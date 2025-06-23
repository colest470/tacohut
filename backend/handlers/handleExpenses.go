package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
)

type Expenses struct {
	Amount string        `json:"amount" bson:"amount"`
	Category string      `json:"category" bson:"category"`
	Description string   `json:"description" bson:"description"`
	PaymentMethod string `json:"paymentMethod" bson:"paymentMethod"`
}

func HandleExpense(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var expenses Expenses
    err := json.NewDecoder(r.Body).Decode(&expenses)
    if err != nil {
        http.Error(w, "Bad request: "+ err.Error(), http.StatusBadRequest)
        return
    }

	fmt.Println("Received:", expenses)
}