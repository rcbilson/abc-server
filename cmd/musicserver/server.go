package main

import (
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"path/filepath"

	"github.com/fsnotify/fsnotify"
	"github.com/kelseyhightower/envconfig"
)

type specification struct {
	Port         int
	FilePath     string
	FrontendPath string
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
	http.Handle("/", http.FileServer(http.Dir(spec.FrontendPath)))
	log.Println("server listening on port", spec.Port)
	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%d", spec.Port), nil))
}

func longPollHandler(w http.ResponseWriter, r *http.Request) {
	name := spec.FilePath + r.URL.Path

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
