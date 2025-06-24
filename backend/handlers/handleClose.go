package handlers

import (
	"fmt"
	"net/http"
	"tacohut/middlewares"
)

func HandleClose(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Closing app and database...")

	middlewares.CloseDB()
}