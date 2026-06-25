'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Star, Heart } from 'lucide-react';
import { Product } from '@/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/contexts/ToastContext';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { toggle, isWishlisted } = useWishlist();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const wishlisted = isWishlisted(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product, 1, product.sizes?.[0], product.colors?.[0]);
    toast(`${product.name} added to cart`);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    toggle(product);
    toast(wishlisted ? 'Removed from wishlist' : 'Added to wishlist', wishlisted ? 'info' : 'success');
  };

  return (
    <Card className="group overflow-hidden transition-shadow hover:shadow-card-hover bg-white border border-border">
      <Link href={`/product/${product.id}`}>
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 25vw"
            unoptimized
          />
          <button
            onClick={handleWishlist}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow transition-all hover:scale-110 z-10"
            aria-label="Toggle wishlist"
          >
            <Heart className={`h-4 w-4 ${wishlisted ? 'fill-red-500 text-red-500' : 'text-secondary'}`} />
          </button>
          {product.isNew && (
            <Badge className="absolute top-3 left-3 bg-gold text-foreground text-xs">New</Badge>
          )}
          {product.discount && (
            <Badge variant="destructive" className="absolute top-3 left-3 text-xs">
              -{product.discount}%
            </Badge>
          )}
          {product.isNew && product.discount && (
            <Badge variant="destructive" className="absolute top-10 left-3 text-xs">-{product.discount}%</Badge>
          )}
          <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 p-3">
            <Button
              onClick={handleAddToCart}
              className="w-full bg-foreground text-white hover:bg-foreground/90 text-sm"
              size="sm"
            >
              Add to Cart
            </Button>
          </div>
        </div>
        <CardContent className="p-4">
          <p className="text-xs text-secondary uppercase tracking-wide mb-1">{product.categoryId}</p>
          <h3 className="font-semibold text-base leading-snug">{product.name}</h3>
          <div className="flex items-center gap-1.5 mt-1.5">
            <div className="flex items-center">
              <Star className="h-3.5 w-3.5 fill-gold text-gold" />
              <span className="ml-1 text-xs font-medium">{product.rating}</span>
            </div>
            <span className="text-xs text-secondary">({product.reviews})</span>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex items-center gap-2">
          <span className="font-bold text-base">${product.price.toFixed(2)}</span>
          {product.oldPrice && (
            <span className="text-sm text-secondary line-through">${product.oldPrice.toFixed(2)}</span>
          )}
        </CardFooter>
      </Link>
    </Card>
  );
}
