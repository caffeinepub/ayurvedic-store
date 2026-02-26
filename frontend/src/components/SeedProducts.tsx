import { useEffect } from 'react';
import { useGetProducts, useCreateProduct } from '../hooks/useQueries';
import { sampleProducts } from '../utils/seedProducts';

export default function SeedProducts() {
  const { data: products, isLoading } = useGetProducts();
  const createProduct = useCreateProduct();

  useEffect(() => {
    if (!isLoading && products && products.length === 0 && !createProduct.isPending) {
      const seedAll = async () => {
        for (const product of sampleProducts) {
          try {
            await createProduct.mutateAsync(product);
          } catch {
            // ignore seed errors
          }
        }
      };
      seedAll();
    }
  }, [isLoading, products]);

  return null;
}
