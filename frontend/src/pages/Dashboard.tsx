import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Calendar,
  Smartphone,
  Banknote,
  ArrowRight,
  Star
} from 'lucide-react';
import { format } from 'date-fns';

interface MenuItem {
  menuItemId: string;
  name: string;
  quantity: number; 
  price: number;
  cost: number;
  time: string;
}

interface SalesData {
  ID: string;
  items: MenuItem[];
  paymentMethod: string;
  total: number;
  recordedAt: string;
}

// Interface for the overall API response
interface FetchSalesResponse {
  status: string;
  data: SalesData[];
}

export default function Dashboard() {
  // Use useState to manage the fetched sales data
  const [sales, setSales] = useState<SalesData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSalesData = async () => {
      setLoading(true);
      setError(null); 
      try {
        const response = await fetch("http://localhost:8080/fetchSaleData");

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Server error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const result: FetchSalesResponse = await response.json();

        if (result.status === "success") {
          setSales(result.data);
          console.log("Fetched sales data:", result.data);
        } else {
          throw new Error(`API returned non-success status: ${result.status}`);
        }
      } catch (err: any) {
        console.error("Error fetching sales data:", err);
        setError(`Failed to load sales data: ${err.message}. Please ensure the backend server is running and accessible.`);
      } finally {
        setLoading(false);
      }
    };

    fetchSalesData();
  }, []);

  const today = new Date();

  const getDailySummary = useMemo(() => (date: Date) => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const dailySales = sales.filter(sale => {
      const saleDate = new Date(sale.recordedAt);
      return saleDate >= startOfDay && saleDate <= endOfDay;
    });

    let totalSales = 0; // Sum of `sale.total` for the day
    let totalExpenses = 0; // Sum of (item.cost * item.quantity) for the day
    let salesCount = 0; // Number of sales transactions for the day

    dailySales.forEach(sale => {
      totalSales += sale.total;
      salesCount++;
      sale.items.forEach(item => {
        totalExpenses += item.cost * item.quantity; // Sum individual item costs
      });
    });

    const netProfit = totalSales - totalExpenses;

    // Note: If netProfit is consistently 0, it likely means the 'recordedAt'
    // timestamps in your MongoDB data are not correctly set to the current date.
    // Please verify the 'recordedAt' field values in your database for recent sales.
    // The Go backend is designed to set 'recordedAt' to time.Now() on new insertions.

    return {
      totalSales,
      totalExpenses,
      netProfit,
      salesCount,
      dailySales, // Optionally return the filtered sales for further use
    };
  }, [sales]);

  const todaySummary = getDailySummary(today);

  const getTotalProfit = useMemo(() => () => {
    let totalSalesValue = 0;
    let totalCosts = 0;

    sales.forEach(sale => {
      totalSalesValue += sale.total;
      sale.items.forEach(item => {
        totalCosts += item.cost * item.quantity;
      });
    });
    return totalSalesValue - totalCosts;
  }, [sales]);

  const totalProfit = getTotalProfit();

  const getMostProductiveDay = useMemo(() => () => {
    if (sales.length === 0) return "N/A";

    const dailySalesMap: { [key: string]: number } = {}; // Date string -> total sales for that day

    sales.forEach(sale => {
      const dateKey = format(new Date(sale.recordedAt), 'yyyy-MM-dd'); // Use recordedAt
      dailySalesMap[dateKey] = (dailySalesMap[dateKey] || 0) + sale.total;
    });

    let bestDay = "N/A";
    let maxSales = 0;

    for (const dateKey in dailySalesMap) {
      if (dailySalesMap[dateKey] > maxSales) {
        maxSales = dailySalesMap[dateKey];
        bestDay = format(new Date(dateKey), 'MMM dd, yyyy'); // Format for display
      }
    }
    return bestDay;
  }, [sales]);

  const mostProductiveDay = getMostProductiveDay();

  // Recent sales (last 5) - using the actual 'sales' state
  const recentSales = sales
    .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()) // Sort by most recent
    .slice(0, 5);

  // Payment method breakdown
  const mpesaSales = sales.filter(s => s.paymentMethod === 'mpesa').length;
  const cashSales = sales.filter(s => s.paymentMethod === 'cash').length;
  const mpesaPercentage = sales.length > 0 ? Math.round((mpesaSales / sales.length) * 100) : 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-orange-500"></div>
        <p className="ml-4 text-xl text-gray-700">Loading sales data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-red-50 p-6 rounded-lg shadow-md">
        <div className="text-center text-red-700">
          <p className="text-xl font-bold mb-2">Error!</p>
          <p>{error}</p>
          <p className="mt-4 text-sm text-red-500">
            Please ensure your Go backend server is running and accessible at `http://localhost:8080/fetchSaleData`.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 font-inter bg-gray-100 min-h-screen rounded-lg">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome to your Taco Hut command center
          </p>
        </div>
        <div className="text-right mt-4 sm:mt-0">
          <div className="text-sm text-gray-500">
            {format(today, 'EEEE, MMMM do')}
          </div>
          <div className="text-lg font-semibold text-gray-900">
            {format(today, 'HH:mm')}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Today's Sales</p>
              <p className="text-2xl font-bold text-gray-900">
                KES {todaySummary.totalSales.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="mt-2 text-sm text-green-600">
            {todaySummary.salesCount} orders today
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Profit</p>
              <p className="text-2xl font-bold text-gray-900">
                KES {totalProfit.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="mt-2 text-sm text-blue-600">
            All time earnings
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Best Day</p>
              <p className="text-2xl font-bold text-gray-900">
                {mostProductiveDay}
              </p>
            </div>
          </div>
          <div className="mt-2 text-sm text-purple-600">
            Most productive day
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <Smartphone className="h-8 w-8 text-orange-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">M-Pesa Sales</p>
              <p className="text-2xl font-bold text-gray-900">
                {mpesaPercentage}%
              </p>
            </div>
          </div>
          <div className="mt-2 text-sm text-orange-600">
            Digital payments
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Sales</h3>
            <Link to="/sales" className="text-orange-600 hover:text-orange-700 text-sm flex items-center">
              View all <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentSales.length > 0 ? (
              recentSales.map(sale => (
                <div key={sale.ID} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">
                      KES {sale.total.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">
                      {sale.items.length} items • {sale.paymentMethod}
                    </div>
                  </div>
                  <div className="text-right">
                    {/* Ensure recordedAt is parsed correctly to Date */}
                    <div className="text-sm text-gray-500">
                      {format(new Date(sale.recordedAt), 'HH:mm')}
                    </div>
                    <div className="text-xs text-gray-400">
                      {format(new Date(sale.recordedAt), 'MMM dd')}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-500">
                <ShoppingCart className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No sales data available.</p>
                <p className="text-sm">Make sure you've added some sales via the backend.</p>
              </div>
            )}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Payment Methods</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <Smartphone className="h-6 w-6 text-green-600 mr-3" />
                <span className="font-medium">M-Pesa</span>
              </div>
              <div className="text-right">
                <div className="font-bold text-gray-900">{mpesaSales}</div>
                <div className="text-sm text-gray-600">{mpesaPercentage}%</div>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Banknote className="h-6 w-6 text-gray-600 mr-3" />
                <span className="font-medium">Cash</span>
              </div>
              <div className="text-right">
                <div className="font-bold text-gray-900">{cashSales}</div>
                <div className="text-sm text-gray-600">{100 - mpesaPercentage}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 text-white">
          <div className="text-orange-100 text-sm">Today's Expenses</div>
          <div className="text-xl font-bold">KES {todaySummary.totalExpenses.toLocaleString()}</div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
          <div className="text-green-100 text-sm">Net Profit Today</div>
          <div className="text-xl font-bold">KES {todaySummary.netProfit.toLocaleString()}</div>
        </div>
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <div className="text-blue-100 text-sm">Avg Order Value</div>
          <div className="text-xl font-bold">
            KES {todaySummary.salesCount > 0 ? Math.round(todaySummary.totalSales / todaySummary.salesCount) : 0}
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white">
          <div className="text-purple-100 text-sm">Customer Rating</div>
          <div className="text-xl font-bold flex items-center">
            4.8 <Star className="h-4 w-4 ml-1 fill-current" />
          </div>
        </div>
      </div>
    </div>
  );
}