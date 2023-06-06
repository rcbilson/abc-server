package main

import (
	"fmt"
	"log"
	"net/http"
)

func handler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Hi there, I love %s!", r.URL.Path[1:])
}

func main() {
	//http.HandleFunc("/", handler)
	http.Handle("/file/", http.StripPrefix("/file/", http.FileServer(http.Dir("/home/richard/choir"))))
	log.Fatal(http.ListenAndServe(":9000", nil))
}
