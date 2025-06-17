import React from 'react'
import { TrendingUp, Calendar, Star, Target } from 'lucide-react'
import { useSales } from '../context/SalesContext'
import { format, startOfWeek, endOfWeek } from 'date-fns'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const COLORS = ['#ea580c', '#f97316', '#fb923c', '#fdba74', '#fed7aa']

export default function Analytics() {
  const { sales, expenses, getWeeklyAnalysis, getDailySummary } = useSales()

  const today = new Date()
  const weeklyAnalysis = getWeeklyAnalysis(today)

  // Weekly profit data
  const weekStart = startOfWeek(today, { weekStartsOn: 1 })
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStart)
    date.setDate(date.getDate() + i)
    const summary = getDailySummary(date)
    return {
      day: format(date, 'EEE'),
      profit: summary.netProfit,
      sales: summary.totalSales,
      expenses: summary.totalExpenses
    }
  })

  // Payment method distribution
  const mpesaSales = sales.filter(s => s.paymentMethod === 'mpesa').length
  const cashSales = sales.filter(s => s.paymentMethod === 'cash').length
  const paymentData = [
    { name: 'M-Pesa', value: mpesaSales, color: '#22c55e' },
    { name: 'Cash', value: cashSales, color: '#6b7280' }
  ]

  // Category expenses
  const categoryExpenses = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount
    return acc
  }, {} as Record<string, number>)

  const expenseData = Object.entries(categoryExpenses).map(([category, amount]) => ({
    category: category.charAt(0).toUpperCase() + category.slice(1),
    amount
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Business Analytics</h1>
        <p className="text-gray-600 mt-1">Insights and performance analysis</p>
      </div>

      {/* Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center">
            <Star className="h-8 w-8" />
            <div className="ml-3">
              <p className="text-green-100 text-sm">Most Productive Day</p>
              <p className="text-2xl font-bold">{weeklyAnalysis.mostProductiveDay}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8" />
            <div className="ml-3">
              <p className="text-blue-100 text-sm">Weekly Profit</p>
              <p className="text-2xl font-bold">KES {weeklyAnalysis.totalWeeklyProfit.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center">
            <Target className="h-8 w-8" />
            <div className="ml-3">
              <p className="text-purple-100 text-sm">Daily Avg Profit</p>
              <p className="text-2xl font-bold">KES {Math.round(weeklyAnalysis.averageDailyProfit).toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center">
            <Calendar className="h-8 w-8" />
            <div className="ml-3">
              <p className="text-orange-100 text-sm">Total Orders</p>
              <p className="text-2xl font-bold">{sales.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Profit Trend */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Profit Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip formatter={(value) => [`KES ${value}`, 'Profit']} />
                <Bar dataKey="profit" fill="#ea580c" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {paymentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Categories */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Expense Categories</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={expenseData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip formatter={(value) => [`KES ${value}`, 'Amount']} />
                <Bar dataKey="amount" fill="#dc2626" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Best Performing Items */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Items</h3>
          <div className="space-y-3">
            {weeklyAnalysis.bestPerformingItems.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{item.name}</div>
                    <div className="text-sm text-gray-600">{item.quantity} sold</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">
                    KES {item.revenue.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Revenue</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Key Observations</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• {weeklyAnalysis.mostProductiveDay} is your most profitable day of the week</li>
              <li>• M-Pesa accounts for {Math.round((mpesaSales / sales.length) * 100)}% of your transactions</li>
              <li>• Your best-selling item is {weeklyAnalysis.bestPerformingItems[0]?.name || 'N/A'}</li>
              <li>• Average daily profit is KES {Math.round(weeklyAnalysis.averageDailyProfit).toLocaleString()}</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Recommendations</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Consider special promotions on slower days</li>
              <li>• Stock up on ingredients for your best-selling items</li>
              <li>• Monitor expense categories to optimize costs</li>
              <li>• Track daily patterns to optimize staffing</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}