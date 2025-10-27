package handlers

import (
	"net/http"
	"log"
	"context"
	"time"
	"encoding/json"

	"tacohut/middlewares"
	
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type DailyAnalyticsResponse struct {
    ID           string            `json:"id"`
    Date         string            `json:"date"` 
    ItemsSold    map[string]int    `json:"itemsSold"`
    PaymentMethods map[string]int  `json:"paymentMethods"`
    TotalSales   int               `json:"totalSales"`
    TotalExpenses int              `json:"totalExpenses"`
    NetProfit    int               `json:"netProfit"`
    ExpenseCategories map[string]int `json:"expenseCategories"`
    LastUpdated  string            `json:"lastUpdated"` 
}

func FetchDailyAnalysis(w http.ResponseWriter, r *http.Request) {
    if r.Method != "GET" || r.URL.Path != "/api/daily" {
        http.Error(w, "Method not allowed!", http.StatusMethodNotAllowed)
        return
    }

    if middlewares.DailyAnalytics == nil {
        log.Println("Database connection is nil")
        http.Error(w, "Database connection error", http.StatusInternalServerError)
        return
    }

    collection := middlewares.DailyAnalytics.Collection("dailyAnalysis")
    ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
    defer cancel()

    // Fetch data sorted by date (newest first)
    findOptions := options.Find().SetSort(bson.D{{Key: "date", Value: -1}})
    cursor, err := collection.Find(ctx, bson.M{}, findOptions)
    if err != nil {
        log.Printf("Error fetching daily analytics: %v", err)
        http.Error(w, "Failed to fetch daily analytics", http.StatusInternalServerError)
        return
    }
    defer cursor.Close(ctx)

    // Decode into original DailyData struct
    var mongoData []DailyData
    if err = cursor.All(ctx, &mongoData); err != nil {
        log.Printf("Error decoding daily analytics: %v", err)
        http.Error(w, "Failed to decode daily analytics", http.StatusInternalServerError)
        return
    }

    // Convert to TS-friendly format
    tsResponse := make([]DailyAnalyticsResponse, len(mongoData))
    for i, data := range mongoData {
        // Convert ID to string if it's ObjectID
        idStr := ""
        if objID, ok := data.ID.(primitive.ObjectID); ok {
            idStr = objID.Hex()
        } else if strID, ok := data.ID.(string); ok {
            idStr = strID
        }

        tsResponse[i] = DailyAnalyticsResponse{
            ID:           idStr,
            Date:         data.Date.Format(time.RFC3339),
            ItemsSold:     data.ItemsSold,
            PaymentMethods: data.PaymentSummary,
            TotalSales:   data.TotalSales,
            TotalExpenses: data.TotalExpenses,
            NetProfit:    data.NetProfit,
            ExpenseCategories: data.ExpenseCategory,
            LastUpdated:  data.LastUpdated.Format(time.RFC3339),
        }
    }

    // Prepare final response
    response := map[string]interface{}{
        "status": "success",
        "data":   tsResponse,
        "count":  len(tsResponse),
    }

    w.Header().Set("Content-Type", "application/json")
    if err := json.NewEncoder(w).Encode(response); err != nil {
        log.Printf("Error encoding response: %v", err)
        http.Error(w, "Internal server error", http.StatusInternalServerError)
    }
}