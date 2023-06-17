package main

import (
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"path/filepath"

	"github.com/fsnotify/fsnotify"
)

func main() {
	http.Handle("/file/", http.StripPrefix("/file/", http.HandlerFunc(longPollHandler)))
	log.Fatal(http.ListenAndServe(":9000", nil))
}

func longPollHandler(w http.ResponseWriter, r *http.Request) {
	name := "/home/richard/choir/" + r.URL.Path

	// Set the response type to text/event-stream for server-sent events (SSE)
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	// Create a channel to notify when file changes occur
	fileChanges := make(chan bool)

	// Start a goroutine to monitor file changes
	go monitorFileChanges(fileChanges, name)

	// Loop until file changes occur
	for {
		// Read the file contents
		fileContents, err := readFile(name)
		if err != nil {
			log.Println("Error reading file:", err)
			continue
		}

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

		<-fileChanges
	}
}

func monitorFileChanges(fileChanges chan<- bool, pathName string) {
	// Create a new file watcher
	watcher, err := fsnotify.NewWatcher()
	if err != nil {
		log.Fatal("Error creating file watcher:", err)
	}
	defer watcher.Close()

        dir := filepath.Dir(pathName)
	err = watcher.Add(dir)
	if err != nil {
		log.Fatal("Error adding file to watcher:", dir, err)
	}

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
}

func readFile(pathName string) (string, error) {
	// Read the file contents
	content, err := ioutil.ReadFile(pathName)
	if err != nil {
		return "", err
	}
	return string(content), nil
}
