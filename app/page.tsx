import Hero from '@/components/sections/Hero';
import FeaturedCategories from '@/components/sections/FeaturedCategories';
import TrendingProducts from '@/components/sections/TrendingProducts';
import FeaturedCollection from '@/components/sections/FeaturedCollection';
import Benefits from '@/components/sections/Benefits';
import Testimonials from '@/components/sections/Testimonials';
import Newsletter from '@/components/sections/Newsletter';

export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedCategories />
      <TrendingProducts />
      <FeaturedCollection />
      <Benefits />
      <Testimonials />
      <Newsletter />
    </>
  );
}
