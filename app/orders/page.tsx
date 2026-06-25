'use client';

import Link from 'next/link';
import { Package } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { mockOrders } from '@/data/mock';

const statusColors: Record<string, string> = {
  Delivered: 'bg-green-100 text-green-700',
  Shipped: 'bg-blue-100 text-blue-700',
  Processing: 'bg-yellow-100 text-yellow-700',
  Cancelled: 'bg-red-100 text-red-700',
};

export default function OrdersPage() {
  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <h1 className="text-3xl font-display font-bold mb-8">Order History</h1>
      {mockOrders.length === 0 ? (
        <div className="text-center py-24">
          <Package className="h-16 w-16 mx-auto text-secondary/30 mb-4" />
          <p className="text-xl font-semibold">No orders yet</p>
          <Link href="/shop"><Button className="mt-6">Start Shopping</Button></Link>
        </div>
      ) : (
        <div className="space-y-4">
          {mockOrders.map(order => (
            <div key={order.id} className="bg-white border border-border rounded-2xl p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gray-50 border border-border flex items-center justify-center">
                  <Package className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <p className="font-semibold font-mono">{order.id}</p>
                  <p className="text-xs text-secondary mt-0.5">{order.date} · {order.items} item{order.items !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColors[order.status] ?? 'bg-gray-100 text-secondary'}`}>{order.status}</span>
                <p className="font-bold">${order.total.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
