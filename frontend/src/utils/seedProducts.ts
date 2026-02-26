import { ProductInput, ProductStatus } from '../backend';

export const sampleProducts: ProductInput[] = [
  {
    name: 'Ubtan Face Pack',
    description:
      'A traditional Ayurvedic blend of turmeric, sandalwood, and chickpea flour. This time-honored recipe brightens skin, reduces tan, and gives a natural glow. Perfect for all skin types.',
    priceInr: BigInt(599),
    imageUrl: '/assets/generated/product-ubtan.dim_600x600.png',
    category: 'Face Pack',
    stockQuantity: BigInt(50),
    isFeatured: true,
    status: ProductStatus.active,
    specifications: [
      { key: 'Weight', value: '100g' },
      { key: 'Skin Type', value: 'All skin types' },
      { key: 'Key Ingredients', value: 'Turmeric, Sandalwood, Chickpea Flour' },
    ],
  },
  {
    name: 'Anti-Acne Neem Pack',
    description:
      'Powerful neem and tulsi formulation that fights acne-causing bacteria, reduces inflammation, and controls excess oil. Clinically tested for sensitive and acne-prone skin.',
    priceInr: BigInt(499),
    imageUrl: '/assets/generated/product-anti-acne.dim_600x600.png',
    category: 'Face Pack',
    stockQuantity: BigInt(35),
    isFeatured: true,
    status: ProductStatus.active,
    specifications: [
      { key: 'Weight', value: '75g' },
      { key: 'Skin Type', value: 'Oily, Acne-prone' },
      { key: 'Key Ingredients', value: 'Neem, Tulsi, Multani Mitti' },
    ],
  },
  {
    name: 'Pure Sandalwood Powder',
    description:
      'Premium quality pure sandalwood powder sourced from Mysore. Soothes irritated skin, reduces pigmentation, and imparts a cooling effect. A luxury Ayurvedic ingredient.',
    priceInr: BigInt(799),
    imageUrl: '/assets/generated/product-sandalwood.dim_600x600.png',
    category: 'Powder',
    stockQuantity: BigInt(20),
    isFeatured: true,
    status: ProductStatus.active,
    specifications: [
      { key: 'Weight', value: '50g' },
      { key: 'Skin Type', value: 'Dry, Sensitive' },
      { key: 'Origin', value: 'Mysore, Karnataka' },
    ],
  },
  {
    name: 'Neem Powder',
    description:
      'Pure organic neem leaf powder with potent antibacterial and antifungal properties. Use as a face mask, hair pack, or add to your skincare routine for clear, healthy skin.',
    priceInr: BigInt(349),
    imageUrl: '/assets/generated/product-neem.dim_600x600.png',
    category: 'Powder',
    stockQuantity: BigInt(0),
    isFeatured: false,
    status: ProductStatus.outOfStock,
    specifications: [
      { key: 'Weight', value: '100g' },
      { key: 'Skin Type', value: 'Oily, Combination' },
      { key: 'Certification', value: 'Organic Certified' },
    ],
  },
  {
    name: 'Rose & Saffron Glow Pack',
    description:
      'An upcoming luxurious blend of rose petals and pure saffron strands. This premium formulation promises unparalleled radiance and skin brightening. Coming soon!',
    priceInr: BigInt(999),
    imageUrl: '/assets/generated/product-ubtan.dim_600x600.png',
    category: 'Face Pack',
    stockQuantity: BigInt(0),
    isFeatured: true,
    status: ProductStatus.launchingSoon,
    specifications: [
      { key: 'Weight', value: '60g' },
      { key: 'Skin Type', value: 'All skin types' },
      { key: 'Key Ingredients', value: 'Rose Petals, Saffron, Almond' },
    ],
  },
];
