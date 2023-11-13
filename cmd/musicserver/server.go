package main

import (
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/fsnotify/fsnotify"
	"github.com/kelseyhightower/envconfig"
)

type specification struct {
	Port         int    `default:"9000"`
	FilePath     string `default:"/home/richard/choir"`
	FrontendPath string `default:"/home/richard/src/musicserver/src/frontend/build"`
}

var spec specification

func main() {
	err := envconfig.Process("musicserver", &spec)
	if err != nil {
		log.Fatal("error reading environment variables:", err)
	}

	// Handle the /subscribe route in the backend
	http.Handle("/subscribe/", http.StripPrefix("/subscribe/", http.HandlerFunc(longPollHandler)))

	// For render requests, serve up the frontend code
	http.HandleFunc("/render/", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, fmt.Sprintf("%s/index.html", spec.FrontendPath))
	})
	http.Handle("/static/", http.FileServer(http.Dir(spec.FrontendPath)))
	http.Handle("/favicon.ico", http.FileServer(http.Dir(spec.FrontendPath)))
	http.HandleFunc("/", indexHandler)
	log.Println("server listening on port", spec.Port)
	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%d", spec.Port), nil))
}

func listFilesRecursively(dirPath string) ([]string, error) {
	var fileList []string

	err := filepath.Walk(dirPath, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if !info.IsDir() && strings.HasSuffix(path, ".abc") {
			fileList = append(fileList, path)
		}
		return nil
	})

	if err != nil {
		return nil, err
	}

	return fileList, nil
}

func indexHandler(w http.ResponseWriter, r *http.Request) {
	path := spec.FilePath + r.URL.Path

	fileList, err := listFilesRecursively(path)
	if err != nil {
		log.Println(path, "500", err)
		msg := fmt.Sprint("Internal server error: %v", err)
		http.Error(w, msg, 500)
		return
	}

	w.Header().Set("Content-Type", "text/html")
	fmt.Fprintln(w, "<html></html><body>")
	for _, file := range fileList {
		basename := strings.TrimPrefix(file, spec.FilePath+"/")
		url := "/render/" + basename
		fmt.Fprintf(w, "<a href='%s'>%s</a><br/>", url, basename)
	}
	fmt.Fprintln(w, "</body>")
}

func longPollHandler(w http.ResponseWriter, r *http.Request) {
	name := spec.FilePath + "/" + r.URL.Path

	// Set the response type to text/event-stream for server-sent events (SSE)
	w.Header().Set("Content-Type", "text/event-stream")
	// https://github.com/facebook/create-react-app/issues/1633
	w.Header().Set("Cache-Control", "no-transform")
	w.Header().Set("Connection", "keep-alive")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	// Create a channel to notify when file changes occur
	fileChanges := make(chan bool)

	// Start a goroutine to monitor file changes
	err := monitorFileChanges(fileChanges, name)
	if err != nil {
		log.Println(name, "404", err)
		http.NotFound(w, r)
		return
	}

	// Loop until file changes occur
	for {
		// Read the file contents
		fileContents, err := readFile(name)
		if err == nil {
			// Send the file contents to the client
			fmt.Fprintf(w, "data: ")
			for _, c := range fileContents {
				fmt.Fprintf(w, "%c", c)
				if c == '\n' {
					fmt.Fprintf(w, "data: ")
				}
			}
			fmt.Fprintf(w, "\n\n")
			flusher, ok := w.(http.Flusher)
			if ok {
				flusher.Flush()
			}
		}

		_, more := <-fileChanges
		if !more {
			return
		}
	}
}

func monitorFileChanges(fileChanges chan<- bool, pathName string) error {
	// Create a new file watcher
	watcher, err := fsnotify.NewWatcher()
	if err != nil {
		return err
	}

	dir := filepath.Dir(pathName)
	err = watcher.Add(dir)
	if err != nil {
		watcher.Close()
		return err
	}

	go func() {
		defer watcher.Close()
		defer close(fileChanges)
		for {
			select {
			case event, ok := <-watcher.Events:
				if !ok {
					return
				}
				if event.Name == pathName && event.Has(fsnotify.Write) {
					// File has been modified
					fileChanges <- true
				}
			case err, ok := <-watcher.Errors:
				if !ok {
					return
				}
				log.Println("File watcher error:", err)
			}
		}
	}()

	return nil
}

func readFile(pathName string) (string, error) {
	// Read the file contents
	content, err := ioutil.ReadFile(pathName)
	if err != nil {
		return "", err
	}
	return string(content), nil
}
