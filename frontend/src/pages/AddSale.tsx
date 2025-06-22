import { useState } from 'react'
import { Plus, Minus, ShoppingCart, Smartphone, Banknote } from 'lucide-react'
import { useSales } from '../context/SalesContext'

interface SaleItem {
  menuItemId: string
  name: string
  quantity: number
  price: number
  cost: number
  time: Date
}

export default function AddSale() {
  const { menuItems, addSale } = useSales()
  const [cart, setCart] = useState<SaleItem[]>([])
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'cash'>('mpesa')
  // const [mpesaCode, setMpesaCode] = useState('');
  // const [customerPhone, setCustomerPhone] = useState('');
  const [isProcessing, setIsProcessing] = useState(false)

  const addToCart = (menuItem: any) => {
    const existingItem = cart.find(item => item.menuItemId === menuItem.id)
    if (existingItem) {
      setCart(cart.map(item => 
        item.menuItemId === menuItem.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setCart([...cart, {
        menuItemId: menuItem.id,
        name: menuItem.name,
        quantity: 1,
        price: menuItem.price,
        cost: menuItem.cost,
        time: new Date
      }])
    }
  }

  const removeFromCart = (menuItemId: string) => {
    const existingItem = cart.find(item => item.menuItemId === menuItemId)
    if (existingItem && existingItem.quantity > 1) {
      setCart(cart.map(item => 
        item.menuItemId === menuItemId 
          ? { ...item, quantity: item.quantity - 1 }
          : item
      ))
    } else {
      setCart(cart.filter(item => item.menuItemId !== menuItemId))
    }
  }

  const getItemQuantity = (menuItemId: string) => {
    const item = cart.find(item => item.menuItemId === menuItemId)
    return item ? item.quantity : 0
  }

  const getTotalAmount = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }

  const handleProcessSale = async () => {
    if (cart.length === 0) return

    setIsProcessing(true);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    const saleData = {
      items: cart,
      total: getTotalAmount(),
      paymentMethod,
      //...(paymentMethod === 'mpesa' && { mpesaCode, customerPhone }) // this code might be important
    }

    console.log(saleData);

    //addSale(saleData) // instead save to db   

    // try {
    //   const response = await fetch("http://localhost:8080/api/saledata", {
    //     method: "POST",
    //     headers: {
    //       "Content-type": "application/json"
    //     },
    //     body: JSON.stringify(saleData)
    //   });

    //   if (!response.ok) {
    //     throw new Error("Check your server if it is on!");
    //   }
    // } catch (error) {
    //   console.error(error); // ui display or not entered into the database 
    // }
    
    // Reset form
    setCart([])
    // setMpesaCode('')
    // setCustomerPhone('')
    setIsProcessing(false)
    
    alert('Sale processed successfully!')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Add New Sale</h1>
        <p className="text-gray-600 mt-1">Process customer orders and payments</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Menu Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Menu Items</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {menuItems.map(item => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-600">{item.category}</p>
                      <p className="text-lg font-bold text-orange-600 mt-1">
                        KES {item.price}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                        disabled={getItemQuantity(item.id) === 0}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-8 text-center font-medium">
                        {getItemQuantity(item.id)}
                      </span>
                      <button
                        onClick={() => addToCart(item)}
                        className="w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center hover:bg-orange-700 transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cart & Payment */}
        <div className="space-y-6">
          {/* Cart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <ShoppingCart className="h-5 w-5 mr-2" />
              Order Summary
            </h3>
            
            {cart.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ShoppingCart className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No items in cart</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map(item => (
                  <div key={item.menuItemId} className="flex justify-between items-center py-2 border-b border-gray-100">
                    <div>
                      <div className="font-medium text-gray-900">{item.name}</div>
                      <div className="text-sm text-gray-600">
                        {item.quantity} × KES {item.price}
                      </div>
                    </div>
                    <div className="font-bold text-gray-900">
                      KES {(item.quantity * item.price).toLocaleString()}
                    </div>
                  </div>
                ))}
                
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-orange-600">KES {getTotalAmount().toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Payment Method */}
          {cart.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h3>
              
              <div className="space-y-3 mb-4">
                <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="mpesa"
                    checked={paymentMethod === 'mpesa'}
                    onChange={(e) => setPaymentMethod(e.target.value as 'mpesa')}
                    className="mr-3"
                  />
                  <Smartphone className="h-5 w-5 text-green-600 mr-2" />
                  <span className="font-medium">M-Pesa</span>
                </label>
                
                <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash"
                    checked={paymentMethod === 'cash'}
                    onChange={(e) => setPaymentMethod(e.target.value as 'cash')}
                    className="mr-3"
                  />
                  <Banknote className="h-5 w-5 text-gray-600 mr-2" />
                  <span className="font-medium">Cash</span>
                </label>
              </div>

              {paymentMethod === 'mpesa' && (
                <div className="space-y-3">
                  {/* <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      M-Pesa Code
                    </label>
                     <input
                      type="text"
                      value={mpesaCode}
                      onChange={(e) => setMpesaCode(e.target.value)}
                      placeholder="e.g., QA12B3C4D5"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    /> 
                  </div> 
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Customer Phone (Optional)
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+254700123456"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div> */}
                </div>
              )}

              <button
                onClick={handleProcessSale}
                disabled={isProcessing || cart.length === 0} // || (paymentMethod === 'mpesa') && !mpesaCode
                className="w-full mt-4 bg-orange-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {isProcessing ? 'Processing...' : `Process Sale - KES ${getTotalAmount().toLocaleString()}`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}