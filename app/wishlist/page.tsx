'use client';

import Link from 'next/link';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWishlist } from '@/contexts/WishlistContext';
import ProductCard from '@/components/product/ProductCard';

export default function WishlistPage() {
  const { items } = useWishlist();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <Heart className="h-16 w-16 mx-auto text-secondary/30 mb-4" />
        <h1 className="text-2xl font-display font-bold">Your wishlist is empty</h1>
        <p className="text-secondary mt-2">Save items you love and find them here.</p>
        <Link href="/shop"><Button className="mt-8">Explore Products</Button></Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-display font-bold">Wishlist</h1>
        <span className="text-secondary">{items.length} saved item{items.length !== 1 ? 's' : ''}</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {items.map(product => <ProductCard key={product.id} product={product} />)}
      </div>
    </div>
  );
}
