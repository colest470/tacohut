package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"sync"
	"tacohut/handlers"
	"tacohut/middleware"

	"github.com/joho/godotenv"
)

func main() {
	mux := http.NewServeMux()

	var doOnce sync.Once

	doOnce.Do(func() {
		err := godotenv.Load()
		if err != nil {
			log.Fatalf("Error loading .env file!")
		}
	})

	port := os.Getenv("PORT")

	mux.HandleFunc("/", handlers.HandleRoot)
	// handlers

	wrappedMux := middlewares.ConnectDb(mux)

	fmt.Println("Server listening in port:", port)

	if err := http.ListenAndServe(port, wrappedMux); err != nil {
		log.Fatal("Error creating server", err)
	}
}