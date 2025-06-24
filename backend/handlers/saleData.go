package handlers

import (
	"fmt"
	"net/http"
	"encoding/json"
	"time"
	"log"
	"context"
	
	"tacohut/middlewares"
)

type MenuItem struct {
	MenuItemId string    `json:"menuItemId" bson:"menuItemId"`
	Name       string    `json:"name" bson:"name"`
	Quantity   int       `json:"quantity" bson:"quantity"`
	Price      int       `json:"price" bson:"price"`
	Cost       int       `json:"cost" bson:"cost"`
	Time       time.Time `json:"time" bson:"time"`
}

type SalesData struct {
	ID            interface{} `bson:"_id,omitempty"`
	Items         []MenuItem  `json:"items"`
	PaymentMethod string      `json:"paymentMethod"`
	Total         int         `json:"total"`
	RecordedAt    time.Time   `json:"recordedAt" bson:"recordedAt"`
}

func Saledata(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var sales SalesData
	err := json.NewDecoder(r.Body).Decode(&sales)
	if err != nil {
		http.Error(w, "Bad request: "+err.Error(), http.StatusBadRequest)
		return
	}

	if sales.RecordedAt.IsZero() {
		sales.RecordedAt = time.Now()
	}

	fmt.Printf("Received sales with %d items\n", len(sales.Items))
	fmt.Printf("Payment method: %s\n", sales.PaymentMethod)
	fmt.Printf("Total amount: %d\n", sales.Total)
	fmt.Printf("Recorded at: %s\n", sales.RecordedAt.Format(time.RFC3339))
	
	for _, item := range sales.Items {
		fmt.Printf("Item: %s (Qty: %d) - Price: %d, date: %s\n", 
			item.Name, item.Quantity, item.Price, item.Time.Format(time.RFC3339))
	}

	if middlewares.MongoClient == nil {
		log.Println("Database connection is nil")
		http.Error(w, "Database connection error", http.StatusInternalServerError)
		return
	}

	collection := middlewares.TacoDB.Collection("dailysales")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	insertResult, err := collection.InsertOne(ctx, sales)
	if err != nil {
		log.Printf("Error inserting sales data into MongoDB: %v", err)
		http.Error(w, "Internal server error: Could not save sales data", http.StatusInternalServerError)
		return
	}

	fmt.Printf("Successfully inserted sales data with ID: %v\n", insertResult.InsertedID)

	response := map[string]interface{}{
		"status":  "success",
		"message": "Sales data received and saved",
		"salesId": insertResult.InsertedID,
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}