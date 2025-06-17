import React, { useState } from 'react'
import { DollarSign, Smartphone, Banknote, Calendar, Search, Filter } from 'lucide-react'
import { useSales } from '../context/SalesContext'
import { format } from 'date-fns'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

export default function Sales() {
  const { sales, menuItems } = useSales()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPayment, setFilterPayment] = useState<'all' | 'mpesa' | 'cash'>('all')

  // Filter sales based on search and payment method
  const filteredSales = sales.filter(sale => {
    const matchesSearch = sale.mpesaCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sale.customerPhone?.includes(searchTerm) ||
                         sale.id.includes(searchTerm)
    const matchesPayment = filterPayment === 'all' || sale.paymentMethod === filterPayment
    return matchesSearch && matchesPayment
  })

  // Calculate metrics
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0)
  const mpesaSales = sales.filter(s => s.paymentMethod === 'mpesa')
  const cashSales = sales.filter(s => s.paymentMethod === 'cash')
  const mpesaRevenue = mpesaSales.reduce((sum, sale) => sum + sale.total, 0)
  const cashRevenue = cashSales.reduce((sum, sale) => sum + sale.total, 0)

  // Daily sales data for chart
  const dailySalesMap = new Map<string, { date: string; revenue: number; orders: number }>()
  
  sales.forEach(sale => {
    const date = format(new Date(sale.timestamp), 'MMM dd')
    const existing = dailySalesMap.get(date) || { date, revenue: 0, orders: 0 }
    dailySalesMap.set(date, {
      date,
      revenue: existing.revenue + sale.total,
      orders: existing.orders + 1
    })
  })

  const dailySalesData = Array.from(dailySalesMap.values()).sort((a, b) => 
    new Date(a.date + ', 2024').getTime() - new Date(b.date + ', 2024').getTime()
  )

  // Best selling items
  const itemSales = sales.flatMap(sale => sale.items)
  const itemStats = menuItems.map(item => {
    const soldItems = itemSales.filter(saleItem => saleItem.menuItemId === item.id)
    const totalQuantity = soldItems.reduce((sum, saleItem) => sum + saleItem.quantity, 0)
    const totalRevenue = soldItems.reduce((sum, saleItem) => sum + (saleItem.quantity * saleItem.price), 0)
    return {
      name: item.name,
      quantity: totalQuantity,
      revenue: totalRevenue
    }
  }).sort((a, b) => b.revenue - a.revenue)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Sales History</h1>
        <p className="text-gray-600 mt-1">Track all your sales and revenue</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                KES {totalRevenue.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{sales.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <Smartphone className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">M-Pesa Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                KES {mpesaRevenue.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <Banknote className="h-8 w-8 text-gray-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Cash Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                KES {cashRevenue.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Sales Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Sales</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailySalesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value, name) => [
                  name === 'revenue' ? `KES ${value}` : value,
                  name === 'revenue' ? 'Revenue' : 'Orders'
                ]} />
                <Line type="monotone" dataKey="revenue" stroke="#ea580c" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Best Selling Items */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Best Sellers</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={itemStats.slice(0, 5)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`KES ${value}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="#ea580c" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Sales List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">All Sales</h3>
          
          <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-0">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by M-Pesa code, phone, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            
            {/* Payment Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={filterPayment}
                onChange={(e) => setFilterPayment(e.target.value as 'all' | 'mpesa' | 'cash')}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none bg-white"
              >
                <option value="all">All Payments</option>
                <option value="mpesa">M-Pesa Only</option>
                <option value="cash">Cash Only</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSales.map(sale => (
                <tr key={sale.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {format(new Date(sale.timestamp), 'MMM dd, yyyy')}
                    </div>
                    <div className="text-sm text-gray-500">
                      {format(new Date(sale.timestamp), 'HH:mm')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {sale.items.map(item => (
                        <div key={item.menuItemId}>
                          {item.quantity}x {item.name}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {sale.paymentMethod === 'mpesa' ? (
                        <Smartphone className="h-4 w-4 text-green-600 mr-2" />
                      ) : (
                        <Banknote className="h-4 w-4 text-gray-600 mr-2" />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900 capitalize">
                          {sale.paymentMethod}
                        </div>
                        {sale.mpesaCode && (
                          <div className="text-sm text-gray-500">{sale.mpesaCode}</div>
                        )}
                        {sale.customerPhone && (
                          <div className="text-sm text-gray-500">{sale.customerPhone}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900">
                      KES {sale.total.toLocaleString()}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredSales.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <DollarSign className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>No sales found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  )
}