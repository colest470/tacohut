package handlers

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"time"
	"strconv"

	"tacohut/middlewares"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type DailyData struct { // can also be the struct for weekly, monthly and yearly
	ID             interface{}        `bson:"_id,omitempty"`
	Date           time.Time          `bson:"date"`
	ItemsSold      map[string]int     `bson:"itemsSold"`
	PaymentSummary map[string]int     `bson:"paymentSummary"`
	TotalSales     int                `bson:"totalSales"`
	TotalExpenses  int                `bson:"totalExpenses"`
	NetProfit      int                `bson:"netProfit"`
	ExpenseCategory map[string]int    `bson:"expenseCategory"`
	LastUpdated    time.Time          `bson:"lastUpdated"`
}

func (randomSales SalesData) CalculateDailySales(w http.ResponseWriter, r *http.Request) error {
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	currentDate := time.Now().Truncate(24 * time.Hour)

	if middlewares.DailyAnalytics == nil {
		return respondWithError(w, http.StatusInternalServerError, "database connection error")
	}

	collection := middlewares.DailyAnalytics.Collection("dailyAnalysis")
	filter := bson.M{"date": currentDate}

	// Build update operation
	update := bson.M{
		"$inc": bson.M{
			"totalSales": randomSales.Total,
		},
		"$set": bson.M{
			"lastUpdated": time.Now(),
		},
		"$setOnInsert": bson.M{
			"date":            currentDate,
			"itemsSold":       make(map[string]int),
			"paymentSummary":  make(map[string]int),
			"totalExpenses":   0,
			"netProfit":       0,
			"expenseCategory": make(map[string]int),
		},
	}

	itemsUpdate := bson.M{}
	for _, item := range randomSales.Items {
		itemsUpdate["itemsSold."+item.Name] = item.Quantity
	}
	update["$inc"].(bson.M)["itemsSold"] = itemsUpdate

	update["$inc"].(bson.M)["paymentSummary."+randomSales.PaymentMethod] = 1

	if _, err := collection.UpdateOne(ctx, filter, update, options.Update().SetUpsert(true)); err != nil {
		return respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("error updating daily sales: %v", err))
	}

	if err := recalculateDailyProfit(middlewares.DailyAnalytics, currentDate); err != nil {
		return respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("error recalculating profit: %v", err))
	}

	return respondWithSuccess(w, "daily sales updated successfully")
}

func (randomExpenses Expenses) CalculateDailyExpenses(w http.ResponseWriter, r *http.Request) error {
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	currentDate := time.Now().Truncate(24 * time.Hour)

	if middlewares.DailyAnalytics == nil {
		return respondWithError(w, http.StatusInternalServerError, "database connection error")
	}

	collection := middlewares.DailyAnalytics.Collection("dailyAnalysis")
	filter := bson.M{"date": currentDate}

	update := bson.M{
		"$inc": bson.M{
			"totalExpenses":              randomExpenses.Amount,
			"expenseCategory." + randomExpenses.Category: randomExpenses.Amount,
		},
		"$set": bson.M{
			"lastUpdated": time.Now(),
		},
		"$setOnInsert": bson.M{
			"date":           currentDate,
			"itemsSold":      make(map[string]int),
			"paymentSummary": make(map[string]int),
			"totalSales":     0,
			"netProfit":      0,
		},
	}

	if _, err := collection.UpdateOne(ctx, filter, update, options.Update().SetUpsert(true)); err != nil {
		return respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("error updating daily expenses: %v", err))
	}

	if err := recalculateDailyProfit(middlewares.DailyAnalytics, currentDate); err != nil {
		return respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("error recalculating profit: %v", err))
	}

	return respondWithSuccess(w, "daily expenses updated successfully")
}

func (randomSales SalesData) CalculateDailySalesDeleted(w http.ResponseWriter, r *http.Request) error {
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	saleDate := randomSales.RecordedAt.Truncate(24 * time.Hour)

	if middlewares.DailyAnalytics == nil {
		return respondWithError(w, http.StatusInternalServerError, "database connection error")
	}

	collection := middlewares.DailyAnalytics.Collection("dailyAnalysis")
	filter := bson.M{"date": saleDate}

	update := bson.M{
		"$inc": bson.M{
			"totalSales": -randomSales.Total,
		},
		"$set": bson.M{
			"lastUpdated": time.Now(),
		},
	}

	itemsUpdate := bson.M{}
	for _, item := range randomSales.Items {
		itemsUpdate["itemsSold."+item.Name] = -item.Quantity
	}
	update["$inc"].(bson.M)["itemsSold"] = itemsUpdate

	update["$inc"].(bson.M)["paymentSummary."+randomSales.PaymentMethod] = -1

	if _, err := collection.UpdateOne(ctx, filter, update); err != nil {
		return respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("error updating deleted sales: %v", err))
	}

	if err := recalculateDailyProfit(middlewares.DailyAnalytics, saleDate); err != nil {
		return respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("error recalculating profit: %v", err))
	}

	return respondWithSuccess(w, "deleted sales updated successfully")
}

func (randomExpenses Expenses) CalculateDailyExpensesDeleted(w http.ResponseWriter, r *http.Request) error {
    ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
    defer cancel()

    expenseDate := randomExpenses.TimeAdded.Truncate(24 * time.Hour)

    if middlewares.DailyAnalytics == nil {
        return respondWithError(w, http.StatusInternalServerError, "database connection error")
    }

    // Convert string amount to integer
    amount, err := strconv.Atoi(randomExpenses.Amount)
    if err != nil {
        return respondWithError(w, http.StatusBadRequest, "invalid expense amount format")
    }

    collection := middlewares.DailyAnalytics.Collection("dailyAnalysis")
    filter := bson.M{"date": expenseDate}

    update := bson.M{
        "$inc": bson.M{
            "totalExpenses": -amount, // Now using the converted integer value
        },
        "$set": bson.M{
            "lastUpdated": time.Now(),
        },
    }

    if randomExpenses.Category != "" {
        update["$inc"].(bson.M)["expenseCategory."+randomExpenses.Category] = -amount
    }

    if _, err := collection.UpdateOne(ctx, filter, update); err != nil {
        return respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("error updating deleted expenses: %v", err))
    }

    if err := recalculateDailyProfit(middlewares.DailyAnalytics, expenseDate); err != nil {
        return respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("error recalculating profit: %v", err))
    }

    return respondWithSuccess(w, "deleted expenses updated successfully")
}

func recalculateDailyProfit(db *mongo.Database, date time.Time) error {
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	collection := db.Collection("dailyAnalysis")
	filter := bson.M{"date": date}

	var dailyData DailyData
	if err := collection.FindOne(ctx, filter).Decode(&dailyData); err != nil {
		return fmt.Errorf("error finding daily data: %v", err)
	}

	netProfit := dailyData.TotalSales - dailyData.TotalExpenses

	update := bson.M{
		"$set": bson.M{
			"netProfit":    netProfit,
			"lastUpdated": time.Now(),
		},
	}

	if _, err := collection.UpdateOne(ctx, filter, update); err != nil {
		return fmt.Errorf("error updating profit: %v", err)
	}

	return nil
}

func respondWithError(w http.ResponseWriter, code int, message string) error {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(map[string]string{"error": message})
	return errors.New(message)
}

func respondWithSuccess(w http.ResponseWriter, message string) error {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "success", "message": message})
	return nil
}