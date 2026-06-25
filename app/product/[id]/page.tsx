import { notFound } from 'next/navigation';
import { products } from '@/data/mock';
import ProductPageClient from './ProductPageClient';

export async function generateStaticParams() {
  return products.map(p => ({ id: p.id }));
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = products.find(p => p.id === id);
  if (!product) return notFound();
  const related = products.filter(p => p.categoryId === product.categoryId && p.id !== product.id).slice(0, 4);
  return <ProductPageClient product={product} related={related} />;
}
