'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { products } from '@/data/mock';
import ProductCard from '@/components/product/ProductCard';

export default function TrendingProducts() {
  const trending = products.slice(0, 4);
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-display font-bold">Trending Now</h2>
            <p className="mt-2 text-secondary">Our most-loved pieces this season.</p>
          </div>
          <Link href="/shop" className="text-sm font-medium underline underline-offset-4 text-secondary hover:text-foreground hidden md:block">
            View All
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trending.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
