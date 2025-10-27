package middlewares

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"sync"
	"time"

	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var (
	MongoClient *mongo.Client
	TacoDB *mongo.Database
	ExpensesDB *mongo.Database
	DailyAnalytics *mongo.Database
	WeeklyAnalytics *mongo.Database
	MonthlyAnalytics *mongo.Database
	YearlyAnalytics *mongo.Database
)

func ConnectDb(next http.Handler) http.Handler {
	// var initOnce sync.Mutex
	var doOnce sync.Once
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/close" && r.Method == "POST" {
			return 
		}

		doOnce.Do(func() {
			fmt.Println("Connecting to database...")
			
			if err := godotenv.Load(); err != nil {
			log.Fatalf("Error loading .env file!")
			CloseDB()
			return
			}

			dbURI := os.Getenv("DB_URI")

			clientOptions := options.Client().ApplyURI(dbURI)
			ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
			defer cancel()

			client, err := mongo.Connect(ctx, clientOptions)
			if err != nil {
				log.Fatalf("Failed to connect to MongoDB: %v", err)
				CloseDB()
				return
			}

			err = client.Ping(ctx, nil)
			if err != nil {
				log.Fatalf("Failed to ping MongoDB: %v", err)
				CloseDB()
				return
			}
			fmt.Println("Connected to MongoDB successfully!")
			MongoClient = client
			
			TacoDB = MongoClient.Database("tacohut")
			ExpensesDB = MongoClient.Database("expenses")
			DailyAnalytics = MongoClient.Database("dailyExpenses")
			WeeklyAnalytics = MongoClient.Database("weeklyAnalytics")
			MonthlyAnalytics = MongoClient.Database("monthlyAnalytics")
			YearlyAnalytics = MongoClient.Database("yearlyAnalytics")

			fmt.Println("Connected to databases:", TacoDB.Name(),", ", ExpensesDB.Name(),", ", DailyAnalytics.Name(), ", ", WeeklyAnalytics.Name(), ", ", MonthlyAnalytics.Name(), ", ", YearlyAnalytics.Name())
		})

		next.ServeHTTP(w, r)
	})
}

func CloseDB() {
	if MongoClient != nil {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		if err := MongoClient.Disconnect(ctx); err != nil {
			log.Printf("Error closing database connection: %v", err)
		} else {
			fmt.Println("Database connection closed")
		}
	}
}