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
	"github.com/rs/cors"
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
	mux.HandleFunc("/api/saledata", handlers.Saledata)

	handlerWithDB := middlewares.ConnectDb(mux)

	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", ""},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
		AllowCredentials: false,
		Debug:            false,
	})
	finalHandler := c.Handler(handlerWithDB)

	fmt.Println("Server listening in port", port)

	if err := http.ListenAndServe(port, finalHandler); err != nil {
		log.Fatal("Error creating server", err)
	}
}

