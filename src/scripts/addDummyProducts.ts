import { createProduct } from '../services/productService';
import { Product } from '../utils/types';

// Dummy product data for Hearty Hounds
const dummyProducts: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: "Premium Dog Treats - Chicken & Sweet Potato",
    description: "Delicious and nutritious treats made with real chicken and sweet potato. Perfect for training or as a special reward. Made with all-natural ingredients and no artificial preservatives.",
    price: 25.99,
    images: [
      "/g1.jpg",
      "/g2.jpg"
    ],
    category: "Treats",
    dimensions: "15cm x 10cm x 5cm",
    weight: "250g",
    inStock: true,
    featured: true
  },
  {
    name: "Interactive Puzzle Ball",
    description: "Keep your dog mentally stimulated with this engaging puzzle ball. Dispenses treats as your dog plays, promoting healthy eating habits and reducing boredom.",
    price: 35.50,
    images: [
      "/g3.jpg",
      "/g4.jpg"
    ],
    category: "Toys",
    dimensions: "12cm diameter",
    weight: "300g",
    inStock: true,
    featured: true
  },
  {
    name: "Luxury Dog Collar - Pink & Blue",
    description: "Stylish and comfortable collar made from premium materials. Adjustable sizing with secure buckle closure. Perfect for daily walks and special occasions.",
    price: 18.99,
    images: [
      "/g5.jpg",
      "/g6.jpg"
    ],
    category: "Accessories",
    dimensions: "Adjustable 30-50cm",
    weight: "150g",
    inStock: true,
    featured: false
  },
  {
    name: "Organic Beef Jerky Strips",
    description: "Premium organic beef jerky strips, perfect for dogs of all sizes. High in protein and made from grass-fed beef. No artificial additives or preservatives.",
    price: 32.00,
    images: [
      "/g7.jpg",
      "/g8.jpg"
    ],
    category: "Treats",
    dimensions: "20cm x 15cm x 3cm",
    weight: "200g",
    inStock: true,
    featured: true
  },
  {
    name: "Rope Toy - Extra Durable",
    description: "Heavy-duty rope toy designed for aggressive chewers. Helps clean teeth and massage gums while providing hours of entertainment. Made from natural cotton fibers.",
    price: 15.75,
    images: [
      "/g9.jpg",
      "/g10.jpg"
    ],
    category: "Toys",
    dimensions: "25cm length",
    weight: "200g",
    inStock: true,
    featured: false
  },
  {
    name: "Premium Dog Leash - Reflective",
    description: "High-quality leash with reflective stitching for nighttime safety. Comfortable padded handle and strong metal clasp. Perfect for daily walks and training.",
    price: 22.50,
    images: [
      "/g1.jpg",
      "/g3.jpg"
    ],
    category: "Accessories",
    dimensions: "150cm length",
    weight: "250g",
    inStock: true,
    featured: false
  },
  {
    name: "Salmon & Rice Training Treats",
    description: "Small, soft training treats made with real salmon and rice. Perfect size for training sessions. Rich in omega-3 fatty acids for healthy skin and coat.",
    price: 19.99,
    images: [
      "/g5.jpg",
      "/g7.jpg"
    ],
    category: "Treats",
    dimensions: "12cm x 8cm x 4cm",
    weight: "150g",
    inStock: true,
    featured: false
  },
  {
    name: "Squeaky Duck Toy",
    description: "Adorable squeaky duck toy that will keep your dog entertained for hours. Made from safe, non-toxic materials. Perfect for fetch and interactive play.",
    price: 12.99,
    images: [
      "/g9.jpg",
      "/g2.jpg"
    ],
    category: "Toys",
    dimensions: "15cm x 10cm x 8cm",
    weight: "100g",
    inStock: true,
    featured: false
  },
  {
    name: "Custom Dog Tag - Personalized",
    description: "Personalized dog tag with your pet's name and your contact information. Made from durable stainless steel with laser engraving. Multiple design options available.",
    price: 14.50,
    images: [
      "/g4.jpg",
      "/g6.jpg"
    ],
    category: "Custom Orders",
    dimensions: "3cm x 2cm",
    weight: "15g",
    inStock: true,
    featured: false
  },
  {
    name: "Dental Chew Sticks - Natural",
    description: "Natural dental chew sticks that help maintain your dog's oral health. Made from sweet potato and other natural ingredients. Promotes healthy teeth and gums.",
    price: 28.75,
    images: [
      "/g8.jpg",
      "/g10.jpg"
    ],
    category: "Treats",
    dimensions: "18cm x 12cm x 6cm",
    weight: "300g",
    inStock: true,
    featured: true
  }
];

// Function to add all dummy products
export const addDummyProducts = async (): Promise<void> => {
  console.log('Starting to add dummy products...');
  
  for (let i = 0; i < dummyProducts.length; i++) {
    const product = dummyProducts[i];
    console.log(`Adding product ${i + 1}/${dummyProducts.length}: ${product.name}`);
    
    try {
      const result = await createProduct(product);
      if (result.success) {
        console.log(`✅ Successfully added: ${product.name}`);
      } else {
        console.error(`❌ Failed to add ${product.name}:`, result.error);
      }
    } catch (error) {
      console.error(`❌ Error adding ${product.name}:`, error);
    }
    
    // Add a small delay to avoid overwhelming Firestore
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('Finished adding dummy products!');
};

// Run the function if this file is executed directly
if (require.main === module) {
  addDummyProducts().catch(console.error);
}