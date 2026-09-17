import { Suspense } from 'react';
import { ProductCatalog } from '@/components/products/ProductCatalog';

export const metadata = { title: 'KamKhoj products' };

export default function ProductsPage() {
  return (
    <Suspense fallback={null}>
      <ProductCatalog />
    </Suspense>
  );
}
