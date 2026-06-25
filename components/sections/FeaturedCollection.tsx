'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export default function FeaturedCollection() {
  return (
    <section className="py-16 md:py-24 bg-foreground text-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <p className="text-gold text-sm font-medium tracking-widest uppercase mb-4">Limited Edition</p>
            <h2 className="text-4xl md:text-5xl font-display font-bold leading-tight">
              The Winter
              <br />
              <span className="text-gold">Capsule Collection</span>
            </h2>
            <p className="mt-6 text-white/70 text-lg leading-relaxed max-w-md">
              Thoughtfully designed pieces for the modern wardrobe. Each garment is a story of craft, quality, and timeless style.
            </p>
            <div className="mt-8 flex gap-4">
              <Link href="/shop">
                <Button size="lg" className="bg-gold text-foreground hover:bg-gold/90">Shop Now</Button>
              </Link>
              <Link href="/category/women">
                <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10">Women&apos;s</Button>
              </Link>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="relative h-[500px] rounded-2xl overflow-hidden"
          >
            <Image
              src="https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80"
              alt="Winter Capsule Collection"
              fill
              className="object-cover"
              unoptimized
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
