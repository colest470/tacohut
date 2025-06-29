package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"tacohut/middlewares"
	"time"

	"go.mongodb.org/mongo-driver/bson"
    "go.mongodb.org/mongo-driver/bson/primitive"
)

func DeleteSale(w http.ResponseWriter, r *http.Request) {
if r.Method != "DELETE" {
    http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
    return
}

pathSegments := strings.Split(r.URL.Path, "/")
id := pathSegments[len(pathSegments)-1]

fmt.Println("Trying to delete sales item with id:", id)

objID, err := primitive.ObjectIDFromHex(id)
if err != nil {
    http.Error(w, "Invalid ID format", http.StatusBadRequest)
    return
}

collection := middlewares.TacoDB.Collection("dailysales")
ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
defer cancel()

result, err := collection.DeleteOne(ctx, bson.M{"_id": objID})
if err != nil {
    http.Error(w, "Error deleting sale", http.StatusInternalServerError)
    return
}

fmt.Println("Delete result:", result)

if result.DeletedCount == 0 {
    http.Error(w, "Sale not found", http.StatusNotFound)
    return
}

response := map[string]interface{}{
    "status":  "success",
    "message": "Deleted",
}

w.Header().Set("Content-Type", "application/json")
json.NewEncoder(w).Encode(response)
}