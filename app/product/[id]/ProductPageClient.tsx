'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Heart, ShoppingCart, Shield, RefreshCw, Truck } from 'lucide-react';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ProductCard from '@/components/product/ProductCard';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useToast } from '@/contexts/ToastContext';

const MOCK_REVIEWS = [
  { id: '1', name: 'Aisha B.', rating: 5, date: 'Dec 2024', text: 'Absolutely stunning quality. Worth every penny — the craftsmanship is remarkable.' },
  { id: '2', name: 'James O.', rating: 4, date: 'Nov 2024', text: 'Great product, fast shipping. Sizing runs slightly large so order one size down.' },
  { id: '3', name: 'Grace A.', rating: 5, date: 'Nov 2024', text: 'Received so many compliments. This is my second purchase from Titan and I am never disappointed.' },
];

export default function ProductPageClient({ product, related }: { product: Product; related: Product[] }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] ?? '');
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] ?? '');
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { toggle, isWishlisted } = useWishlist();
  const { toast } = useToast();
  const images = product.images ?? [product.image];
  const wishlisted = isWishlisted(product.id);

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedSize, selectedColor);
    toast(`${product.name} added to cart`);
  };

  return (
    <div className="container mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <nav className="text-sm text-secondary mb-8 flex gap-2">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-foreground">Shop</Link>
        <span>/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Image Gallery */}
        <div className="flex gap-4">
          <div className="flex flex-col gap-2 w-20 flex-shrink-0">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(i)}
                className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${selectedImage === i ? 'border-foreground' : 'border-border hover:border-secondary'}`}
              >
                <Image src={img} alt={`${product.name} view ${i + 1}`} fill className="object-cover" unoptimized />
              </button>
            ))}
          </div>
          <div className="relative flex-1 aspect-square rounded-2xl overflow-hidden bg-gray-100">
            <Image
              src={images[selectedImage]}
              alt={product.name}
              fill
              className="object-cover"
              priority
              unoptimized
            />
            {product.discount && (
              <Badge variant="destructive" className="absolute top-4 left-4 text-sm">-{product.discount}%</Badge>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <p className="text-sm text-secondary uppercase tracking-widest mb-2">{product.categoryId}</p>
          <h1 className="text-3xl md:text-4xl font-display font-bold">{product.name}</h1>

          <div className="flex items-center gap-3 mt-3">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`h-4 w-4 ${i < Math.floor(product.rating) ? 'fill-gold text-gold' : 'text-gray-200 fill-gray-200'}`} />
              ))}
            </div>
            <span className="font-semibold text-sm">{product.rating}</span>
            <span className="text-sm text-secondary">({product.reviews} reviews)</span>
          </div>

          <div className="flex items-baseline gap-3 mt-6">
            <span className="text-3xl font-bold">${product.price.toFixed(2)}</span>
            {product.oldPrice && (
              <span className="text-xl text-secondary line-through">${product.oldPrice.toFixed(2)}</span>
            )}
            {product.discount && (
              <span className="text-sm font-semibold text-green-600">Save {product.discount}%</span>
            )}
          </div>

          <p className="mt-4 text-secondary leading-relaxed">{product.description}</p>

          {/* Color selection */}
          {product.colors && product.colors.length > 0 && (
            <div className="mt-6">
              <p className="text-sm font-semibold mb-2">Color: <span className="font-normal text-secondary">{selectedColor}</span></p>
              <div className="flex gap-2">
                {product.colors.map(c => (
                  <button
                    key={c}
                    onClick={() => setSelectedColor(c)}
                    className={`px-3 py-1.5 rounded-lg border text-sm transition-all ${selectedColor === c ? 'border-foreground bg-foreground text-white' : 'border-border hover:border-secondary'}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size selection */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="mt-5">
              <p className="text-sm font-semibold mb-2">Size: <span className="font-normal text-secondary">{selectedSize}</span></p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map(s => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`w-12 h-10 rounded-lg border text-sm font-medium transition-all ${selectedSize === s ? 'border-foreground bg-foreground text-white' : 'border-border hover:border-secondary'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="mt-5">
            <p className="text-sm font-semibold mb-2">Quantity</p>
            <div className="flex items-center gap-3">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-9 h-9 rounded-lg border border-border flex items-center justify-center hover:border-secondary text-lg font-medium">-</button>
              <span className="w-8 text-center font-semibold">{quantity}</span>
              <button onClick={() => setQuantity(q => Math.min(10, q + 1))} className="w-9 h-9 rounded-lg border border-border flex items-center justify-center hover:border-secondary text-lg font-medium">+</button>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex gap-3">
            <Button size="lg" className="flex-1 gap-2" onClick={handleAddToCart}>
              <ShoppingCart className="h-4 w-4" />
              Add to Cart
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => { toggle(product); toast(wishlisted ? 'Removed from wishlist' : 'Saved to wishlist', wishlisted ? 'info' : 'success'); }}
              className="w-12 px-0"
              aria-label="Wishlist"
            >
              <Heart className={`h-5 w-5 ${wishlisted ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
          </div>

          {/* Trust Badges */}
          <div className="mt-8 grid grid-cols-3 gap-4 pt-8 border-t border-border">
            {[
              { icon: Truck, label: 'Free Shipping', sub: 'Orders over $150' },
              { icon: RefreshCw, label: '30-Day Returns', sub: 'No questions asked' },
              { icon: Shield, label: 'Secure Payment', sub: 'SSL encrypted' },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex flex-col items-center text-center gap-1">
                <Icon className="h-5 w-5 text-gold" />
                <p className="text-xs font-semibold">{label}</p>
                <p className="text-xs text-secondary">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Specs */}
      {product.specs && (
        <div className="mb-16">
          <h2 className="text-2xl font-display font-bold mb-6">Specifications</h2>
          <div className="bg-white border border-border rounded-2xl overflow-hidden">
            {Object.entries(product.specs).map(([k, v], i) => (
              <div key={k} className={`flex ${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                <span className="w-1/3 px-6 py-3 text-sm font-semibold text-secondary">{k}</span>
                <span className="flex-1 px-6 py-3 text-sm">{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviews */}
      <div className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-display font-bold">Customer Reviews</h2>
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 fill-gold text-gold" />
            <span className="font-bold">{product.rating}</span>
            <span className="text-secondary text-sm">({product.reviews} reviews)</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {MOCK_REVIEWS.map(r => (
            <div key={r.id} className="bg-white border border-border rounded-2xl p-5">
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? 'fill-gold text-gold' : 'fill-gray-200 text-gray-200'}`} />
                ))}
              </div>
              <p className="text-secondary text-sm leading-relaxed">&ldquo;{r.text}&rdquo;</p>
              <div className="flex items-center justify-between mt-4">
                <p className="font-semibold text-sm">{r.name}</p>
                <p className="text-xs text-secondary">{r.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div>
          <h2 className="text-2xl font-display font-bold mb-6">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {related.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}
