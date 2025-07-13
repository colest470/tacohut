package handlers

import (
	"net/http"
	//"fmt"
	"context"
	"encoding/json"
	"log"
	"time"

	"tacohut/middlewares"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type ExpensesFetched struct {
	ID interface{}       `bson:"_id,omitempty"`
	Amount string        `json:"amount" bson:"amount"`
	Category string      `json:"category" bson:"category"`
	Description string   `json:"description" bson:"description"`
	PaymentMethod string `json:"paymentMethod" bson:"paymentMethod"`
	TimeAdded time.Time  `json:"timeAdded" bson:"timeAdded"`
}

func FetchExpenses(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	if middlewares.ExpensesDB == nil {
		log.Println("Database connection is nil")
		http.Error(w, "Database connection error", http.StatusInternalServerError)
		return
	}
	
	
	collection := middlewares.ExpensesDB.Collection("dailyExpense")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	count , err := collection.CountDocuments(ctx, bson.M{})
	if err != nil {
		log.Printf("Count error %v", err)
	} else {
		log.Printf("Sales items: %d", count)
	}

	var rawDoc bson.M
	if err := collection.FindOne(ctx, bson.M{}).Decode(&rawDoc); err != nil {
		log.Printf("Debug findOne error: %v", err)
	} else {
		log.Printf("Sample document structure: %+v", rawDoc)
	}

	findOptions := options.Find().SetSort(bson.D{{Key: "createdAt", Value: -1}})
	cursor, err := collection.Find(ctx, bson.M{}, findOptions)
	if err != nil {
		log.Printf("Error fetching portfolio items: %v", err)
		http.Error(w, "Failed to fetch portfolio items", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	var expenses []ExpensesFetched
	if err = cursor.All(ctx, &expenses); err != nil {
		log.Printf("Error decoding portfolio items: %v", err)
		http.Error(w, "Failed to decode portfolio items", http.StatusInternalServerError)
		return
	}

	response := map[string]interface{}{
		"status": "success",
		"data": expenses,
	}
	w.Header().Set("Content-Type", "application/json")

	if err := json.NewEncoder(w).Encode(response); err != nil {
		log.Printf("Error encoding response: %v", err)
		http.Error(w, "Internal server error: Could not encode response", http.StatusInternalServerError)
	}
}