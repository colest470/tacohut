import React, { createContext, useContext, useState, useEffect } from 'react'
import { Sale, MenuItem, InventoryExpense, DailySummary, WeeklyAnalysis } from '../types'
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns'

interface SalesContextType {
  sales: Sale[]
  expenses: InventoryExpense[]
  menuItems: MenuItem[]
  addSale: (sale: Omit<Sale, 'id' | 'timestamp'>) => void
  addExpense: (expense: Omit<InventoryExpense, 'id' | 'timestamp'>) => void
  getDailySummary: (date: Date) => DailySummary
  getWeeklyAnalysis: (date: Date) => WeeklyAnalysis
  getTotalProfit: () => number
  getMostProductiveDay: () => string
}

const SalesContext = createContext<SalesContextType | undefined>(undefined)

export function useSales() {
  const context = useContext(SalesContext)
  if (!context) {
    throw new Error('useSales must be used within a SalesProvider')
  }
  return context
}

export function SalesProvider({ children }: { children: React.ReactNode }) {
  const [sales, setSales] = useState<Sale[]>([
    // Sample data for demonstration
    {
      id: '1',
      timestamp: '2024-01-15T10:30:00Z',
      items: [
        { menuItemId: '1', name: 'Carne Asada Taco', quantity: 2, price: 250, cost: 120 },
        { menuItemId: '3', name: 'Guacamole & Chips', quantity: 1, price: 180, cost: 80 }
      ],
      total: 680,
      paymentMethod: 'mpesa',
      mpesaCode: 'QA12B3C4D5',
      customerPhone: '+254700123456'
    },
    {
      id: '2',
      timestamp: '2024-01-15T11:15:00Z',
      items: [
        { menuItemId: '2', name: 'Chicken Taco', quantity: 3, price: 220, cost: 100 }
      ],
      total: 660,
      paymentMethod: 'cash'
    },
    {
      id: '3',
      timestamp: '2024-01-16T12:00:00Z',
      items: [
        { menuItemId: '1', name: 'Carne Asada Taco', quantity: 1, price: 250, cost: 120 },
        { menuItemId: '2', name: 'Chicken Taco', quantity: 2, price: 220, cost: 100 }
      ],
      total: 690,
      paymentMethod: 'mpesa',
      mpesaCode: 'QB34C5D6E7'
    },
    {
      id: '4',
      timestamp: '2024-01-17T13:30:00Z',
      items: [
        { menuItemId: '1', name: 'Carne Asada Taco', quantity: 4, price: 250, cost: 120 }
      ],
      total: 1000,
      paymentMethod: 'cash'
    },
    {
      id: '5',
      timestamp: '2024-01-18T14:45:00Z',
      items: [
        { menuItemId: '2', name: 'Chicken Taco', quantity: 2, price: 220, cost: 100 },
        { menuItemId: '3', name: 'Guacamole & Chips', quantity: 2, price: 180, cost: 80 }
      ],
      total: 800,
      paymentMethod: 'mpesa',
      mpesaCode: 'QC45D6E7F8'
    }
  ])

  const [expenses, setExpenses] = useState<InventoryExpense[]>([
    {
      id: '1',
      timestamp: '2024-01-15T08:00:00Z',
      description: 'Fresh beef from Kileleshwa Butchery',
      amount: 3500,
      category: 'ingredients',
      paymentMethod: 'cash'
    },
    {
      id: '2',
      timestamp: '2024-01-15T08:30:00Z',
      description: 'Vegetables and avocados',
      amount: 1200,
      category: 'ingredients',
      paymentMethod: 'mpesa',
      mpesaCode: 'QZ98Y7X6W5'
    },
    {
      id: '3',
      timestamp: '2024-01-16T09:00:00Z',
      description: 'Tortillas from local bakery',
      amount: 800,
      category: 'ingredients',
      paymentMethod: 'cash'
    },
    {
      id: '4',
      timestamp: '2024-01-17T07:45:00Z',
      description: 'Gas cylinder refill',
      amount: 2200,
      category: 'utilities',
      paymentMethod: 'mpesa',
      mpesaCode: 'QA11B2C3D4'
    }
  ])

  const [menuItems] = useState<MenuItem[]>([
    {
      id: '1',
      name: 'Carne Asada Taco',
      price: 250,
      category: 'Tacos',
      cost: 120
    },
    {
      id: '2',
      name: 'Chicken Taco',
      price: 220,
      category: 'Tacos',
      cost: 100
    },
    {
      id: '3',
      name: 'Guacamole & Chips',
      price: 180,
      category: 'Sides',
      cost: 80
    },
    {
      id: '4',
      name: 'Beef Burrito',
      price: 350,
      category: 'Burritos',
      cost: 180
    },
    {
      id: '5',
      name: 'Chicken Quesadilla',
      price: 280,
      category: 'Quesadillas',
      cost: 140
    }
  ])

  const addSale = (saleData: Omit<Sale, 'id' | 'timestamp'>) => {
    const newSale: Sale = {
      ...saleData,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    }
    setSales(prev => [newSale, ...prev])
  }

  const addExpense = (expenseData: Omit<InventoryExpense, 'id' | 'timestamp'>) => {
    const newExpense: InventoryExpense = {
      ...expenseData,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    }
    setExpenses(prev => [newExpense, ...prev])
  }

  const getDailySummary = (date: Date): DailySummary => {
    const dateStr = format(date, 'yyyy-MM-dd')
    const dayOfWeek = format(date, 'EEEE')
    
    const daySales = sales.filter(sale => 
      format(new Date(sale.timestamp), 'yyyy-MM-dd') === dateStr
    )
    
    const dayExpenses = expenses.filter(expense => 
      format(new Date(expense.timestamp), 'yyyy-MM-dd') === dateStr
    )

    const totalSales = daySales.reduce((sum, sale) => sum + sale.total, 0)
    const totalExpenses = dayExpenses.reduce((sum, expense) => sum + expense.amount, 0)
    const mpesaSales = daySales.filter(s => s.paymentMethod === 'mpesa').reduce((sum, sale) => sum + sale.total, 0)
    const cashSales = daySales.filter(s => s.paymentMethod === 'cash').reduce((sum, sale) => sum + sale.total, 0)

    return {
      date: dateStr,
      dayOfWeek,
      totalSales,
      totalExpenses,
      netProfit: totalSales - totalExpenses,
      salesCount: daySales.length,
      mpesaSales,
      cashSales
    }
  }

  const getWeeklyAnalysis = (date: Date): WeeklyAnalysis => {
    const weekStart = startOfWeek(date, { weekStartsOn: 1 }) // Monday
    const weekEnd = endOfWeek(date, { weekStartsOn: 1 })
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })

    const dailySummaries = weekDays.map(day => getDailySummary(day))
    const totalWeeklyProfit = dailySummaries.reduce((sum, day) => sum + day.netProfit, 0)
    const averageDailyProfit = totalWeeklyProfit / 7

    // Find most productive day
    const mostProductiveDay = dailySummaries.reduce((best, current) => 
      current.netProfit > best.netProfit ? current : best
    ).dayOfWeek

    // Get best performing items for the week
    const weekSales = sales.filter(sale => {
      const saleDate = new Date(sale.timestamp)
      return saleDate >= weekStart && saleDate <= weekEnd
    })

    const itemStats = new Map<string, { quantity: number; revenue: number }>()
    weekSales.forEach(sale => {
      sale.items.forEach(item => {
        const existing = itemStats.get(item.name) || { quantity: 0, revenue: 0 }
        itemStats.set(item.name, {
          quantity: existing.quantity + item.quantity,
          revenue: existing.revenue + (item.quantity * item.price)
        })
      })
    })

    const bestPerformingItems = Array.from(itemStats.entries())
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 3)

    return {
      mostProductiveDay,
      averageDailyProfit,
      totalWeeklyProfit,
      bestPerformingItems
    }
  }

  const getTotalProfit = (): number => {
    const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0)
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
    return totalSales - totalExpenses
  }

  const getMostProductiveDay = (): string => {
    const dayStats = new Map<string, number>()
    
    sales.forEach(sale => {
      const dayOfWeek = format(new Date(sale.timestamp), 'EEEE')
      const profit = sale.items.reduce((sum, item) => sum + ((item.price - item.cost) * item.quantity), 0)
      dayStats.set(dayOfWeek, (dayStats.get(dayOfWeek) || 0) + profit)
    })

    let bestDay = 'Monday'
    let bestProfit = 0
    
    dayStats.forEach((profit, day) => {
      if (profit > bestProfit) {
        bestProfit = profit
        bestDay = day
      }
    })

    return bestDay
  }

  return (
    <SalesContext.Provider value={{
      sales,
      expenses,
      menuItems,
      addSale,
      addExpense,
      getDailySummary,
      getWeeklyAnalysis,
      getTotalProfit,
      getMostProductiveDay
    }}>
      {children}
    </SalesContext.Provider>
  )
}