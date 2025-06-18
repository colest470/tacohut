import React, { createContext, useContext, useState } from 'react';

interface MenuItem {
  id: string
  name: string
  price: number
  category: string
  ingredients: { name: string; quantity: number; unit: string }[]
}

interface InventoryItem {
  id: string
  name: string
  currentStock: number
  unit: string
  lowStockThreshold: number
  costPerUnit: number
  supplier: string
  lastRestocked: string
  expiryDate?: string
}

interface Sale {
  id: string
  timestamp: string
  items: { menuItemId: string; quantity: number; price: number }[]
  total: number
  paymentMethod: 'cash' | 'mpesa'
  mpesaCode?: string
}

interface Order {
  id: string
  timestamp: string
  items: { name: string; quantity: number; notes?: string }[]
  status: 'pending' | 'preparing' | 'ready' | 'completed'
  estimatedTime: number
  actualTime?: number
}

interface Alert {
  id: string
  type: 'critical' | 'warning' | 'info'
  title: string
  message: string
  timestamp: string
  acknowledged: boolean
}

interface DataContextType {
  menuItems: MenuItem[]
  inventory: InventoryItem[]
  sales: Sale[]
  orders: Order[]
  alerts: Alert[]
  addSale: (sale: Omit<Sale, 'id' | 'timestamp'>) => void
  updateOrderStatus: (orderId: string, status: Order['status']) => void
  acknowledgeAlert: (alertId: string) => void
  updateInventory: (itemId: string, newStock: number) => void
}


const DataContext = createContext<DataContextType | undefined>(undefined)

export function useData() {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [menuItems] = useState<MenuItem[]>([
    {
      id: '1',
      name: 'Carne Asada Taco',
      price: 250,
      category: 'Tacos',
      ingredients: [
        { name: 'Beef', quantity: 80, unit: 'g' },
        { name: 'Tortilla', quantity: 1, unit: 'piece' },
        { name: 'Onions', quantity: 15, unit: 'g' },
        { name: 'Cilantro', quantity: 5, unit: 'g' },
        { name: 'Lime', quantity: 0.25, unit: 'piece' }
      ]
    },
    {
      id: '2',
      name: 'Chicken Taco',
      price: 220,
      category: 'Tacos',
      ingredients: [
        { name: 'Chicken', quantity: 70, unit: 'g' },
        { name: 'Tortilla', quantity: 1, unit: 'piece' },
        { name: 'Onions', quantity: 15, unit: 'g' },
        { name: 'Cilantro', quantity: 5, unit: 'g' },
        { name: 'Lime', quantity: 0.25, unit: 'piece' }
      ]
    },
    {
      id: '3',
      name: 'Guacamole & Chips',
      price: 180,
      category: 'Sides',
      ingredients: [
        { name: 'Avocado', quantity: 1, unit: 'piece' },
        { name: 'Tortilla Chips', quantity: 50, unit: 'g' },
        { name: 'Tomatoes', quantity: 20, unit: 'g' },
        { name: 'Onions', quantity: 10, unit: 'g' },
        { name: 'Lime', quantity: 0.5, unit: 'piece' }
      ]
    }
  ])

  const [inventory, setInventory] = useState<InventoryItem[]>([
    {
      id: '1',
      name: 'Beef',
      currentStock: 2500,
      unit: 'g',
      lowStockThreshold: 500,
      costPerUnit: 0.8,
      supplier: 'Kileleshwa Butchery',
      lastRestocked: '2024-01-15',
      expiryDate: '2024-01-18'
    },
    {
      id: '2',
      name: 'Chicken',
      currentStock: 1800,
      unit: 'g',
      lowStockThreshold: 400,
      costPerUnit: 0.6,
      supplier: 'Kileleshwa Butchery',
      lastRestocked: '2024-01-15',
      expiryDate: '2024-01-18'
    },
    {
      id: '3',
      name: 'Tortilla',
      currentStock: 45,
      unit: 'piece',
      lowStockThreshold: 20,
      costPerUnit: 8,
      supplier: 'Local Bakery',
      lastRestocked: '2024-01-14'
    },
    {
      id: '4',
      name: 'Avocado',
      currentStock: 8,
      unit: 'piece',
      lowStockThreshold: 10,
      costPerUnit: 25,
      supplier: 'City Park Market',
      lastRestocked: '2024-01-13',
      expiryDate: '2024-01-17'
    },
    {
      id: '5',
      name: 'Tomatoes',
      currentStock: 800,
      unit: 'g',
      lowStockThreshold: 200,
      costPerUnit: 0.15,
      supplier: 'City Park Market',
      lastRestocked: '2024-01-14',
      expiryDate: '2024-01-18'
    }
  ])

  const [sales, setSales] = useState<Sale[]>([
    {
      id: '1',
      timestamp: '2024-01-16T10:30:00Z',
      items: [
        { menuItemId: '1', quantity: 2, price: 250 },
        { menuItemId: '3', quantity: 1, price: 180 }
      ],
      total: 680,
      paymentMethod: 'mpesa',
      mpesaCode: 'QA12B3C4D5'
    },
    {
      id: '2',
      timestamp: '2024-01-16T11:15:00Z',
      items: [
        { menuItemId: '2', quantity: 3, price: 220 }
      ],
      total: 660,
      paymentMethod: 'cash'
    }
  ])

  const [orders, setOrders] = useState<Order[]>([
    {
      id: '1',
      timestamp: '2024-01-16T12:00:00Z',
      items: [
        { name: 'Carne Asada Taco', quantity: 2 },
        { name: 'Chicken Taco', quantity: 1, notes: 'Extra spicy' }
      ],
      status: 'preparing',
      estimatedTime: 8
    },
    {
      id: '2',
      timestamp: '2024-01-16T12:05:00Z',
      items: [
        { name: 'Guacamole & Chips', quantity: 2 }
      ],
      status: 'pending',
      estimatedTime: 5
    }
  ])

  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      type: 'critical',
      title: 'Low Stock Alert',
      message: 'Avocados are running low! Only 8 pieces remaining (threshold: 10)',
      timestamp: '2024-01-16T11:45:00Z',
      acknowledged: false
    },
    {
      id: '2',
      type: 'warning',
      title: 'Expiry Warning',
      message: 'Beef expires tomorrow (Jan 18th). Use soon to avoid spoilage.',
      timestamp: '2024-01-16T09:00:00Z',
      acknowledged: false
    },
    {
      id: '3',
      type: 'info',
      title: 'High Sales Volume',
      message: 'Carne Asada tacos are selling 2x faster than usual today!',
      timestamp: '2024-01-16T10:00:00Z',
      acknowledged: false
    }
  ])

  const addSale = (saleData: Omit<Sale, 'id' | 'timestamp'>) => {
    const newSale: Sale = {
      ...saleData,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    }
    setSales(prev => [newSale, ...prev])

    // Update inventory based on sale
    saleData.items.forEach(saleItem => {
      const menuItem = menuItems.find(m => m.id === saleItem.menuItemId)
      if (menuItem) {
        menuItem.ingredients.forEach(ingredient => {
          setInventory(prev => prev.map(invItem => {
            if (invItem.name.toLowerCase() === ingredient.name.toLowerCase()) {
              const newStock = invItem.currentStock - (ingredient.quantity * saleItem.quantity)
              
              // Check if this creates a low stock alert
              if (newStock <= invItem.lowStockThreshold && invItem.currentStock > invItem.lowStockThreshold) {
                const newAlert: Alert = {
                  id: Date.now().toString() + Math.random(),
                  type: 'critical',
                  title: 'Low Stock Alert',
                  message: `${invItem.name} is running low! Only ${newStock} ${invItem.unit} remaining (threshold: ${invItem.lowStockThreshold})`,
                  timestamp: new Date().toISOString(),
                  acknowledged: false
                }
                setAlerts(prev => [newAlert, ...prev])
              }
              
              return { ...invItem, currentStock: Math.max(0, newStock) }
            }
            return invItem
          }))
        })
      }
    })
  }

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { 
            ...order, 
            status,
            actualTime: status === 'completed' ? Math.floor(Math.random() * 10) + 5 : order.actualTime
          }
        : order
    ))
  }

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ))
  }

  const updateInventory = (itemId: string, newStock: number) => {
    setInventory(prev => prev.map(item => 
      item.id === itemId ? { ...item, currentStock: newStock } : item
    ))
  }

  return (
    <DataContext.Provider value={{
      menuItems,
      inventory,
      sales,
      orders,
      alerts,
      addSale,
      updateOrderStatus,
      acknowledgeAlert,
      updateInventory
    }}>
      {children}
    </DataContext.Provider>
  )
}