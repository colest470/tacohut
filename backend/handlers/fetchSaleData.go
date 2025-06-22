package handlers

import (
	"encoding/json"
	"net/http"
)

func FetchSaleData(w http.ResponseWriter, r *http.Request) {
	response := map[string]interface{}{
        "status":  "success",
        "message": "sales fetched",
        "salesId": "12345", // You might generate a real ID here
    }
    json.NewEncoder(w).Encode(response)
}