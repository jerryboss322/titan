'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      <Image
        src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1920&q=80"
        alt="Premium fashion collection"
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
        unoptimized
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/10 z-10" />
      <div className="container mx-auto px-4 relative z-20 text-white">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="max-w-2xl"
        >
          <p className="text-gold font-medium tracking-widest text-sm uppercase mb-4">New Season 2025</p>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-display font-bold leading-tight">
            Timeless Elegance,
            <br />
            <span className="text-gold">Modern Craft</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-white/75 max-w-lg leading-relaxed">
            Discover our curated collection of premium apparel and accessories, designed for those who appreciate the finer things.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/shop">
              <Button size="lg" className="bg-gold text-foreground hover:bg-gold/90 font-semibold px-8">
                Shop Collection
              </Button>
            </Link>
            <Link href="/category/women">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8">
                Explore Looks
              </Button>
            </Link>
          </div>
          <div className="mt-12 flex gap-8">
            {[['10K+', 'Happy Clients'], ['200+', 'Premium Products'], ['Free', 'Worldwide Shipping']].map(([num, label]) => (
              <div key={label}>
                <p className="text-2xl font-bold text-gold">{num}</p>
                <p className="text-xs text-white/60 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
