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

type AnalyticsSummary struct {
	ID               primitive.ObjectID `bson:"_id,omitempty"`
	Period           string             `bson:"period"` // "daily", "weekly", "monthly", "yearly"
	StartDate        time.Time          `bson:"startDate"`
	EndDate          time.Time          `bson:"endDate"`
	ItemsSold        map[string]int     `bson:"itemsSold"`
	PaymentMethods   map[string]int     `bson:"paymentMethods"`
	TotalSales       int                `bson:"totalSales"`
	TotalExpenses    int                `bson:"totalExpenses"`
	NetProfit        int                `bson:"netProfit"`
	TransactionCount int                `bson:"transactionCount"`
	LastUpdated      time.Time          `bson:"lastUpdated"`
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

	err = UpdateAllAnalytics(sales)
	if err != nil {
		log.Printf("Error updating analytics: %v", err)
	}

	response := map[string]interface{}{
		"status":  "success",
		"message": "Sales data received and saved",
		"salesId": insertResult.InsertedID,
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func UpdateAllAnalytics(sales SalesData) error {
	if err := UpdatePeriodAnalytics(sales, "daily"); err != nil {
		log.Printf("Error updating daily analytics: %v", err)
	}

	if err := UpdatePeriodAnalytics(sales, "weekly"); err != nil {
		log.Printf("Error updating weekly analytics: %v", err)
	}

	if err := UpdatePeriodAnalytics(sales, "monthly"); err != nil {
		log.Printf("Error updating monthly analytics: %v", err)
	}

	if err := UpdatePeriodAnalytics(sales, "yearly"); err != nil {
		log.Printf("Error updating yearly analytics: %v", err)
	}

	return nil
}

func UpdatePeriodAnalytics(sales SalesData, period string) error {
	if middlewares.MongoClient == nil {
		return fmt.Errorf("database connection is nil")
	}

	var db *mongo.Database
	switch period {
	case "daily":
		db = middlewares.DailyAnalytics
	case "weekly":
		db = middlewares.WeeklyAnalytics
	case "monthly":
		db = middlewares.MonthlyAnalytics
	case "yearly":
		db = middlewares.YearlyAnalytics
	default:
		return fmt.Errorf("invalid period: %s", period)
	}

	if db == nil {
		return fmt.Errorf("%s analytics database is nil", period)
	}

	collection := db.Collection(period + "Analytics")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	startDate, endDate := calculateDateRange(sales.RecordedAt, period)

	var existingAnalytics AnalyticsSummary
	filter := bson.M{
		"period":    period,
		"startDate": startDate,
		"endDate":   endDate,
	}

	err := collection.FindOne(ctx, filter).Decode(&existingAnalytics)

	if err == mongo.ErrNoDocuments {
		return CreateNewPeriodAnalytics(collection, ctx, period, startDate, endDate, sales)
	} else if err != nil {
		return fmt.Errorf("error finding %s analytics: %w", period, err)
	} else {
		return UpdateExistingPeriodAnalytics(collection, ctx, existingAnalytics, sales)
	}
}

func calculateDateRange(timestamp time.Time, period string) (time.Time, time.Time) {
	switch period {
	case "daily":
		start := time.Date(timestamp.Year(), timestamp.Month(), timestamp.Day(), 0, 0, 0, 0, timestamp.Location())
		end := start.Add(24 * time.Hour).Add(-1 * time.Nanosecond)
		return start, end

	case "weekly":
		weekday := int(timestamp.Weekday())
		if weekday == 0 {
			weekday = 7
		}
		start := time.Date(timestamp.Year(), timestamp.Month(), timestamp.Day()-weekday+1, 0, 0, 0, 0, timestamp.Location())
		end := start.Add(7 * 24 * time.Hour).Add(-1 * time.Nanosecond)
		return start, end

	case "monthly":
		start := time.Date(timestamp.Year(), timestamp.Month(), 1, 0, 0, 0, 0, timestamp.Location())
		end := start.AddDate(0, 1, 0).Add(-1 * time.Nanosecond)
		return start, end

	case "yearly":
		start := time.Date(timestamp.Year(), 1, 1, 0, 0, 0, 0, timestamp.Location())
		end := start.AddDate(1, 0, 0).Add(-1 * time.Nanosecond)
		return start, end

	default:
		return timestamp, timestamp
	}
}

func CreateNewPeriodAnalytics(collection *mongo.Collection, ctx context.Context, period string, startDate, endDate time.Time, sales SalesData) error {
	itemsSold := make(map[string]int)
	paymentMethods := make(map[string]int)

	totalExpenses := 0
	for _, item := range sales.Items {
		itemsSold[item.Name] += item.Quantity
		totalExpenses += item.Cost * item.Quantity
	}

	paymentMethods[sales.PaymentMethod] = sales.Total

	newAnalytics := AnalyticsSummary{
		Period:           period,
		StartDate:        startDate,
		EndDate:          endDate,
		ItemsSold:        itemsSold,
		PaymentMethods:   paymentMethods,
		TotalSales:       sales.Total,
		TotalExpenses:    totalExpenses,
		NetProfit:        sales.Total - totalExpenses,
		TransactionCount: 1,
		LastUpdated:      time.Now(),
	}

	_, err := collection.InsertOne(ctx, newAnalytics)
	if err != nil {
		return fmt.Errorf("error creating new %s analytics: %w", period, err)
	}

	log.Printf("Created new %s analytics for period: %s to %s", period, startDate.Format("2006-01-02"), endDate.Format("2006-01-02"))
	return nil
}

func UpdateExistingPeriodAnalytics(collection *mongo.Collection, ctx context.Context, existingAnalytics AnalyticsSummary, sales SalesData) error {
	updateItemsSold := bson.M{}
	for _, item := range sales.Items {
		key := fmt.Sprintf("itemsSold.%s", item.Name)
		currentQuantity := existingAnalytics.ItemsSold[item.Name]
		updateItemsSold[key] = currentQuantity + item.Quantity
	}

	paymentKey := fmt.Sprintf("paymentMethods.%s", sales.PaymentMethod)
	//currentPaymentTotal := existingAnalytics.PaymentMethods[sales.PaymentMethod]

	transactionExpenses := 0
	for _, item := range sales.Items {
		transactionExpenses += item.Cost * item.Quantity
	}

	update := bson.M{
		"$set": bson.M{
			"lastUpdated": time.Now(),
		},
		"$inc": bson.M{
			"totalSales":       sales.Total,
			"totalExpenses":    transactionExpenses,
			"netProfit":        sales.Total - transactionExpenses,
			"transactionCount": 1,
		},
	}

	if paymentKey != "" {
		update["$inc"].(bson.M)[paymentKey] = sales.Total
	}

	if len(updateItemsSold) > 0 {
		for key, value := range updateItemsSold {
			update["$inc"].(bson.M)[key] = value
		}
	}

	_, err := collection.UpdateOne(
		ctx,
		bson.M{"_id": existingAnalytics.ID},
		update,
	)

	if err != nil {
		return fmt.Errorf("error updating %s analytics: %w", existingAnalytics.Period, err)
	}

	log.Printf("Updated %s analytics for period: %s to %s", existingAnalytics.Period, existingAnalytics.StartDate.Format("2006-01-02"), existingAnalytics.EndDate.Format("2006-01-02"))
	return nil
}

func GetAnalytics(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	period := r.URL.Query().Get("period") // daily, weekly, monthly, yearly
	dateParam := r.URL.Query().Get("date")

	if period == "" {
		http.Error(w, "Period parameter is required (daily, weekly, monthly, yearly)", http.StatusBadRequest)
		return
	}

	var targetDate time.Time
	var err error

	if dateParam == "" {
		targetDate = time.Now()
	} else {
		targetDate, err = time.Parse("2006-01-02", dateParam)
		if err != nil {
			http.Error(w, "Invalid date format. Use YYYY-MM-DD", http.StatusBadRequest)
			return
		}
	}

	var db *mongo.Database
	switch period {
	case "daily":
		db = middlewares.DailyAnalytics
	case "weekly":
		db = middlewares.WeeklyAnalytics
	case "monthly":
		db = middlewares.MonthlyAnalytics
	case "yearly":
		db = middlewares.YearlyAnalytics
	default:
		http.Error(w, "Invalid period. Use: daily, weekly, monthly, yearly", http.StatusBadRequest)
		return
	}

	if db == nil {
		http.Error(w, "Analytics database not available", http.StatusInternalServerError)
		return
	}

	collection := db.Collection(period + "Analytics")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	startDate, endDate := calculateDateRange(targetDate, period)

	var analytics AnalyticsSummary
	err = collection.FindOne(ctx, bson.M{
		"period":    period,
		"startDate": startDate,
		"endDate":   endDate,
	}).Decode(&analytics)

	if err == mongo.ErrNoDocuments {
		http.Error(w, fmt.Sprintf("No %s analytics found for the specified date", period), http.StatusNotFound)
		return
	} else if err != nil {
		log.Printf("Error fetching %s analytics: %v", period, err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(analytics)
}