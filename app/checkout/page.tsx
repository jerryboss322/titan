'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/contexts/ToastContext';

const STEPS = ['Cart Review', 'Shipping', 'Payment', 'Confirmation'];
const TAX_RATE = 0.075;
const SHIPPING_COST = 12.99;
const FREE_SHIPPING_THRESHOLD = 150;

function StepIndicator({ step, current }: { step: number; current: number }) {
  const done = current > step;
  const active = current === step;
  return (
    <div className="flex items-center gap-2">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${done ? 'bg-green-500 text-white' : active ? 'bg-foreground text-white' : 'bg-gray-100 text-secondary'}`}>
        {done ? <Check className="h-4 w-4" /> : step}
      </div>
      <span className={`text-sm hidden md:block ${active ? 'font-semibold' : 'text-secondary'}`}>{STEPS[step - 1]}</span>
    </div>
  );
}

function OrderSummaryBox({ subtotal, tax, shipping, total }: { subtotal: number; tax: number; shipping: number; total: number }) {
  return (
    <div className="mt-6 bg-gray-50 border border-border rounded-xl p-4 space-y-2 text-sm">
      <div className="flex justify-between text-secondary"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
      <div className="flex justify-between text-secondary"><span>Tax (7.5%)</span><span>${tax.toFixed(2)}</span></div>
      <div className="flex justify-between text-secondary">
        <span>Shipping</span>
        <span>{shipping === 0 ? <span className="text-green-600 font-medium">Free</span> : `$${shipping.toFixed(2)}`}</span>
      </div>
      <div className="flex justify-between font-bold text-base pt-2 border-t border-border"><span>Total</span><span>${total.toFixed(2)}</span></div>
    </div>
  );
}

export default function CheckoutPage() {
  const [step, setStep] = useState(1);
  const [address, setAddress] = useState({
    first: '', last: '', address: '', city: '', state: '', zip: '', country: 'Nigeria',
  });
  const [payment, setPayment] = useState({ card: '', name: '', expiry: '', cvv: '' });
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);
  const { items, subtotal, clearCart } = useCart();
  const { toast } = useToast();

  const tax = subtotal * TAX_RATE;
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = subtotal + tax + shipping;

  const handlePlaceOrder = async () => {
    setPlacing(true);
    try {
      const orderItems = items.map(i => ({
        productId: i.product.id,
        name: i.product.name,
        image: i.product.image,
        price: i.product.price,
        quantity: i.quantity,
        size: i.selectedSize,
        color: i.selectedColor,
      }));

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: orderItems, address, subtotal, tax, shipping, total }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast(data.error ?? 'Failed to place order. Please try again.');
        return;
      }

      clearCart();
      setPlacedOrderId(data.data.id);
      setStep(4);
      toast('Order placed successfully!');
    } catch {
      toast('Something went wrong. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  if (items.length === 0 && step < 4) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <p className="text-xl font-display font-bold">Your cart is empty</p>
        <Link href="/shop"><Button className="mt-6">Shop Now</Button></Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      {/* Step Bar */}
      <div className="flex items-center justify-between mb-10 relative">
        {[1, 2, 3, 4].map((s, i) => (
          <div key={s} className="flex items-center flex-1">
            <StepIndicator step={s} current={step} />
            {i < 3 && <div className={`flex-1 h-0.5 mx-2 ${step > s ? 'bg-green-400' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      {/* Step 1: Cart Review */}
      {step === 1 && (
        <div>
          <h2 className="text-2xl font-display font-bold mb-6">Review Your Cart</h2>
          <div className="space-y-3 mb-8">
            {items.map(item => (
              <div key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}`} className="flex gap-4 bg-white border border-border rounded-xl p-4 items-center">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                  <Image src={item.product.image} alt={item.product.name} fill className="object-cover" unoptimized />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{item.product.name}</p>
                  <p className="text-xs text-secondary">{[item.selectedColor, item.selectedSize].filter(Boolean).join(' · ')} × {item.quantity}</p>
                </div>
                <p className="font-bold">${(item.product.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>
          <OrderSummaryBox subtotal={subtotal} tax={tax} shipping={shipping} total={total} />
          <Button className="w-full mt-6" size="lg" onClick={() => setStep(2)}>Continue to Shipping</Button>
        </div>
      )}

      {/* Step 2: Shipping */}
      {step === 2 && (
        <div>
          <h2 className="text-2xl font-display font-bold mb-6">Shipping Address</h2>
          <div className="bg-white border border-border rounded-2xl p-6">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium block mb-1.5">First name</label><Input value={address.first} onChange={e => setAddress(a => ({ ...a, first: e.target.value }))} placeholder="Jane" /></div>
              <div><label className="text-sm font-medium block mb-1.5">Last name</label><Input value={address.last} onChange={e => setAddress(a => ({ ...a, last: e.target.value }))} placeholder="Doe" /></div>
              <div className="col-span-2"><label className="text-sm font-medium block mb-1.5">Address</label><Input value={address.address} onChange={e => setAddress(a => ({ ...a, address: e.target.value }))} placeholder="123 Main St" /></div>
              <div><label className="text-sm font-medium block mb-1.5">City</label><Input value={address.city} onChange={e => setAddress(a => ({ ...a, city: e.target.value }))} placeholder="Lagos" /></div>
              <div><label className="text-sm font-medium block mb-1.5">State</label><Input value={address.state} onChange={e => setAddress(a => ({ ...a, state: e.target.value }))} placeholder="Lagos State" /></div>
              <div><label className="text-sm font-medium block mb-1.5">ZIP / Postal code</label><Input value={address.zip} onChange={e => setAddress(a => ({ ...a, zip: e.target.value }))} placeholder="100001" /></div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Country</label>
                <select className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gold/40" value={address.country} onChange={e => setAddress(a => ({ ...a, country: e.target.value }))}>
                  {['Nigeria', 'Ghana', 'South Africa', 'United Kingdom', 'United States', 'Canada'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
            <Button className="flex-1" onClick={() => setStep(3)} disabled={!address.first || !address.last || !address.address || !address.city}>
              Continue to Payment
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Payment */}
      {step === 3 && (
        <div>
          <h2 className="text-2xl font-display font-bold mb-6">Payment</h2>
          <div className="bg-gold/10 border border-gold/30 rounded-xl px-4 py-3 text-sm text-secondary mb-4">
            Payment integration (Paystack / Stripe) is coming soon. Your order will be recorded and confirmed when ready.
          </div>
          <div className="bg-white border border-border rounded-2xl p-6 space-y-4">
            <div><label className="text-sm font-medium block mb-1.5">Card number</label><Input value={payment.card} onChange={e => setPayment(p => ({ ...p, card: e.target.value }))} placeholder="4242 4242 4242 4242" maxLength={19} /></div>
            <div><label className="text-sm font-medium block mb-1.5">Cardholder name</label><Input value={payment.name} onChange={e => setPayment(p => ({ ...p, name: e.target.value }))} placeholder="Jane Doe" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium block mb-1.5">Expiry</label><Input value={payment.expiry} onChange={e => setPayment(p => ({ ...p, expiry: e.target.value }))} placeholder="MM / YY" maxLength={7} /></div>
              <div><label className="text-sm font-medium block mb-1.5">CVV</label><Input value={payment.cvv} onChange={e => setPayment(p => ({ ...p, cvv: e.target.value }))} placeholder="123" maxLength={3} /></div>
            </div>
          </div>
          <OrderSummaryBox subtotal={subtotal} tax={tax} shipping={shipping} total={total} />
          <div className="flex gap-3 mt-6">
            <Button variant="outline" onClick={() => setStep(2)} disabled={placing}>Back</Button>
            <Button className="flex-1" size="lg" onClick={handlePlaceOrder} disabled={placing}>
              {placing ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Placing order...
                </span>
              ) : (
                `Place Order · $${total.toFixed(2)}`
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Confirmation */}
      {step === 4 && (
        <div className="text-center py-12">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <Check className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-display font-bold">Order Confirmed!</h2>
          <p className="text-secondary mt-3 text-lg">Thank you for shopping with Titan.</p>
          {placedOrderId && (
            <div className="mt-6 bg-white border border-border rounded-2xl p-6 max-w-sm mx-auto">
              <p className="text-sm text-secondary">Order ID</p>
              <p className="text-lg font-mono font-bold text-gold mt-1 break-all">{placedOrderId}</p>
              <p className="text-sm text-secondary mt-4">Your order has been recorded. We will reach out with delivery details shortly.</p>
            </div>
          )}
          <div className="flex gap-3 justify-center mt-8">
            <Link href="/orders"><Button variant="outline">View Orders</Button></Link>
            <Link href="/shop"><Button>Continue Shopping</Button></Link>
          </div>
        </div>
      )}
    </div>
  );
}
