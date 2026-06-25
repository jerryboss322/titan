'use client';

import { useState, useCallback } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  LayoutDashboard, ShoppingBag, Package, Users, Star, BarChart2,
  Settings, Tag, Image as ImageIcon, Boxes, Clock, CheckCircle,
  Truck, XCircle, ChevronRight, LogOut, Shield, Edit3, UserCheck,
  Menu, X, TrendingUp, Activity, AlertCircle, Trash2, UserPlus,
  Eye, EyeOff,
} from 'lucide-react';
import { adminStats, products } from '@/data/mock';
import { useAuth } from '@/contexts/AuthContext';
import { hasPermission, ROLE_LABELS, UserRole, User } from '@/types';
import Image from 'next/image';
import Link from 'next/link';

// ── Sidebar nav definition ──────────────────────────────────────────────
type NavSection = {
  title: string;
  permission?: string;
  items: { label: string; icon: React.ElementType; id: string; permission?: string }[];
};

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, id: 'dashboard' },
    ],
  },
  {
    title: 'Catalog',
    permission: 'manage_products',
    items: [
      { label: 'Products', icon: Package, id: 'products', permission: 'manage_products' },
      { label: 'Categories', icon: Tag, id: 'categories', permission: 'manage_categories' },
      { label: 'Brands', icon: Star, id: 'brands', permission: 'manage_brands' },
      { label: 'Images', icon: ImageIcon, id: 'images', permission: 'manage_products' },
      { label: 'Inventory', icon: Boxes, id: 'inventory', permission: 'manage_products' },
    ],
  },
  {
    title: 'Orders',
    permission: 'manage_orders',
    items: [
      { label: 'All Orders', icon: ShoppingBag, id: 'orders', permission: 'manage_orders' },
      { label: 'Pending', icon: Clock, id: 'pending', permission: 'manage_orders' },
      { label: 'Processing', icon: AlertCircle, id: 'processing', permission: 'manage_orders' },
      { label: 'Delivered', icon: CheckCircle, id: 'delivered', permission: 'manage_orders' },
      { label: 'Cancelled', icon: XCircle, id: 'cancelled', permission: 'manage_orders' },
    ],
  },
  {
    title: 'Customers',
    permission: 'manage_users',
    items: [
      { label: 'Customer List', icon: Users, id: 'customers', permission: 'manage_users' },
      { label: 'Order History', icon: Truck, id: 'order-history', permission: 'manage_users' },
    ],
  },
  {
    title: 'Reviews',
    permission: 'manage_reviews',
    items: [
      { label: 'Approve Reviews', icon: CheckCircle, id: 'approve-reviews', permission: 'manage_reviews' },
      { label: 'Reported', icon: AlertCircle, id: 'reported-reviews', permission: 'manage_reviews' },
    ],
  },
  {
    title: 'Analytics',
    permission: 'view_analytics',
    items: [
      { label: 'Revenue Trends', icon: TrendingUp, id: 'revenue', permission: 'view_analytics' },
      { label: 'Top Products', icon: BarChart2, id: 'top-products', permission: 'view_analytics' },
      { label: 'Activity', icon: Activity, id: 'activity', permission: 'view_analytics' },
    ],
  },
  {
    title: 'Settings',
    permission: 'manage_settings',
    items: [
      { label: 'General', icon: Settings, id: 'settings', permission: 'manage_settings' },
      { label: 'Store Info', icon: ShoppingBag, id: 'store-info', permission: 'manage_settings' },
      { label: 'Roles & Users', icon: UserCheck, id: 'roles', permission: 'assign_roles' },
    ],
  },
];

const STATUS_STYLE: Record<string, string> = {
  Delivered: 'bg-green-100 text-green-700',
  Shipped: 'bg-blue-100 text-blue-700',
  Processing: 'bg-yellow-100 text-yellow-700',
  Cancelled: 'bg-red-100 text-red-700',
};

const ROLE_BADGE: Record<UserRole, { bg: string; icon: React.ElementType }> = {
  super_admin: { bg: 'bg-purple-100 text-purple-700', icon: Shield },
  admin: { bg: 'bg-gold/20 text-yellow-700', icon: UserCheck },
  editor: { bg: 'bg-blue-100 text-blue-700', icon: Edit3 },
  customer: { bg: 'bg-gray-100 text-gray-600', icon: Users },
};

// ── Review type ────────────────────────────────────────────────────────
type ReviewStatus = 'pending' | 'approved' | 'flagged' | 'deleted';

interface Review {
  id: number;
  name: string;
  product: string;
  rating: number;
  text: string;
  status: ReviewStatus;
}

const INITIAL_REVIEWS: Review[] = [
  { id: 1, name: 'Aisha B.', product: 'Leather Jacket', rating: 5, text: 'Absolutely love the quality. Worth every penny.', status: 'pending' },
  { id: 2, name: 'James O.', product: 'Minimalist Watch', rating: 4, text: 'Great watch, arrived quickly.', status: 'pending' },
  { id: 3, name: 'Grace A.', product: 'Silk Blouse', rating: 3, text: 'Good but runs small.', status: 'flagged' },
  { id: 4, name: 'Emeka N.', product: 'Slim Chinos', rating: 2, text: 'Stitching came apart after one wash.', status: 'flagged' },
];

// ── Staff member type ──────────────────────────────────────────────────
interface StaffMember extends User {
  createdAt: string;
}

const INITIAL_STAFF: StaffMember[] = [
  { id: 'u_superadmin', name: 'Jerry Boss', email: 'superadmin@titan.com', role: 'super_admin', createdAt: 'Jan 2024', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80' },
  { id: 'u_admin', name: 'Amara Okonkwo', email: 'admin@titan.com', role: 'admin', createdAt: 'Feb 2024', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80' },
  { id: 'u_editor', name: 'Temi Adeyemi', email: 'editor@titan.com', role: 'editor', createdAt: 'Mar 2024', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80' },
];

// ── New staff form state ───────────────────────────────────────────────
interface NewStaffForm {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'editor';
}

const EMPTY_FORM: NewStaffForm = { name: '', email: '', password: '', role: 'admin' };

export default function AdminPage() {
  const { user, signOut } = useAuth();
  const [activeId, setActiveId] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ── Review state ─────────────────────────────────────────────────────
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);

  const approveReview = useCallback((id: number) => {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, status: 'approved' } : r));
  }, []);

  const deleteReview = useCallback((id: number) => {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, status: 'deleted' } : r));
  }, []);

  // ── Staff state ───────────────────────────────────────────────────────
  const [staff, setStaff] = useState<StaffMember[]>(INITIAL_STAFF);
  const [form, setForm] = useState<NewStaffForm>(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleCreateStaff = () => {
    setFormError('');
    if (!form.name.trim() || !form.email.trim() || form.password.length < 6) {
      setFormError('Name, email, and a password of at least 6 characters are required.');
      return;
    }
    if (staff.some(s => s.email.toLowerCase() === form.email.toLowerCase())) {
      setFormError('A staff account with this email already exists.');
      return;
    }
    const newMember: StaffMember = {
      id: `u_${Date.now()}`,
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      role: form.role,
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    };
    setStaff(prev => [...prev, newMember]);
    setForm(EMPTY_FORM);
    setShowCreateForm(false);
  };

  const handleDeleteStaff = (id: string) => {
    // Prevent self-deletion
    if (id === user?.id) return;
    setStaff(prev => prev.filter(s => s.id !== id));
  };

  if (!user || !['super_admin', 'admin', 'editor'].includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 max-w-sm px-6">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
            <Shield className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-display font-bold">Access Denied</h1>
          <p className="text-secondary text-sm">You do not have permission to view this page.</p>
          <Link href="/" className="inline-block mt-2 text-sm font-semibold text-gold hover:underline">← Back to store</Link>
        </div>
      </div>
    );
  }

  const role = user.role as UserRole;
  const roleMeta = ROLE_BADGE[role];
  const RoleIcon = roleMeta.icon;

  const stats = [
    { label: 'Total Revenue', value: `$${adminStats.revenue.toLocaleString()}`, icon: TrendingUp, change: '+12.5%' },
    { label: 'Total Orders', value: adminStats.orders.toLocaleString(), icon: ShoppingBag, change: '+8.2%' },
    { label: 'Products', value: adminStats.products.toString(), icon: Package, change: `+${adminStats.products - 8}` },
    { label: 'Customers', value: adminStats.users.toLocaleString(), icon: Users, change: '+5.1%' },
  ];

  // Filter nav based on role permissions
  const visibleSections = NAV_SECTIONS.map(section => ({
    ...section,
    items: section.items.filter(item =>
      !item.permission || hasPermission(user, item.permission)
    ),
  })).filter(section =>
    section.items.length > 0 &&
    (!section.permission || hasPermission(user, section.permission))
  );

  // Derive visible reviews based on the active section
  const visibleReviews = reviews.filter(r => {
    if (r.status === 'deleted') return false;
    if (activeId === 'approve-reviews') return r.status === 'pending' || r.status === 'approved';
    if (activeId === 'reported-reviews') return r.status === 'flagged';
    return false;
  });

  const Sidebar = () => (
    <aside className="w-64 flex-shrink-0 h-full flex flex-col bg-white border-r border-border overflow-y-auto">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-border flex items-center justify-between">
        <Link href="/" className="font-display text-xl font-bold">
          Titan<span className="text-gold">.</span>
        </Link>
        <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-secondary hover:text-foreground">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* User card */}
      <div className="px-4 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-full overflow-hidden bg-gold/20 flex-shrink-0">
            {user.avatar
              ? <Image src={user.avatar} alt={user.name} fill className="object-cover" unoptimized />
              : <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-gold">{user.name[0]}</span>
            }
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{user.name}</p>
            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${roleMeta.bg}`}>
              <RoleIcon className="h-2.5 w-2.5" />
              {ROLE_LABELS[role]}
            </span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-3 space-y-5">
        {visibleSections.map(section => (
          <div key={section.title}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-secondary/60 px-2 mb-1">{section.title}</p>
            <div className="space-y-0.5">
              {section.items.map(item => {
                const Icon = item.icon;
                const active = activeId === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => { setActiveId(item.id); setSidebarOpen(false); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                      active
                        ? 'bg-gold/10 text-foreground'
                        : 'text-secondary hover:bg-gray-50 hover:text-foreground'
                    }`}
                  >
                    <Icon className={`h-4 w-4 flex-shrink-0 ${active ? 'text-gold' : ''}`} />
                    {item.label}
                    {active && <ChevronRight className="h-3 w-3 ml-auto text-gold" />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Sign out */}
      <div className="px-3 py-4 border-t border-border">
        <button
          onClick={signOut}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-secondary hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex flex-col w-64 bg-white h-full">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-border px-5 py-3.5 flex items-center gap-4">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-secondary hover:text-foreground">
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-base font-display font-bold capitalize">{activeId.replace(/-/g, ' ')}</h1>
            <p className="text-xs text-secondary hidden sm:block">Titan Admin · {ROLE_LABELS[role]}</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className={`hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${roleMeta.bg}`}>
              <RoleIcon className="h-3 w-3" />
              {ROLE_LABELS[role]}
            </span>
            <Link href="/" className="text-xs text-secondary hover:text-foreground font-medium hidden sm:block">
              ← Storefront
            </Link>
          </div>
        </header>

        {/* Dashboard content */}
        <main className="flex-1 overflow-y-auto p-5 space-y-6 max-w-7xl mx-auto w-full">

          {/* ── DASHBOARD ─────────────────────────────────────── */}
          {activeId === 'dashboard' && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map(({ label, value, icon: Icon, change }) => (
                  <div key={label} className="bg-white border border-border rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm text-secondary">{label}</p>
                      <div className="w-9 h-9 rounded-xl bg-gold/10 flex items-center justify-center">
                        <Icon className="h-4 w-4 text-gold" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold">{value}</p>
                    <p className="text-xs text-green-600 font-medium mt-1">{change} this month</p>
                  </div>
                ))}
              </div>

              {hasPermission(user, 'view_analytics') && (
                <div className="bg-white border border-border rounded-2xl p-6">
                  <h2 className="font-semibold mb-6">Revenue (Last 6 months)</h2>
                  <ResponsiveContainer width="100%" height={240}>
                    <AreaChart data={adminStats.revenueData}>
                      <defs>
                        <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(v: unknown) => [`$${Number(v).toLocaleString()}`, 'Revenue']} />
                      <Area type="monotone" dataKey="value" stroke="#D4AF37" strokeWidth={2} fill="url(#goldGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {hasPermission(user, 'manage_orders') && (
                  <div className="bg-white border border-border rounded-2xl p-5">
                    <h2 className="font-semibold mb-4">Recent Orders</h2>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-secondary text-xs border-b border-border">
                          <th className="text-left pb-3">Order</th>
                          <th className="text-left pb-3">Customer</th>
                          <th className="text-right pb-3">Amount</th>
                          <th className="text-right pb-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {adminStats.recentOrders.map(o => (
                          <tr key={o.id}>
                            <td className="py-3 font-mono text-xs">{o.id}</td>
                            <td className="py-3 text-secondary">{o.customer}</td>
                            <td className="py-3 text-right font-semibold">${o.amount.toFixed(2)}</td>
                            <td className="py-3 text-right">
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLE[o.status]}`}>{o.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="bg-white border border-border rounded-2xl p-5">
                  <h2 className="font-semibold mb-4">Top Products</h2>
                  <div className="space-y-3">
                    {products.slice(0, 5).map((p, i) => (
                      <div key={p.id} className="flex items-center gap-3">
                        <span className="text-xs text-secondary w-5">{i + 1}</span>
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                          <Image src={p.image} alt={p.name} fill className="object-cover" unoptimized />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{p.name}</p>
                          <p className="text-xs text-secondary">{p.reviews} reviews</p>
                        </div>
                        <p className="text-sm font-bold">${p.price.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white border border-border rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="h-4 w-4 text-gold" />
                  <h2 className="font-semibold">Activity Feed</h2>
                </div>
                <div className="space-y-3">
                  {[
                    { text: 'New order TIT-1291 placed by Aisha Bello', time: '2 min ago' },
                    { text: 'Product "Cashmere Sweater" back in stock', time: '18 min ago' },
                    { text: 'New customer Grace Adeyemi registered', time: '1 hr ago' },
                    { text: 'Order TIT-1288 marked as delivered', time: '3 hrs ago' },
                    { text: 'Flash sale launched: 20% off accessories', time: '5 hrs ago' },
                  ].map((a, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-gold mt-2 flex-shrink-0" />
                      <p className="flex-1 text-secondary">{a.text}</p>
                      <p className="text-xs text-secondary flex-shrink-0">{a.time}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── PRODUCTS TABLE ────────────────────────────────── */}
          {activeId === 'products' && hasPermission(user, 'manage_products') && (
            <div className="bg-white border border-border rounded-2xl overflow-hidden">
              <div className="p-5 flex items-center justify-between border-b border-border">
                <div>
                  <h2 className="font-semibold">All Products</h2>
                  <p className="text-xs text-secondary mt-0.5">{products.length} items</p>
                </div>
                <button className="text-xs font-semibold bg-foreground text-background px-4 py-2 rounded-xl hover:opacity-80 transition-opacity">
                  + Add Product
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-secondary text-xs bg-gray-50 border-b border-border">
                      <th className="text-left px-5 py-3">Product</th>
                      <th className="text-left px-5 py-3">Category</th>
                      <th className="text-left px-5 py-3">Brand</th>
                      <th className="text-right px-5 py-3">Price</th>
                      <th className="text-right px-5 py-3">Stock</th>
                      <th className="text-right px-5 py-3">Rating</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {products.map(p => (
                      <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                              <Image src={p.image} alt={p.name} fill className="object-cover" unoptimized />
                            </div>
                            <div>
                              <p className="font-medium">{p.name}</p>
                              {p.isNew && <span className="text-xs bg-gold/20 text-yellow-700 px-1.5 py-0.5 rounded font-semibold">New</span>}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-secondary capitalize">{p.categoryId}</td>
                        <td className="px-5 py-3 text-secondary">{p.brand ?? '—'}</td>
                        <td className="px-5 py-3 text-right font-semibold">${p.price.toFixed(2)}</td>
                        <td className="px-5 py-3 text-right">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${(p.stock ?? 99) < 15 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                            {p.stock ?? '—'}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <span className="text-xs">&#9733; {p.rating}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── ORDERS ────────────────────────────────────────── */}
          {['orders', 'pending', 'processing', 'delivered', 'cancelled'].includes(activeId) && hasPermission(user, 'manage_orders') && (
            <div className="bg-white border border-border rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-border">
                <h2 className="font-semibold capitalize">{activeId === 'orders' ? 'All Orders' : `${activeId} Orders`}</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-secondary text-xs bg-gray-50 border-b border-border">
                      <th className="text-left px-5 py-3">Order ID</th>
                      <th className="text-left px-5 py-3">Customer</th>
                      <th className="text-left px-5 py-3">Product</th>
                      <th className="text-right px-5 py-3">Amount</th>
                      <th className="text-right px-5 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {adminStats.recentOrders
                      .filter(o => activeId === 'orders' || o.status.toLowerCase() === activeId)
                      .map(o => (
                        <tr key={o.id} className="hover:bg-gray-50">
                          <td className="px-5 py-3 font-mono text-xs">{o.id}</td>
                          <td className="px-5 py-3">{o.customer}</td>
                          <td className="px-5 py-3 text-secondary">{o.product}</td>
                          <td className="px-5 py-3 text-right font-semibold">${o.amount.toFixed(2)}</td>
                          <td className="px-5 py-3 text-right">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLE[o.status]}`}>{o.status}</span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── CUSTOMERS ─────────────────────────────────────── */}
          {(activeId === 'customers' || activeId === 'order-history') && hasPermission(user, 'manage_users') && (
            <div className="bg-white border border-border rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-border">
                <h2 className="font-semibold">{activeId === 'customers' ? 'Customer List' : 'Order History'}</h2>
                <p className="text-xs text-secondary mt-0.5">3,421 registered customers</p>
              </div>
              <div className="divide-y divide-border">
                {[
                  { name: 'Aisha Bello', email: 'aisha@example.com', orders: 12, spent: 1849.88, joined: 'Jan 2024' },
                  { name: 'James Okafor', email: 'james@example.com', orders: 7, spent: 1119.93, joined: 'Mar 2024' },
                  { name: 'Fatima Yusuf', email: 'fatima@example.com', orders: 5, spent: 949.95, joined: 'Apr 2024' },
                  { name: 'Emeka Nwosu', email: 'emeka@example.com', orders: 9, spent: 2699.91, joined: 'Feb 2024' },
                  { name: 'Grace Adeyemi', email: 'grace@example.com', orders: 3, spent: 269.97, joined: 'Jun 2024' },
                ].map(c => (
                  <div key={c.email} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50">
                    <div className="w-9 h-9 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-gold">{c.name[0]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{c.name}</p>
                      <p className="text-xs text-secondary">{c.email}</p>
                    </div>
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-semibold">${c.spent.toFixed(2)}</p>
                      <p className="text-xs text-secondary">{c.orders} orders · Since {c.joined}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── ANALYTICS ─────────────────────────────────────── */}
          {['revenue', 'top-products', 'activity'].includes(activeId) && hasPermission(user, 'view_analytics') && (
            <div className="space-y-6">
              <div className="bg-white border border-border rounded-2xl p-6">
                <h2 className="font-semibold mb-6">Revenue Trends (Last 6 months)</h2>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={adminStats.revenueData}>
                    <defs>
                      <linearGradient id="goldGrad2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v: unknown) => [`$${Number(v).toLocaleString()}`, 'Revenue']} />
                    <Area type="monotone" dataKey="value" stroke="#D4AF37" strokeWidth={2} fill="url(#goldGrad2)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* ── SETTINGS ──────────────────────────────────────── */}
          {['settings', 'store-info'].includes(activeId) && hasPermission(user, 'manage_settings') && (
            <div className="space-y-4">
              <div className="bg-white border border-border rounded-2xl p-6">
                <h2 className="font-semibold mb-5">
                  {activeId === 'store-info' ? 'Store Information' : 'General Settings'}
                </h2>

                {activeId === 'store-info' && (
                  <div className="space-y-4 max-w-md">
                    {[
                      { label: 'Store Name', value: 'Titan' },
                      { label: 'Contact Email', value: 'hello@titan.store' },
                      { label: 'Currency', value: 'USD ($)' },
                      { label: 'Timezone', value: 'Africa/Lagos (WAT)' },
                    ].map(field => (
                      <div key={field.label}>
                        <label className="block text-xs font-semibold text-secondary uppercase tracking-wide mb-1">{field.label}</label>
                        <div className="px-4 py-3 border border-border rounded-xl text-sm bg-gray-50">{field.value}</div>
                      </div>
                    ))}
                  </div>
                )}

                {activeId === 'settings' && (
                  <div className="space-y-3 max-w-md">
                    {['Maintenance mode', 'Customer reviews', 'Guest checkout', 'Wishlist feature'].map(setting => (
                      <div key={setting} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                        <span className="text-sm">{setting}</span>
                        <div className="w-10 h-5 rounded-full bg-gold/80 relative flex-shrink-0">
                          <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── ROLES & USERS ─────────────────────────────────── */}
          {activeId === 'roles' && hasPermission(user, 'assign_roles') && (
            <div className="space-y-6">

              {/* Role definitions card */}
              <div className="bg-white border border-border rounded-2xl p-6">
                <h2 className="font-semibold mb-5">Roles & Permissions</h2>
                <div className="space-y-3">
                  {(['super_admin', 'admin', 'editor', 'customer'] as UserRole[]).map(r => {
                    const meta = ROLE_BADGE[r];
                    const Icon = meta.icon;
                    return (
                      <div key={r} className="flex items-center gap-4 p-4 border border-border rounded-xl">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${meta.bg}`}>
                          <Icon className="h-3 w-3" />
                          {ROLE_LABELS[r]}
                        </span>
                        <p className="text-sm text-secondary flex-1">
                          {r === 'super_admin' && 'Full system access. Can manage everything including other admins.'}
                          {r === 'admin' && 'Store operations. Products, orders, customers, and analytics.'}
                          {r === 'editor' && 'Content management. Products, categories, brands, and reviews.'}
                          {r === 'customer' && 'Regular shopper. Cart, wishlist, orders, and reviews.'}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Manage Staff card — Super Admin only */}
              {role === 'super_admin' && (
                <div className="bg-white border border-border rounded-2xl overflow-hidden">
                  <div className="p-5 border-b border-border flex items-center justify-between">
                    <div>
                      <h2 className="font-semibold">Manage Staff</h2>
                      <p className="text-xs text-secondary mt-0.5">{staff.filter(s => s.role !== 'customer').length} staff accounts</p>
                    </div>
                    <button
                      onClick={() => { setShowCreateForm(v => !v); setFormError(''); setForm(EMPTY_FORM); }}
                      className="flex items-center gap-1.5 text-xs font-semibold bg-foreground text-background px-4 py-2 rounded-xl hover:opacity-80 transition-opacity"
                    >
                      <UserPlus className="h-3.5 w-3.5" />
                      Add Staff
                    </button>
                  </div>

                  {/* Create staff form */}
                  {showCreateForm && (
                    <div className="p-5 border-b border-border bg-gray-50">
                      <h3 className="text-sm font-semibold mb-4">New Staff Account</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
                        <div>
                          <label className="block text-xs font-semibold text-secondary uppercase tracking-wide mb-1">Full Name</label>
                          <input
                            type="text"
                            value={form.name}
                            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                            placeholder="e.g. Chisom Eze"
                            className="w-full px-4 py-2.5 border border-border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gold/40"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-secondary uppercase tracking-wide mb-1">Email Address</label>
                          <input
                            type="email"
                            value={form.email}
                            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                            placeholder="e.g. chisom@titan.com"
                            className="w-full px-4 py-2.5 border border-border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gold/40"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-secondary uppercase tracking-wide mb-1">Password</label>
                          <div className="relative">
                            <input
                              type={showPassword ? 'text' : 'password'}
                              value={form.password}
                              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                              placeholder="Min. 6 characters"
                              className="w-full px-4 py-2.5 pr-10 border border-border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gold/40"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(v => !v)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-foreground"
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-secondary uppercase tracking-wide mb-1">Role</label>
                          <select
                            value={form.role}
                            onChange={e => setForm(f => ({ ...f, role: e.target.value as 'admin' | 'editor' }))}
                            className="w-full px-4 py-2.5 border border-border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gold/40"
                          >
                            <option value="admin">Admin</option>
                            <option value="editor">Editor</option>
                          </select>
                        </div>
                      </div>

                      {formError && (
                        <p className="mt-3 text-xs text-red-600 font-medium">{formError}</p>
                      )}

                      <div className="flex items-center gap-3 mt-4">
                        <button
                          onClick={handleCreateStaff}
                          className="text-xs font-semibold bg-foreground text-background px-5 py-2.5 rounded-xl hover:opacity-80 transition-opacity"
                        >
                          Create Account
                        </button>
                        <button
                          onClick={() => { setShowCreateForm(false); setFormError(''); setForm(EMPTY_FORM); }}
                          className="text-xs font-semibold text-secondary hover:text-foreground px-3 py-2.5 rounded-xl transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Staff list */}
                  <div className="divide-y divide-border">
                    {staff
                      .filter(s => ['super_admin', 'admin', 'editor'].includes(s.role))
                      .map(member => {
                        const meta = ROLE_BADGE[member.role as UserRole];
                        const Icon = meta.icon;
                        const isSelf = member.id === user.id;
                        return (
                          <div key={member.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                            <div className="relative w-9 h-9 rounded-full overflow-hidden bg-gold/20 flex-shrink-0">
                              {member.avatar
                                ? <Image src={member.avatar} alt={member.name} fill className="object-cover" unoptimized />
                                : <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-gold">{member.name[0]}</span>
                              }
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-sm font-semibold">{member.name}</p>
                                {isSelf && <span className="text-xs text-secondary">(you)</span>}
                                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${meta.bg}`}>
                                  <Icon className="h-2.5 w-2.5" />
                                  {ROLE_LABELS[member.role as UserRole]}
                                </span>
                              </div>
                              <p className="text-xs text-secondary mt-0.5">{member.email} · Added {member.createdAt}</p>
                            </div>
                            {/* Super Admin accounts cannot be deleted; self cannot be deleted */}
                            {!isSelf && member.role !== 'super_admin' && (
                              <button
                                onClick={() => handleDeleteStaff(member.id)}
                                className="flex-shrink-0 p-2 text-secondary hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Remove staff account"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        );
                      })
                    }
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── REVIEWS ───────────────────────────────────────── */}
          {['approve-reviews', 'reported-reviews'].includes(activeId) && hasPermission(user, 'manage_reviews') && (
            <div className="bg-white border border-border rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-border flex items-center justify-between">
                <div>
                  <h2 className="font-semibold">{activeId === 'approve-reviews' ? 'Approve Reviews' : 'Reported Reviews'}</h2>
                  <p className="text-xs text-secondary mt-0.5">{visibleReviews.length} review{visibleReviews.length !== 1 ? 's' : ''}</p>
                </div>
              </div>

              {visibleReviews.length === 0 ? (
                <div className="p-10 text-center text-secondary text-sm">
                  No reviews to show here.
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {visibleReviews.map(r => (
                    <div key={r.id} className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium text-sm">{r.name}</p>
                            <span className="text-secondary text-sm">·</span>
                            <span className="text-secondary text-sm">{r.product}</span>
                            {r.status === 'approved' && (
                              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">Approved</span>
                            )}
                            {r.status === 'flagged' && (
                              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">Reported</span>
                            )}
                          </div>
                          <p className="text-xs text-gold mt-0.5">
                            {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                          </p>
                          <p className="text-sm text-secondary mt-1.5">{r.text}</p>
                        </div>

                        {/* Action buttons — context-aware */}
                        <div className="flex gap-2 flex-shrink-0">
                          {r.status !== 'approved' && (
                            <button
                              onClick={() => approveReview(r.id)}
                              className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                            >
                              <CheckCircle className="h-3.5 w-3.5" />
                              Approve
                            </button>
                          )}
                          <button
                            onClick={() => deleteReview(r.id)}
                            className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Generic placeholder for non-implemented sections */}
          {!['dashboard', 'products', 'orders', 'pending', 'processing', 'delivered', 'cancelled',
             'customers', 'order-history', 'revenue', 'top-products', 'activity',
             'settings', 'store-info', 'roles', 'approve-reviews', 'reported-reviews'].includes(activeId) && (
            <div className="bg-white border border-border rounded-2xl p-12 text-center">
              <p className="text-secondary text-sm">This section is under construction.</p>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
