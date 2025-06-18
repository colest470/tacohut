export interface MenuItem {
  id: string
  name: string
  price: number
  category: string
  cost: number // Cost to make the item
}

export interface Sale {
  id: string
  timestamp: string
  items: SaleItem[]
  total: number
  paymentMethod: 'mpesa' | 'cash'
  mpesaCode?: string
  customerPhone?: string
}

export interface SaleItem {
  menuItemId: string
  name: string
  quantity: number
  price: number
  cost: number
}

export interface InventoryExpense {
  id: string
  timestamp: string
  description: string
  amount: number
  category: 'ingredients' | 'supplies' | 'equipment' | 'utilities' | 'other'
  paymentMethod: 'mpesa' | 'cash'
  mpesaCode?: string
}

export interface DailySummary {
  date: string
  dayOfWeek: string
  totalSales: number
  totalExpenses: number
  netProfit: number
  salesCount: number
  mpesaSales: number
  cashSales: number
}

export interface WeeklyAnalysis {
  mostProductiveDay: string
  averageDailyProfit: number
  totalWeeklyProfit: number
  bestPerformingItems: { name: string; quantity: number; revenue: number }[]
}