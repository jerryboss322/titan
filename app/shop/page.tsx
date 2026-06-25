'use client';

import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { products } from '@/data/mock';
import ProductCard from '@/components/product/ProductCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const CATEGORIES = ['All', 'men', 'women', 'accessories', 'home'];
const SORT_OPTIONS = [
  { value: 'default', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'newest', label: 'Newest' },
];
const PER_PAGE = 6;

export default function ShopPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('default');
  const [maxPrice, setMaxPrice] = useState(400);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let list = products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
      const matchCat = category === 'All' || p.categoryId === category;
      const matchPrice = p.price <= maxPrice;
      return matchSearch && matchCat && matchPrice;
    });
    if (sort === 'price-asc') list = [...list].sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') list = [...list].sort((a, b) => b.price - a.price);
    if (sort === 'rating') list = [...list].sort((a, b) => b.rating - a.rating);
    return list;
  }, [search, category, sort, maxPrice]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleFilterChange = (fn: () => void) => { fn(); setPage(1); };

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-display font-bold">All Products</h1>
        <p className="text-secondary mt-1">{filtered.length} items available</p>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-border rounded-2xl p-4 mb-8 flex flex-wrap gap-4 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={e => handleFilterChange(() => setSearch(e.target.value))}
            className="pl-9"
          />
        </div>
        {/* Category */}
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => handleFilterChange(() => setCategory(c))}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all capitalize ${category === c ? 'bg-foreground text-white border-foreground' : 'border-border hover:border-secondary'}`}
            >
              {c}
            </button>
          ))}
        </div>
        {/* Sort */}
        <select
          value={sort}
          onChange={e => handleFilterChange(() => setSort(e.target.value))}
          className="px-3 py-2 rounded-lg border border-border text-sm bg-white focus:outline-none focus:border-foreground"
        >
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        {/* Price slider */}
        <div className="flex items-center gap-3 min-w-[180px]">
          <SlidersHorizontal className="h-4 w-4 text-secondary flex-shrink-0" />
          <div className="flex-1">
            <p className="text-xs text-secondary mb-1">Max: ${maxPrice}</p>
            <input
              type="range"
              min={50}
              max={400}
              step={10}
              value={maxPrice}
              onChange={e => handleFilterChange(() => setMaxPrice(Number(e.target.value)))}
              className="w-full accent-gold"
            />
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {paginated.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {paginated.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24">
          <p className="text-2xl font-display font-bold">No products found</p>
          <p className="text-secondary mt-2">Try adjusting your filters or search term.</p>
          <Button className="mt-6" onClick={() => { setSearch(''); setCategory('All'); setMaxPrice(400); setSort('default'); setPage(1); }}>
            Clear Filters
          </Button>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-10">
          <Button variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
          {Array.from({ length: totalPages }).map((_, i) => (
            <Button
              key={i}
              variant={page === i + 1 ? 'default' : 'outline'}
              onClick={() => setPage(i + 1)}
              className="w-10"
            >
              {i + 1}
            </Button>
          ))}
          <Button variant="outline" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}
