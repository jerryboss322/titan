'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ShoppingCart, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { totalItems } = useCart();
  const { items: wishItems } = useWishlist();
  const { user, signOut } = useAuth();

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/shop', label: 'Shop' },
    { href: '/category/men', label: 'Men' },
    { href: '/category/women', label: 'Women' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="font-display text-2xl font-bold tracking-tight">
            <span className="text-foreground">Titan</span>
            <span className="text-gold">.</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  pathname === link.href ? 'text-foreground' : 'text-secondary hover:text-foreground'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            <Link href="/wishlist">
              <Button variant="ghost" size="icon" aria-label="Wishlist" className="relative">
                <Heart className="h-5 w-5" />
                {wishItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gold text-foreground text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {wishItems.length}
                  </span>
                )}
              </Button>
            </Link>
            <Link href="/cart">
              <Button variant="ghost" size="icon" aria-label="Cart" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gold text-foreground text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {totalItems}
                  </span>
                )}
              </Button>
            </Link>
            {user ? (
              <div className="flex items-center gap-3 ml-2">
                {['super_admin', 'admin', 'editor'].includes(user.role) && (
                  <Link href="/admin">
                    <Button variant="outline" size="sm">Dashboard</Button>
                  </Link>
                )}
                <Link href="/orders">
                  <span className="text-sm text-secondary hover:text-foreground cursor-pointer">{user.name.split(' ')[0]}</span>
                </Link>
                <Button size="sm" variant="ghost" onClick={signOut}>Sign Out</Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-2">
                <Link href="/auth/signin"><Button size="sm">Sign In</Button></Link>
                <Link href="/auth/signup"><Button size="sm" variant="outline">Sign Up</Button></Link>
              </div>
            )}
          </div>

          <button className="md:hidden p-2" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="container mx-auto px-4 py-6 space-y-4">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="block text-base font-medium text-secondary hover:text-foreground" onClick={() => setIsOpen(false)}>
                {link.label}
              </Link>
            ))}
            <div className="flex gap-3 pt-4 border-t border-border">
              <Link href="/cart" onClick={() => setIsOpen(false)} className="flex-1">
                <Button className="w-full" variant="outline">Cart ({totalItems})</Button>
              </Link>
              <Link href="/wishlist" onClick={() => setIsOpen(false)} className="flex-1">
                <Button className="w-full" variant="outline">Wishlist ({wishItems.length})</Button>
              </Link>
            </div>
            {user ? (
              <Button className="w-full" variant="ghost" onClick={() => { signOut(); setIsOpen(false); }}>Sign Out</Button>
            ) : (
              <div className="flex flex-col gap-2">
                <Link href="/auth/signin" onClick={() => setIsOpen(false)}><Button className="w-full">Sign In</Button></Link>
                <Link href="/auth/signup" onClick={() => setIsOpen(false)}><Button variant="outline" className="w-full">Sign Up</Button></Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
