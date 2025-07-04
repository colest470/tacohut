package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"tacohut/middlewares"
	"time"
)

type Expenses struct {
	Amount string        `json:"amount" bson:"amount"`
	Category string      `json:"category" bson:"category"`
	Description string   `json:"description" bson:"description"`
	PaymentMethod string `json:"paymentMethod" bson:"paymentMethod"`
	TimeAdded time.Time  `json:"timeAdded" bson:"timeAdded"`
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

	expenses.TimeAdded = time.Now()

	fmt.Println("Received:", expenses)

	if middlewares.MongoClient == nil {
		log.Println("Database connection is nil!")
		http.Error(w, "Database connection error", http.StatusInternalServerError)
		return
	}

	collectionExpenses := middlewares.ExpensesDB.Collection("dailyExpense")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	insertResult, err := collectionExpenses.InsertOne(ctx, expenses)
	if err != nil {
		log.Printf("Error inserting sales into DB: %v", err)
		http.Error(w, "Internal server error: Could not save expenses data!", http.StatusInternalServerError)
		return
	}

	fmt.Printf("Succesfully inserted expenses datawith id: %v\n", insertResult.InsertedID)

	response := map[string]interface{}{
		"status": "success",
		"message": "Sales data received and saved",
		"salesId": insertResult.InsertedID,
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)

	expenses.CalculateDailyExpenses(w, r)
}