import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, DollarSign, ShoppingCart, TrendingUp, X, Settings, Menu, Crown } from "lucide-react";

const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Sales', href: '/sales', icon: DollarSign },
    { name: 'Add Sale', href: '/add-sale', icon: ShoppingCart },
    { name: 'Expenses', href: '/expenses', icon: TrendingUp },
    { name: 'Analytics', href: '/analytics', icon: TrendingUp },
    { name: 'Settings', href: '/settings', icon: Settings },
];

interface LayoutProps {
    children: React.ReactNode
}

function Layout({ children }: LayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();

    return(
        <div className="min-h-screen bg-gray-50">
        {/* Mobile sidebar */}
        <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
            <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white shadow-xl">
            <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                <Crown className="h-8 w-8 text-orange-600" />
                <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">
                    Taco Hut
                </span>
                </div>
                <button
                onClick={() => setSidebarOpen(false)}
                className="text-gray-400 hover:text-gray-600"
                >
                <X className="h-6 w-6" />
                </button>
            </div>
            <nav className="flex-1 px-4 py-4 space-y-2">
                {navigation.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.href
                return (
                    <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                        ? 'bg-orange-100 text-orange-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                    >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                    </Link>
                )
                })}
            </nav>
            </div>
        </div>

        {/* Desktop sidebar */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
            <div className="flex flex-col flex-grow bg-white border-r border-gray-200 shadow-sm">
            <div className="flex h-16 items-center px-6 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                <Crown className="h-8 w-8 text-orange-600" />
                <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">
                    Taco Hut
                </span>
                </div>
            </div>
            <nav className="flex-1 px-4 py-4 space-y-2">
                {navigation.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.href
                return (
                    <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                        ? 'bg-orange-100 text-orange-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                    >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                    </Link>
                )
                })}
            </nav>
            </div>
        </div>

        {/* Main content */}
        <div className="lg:pl-64">
            {/* Top bar */}
            <div className="sticky top-0 z-40 flex h-16 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
            <button
                type="button"
                className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
                onClick={() => setSidebarOpen(true)}
            >
                <Menu className="h-6 w-6" />
            </button>
            
            <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
                <div className="flex items-center gap-x-4 lg:gap-x-6">
                <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" />
                <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-600">Sales System Online</span>
                </div>
                </div>
            </div>
            </div>

            {/* Page content */}
            <main className="py-6">
            <div className="px-4 sm:px-6 lg:px-8">
                {children}
            </div>
            </main>
        </div>
        </div>
    )
}

export default Layout;
