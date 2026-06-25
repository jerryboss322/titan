'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Trash2, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/contexts/ToastContext';

const SHIPPING = 12.99;
const TAX_RATE = 0.075;

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, subtotal, clearCart } = useCart();
  const { toast } = useToast();

  const tax = subtotal * TAX_RATE;
  const shipping = subtotal >= 150 ? 0 : SHIPPING;
  const total = subtotal + tax + shipping;

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <ShoppingBag className="h-16 w-16 mx-auto text-secondary/30 mb-4" />
        <h1 className="text-2xl font-display font-bold">Your cart is empty</h1>
        <p className="text-secondary mt-2">Add some items and they&apos;ll appear here.</p>
        <Link href="/shop"><Button className="mt-8">Continue Shopping</Button></Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-display font-bold mb-8">Shopping Cart</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => (
            <div key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}`} className="bg-white border border-border rounded-2xl p-4 flex gap-4">
              <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                <Image src={item.product.image} alt={item.product.name} fill className="object-cover" unoptimized />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-semibold">{item.product.name}</h3>
                    <p className="text-xs text-secondary mt-0.5">
                      {[item.selectedColor, item.selectedSize].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <button onClick={() => { removeFromCart(item.product.id); toast('Item removed', 'info'); }} className="text-secondary hover:text-red-500 transition-colors p-1">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="w-8 h-8 border border-border rounded-lg flex items-center justify-center hover:border-secondary text-sm font-medium">-</button>
                    <span className="w-6 text-center font-semibold text-sm">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="w-8 h-8 border border-border rounded-lg flex items-center justify-center hover:border-secondary text-sm font-medium">+</button>
                  </div>
                  <p className="font-bold">${(item.product.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            </div>
          ))}
          <button onClick={() => { clearCart(); toast('Cart cleared', 'info'); }} className="text-sm text-secondary hover:text-foreground underline underline-offset-4 mt-2">
            Clear cart
          </button>
        </div>

        {/* Summary */}
        <div className="bg-white border border-border rounded-2xl p-6 h-fit sticky top-20">
          <h2 className="font-display font-bold text-xl mb-6">Order Summary</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-secondary">Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-secondary">Tax (7.5%)</span><span>${tax.toFixed(2)}</span></div>
            <div className="flex justify-between">
              <span className="text-secondary">Shipping</span>
              <span>{shipping === 0 ? <span className="text-green-600">Free</span> : `$${shipping.toFixed(2)}`}</span>
            </div>
            {shipping > 0 && (
              <p className="text-xs text-secondary bg-gold/10 rounded-lg px-3 py-2">Add ${(150 - subtotal).toFixed(2)} more for free shipping</p>
            )}
            <div className="border-t border-border pt-3 flex justify-between font-bold text-base">
              <span>Total</span><span>${total.toFixed(2)}</span>
            </div>
          </div>
          <Link href="/checkout">
            <Button className="w-full mt-6" size="lg">Proceed to Checkout</Button>
          </Link>
          <Link href="/shop">
            <Button variant="outline" className="w-full mt-3">Continue Shopping</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
