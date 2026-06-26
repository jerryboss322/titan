'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend,
} from 'recharts';
import {
  LayoutDashboard, ShoppingBag, Package, Users, BarChart2,
  Settings, Clock, CheckCircle, Truck, XCircle, LogOut, Shield,
  Menu, X, TrendingUp, Activity, Trash2, UserPlus,
  Eye, EyeOff, Loader2, Plus, Zap, Gauge, ChevronDown, Search,
} from 'lucide-react';
import { adminStats, products as mockProducts } from '@/data/mock';
import { useAuth } from '@/contexts/AuthContext';
import { hasPermission, ROLE_LABELS, UserRole } from '@/types';
import Image from 'next/image';
import Link from 'next/link';

// ── Navigation structure (same as before) ──
type NavSection = {
  title: string;
  permission?: string;
  items: { label: string; icon: React.ElementType; id: string; permission?: string }[];
};

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Overview',
    items: [{ label: 'Dashboard', icon: LayoutDashboard, id: 'dashboard' }],
  },
  {
    title: 'Catalog',
    permission: 'manage_products',
    items: [
      { label: 'Products', icon: Package, id: 'products', permission: 'manage_products' },
    ],
  },
  {
    title: 'Orders',
    permission: 'manage_orders',
    items: [
      { label: 'All Orders', icon: ShoppingBag, id: 'orders', permission: 'manage_orders' },
      { label: 'Pending', icon: Clock, id: 'pending', permission: 'manage_orders' },
      { label: 'Processing', icon: Activity, id: 'processing', permission: 'manage_orders' },
      { label: 'Delivered', icon: CheckCircle, id: 'delivered', permission: 'manage_orders' },
      { label: 'Cancelled', icon: XCircle, id: 'cancelled', permission: 'manage_orders' },
    ],
  },
  {
    title: 'Customers',
    permission: 'manage_users',
    items: [
      { label: 'Customer List', icon: Users, id: 'customers', permission: 'manage_users' },
    ],
  },
  {
    title: 'Analytics',
    permission: 'view_analytics',
    items: [
      { label: 'Revenue Trends', icon: TrendingUp, id: 'revenue', permission: 'view_analytics' },
      { label: 'Top Products', icon: BarChart2, id: 'top-products', permission: 'view_analytics' },
    ],
  },
  {
    title: 'Settings',
    permission: 'manage_settings',
    items: [
      { label: 'General', icon: Settings, id: 'settings', permission: 'manage_settings' },
      { label: 'Staff', icon: Users, id: 'roles', permission: 'assign_roles' },
    ],
  },
];

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: string;
  image?: string | null;
  createdAt: string;
}

interface NewProductForm {
  name: string;
  description: string;
  price: string;
  oldPrice: string;
  image: string;
  categoryId: string;
  brand: string;
  stock: string;
  sizes: string;
  colors: string;
  isNew: boolean;
}

const EMPTY_PRODUCT: NewProductForm = {
  name: '', description: '', price: '', oldPrice: '', image: '',
  categoryId: 'men', brand: '', stock: '', sizes: '', colors: '', isNew: false,
};

interface StaffForm {
  name: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'EDITOR';
}

const EMPTY_STAFF: StaffForm = { name: '', email: '', password: '', role: 'ADMIN' };

export default function AdminDashboard() {
  const { user, logout } = useAuth();

  // State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeId, setActiveId] = useState('dashboard');
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [showCreateStaff, setShowCreateStaff] = useState(false);
  const [staffForm, setStaffForm] = useState<StaffForm>(EMPTY_STAFF);
  const [staffSubmitting, setStaffSubmitting] = useState(false);
  const [staffFormError, setStaffFormError] = useState('');
  const [showStaffPassword, setShowStaffPassword] = useState(false);

  const [showCreateProduct, setShowCreateProduct] = useState(false);
  const [productForm, setProductForm] = useState<NewProductForm>(EMPTY_PRODUCT);
  const [productSubmitting, setProductSubmitting] = useState(false);
  const [productFormError, setProductFormError] = useState('');

  // Load staff on mount
  useEffect(() => {
    if (activeId === 'roles' && hasPermission(user, 'assign_roles')) {
      loadStaff();
    }
  }, [activeId, user]);

  const loadStaff = async () => {
    setStaffLoading(true);
    try {
      const res = await fetch('/api/admin/staff');
      if (!res.ok) throw new Error('Failed to load staff');
      const data = await res.json();
      setStaff(data);
    } catch (err) {
      console.error(err);
    } finally {
      setStaffLoading(false);
    }
  };

  const handleCreateStaff = async () => {
    setStaffFormError('');
    if (!staffForm.name || !staffForm.email || !staffForm.password) {
      setStaffFormError('All fields are required.');
      return;
    }
    setStaffSubmitting(true);
    try {
      const res = await fetch('/api/admin/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(staffForm),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create staff');
      }
      setShowCreateStaff(false);
      setStaffForm(EMPTY_STAFF);
      loadStaff();
    } catch (err: any) {
      setStaffFormError(err.message);
    } finally {
      setStaffSubmitting(false);
    }
  };

  const handleDeleteStaff = async (id: string) => {
    if (!confirm('Remove this staff account?')) return;
    try {
      const res = await fetch(`/api/admin/staff`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error('Failed to delete staff');
      loadStaff();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateProduct = async () => {
    setProductFormError('');
    if (!productForm.name || !productForm.price || !productForm.description) {
      setProductFormError('Name, price, and description are required.');
      return;
    }
    setProductSubmitting(true);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productForm),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create product');
      }
      setShowCreateProduct(false);
      setProductForm(EMPTY_PRODUCT);
      // Optionally refresh products here
    } catch (err: any) {
      setProductFormError(err.message);
    } finally {
      setProductSubmitting(false);
    }
  };

  if (!user) {
    return <div className="flex items-center justify-center h-screen text-secondary">Loading...</div>;
  }

  const visibleNavSections = NAV_SECTIONS.filter(
    section => !section.permission || hasPermission(user, section.permission)
  ).map(section => ({
    ...section,
    items: section.items.filter(item => !item.permission || hasPermission(user, item.permission)),
  }));

  const statCards = [
    { label: 'Total Revenue', value: adminStats.totalRevenue, icon: TrendingUp, color: 'text-gold' },
    { label: 'Orders', value: adminStats.totalOrders, icon: ShoppingBag, color: 'text-blue-600' },
    { label: 'Products', value: adminStats.productCount, icon: Package, color: 'text-green-600' },
    { label: 'Customers', value: adminStats.customerCount, icon: Users, color: 'text-purple-600' },
  ];

  return (
    <div className="flex h-screen bg-[#FFFBF4] text-[#111827]" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* ── SIDEBAR ────────────────────────────────────────── */}
      <aside className={`${sidebarOpen ? 'w-72' : 'w-20'} transition-all duration-300 bg-white border-r border-[#E5E7EB] overflow-y-auto flex flex-col`}>
        {/* Header */}
        <div className="p-6 border-b border-[#E5E7EB] flex items-center justify-between">
          {sidebarOpen && <h1 className="text-xl font-semibold">J<span className="text-[#D4AF37]">Store</span></h1>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-[#FFFBF4] rounded-lg transition-colors">
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-6">
          {visibleNavSections.map(section => (
            <div key={section.title}>
              {sidebarOpen && <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider px-3 mb-3">{section.title}</p>}
              <div className="space-y-1">
                {section.items.map(item => {
                  const Icon = item.icon;
                  const isActive = activeId === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveId(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                        isActive
                          ? 'bg-[#FFFBF4] text-[#D4AF37] font-semibold'
                          : 'text-[#6B7280] hover:bg-[#FFFBF4] hover:text-[#111827]'
                      }`}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      {sidebarOpen && <span className="text-sm">{item.label}</span>}
                      {sidebarOpen && isActive && <ChevronDown className="h-4 w-4 ml-auto" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User & Logout */}
        <div className="p-4 border-t border-[#E5E7EB] space-y-3">
          <div className={`flex items-center gap-3 ${!sidebarOpen && 'justify-center'}`}>
            <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-sm font-bold text-[#D4AF37] flex-shrink-0">
              {user.name[0]}
            </div>
            {sidebarOpen && (
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate">{user.name}</p>
                <p className="text-xs text-[#6B7280] truncate">{user.role}</p>
              </div>
            )}
          </div>
          <button
            onClick={() => logout()}
            className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-[#EF4444] hover:bg-red-50 py-2 px-3 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" />
            {sidebarOpen && 'Logout'}
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-8 space-y-8">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-light tracking-tight mb-2">
                {activeId === 'dashboard' ? 'Dashboard' : 'Management'}
              </h1>
              <p className="text-[#6B7280] text-sm">Welcome back, {user.name}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 bg-white border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 w-40"
                />
              </div>
            </div>
          </div>

          {/* ── DASHBOARD ────────────────────────────────────────── */}
          {activeId === 'dashboard' && (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((card, i) => {
                  const Icon = card.icon;
                  return (
                    <div key={i} className="bg-white border border-[#E5E7EB] rounded-2xl p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide mb-1">{card.label}</p>
                          <p className="text-3xl font-semibold text-[#111827]">{card.value}</p>
                        </div>
                        <div className={`p-3 bg-[#FFFBF4] rounded-lg ${card.color}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                      </div>
                      <p className="text-xs text-[#6B7280]">↑ 12% from last month</p>
                    </div>
                  );
                })}
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Trend */}
                <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6">
                  <h3 className="font-semibold text-[#111827] mb-4">Revenue Trend</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={adminStats.revenueData}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="month" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
                      <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
                      <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px' }} />
                      <Area type="monotone" dataKey="revenue" stroke="#D4AF37" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Top Products */}
                <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6">
                  <h3 className="font-semibold text-[#111827] mb-4">Top Products</h3>
                  <div className="space-y-4">
                    {adminStats.topProducts.slice(0, 5).map((p, i) => (
                      <div key={i} className="flex items-center gap-4 pb-4 border-b border-[#E5E7EB] last:border-0">
                        <div className="w-12 h-12 rounded-lg bg-[#F5F3EF] flex items-center justify-center text-sm font-bold text-[#6B7280]">{i + 1}</div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-[#111827]">{p.name}</p>
                          <p className="text-xs text-[#9CA3AF]">{p.sales} units sold</p>
                        </div>
                        <p className="text-sm font-semibold text-[#D4AF37]">₦{(p.revenue / 1000).toFixed(1)}k</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── PRODUCTS ────────────────────────────────────────── */}
          {activeId === 'products' && hasPermission(user, 'manage_products') && (
            <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-[#E5E7EB] flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-[#111827]">Products</h2>
                  <p className="text-sm text-[#6B7280] mt-1">{mockProducts.length} products in catalog</p>
                </div>
                <button
                  onClick={() => setShowCreateProduct(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#111827] text-white rounded-lg hover:opacity-90 transition-opacity font-semibold text-sm"
                >
                  <Plus className="h-4 w-4" />
                  Add Product
                </button>
              </div>

              {/* Product Form Modal */}
              {showCreateProduct && (
                <div className="p-6 bg-[#FFFBF4] border-b border-[#E5E7EB]">
                  <h3 className="text-sm font-semibold text-[#111827] mb-4">New Product</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mb-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide mb-2">Product Name</label>
                      <input type="text" value={productForm.name} onChange={e => setProductForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Premium Leather Jacket" className="w-full px-4 py-2.5 border border-[#E5E7EB] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide mb-2">Price (₦)</label>
                      <input type="number" value={productForm.price} onChange={e => setProductForm(f => ({ ...f, price: e.target.value }))} placeholder="45000" className="w-full px-4 py-2.5 border border-[#E5E7EB] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide mb-2">Old Price (₦)</label>
                      <input type="number" value={productForm.oldPrice} onChange={e => setProductForm(f => ({ ...f, oldPrice: e.target.value }))} placeholder="50000" className="w-full px-4 py-2.5 border border-[#E5E7EB] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide mb-2">Stock</label>
                      <input type="number" value={productForm.stock} onChange={e => setProductForm(f => ({ ...f, stock: e.target.value }))} placeholder="100" className="w-full px-4 py-2.5 border border-[#E5E7EB] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide mb-2">Description</label>
                      <textarea value={productForm.description} onChange={e => setProductForm(f => ({ ...f, description: e.target.value }))} placeholder="Product description..." rows={3} className="w-full px-4 py-2.5 border border-[#E5E7EB] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40" />
                    </div>
                  </div>
                  {productFormError && <p className="text-xs text-red-600 font-medium mb-4">{productFormError}</p>}
                  <div className="flex items-center gap-3">
                    <button onClick={handleCreateProduct} disabled={productSubmitting} className="flex items-center gap-2 text-xs font-semibold bg-[#111827] text-white px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50">
                      {productSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                      {productSubmitting ? 'Creating...' : 'Create Product'}
                    </button>
                    <button onClick={() => { setShowCreateProduct(false); setProductFormError(''); setProductForm(EMPTY_PRODUCT); }} className="text-xs font-semibold text-[#6B7280] hover:text-[#111827] px-3 py-2.5 rounded-lg transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Products List */}
              <div className="divide-y divide-[#E5E7EB]">
                {mockProducts.slice(0, 10).map(product => (
                  <div key={product.id} className="p-6 hover:bg-[#FFFBF4] transition-colors flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="w-16 h-16 rounded-lg bg-[#F5F3EF] flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-[#111827]">{product.name}</p>
                        <p className="text-xs text-[#9CA3AF] mt-1">SKU: {product.id}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-sm font-semibold text-[#111827]">₦{product.price}</span>
                          <span className="text-xs text-[#9CA3AF]">Stock: {product.stock}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0 flex items-center gap-2">
                      <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full">Active</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── ORDERS ────────────────────────────────────────── */}
          {['orders', 'pending', 'processing', 'delivered', 'cancelled'].includes(activeId) && hasPermission(user, 'manage_orders') && (
            <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-[#E5E7EB]">
                <h2 className="text-xl font-semibold text-[#111827]">Orders</h2>
                <p className="text-sm text-[#6B7280] mt-1">Manage and track all orders</p>
              </div>
              <div className="divide-y divide-[#E5E7EB]">
                {adminStats.recentOrders.slice(0, 8).map(order => (
                  <div key={order.id} className="p-6 hover:bg-[#FFFBF4] transition-colors flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#111827]">Order #{order.id}</p>
                      <p className="text-sm text-[#6B7280] mt-1">₦{order.total} • {order.items} items</p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      order.status === 'Delivered' ? 'bg-green-50 text-green-700' :
                      order.status === 'Processing' ? 'bg-blue-50 text-blue-700' :
                      order.status === 'Pending' ? 'bg-yellow-50 text-yellow-700' :
                      'bg-red-50 text-red-700'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── CUSTOMERS ────────────────────────────────────────── */}
          {activeId === 'customers' && hasPermission(user, 'manage_users') && (
            <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-[#E5E7EB]">
                <h2 className="text-xl font-semibold text-[#111827]">Customers</h2>
                <p className="text-sm text-[#6B7280] mt-1">{adminStats.customerCount} active customers</p>
              </div>
              <div className="divide-y divide-[#E5E7EB]">
                {adminStats.topCustomers.map((customer, i) => (
                  <div key={i} className="p-6 hover:bg-[#FFFBF4] transition-colors flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-sm font-bold text-[#D4AF37] flex-shrink-0">
                      {customer.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#111827]">{customer.name}</p>
                      <p className="text-sm text-[#6B7280] mt-1">{customer.orders} orders • ₦{customer.spent}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── STAFF MANAGEMENT ────────────────────────────────────────── */}
          {activeId === 'roles' && hasPermission(user, 'assign_roles') && (
            <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-[#E5E7EB] flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-[#111827]">Staff Members</h2>
                  <p className="text-sm text-[#6B7280] mt-1">{staff.length} staff members</p>
                </div>
                <button
                  onClick={() => setShowCreateStaff(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#111827] text-white rounded-lg hover:opacity-90 transition-opacity font-semibold text-sm"
                >
                  <UserPlus className="h-4 w-4" />
                  Add Staff
                </button>
              </div>

              {/* Staff Form Modal */}
              {showCreateStaff && (
                <div className="p-6 bg-[#FFFBF4] border-b border-[#E5E7EB]">
                  <h3 className="text-sm font-semibold text-[#111827] mb-4">New Staff Account</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mb-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide mb-2">Full Name</label>
                      <input type="text" value={staffForm.name} onChange={e => setStaffForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Chisom Eze" className="w-full px-4 py-2.5 border border-[#E5E7EB] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide mb-2">Email Address</label>
                      <input type="email" value={staffForm.email} onChange={e => setStaffForm(f => ({ ...f, email: e.target.value }))} placeholder="e.g. chisom@jstore.com" className="w-full px-4 py-2.5 border border-[#E5E7EB] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide mb-2">Password</label>
                      <div className="relative">
                        <input type={showStaffPassword ? 'text' : 'password'} value={staffForm.password} onChange={e => setStaffForm(f => ({ ...f, password: e.target.value }))} placeholder="Min. 6 characters" className="w-full px-4 py-2.5 pr-10 border border-[#E5E7EB] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40" />
                        <button type="button" onClick={() => setShowStaffPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#111827]">
                          {showStaffPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide mb-2">Role</label>
                      <select value={staffForm.role} onChange={e => setStaffForm(f => ({ ...f, role: e.target.value as 'ADMIN' | 'EDITOR' }))} className="w-full px-4 py-2.5 border border-[#E5E7EB] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40">
                        <option value="ADMIN">Admin</option>
                        <option value="EDITOR">Editor</option>
                      </select>
                    </div>
                  </div>
                  {staffFormError && <p className="text-xs text-red-600 font-medium mb-4">{staffFormError}</p>}
                  <div className="flex items-center gap-3">
                    <button onClick={handleCreateStaff} disabled={staffSubmitting} className="flex items-center gap-2 text-xs font-semibold bg-[#111827] text-white px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50">
                      {staffSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                      {staffSubmitting ? 'Creating...' : 'Create Account'}
                    </button>
                    <button onClick={() => { setShowCreateStaff(false); setStaffFormError(''); setStaffForm(EMPTY_STAFF); }} className="text-xs font-semibold text-[#6B7280] hover:text-[#111827] px-3 py-2.5 rounded-lg transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Staff List */}
              {staffLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-5 w-5 animate-spin text-[#6B7280]" />
                </div>
              ) : (
                <div className="divide-y divide-[#E5E7EB]">
                  {staff.map(member => {
                    const isSelf = member.id === user.id;
                    return (
                      <div key={member.id} className="p-6 hover:bg-[#FFFBF4] transition-colors flex items-center gap-4 justify-between">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-sm font-bold text-[#D4AF37] flex-shrink-0">
                            {member.name[0]}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold text-[#111827]">{member.name}</p>
                              {isSelf && <span className="text-xs text-[#6B7280]">(you)</span>}
                            </div>
                            <p className="text-sm text-[#6B7280] mt-1">{member.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 flex-shrink-0">
                          <span className="px-3 py-1 bg-[#FFFBF4] text-[#D4AF37] text-xs font-semibold rounded-full">{member.role}</span>
                          {!isSelf && member.role !== 'SUPER_ADMIN' && (
                            <button
                              onClick={() => handleDeleteStaff(member.id)}
                              className="p-2 text-[#6B7280] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Remove staff account"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── SETTINGS ────────────────────────────────────────── */}
          {activeId === 'settings' && hasPermission(user, 'manage_settings') && (
            <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden p-6">
              <h2 className="text-xl font-semibold text-[#111827] mb-6">Settings</h2>
              <p className="text-sm text-[#6B7280]">Store settings coming soon...</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
