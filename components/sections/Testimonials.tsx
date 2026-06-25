'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Star } from 'lucide-react';
import { testimonials } from '@/data/mock';

export default function Testimonials() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-center">What Our Customers Say</h2>
        <p className="mt-2 text-center text-secondary">Trusted by thousands of happy shoppers worldwide.</p>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="bg-white border border-border rounded-2xl p-6 shadow-card"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-gold text-gold" />
                ))}
              </div>
              <p className="text-secondary leading-relaxed">&ldquo;{t.text}&rdquo;</p>
              <div className="flex items-center gap-3 mt-6">
                {t.avatar ? (
                  <Image src={t.avatar} alt={t.name} width={40} height={40} className="rounded-full object-cover" unoptimized />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center font-bold text-gold">{t.name[0]}</div>
                )}
                <div>
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-xs text-secondary">{t.title}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
