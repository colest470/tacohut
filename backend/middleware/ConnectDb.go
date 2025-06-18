package middlewares

import (
	"fmt"
	"net/http"
	"time"
)

func ConnectDb(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/" {
			fmt.Println("Connecting to database...")

			time.Sleep(time.Second * 4)

			fmt.Println("Success: Connected to db")
		}

		next.ServeHTTP(w, r)
	})
}