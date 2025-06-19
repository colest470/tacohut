package handlers

import (
	"fmt"
	"net/http"
	"encoding/json"
)

type MenuItem struct {
    MenuItemId string `json:"menuItemId"`
    Name       string `json:"name"`
    Quantity   int    `json:"quantity"`
    Price      int    `json:"price"`
    Cost       int    `json:"cost"`
}

type SalesData struct {
    Items         []MenuItem `json:"items"`
    PaymentMethod string     `json:"paymentMethod"`
    Total         int        `json:"total"`
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

    fmt.Printf("Received sales with %d items\n", len(sales.Items))
    fmt.Printf("Payment method: %s\n", sales.PaymentMethod)
    fmt.Printf("Total amount: %d\n", sales.Total)
    
    for _, item := range sales.Items {
        fmt.Printf("Item: %s (Qty: %d) - Price: %d\n", item.Name, item.Quantity, item.Price)
    }

    // Send response
    response := map[string]interface{}{
        "status":  "success",
        "message": "sales received",
        "salesId": "12345", // You might generate a real ID here
    }
    json.NewEncoder(w).Encode(response)
}