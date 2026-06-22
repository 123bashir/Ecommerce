export const MOCK_CATEGORIES = [
  { id: 1, category_id: 1, name: 'Laptops', slug: 'laptops' },
  { id: 2, category_id: 2, name: 'Smartphones', slug: 'smartphones' },
  { id: 3, category_id: 3, name: 'Headphones', slug: 'headphones' },
  { id: 4, category_id: 4, name: 'Smartwatches', slug: 'smartwatches' },
  { id: 5, category_id: 5, name: 'Gaming', slug: 'gaming' },
  { id: 6, category_id: 6, name: 'Accessories', slug: 'accessories' },
];

export const MOCK_PRODUCTS = [
  {
    id: 101,
    product_id: 101,
    name: 'MacBook Pro 14"',
    price: 1999.99,
    description: 'Apple M3 chip, 16GB Unified Memory, 512GB SSD Storage.',
    category_id: 1,
    category_name: 'Laptops',
    images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=800'],
    isPopular: true,
    rating: 4.9,
    stock: 15
  },
  {
    id: 102,
    product_id: 102,
    name: 'Samsung Galaxy S24 Ultra',
    price: 1299.99,
    description: 'Galaxy AI is here. 200MP Camera, S Pen included.',
    category_id: 2,
    category_name: 'Smartphones',
    images: ['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=800'],
    isPopular: true,
    rating: 4.8,
    stock: 20
  },
  {
    id: 103,
    product_id: 103,
    name: 'Sony WH-1000XM5',
    price: 399.99,
    description: 'Industry-leading noise canceling with Auto NC Optimizer.',
    category_id: 3,
    category_name: 'Headphones',
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800'],
    isPopular: true,
    rating: 4.7,
    stock: 30
  },
  {
    id: 104,
    product_id: 104,
    name: 'iPad Pro 12.9"',
    price: 1099.99,
    description: 'XDR Display, M2 Chip, incredibly thin design.',
    category_id: 1,
    category_name: 'Laptops',
    images: ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=800'],
    isPopular: false,
    rating: 4.8,
    stock: 12
  },
  {
    id: 105,
    product_id: 105,
    name: 'PlayStation 5 Console',
    price: 499.99,
    description: 'Experience lightning-fast loading with an ultra-high speed SSD.',
    category_id: 5,
    category_name: 'Gaming',
    images: ['https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&q=80&w=800'],
    isPopular: true,
    rating: 4.9,
    stock: 8
  },
  {
    id: 106,
    product_id: 106,
    name: 'Apple Watch Series 9',
    price: 399.00,
    description: 'Smarter, brighter, mightier. Track your health and stay connected.',
    category_id: 4,
    category_name: 'Smartwatches',
    images: ['https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=800'],
    isPopular: false,
    rating: 4.6,
    stock: 25
  },
  {
    id: 107,
    product_id: 107,
    name: 'Dell XPS 15',
    price: 1699.00,
    description: 'Intel Core i9, 32GB RAM, NVIDIA GeForce RTX graphics.',
    category_id: 1,
    category_name: 'Laptops',
    images: ['https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&q=80&w=800'],
    isPopular: false,
    rating: 4.5,
    stock: 10
  }
];

export const MOCK_HERO_SLIDES = [
  {
    title: 'Future of Tech is Here',
    subtitle: 'Explore the latest in Electronics',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=1200'
  }
];
