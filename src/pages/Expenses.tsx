import React, { useState } from 'react'
import { Plus, TrendingDown, ShoppingCart, Wrench, Zap, DollarSign } from 'lucide-react'
import { useSales } from '../context/SalesContext'
import { format } from 'date-fns'

const categoryIcons = {
  ingredients: ShoppingCart,
  supplies: ShoppingCart,
  equipment: Wrench,
  utilities: Zap,
  other: DollarSign
}

const categoryColors = {
  ingredients: 'text-green-600 bg-green-100',
  supplies: 'text-blue-600 bg-blue-100',
  equipment: 'text-purple-600 bg-purple-100',
  utilities: 'text-yellow-600 bg-yellow-100',
  other: 'text-gray-600 bg-gray-100'
}

export default function Expenses() {
  const { expenses, addExpense } = useSales()
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: 'ingredients' as const,
    paymentMethod: 'cash' as const,
    mpesaCode: ''
  })

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const categoryTotals = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount
    return acc
  }, {} as Record<string, number>)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.description || !formData.amount) return

    addExpense({
      description: formData.description,
      amount: parseFloat(formData.amount),
      category: formData.category,
      paymentMethod: formData.paymentMethod,
      ...(formData.paymentMethod === 'mpesa' && { mpesaCode: formData.mpesaCode })
    })

    setFormData({
      description: '',
      amount: '',
      category: 'ingredients',
      paymentMethod: 'cash',
      mpesaCode: ''
    })
    setShowAddForm(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory Expenses</h1>
          <p className="text-gray-600 mt-1">Track all your business expenses</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Expense
        </button>
      </div>

      {/* Total Expenses */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center">
          <TrendingDown className="h-8 w-8 text-red-600" />
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-500">Total Expenses</p>
            <p className="text-3xl font-bold text-gray-900">
              KES {totalExpenses.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {Object.entries(categoryTotals).map(([category, total]) => {
          const Icon = categoryIcons[category as keyof typeof categoryIcons]
          const colorClass = categoryColors[category as keyof typeof categoryColors]
          
          return (
            <div key={category} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${colorClass}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500 capitalize">{category}</p>
                  <p className="text-lg font-bold text-gray-900">
                    KES {total.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Add Expense Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Expense</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="e.g., Fresh beef from butchery"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (KES)
                </label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="ingredients">Ingredients</option>
                  <option value="supplies">Supplies</option>
                  <option value="equipment">Equipment</option>
                  <option value="utilities">Utilities</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash"
                      checked={formData.paymentMethod === 'cash'}
                      onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value as 'cash' }))}
                      className="mr-2"
                    />
                    Cash
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="mpesa"
                      checked={formData.paymentMethod === 'mpesa'}
                      onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value as 'mpesa' }))}
                      className="mr-2"
                    />
                    M-Pesa
                  </label>
                </div>
              </div>

              {formData.paymentMethod === 'mpesa' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    M-Pesa Code
                  </label>
                  <input
                    type="text"
                    value={formData.mpesaCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, mpesaCode: e.target.value }))}
                    placeholder="e.g., QZ98Y7X6W5"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Add Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Expenses List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Expenses</h3>
        
        <div className="space-y-3">
          {expenses.map(expense => {
            const Icon = categoryIcons[expense.category]
            const colorClass = categoryColors[expense.category]
            
            return (
              <div key={expense.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${colorClass} mr-3`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{expense.description}</div>
                    <div className="text-sm text-gray-600 capitalize">
                      {expense.category} • {expense.paymentMethod}
                      {expense.mpesaCode && ` • ${expense.mpesaCode}`}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-red-600">
                    -KES {expense.amount.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">
                    {format(new Date(expense.timestamp), 'MMM dd, HH:mm')}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {expenses.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <TrendingDown className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>No expenses recorded yet</p>
          </div>
        )}
      </div>
    </div>
  )
}