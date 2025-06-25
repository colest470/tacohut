package handlers

import (
	//"context"
	//"encoding/json"
	"fmt"
	"net/http"
	//"time"

	//"tacohut/middlewares"

	"github.com/gorilla/mux"
	//"go.mongodb.org/mongo-driver/bson"
)

func DeleteSale(w http.ResponseWriter, r *http.Request) {
    if r.Method != "DELETE" {
        http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
        return
    }

    // id := chi.URLParam(r, "id")
    // objectId, err := primitive.ObjectIDFromHex(id)
    // if err != nil {
    //     http.Error(w, "Invalid ID", http.StatusBadRequest)
    //     return
    // }

    vars := mux.Vars(r)
    id := vars["id"]

    fmt.Println("Attemting to delete sale with id:", id)

    // collection := middlewares.TacoDB.Collection("dailysales")
    // ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    // defer cancel()

    // result, err := collection.DeleteOne(ctx, bson.M{"_id": objectId})
    // if err != nil {
    //     http.Error(w, "Error deleting sale", http.StatusInternalServerError)
    //     return
    // }

    // if result.DeletedCount == 0 {
    //     http.Error(w, "Sale not found", http.StatusNotFound)
    //     return
    // }

    // w.Header().Set("Content-Type", "application/json")
    // json.NewEncoder(w).Encode(map[string]string{"status": "success"})
}