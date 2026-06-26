'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OrderRow {
  id: string;
  status: string;
  total: number;
  itemCount: number;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  PROCESSING: 'bg-yellow-100 text-yellow-700',
  SHIPPED: 'bg-blue-100 text-blue-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

const statusLabel: Record<string, string> = {
  PENDING: 'Pending',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/orders')
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setOrders(data.data);
        } else {
          setError(data.error ?? 'Failed to load orders.');
        }
      })
      .catch(() => setError('Failed to load orders.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-24 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-secondary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <h1 className="text-3xl font-display font-bold mb-8">Order History</h1>

      {error && (
        <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
          {error}
        </div>
      )}

      {orders.length === 0 && !error ? (
        <div className="text-center py-24">
          <Package className="h-16 w-16 mx-auto text-secondary/30 mb-4" />
          <p className="text-xl font-semibold">No orders yet</p>
          <p className="text-secondary text-sm mt-2 mb-6">Place your first order and it will appear here.</p>
          <Link href="/shop"><Button>Start Shopping</Button></Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white border border-border rounded-2xl p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gray-50 border border-border flex items-center justify-center">
                  <Package className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <p className="font-semibold font-mono text-sm">{order.id}</p>
                  <p className="text-xs text-secondary mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString('en-GB', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })} · {order.itemCount} item{order.itemCount !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColors[order.status] ?? 'bg-gray-100 text-secondary'}`}>
                  {statusLabel[order.status] ?? order.status}
                </span>
                <p className="font-bold">${order.total.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
