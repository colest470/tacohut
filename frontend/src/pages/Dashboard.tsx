import { Link } from 'react-router-dom'
import { 
  DollarSign, 
  TrendingUp, 
  ShoppingCart, 
  Calendar,
  Smartphone,
  Banknote,
  ArrowRight,
  Star
} from 'lucide-react'
import { useSales } from '../context/SalesContext'
import { format } from 'date-fns'
import { useEffect } from 'react'

export default function Dashboard() {
  const { sales, expenses, getTotalProfit, getMostProductiveDay, getDailySummary } = useSales() // this is a mock info

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch("http://localhost:8080/");
        if (!response.ok) {
          throw new Error("Error getting to server!")
        }
      } catch (error) {
        console.error(error) // might also not connect to database so return error and a ui display
      }
    })();
  }, []);

  const today = new Date()
  const todaySummary = getDailySummary(today)
  const totalProfit = getTotalProfit();
  const mostProductiveDay = getMostProductiveDay();

  // Recent sales (last 5)
  const recentSales = sales.slice(0, 5)

  // Payment method breakdown
  const mpesaSales = sales.filter(s => s.paymentMethod === 'mpesa').length
  const cashSales = sales.filter(s => s.paymentMethod === 'cash').length
  const mpesaPercentage = sales.length > 0 ? Math.round((mpesaSales / sales.length) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome to your Taco Hut command center
          </p>
        </div>
        <div className="text-right">
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
            {recentSales.map(sale => (
              <div key={sale.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">
                    KES {sale.total.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">
                    {sale.items.length} items • {sale.paymentMethod}
                    {sale.mpesaCode && ` • ${sale.mpesaCode}`}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">
                    {format(new Date(sale.timestamp), 'HH:mm')}
                  </div>
                  <div className="text-xs text-gray-400">
                    {format(new Date(sale.timestamp), 'MMM dd')}
                  </div>
                </div>
              </div>
            ))}
            {recentSales.length === 0 && (
              <div className="text-center py-6 text-gray-500">
                <ShoppingCart className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No sales yet today</p>
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
  )
}