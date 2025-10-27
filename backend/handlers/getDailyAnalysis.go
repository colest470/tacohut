package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"tacohut/middlewares"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type DailyAnalyticsResponse struct {
	ID               string            `json:"id"`
	Date             string            `json:"date"`
	ItemsSold        map[string]int    `json:"itemsSold"`
	PaymentMethods   map[string]int    `json:"paymentMethods"` // for receiving
	TotalSales       int               `json:"totalSales"`
	TotalExpenses    int               `json:"totalExpenses"`
	NetProfit        int               `json:"netProfit"`
	ExpenseCategories map[string]int   `json:"expenseCategories"`
	LastUpdated      string            `json:"lastUpdated"`
}

type FinalResponse struct {
	DailyAnalytics  []DailyAnalyticsResponse `json:"dailyAnalytics"`
	WeeklyAnalytics  []DailyAnalyticsResponse `json:"weeklyAnalytics"`
	MonthlyAnalytics []DailyAnalyticsResponse `json:"monthlyAnalytics"`
	YearlyAnalytics  []DailyAnalyticsResponse `json:"yearlyAnalytics"`
}

// Define the DailyData struct that matches your MongoDB documents
// type DailyData struct {
// 	ID             interface{}    `bson:"_id,omitempty"`
// 	Date           time.Time      `bson:"date"`
// 	ItemsSold      map[string]int `bson:"itemsSold"`
// 	PaymentSummary map[string]int `bson:"paymentSummary"`
// 	TotalSales     int            `bson:"totalSales"`
// 	TotalExpenses  int            `bson:"totalExpenses"`
// 	NetProfit      int            `bson:"netProfit"`
// 	ExpenseCategory map[string]int `bson:"expenseCategory"`
// 	LastUpdated    time.Time      `bson:"lastUpdated"`
// }

func FetchDailyAnalysis(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" || r.URL.Path != "/api/daily" {
		http.Error(w, "Method not allowed!", http.StatusMethodNotAllowed)
		return
	}

	analyticsConfigs := []struct {
		db         *mongo.Database
		collection string
	}{
		{middlewares.DailyAnalytics, "dailyAnalysis"},
		{middlewares.WeeklyAnalytics, "weeklyAnalytics"},
		{middlewares.MonthlyAnalytics, "monthlyAnalytics"},
		{middlewares.YearlyAnalytics, "yearlyAnalytics"},
	}

	finalResponse := FinalResponse{}

	for index, config := range analyticsConfigs {
		if config.db == nil {
			log.Printf("Database connection for index %d is nil", index)
			http.Error(w, "Database connection error", http.StatusInternalServerError)
			return
		}

		collection := config.db.Collection(config.collection)
		data, err := MappingDailyData(collection, index)
		
		if err != nil {
			log.Printf("Error mapping data for %s: %v", config.collection, err)
			http.Error(w, "Failed to process analytics data", http.StatusInternalServerError)
			return
		}

		switch index {
		case 0:
			finalResponse.DailyAnalytics = data
		case 1:
			finalResponse.WeeklyAnalytics = data
		case 2:
			finalResponse.MonthlyAnalytics = data
		case 3:
			finalResponse.YearlyAnalytics = data
		}
	}

	response := map[string]interface{}{
		"status": "success",
		"data":   finalResponse,
		"count":  4,
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(response); err != nil {
		log.Printf("Error encoding response: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
	}
}

func MappingDailyData(collection *mongo.Collection, index int) ([]DailyAnalyticsResponse, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	findOptions := options.Find().SetSort(bson.D{{Key: "date", Value: -1}})
	cursor, err := collection.Find(ctx, bson.M{}, findOptions)
	if err != nil {
		return nil, fmt.Errorf("error fetching analytics: %w", err)
	}
	defer cursor.Close(ctx)

	var mongoData []DailyData
	if err = cursor.All(ctx, &mongoData); err != nil {
		return nil, fmt.Errorf("error decoding analytics: %w", err)
	}

	tsResponse := make([]DailyAnalyticsResponse, len(mongoData))

	for i, data := range mongoData {
		idStr := ""
		if objID, ok := data.ID.(primitive.ObjectID); ok {
			idStr = objID.Hex()
		} else if strID, ok := data.ID.(string); ok {
			idStr = strID
		}

		tsResponse[i] = DailyAnalyticsResponse{
			ID:                idStr,
			Date:              data.Date.Format(time.RFC3339),
			ItemsSold:         data.ItemsSold,
			PaymentMethods:    data.PaymentSummary,
			TotalSales:        data.TotalSales,
			TotalExpenses:     data.TotalExpenses,
			NetProfit:         data.NetProfit,
			ExpenseCategories: data.ExpenseCategory,
			LastUpdated:       data.LastUpdated.Format(time.RFC3339),
		}
	}

	return tsResponse, nil
}