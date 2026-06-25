import { notFound } from 'next/navigation';
import Image from 'next/image';
import { categories, products } from '@/data/mock';
import ProductCard from '@/components/product/ProductCard';

export async function generateStaticParams() {
  return categories.map(c => ({ slug: c.slug }));
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = categories.find(c => c.slug === slug);
  if (!category) return notFound();
  const categoryProducts = products.filter(p => p.categoryId === category.id);

  return (
    <div>
      {/* Hero banner */}
      {category.image && (
        <div className="relative h-64 md:h-80 overflow-hidden">
          <Image src={category.image} alt={category.name} fill className="object-cover" unoptimized />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 flex items-center justify-center text-white text-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-display font-bold">{category.name}</h1>
              <p className="mt-2 text-white/75">{categoryProducts.length} products</p>
            </div>
          </div>
        </div>
      )}
      <div className="container mx-auto px-4 py-10">
        {!category.image && (
          <div className="mb-8">
            <h1 className="text-4xl font-display font-bold">{category.name}</h1>
            <p className="text-secondary mt-1">{categoryProducts.length} products</p>
          </div>
        )}
        {categoryProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
            {categoryProducts.map(product => <ProductCard key={product.id} product={product} />)}
          </div>
        ) : (
          <div className="text-center py-24">
            <p className="text-xl font-semibold">No products in this category yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
