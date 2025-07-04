package handlers

import (
	"context"
	"net/http"
	"time"
	"errors"

	"tacohut/middlewares"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// type MenuItem struct {
// 	MenuItemId string    `json:"menuItemId" bson:"menuItemId"`
// 	Name       string    `json:"name" bson:"name"`
// 	Quantity   int       `json:"quantity" bson:"quantity"`
// 	Price      int       `json:"price" bson:"price"`
// 	Cost       int       `json:"cost" bson:"cost"`
// 	Time       time.Time `json:"time" bson:"time"`
// }

// type SalesData struct {
// 	ID            interface{} `bson:"_id,omitempty"`
// 	Items         []MenuItem  `json:"items" bson:"items"`
// 	PaymentMethod string      `json:"paymentMethod" bson:"paymentMethod"`
// 	Total         int         `json:"total" bson:"total"`
// 	RecordedAt    time.Time   `json:"recordedAt" bson:"recordedAt"`
// }

// type Expenses struct {
// 	ID            interface{} `bson:"_id,omitempty"`
// 	Amount        int         `json:"amount" bson:"amount"`
// 	Category      string      `json:"category" bson:"category"`
// 	Description   string      `json:"description" bson:"description"`
// 	PaymentMethod string      `json:"paymentMethod" bson:"paymentMethod"`
// 	TimeAdded     time.Time   `json:"timeAdded" bson:"timeAdded"`
// }

type DailyData struct {
	ID interface{}                 `bson:"_id,omitempty"`
	Date time.Time                 `bson:"date"`
	ItemsSold map[string]int       `bson:"itemsSold"`
	PaymentSummary map[string]int  `bson:"paymentSummary"`
	TotalSales int                 `bson:"totalSales"`
	TotalExpenses int              `bson:"totalExpenses"`
	NetProfit  int                 `bson:"netProfit"`
	ExpenseCategory map[string]int `bson:"expenseCategory"`
	LastUpdated time.Time          `bson:"lastUpdated"`
}

func (randomSales SalesData) CalculateDailySales(w http.ResponseWriter, r *http.Request) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	currentDate := time.Now().Truncate(24 * time.Hour)

	update := bson.M{
		"$inc": bson.M{
			"totalSales": randomSales.Total,
		},
		"$set": bson.M{
			"lastUpdated": time.Now(),
		},
		"$setOnInsert": bson.M{
			"date": currentDate,
		},
	}

	itemsUpdate := bson.M{}
	for _, item := range randomSales.Items {
		itemsUpdate["itemsSold."+item.Name] = item.Quantity
	}
	update["$inc"].(bson.M)["itemsSold"] = itemsUpdate

	update["$inc"].(bson.M)["paymentSummary."+randomSales.PaymentMethod] = 1

	collection := middlewares.DailyAnalytics.Collection("dailyAnalysis")
	filter := bson.M{"date": currentDate}
	_, err := collection.UpdateOne(ctx, filter, update, options.Update().SetUpsert(true))
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return errors.New("Error entering daily sales data!")
	}

	err = recalculateDailyProfit(middlewares.DailyAnalytics, currentDate)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return errors.New("Error entering daily sales Data!")
	}
	return nil
}

func (randomExpenses Expenses) CalculateDailyExpenses(w http.ResponseWriter, r *http.Request) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	currentDate := time.Now().Truncate(24 * time.Hour)

	update := bson.M{
		"$inc": bson.M{
			"totalExpenses": randomExpenses.Amount,
			"expenseCategory." + randomExpenses.Category: randomExpenses.Amount,
		},
		"$set": bson.M{
			"lastUpdated": time.Now(),
		},
		"$setOnInsert": bson.M{
			"date": currentDate,
		},
	}

	collection := middlewares.DailyAnalytics.Collection("dailyAnalysis")
	filter := bson.M{"date": currentDate}
	_, err := collection.UpdateOne(ctx, filter, update, options.Update().SetUpsert(true))
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return errors.New("Error updatin daily data!")
	}

	err = recalculateDailyProfit(middlewares.DailyAnalytics, currentDate)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return errors.New("Error updatin daily data!")
	}
	return nil
}

func (randomSales SalesData) CalculateDailySalesDeleted(w http.ResponseWriter, r *http.Request) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	saleDate := randomSales.RecordedAt.Truncate(24 * time.Hour)

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

	collection := middlewares.DailyAnalytics.Collection("dailyAnalysis")
	filter := bson.M{"date": saleDate}
	_, err := collection.UpdateOne(ctx, filter, update)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return errors.New("Error updatin daily data!")
	}

	err = recalculateDailyProfit(middlewares.DailyAnalytics, saleDate)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return errors.New("Error updatin daily data!")
	}

	return nil
}

func (randomExpenses Expenses) CalculateDailyExpensesDeleted(w http.ResponseWriter, r *http.Request) error {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		// Get the date from the deleted expense
		expenseDate := randomExpenses.TimeAdded.Truncate(24 * time.Hour)

		// Prepare update operations
		update := bson.M{
			"$inc": bson.M{
				"totalExpenses": -randomExpenses.Amount,
				"expenseCategory." + randomExpenses.Category: -randomExpenses.Amount,
			},
			"$set": bson.M{
				"lastUpdated": time.Now(),
			},
		}

		// Update the daily data
		collection := middlewares.DailyAnalytics.Collection("dailyAnalysis")
		filter := bson.M{"date": expenseDate}
		_, err := collection.UpdateOne(ctx, filter, update)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return errors.New("Error updatin daily data!")
		}

		err = recalculateDailyProfit(middlewares.DailyAnalytics, expenseDate)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return errors.New("Error updatin daily data!")
		}
		return  nil
}

func recalculateDailyProfit(db *mongo.Database, date time.Time) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	collection := db.Collection("dailyAnalysis")
	filter := bson.M{"date": date}

	var dailyData DailyData
	err := collection.FindOne(ctx, filter).Decode(&dailyData)
	if err != nil {
		return err
	}

	netProfit := dailyData.TotalSales - dailyData.TotalExpenses

	update := bson.M{
		"$set": bson.M{
			"netProfit":    netProfit,
			"lastUpdated": time.Now(),
		},
	}

	_, err = collection.UpdateOne(ctx, filter, update)
	return err
}