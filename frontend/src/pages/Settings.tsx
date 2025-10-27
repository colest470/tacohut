import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Smartphone, Bell, User, Crown, Trash2, Clock } from 'lucide-react';

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

interface FetchSalesResponse {
  status: string;
  data: SalesData[];
}

interface ExpenseData {
  ID: string;
  amount: number;
  category: string;
  description: string;
  paymentMethod: string;
  recordedAt: string;
}

interface FetchExpensesResponse {
  status: string;
  data: ExpenseData[];
}

export default function Settings() {
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expensesData, setExpensesData] = useState<ExpenseData[]>([]);

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        const response = await fetch('http://localhost:8080/');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: FetchSalesResponse = await response.json();

        if (data.status == "success") {
          setSalesData(data.data || []);
        }

        setIsLoading(false);
      } catch (err: any) {
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchSalesData();
  }, []);

  useEffect(() => {
    const fetchExpensesData = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/fetchExpense");

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: FetchExpensesResponse = await response.json();

        if (data.status === "success") {
          setExpensesData(data.data);
        }
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchExpensesData();
  }, []);

  const handleDeleteSales = async (id: string) => {
    console.log("Deleting sales eith id: ", id);
    try {
      const response = await fetch(`http://localhost:8080/api/sales/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setExpensesData(expensesData.filter(expense => expense.ID !== id));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    console.log("Deleting expense with id: ", id);

    try {
      const response = await fetch(`http://localhost:8080/api/expenses/${id}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        setError("Error Deleting expense");
        throw new Error(`Error deleting expense with id:${id}`);
      }

      setSalesData(salesData?.filter(sale => sale.ID !== id));
    } catch (error) {
      console.error(error);
    }
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Configure your Taco Hut system</p>
      </div>

      {/* Sales Data Management */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <Clock className="h-5 w-5 text-orange-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Sales Records</h3>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {salesData?.map((sale) => (
                  <tr key={sale.ID} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(sale.recordedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {sale.items.map(item => (
                          <div key={item.menuItemId} className="flex items-center space-x-2 mb-1">
                            <span className="font-medium">{item.name}</span>
                            <span className="text-gray-500">x{item.quantity}</span>
                            <span className="text-orange-600">ksh{item.price}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${sale.paymentMethod === 'cash' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                        {sale.paymentMethod}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ksh{sale.total}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDeleteSales(sale.ID)}
                        className="text-red-600 hover:text-red-900 flex items-center space-x-1"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Expenses Data Management */}
<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
  <div className="flex items-center mb-4">
    <Trash2 className="h-5 w-5 text-orange-600 mr-2" />
    <h3 className="text-lg font-semibold text-gray-900">Expense Records</h3>
  </div>
  
  {isLoading ? (
    <div className="flex justify-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-600"></div>
    </div>
  ) : error ? (
    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </div>
    </div>
  ) : (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Description
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Category
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Payment Method
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {expensesData?.map((expense) => (
            <tr key={expense.ID} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatDate(expense.recordedAt)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {expense.description}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {expense.category}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                ksh{expense.amount}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                  ${expense.paymentMethod === 'cash' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                  {expense.paymentMethod}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => handleDeleteExpense(expense.ID)}
                  className="text-red-600 hover:text-red-900 flex items-center space-x-1"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</div>

      {/* Business Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <Crown className="h-5 w-5 text-orange-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Business Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Name
            </label>
            <input
              type="text"
              defaultValue="Taco Hut"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <input
              type="text"
              defaultValue="Westlands, Nairobi"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              defaultValue="+254 700 123 456"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Operating Hours
            </label>
            <input
              type="text"
              defaultValue="10:00 AM - 10:00 PM"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>
      </div>

      {/* User Profile */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <User className="h-5 w-5 text-gray-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">User Profile</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              defaultValue="Restaurant Manager"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              defaultValue="manager@tacohut.co.ke"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>
      </div>

      {/* Save Settings */}
      <div className="flex justify-end space-x-4">
        <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
          Reset to Defaults
        </button>
        <button className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
          Save Settings
        </button>
      </div>
    </div>
  );
}