'use client';

import useSWR from 'swr';
import HeroSection from '@/components/home/HeroSection';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Home() {
  const { data } = useSWR('/api/products', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 10000,
  });
  const productsCount = data?.products?.length;

  return (
    <div className="min-h-screen bg-background">
      <HeroSection productCount={productsCount} />

      {/* Fallback space for other content if needed later */}
      <div className="h-20"></div>
    </div>
  );
}
