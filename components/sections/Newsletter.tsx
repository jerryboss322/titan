'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) { setSubmitted(true); }
  };

  return (
    <section className="py-16 md:py-24 bg-foreground text-white">
      <div className="container mx-auto px-4 text-center max-w-xl">
        <h2 className="text-3xl md:text-4xl font-display font-bold">Stay in the Loop</h2>
        <p className="mt-3 text-white/70">Get early access to new arrivals, exclusive offers, and style inspiration — straight to your inbox.</p>
        {submitted ? (
          <div className="mt-8 bg-gold/20 border border-gold/40 rounded-xl py-4 px-6">
            <p className="text-gold font-semibold">You&apos;re subscribed! Welcome to the Titan family.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 flex gap-3">
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-gold"
            />
            <Button type="submit" className="bg-gold text-foreground hover:bg-gold/90 px-6">Subscribe</Button>
          </form>
        )}
      </div>
    </section>
  );
}
