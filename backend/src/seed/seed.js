require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Order = require('../models/Order');
const Notification = require('../models/Notification');
const Banner = require('../models/Banner');
const Settings = require('../models/Settings');

const usersData = [
  { id: 1, name: 'Alexander Mitchell', email: 'alex.mitchell@example.com', password: 'password123', avatar: '/assets/placeholders/avatar.svg', role: 'admin', phone: '+1 (555) 123-4567', address: { street: '742 Fifth Avenue', city: 'New York', state: 'NY', zip: '10022', country: 'USA' }, joinDate: '2024-01-15T10:00:00Z', isBlocked: false },
  { id: 2, name: 'Victoria Sterling', email: 'victoria@example.com', password: 'password123', avatar: '/assets/placeholders/avatar.svg', role: 'admin', phone: '+1 (555) 234-5678', address: { street: '1 Rodeo Drive', city: 'Beverly Hills', state: 'CA', zip: '90210', country: 'USA' }, joinDate: '2024-02-20T10:00:00Z', isBlocked: false },
  { id: 3, name: 'James Whitfield', email: 'james.whitfield@example.com', password: 'password123', avatar: '/assets/placeholders/avatar.svg', role: 'customer', phone: '+1 (555) 345-6789', address: { street: '45 Park Lane', city: 'London', state: 'Greater London', zip: 'W1K 1PN', country: 'UK' }, joinDate: '2024-03-10T10:00:00Z', isBlocked: false },
  { id: 4, name: 'Sophia Laurent', email: 'sophia.laurent@example.com', password: 'password123', avatar: '/assets/placeholders/avatar.svg', role: 'customer', phone: '+33 (1) 23-45-67-89', address: { street: '15 Avenue Montaigne', city: 'Paris', state: 'Île-de-France', zip: '75008', country: 'France' }, joinDate: '2024-04-05T10:00:00Z', isBlocked: false },
  { id: 5, name: 'Benjamin Hart', email: 'ben.hart@example.com', password: 'password123', avatar: '/assets/placeholders/avatar.svg', role: 'customer', phone: '+1 (555) 456-7890', address: { street: '890 Madison Avenue', city: 'New York', state: 'NY', zip: '10021', country: 'USA' }, joinDate: '2024-05-18T10:00:00Z', isBlocked: false },
  { id: 6, name: 'Isabella Rossi', email: 'isabella.rossi@example.com', password: 'password123', avatar: '/assets/placeholders/avatar.svg', role: 'customer', phone: '+39 (02) 1234-5678', address: { street: 'Via Monte Napoleone 8', city: 'Milan', state: 'Lombardy', zip: '20121', country: 'Italy' }, joinDate: '2024-06-22T10:00:00Z', isBlocked: false },
  { id: 7, name: 'Oliver Chen', email: 'oliver.chen@example.com', password: 'password123', avatar: '/assets/placeholders/avatar.svg', role: 'customer', phone: '+65 9876 5432', address: { street: '10 Orchard Road', city: 'Singapore', state: 'Singapore', zip: '238801', country: 'Singapore' }, joinDate: '2024-07-14T10:00:00Z', isBlocked: false },
  { id: 8, name: 'Charlotte Dubois', email: 'charlotte.dubois@example.com', password: 'password123', avatar: '/assets/placeholders/avatar.svg', role: 'customer', phone: '+49 (30) 1234-5678', address: { street: 'Kurfürstendamm 34', city: 'Berlin', state: 'Berlin', zip: '10719', country: 'Germany' }, joinDate: '2024-08-30T10:00:00Z', isBlocked: false },
  { id: 9, name: 'William Tanaka', email: 'william.tanaka@example.com', password: 'password123', avatar: '/assets/placeholders/avatar.svg', role: 'customer', phone: '+81 (3) 1234-5678', address: { street: '2-7-12 Ginza', city: 'Tokyo', state: 'Tokyo', zip: '104-0061', country: 'Japan' }, joinDate: '2024-09-12T10:00:00Z', isBlocked: true },
  { id: 10, name: 'Amara Okafor', email: 'amara.okafor@example.com', password: 'password123', avatar: '/assets/placeholders/avatar.svg', role: 'customer', phone: '+27 (11) 234-5678', address: { street: '12 Sandton Drive', city: 'Johannesburg', state: 'Gauteng', zip: '2196', country: 'South Africa' }, joinDate: '2024-10-05T10:00:00Z', isBlocked: false },
  { id: 11, name: 'Lucas Weber', email: 'lucas.weber@example.com', password: 'password123', avatar: '/assets/placeholders/avatar.svg', role: 'customer', phone: '+41 (44) 123-45-67', address: { street: 'Bahnhofstrasse 20', city: 'Zurich', state: 'Zurich', zip: '8001', country: 'Switzerland' }, joinDate: '2024-11-18T10:00:00Z', isBlocked: false },
  { id: 12, name: 'Emily Park', email: 'emily.park@example.com', password: 'password123', avatar: '/assets/placeholders/avatar.svg', role: 'customer', phone: '+82 (2) 123-4567', address: { street: '123 Gangnam-daero', city: 'Seoul', state: 'Gangnam-gu', zip: '06100', country: 'South Korea' }, joinDate: '2024-12-01T10:00:00Z', isBlocked: false },
];

const categoriesData = [
  {
    name: 'Men', slug: 'men', image: '/assets/placeholders/men.jpg',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="10" cy="14" r="6"/><path d="M19 5l-5.4 5.4"/><path d="M15 5h4v4"/></svg>',
    productCount: 42, description: "Premium men's fashion featuring tailored suits, casual wear, accessories, and footwear from world-class designers.",
    subcategories: [
      { name: 'T-Shirts', slug: 't-shirts', productCount: 5 },
      { name: 'Shirts', slug: 'shirts', productCount: 5 },
      { name: 'Jeans', slug: 'jeans', productCount: 4 },
      { name: 'Hoodies', slug: 'hoodies', productCount: 4 },
      { name: 'Jackets', slug: 'jackets', productCount: 4 },
      { name: 'Sneakers', slug: 'sneakers', productCount: 5 },
      { name: 'Formal Shoes', slug: 'formal-shoes', productCount: 4 },
      { name: 'Watches', slug: 'watches', productCount: 4 },
      { name: 'Wallets', slug: 'wallets', productCount: 3 },
      { name: 'Accessories', slug: 'accessories', productCount: 4 },
    ]
  },
  {
    name: 'Women', slug: 'women', image: '/assets/placeholders/women.jpg',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="9" r="6"/><path d="M12 15v6"/><path d="M9 21h6"/></svg>',
    productCount: 38, description: "Curated women's luxury collection from haute couture dresses to timeless accessories and exclusive designer pieces.",
    subcategories: [
      { name: 'Dresses', slug: 'dresses', productCount: 6 },
      { name: 'Tops', slug: 'tops', productCount: 5 },
      { name: 'Jeans', slug: 'jeans', productCount: 4 },
      { name: 'Handbags', slug: 'handbags', productCount: 5 },
      { name: 'Heels', slug: 'heels', productCount: 4 },
      { name: 'Makeup', slug: 'makeup', productCount: 5 },
      { name: 'Jewelry', slug: 'jewelry', productCount: 4 },
      { name: 'Skincare', slug: 'skincare', productCount: 5 },
    ]
  },
  {
    name: 'Fashion', slug: 'fashion', image: '/assets/placeholders/fashion.jpg',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4h12l4 7-5 7-7-4-7 4-5-7 4-7z"/></svg>',
    productCount: 35, description: 'Trendsetting streetwear and contemporary fashion blends from avant-garde designers and luxury labels.',
    subcategories: [
      { name: 'T-Shirts', slug: 't-shirts', productCount: 6 },
      { name: 'Shirts', slug: 'shirts', productCount: 5 },
      { name: 'Jeans', slug: 'jeans', productCount: 5 },
      { name: 'Hoodies', slug: 'hoodies', productCount: 4 },
      { name: 'Jackets', slug: 'jackets', productCount: 4 },
      { name: 'Shoes', slug: 'shoes', productCount: 6 },
      { name: 'Accessories', slug: 'accessories', productCount: 5 },
    ]
  },
  {
    name: 'Shoes', slug: 'shoes', image: '/assets/placeholders/shoes.jpg',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14c.5-1 2-2 5-2 4 0 5 2 8 2 2 0 3.5-1 4-2"/><path d="M3 18c.5-1 2-2 5-2 4 0 5 2 8 2 2 0 3.5-1 4-2"/><path d="M2 22c.5-1 2-2 5-2 4 0 5 2 8 2 2 0 3.5-1 4-2"/><path d="M4 10c.5-1 2-2 5-2 4 0 5 2 8 2 2 0 3.5-1 4-2"/></svg>',
    productCount: 28, description: 'Exquisite footwear collection from Italian leather loafers to limited-edition sneakers and elegant heels.',
    subcategories: [
      { name: 'Sneakers', slug: 'sneakers', productCount: 7 },
      { name: 'Running Shoes', slug: 'running-shoes', productCount: 6 },
      { name: 'Formal Shoes', slug: 'formal-shoes', productCount: 5 },
      { name: 'Sandals', slug: 'sandals', productCount: 4 },
      { name: 'Sports Shoes', slug: 'sports-shoes', productCount: 6 },
    ]
  },
  {
    name: 'Watches', slug: 'watches', image: '/assets/placeholders/watches.jpg',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="8"/><path d="M12 8v4l2 2"/><path d="M10 2h4"/><path d="M11 22h2"/></svg>',
    productCount: 22, description: 'Haute horlogerie timepieces from Swiss masters including Rolex, Patek Philippe, Audemars Piguet and more.',
    subcategories: [
      { name: 'Luxury Watches', slug: 'luxury-watches', productCount: 9 },
      { name: 'Smart Watches', slug: 'smart-watches', productCount: 7 },
      { name: 'Sports Watches', slug: 'sports-watches', productCount: 6 },
    ]
  },
  {
    name: 'Bags', slug: 'bags', image: '/assets/placeholders/bags.jpg',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 8h16l-1.5 12H5.5L4 8z"/><path d="M8 8V6a4 4 0 0 1 8 0v2"/></svg>',
    productCount: 26, description: 'Luxury handbags and accessories from Hermès, Louis Vuitton, Chanel and other iconic fashion houses.',
    subcategories: [
      { name: 'Backpacks', slug: 'backpacks', productCount: 7 },
      { name: 'Handbags', slug: 'handbags', productCount: 8 },
      { name: 'Laptop Bags', slug: 'laptop-bags', productCount: 5 },
      { name: 'Travel Bags', slug: 'travel-bags', productCount: 6 },
    ]
  },
  {
    name: 'Perfumes', slug: 'perfumes', image: '/assets/placeholders/perfumes.jpg',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v6"/><path d="M8 8h8v2a6 6 0 0 1-6 6h-4a2 2 0 0 1-2-2v-2a4 4 0 0 1 4-4z"/><path d="M8 16v4a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-4"/></svg>',
    productCount: 20, description: 'Artisan-crafted fragrances from renowned perfumers featuring rare ingredients and exquisite blends.',
    subcategories: [
      { name: 'Men Perfumes', slug: 'men-perfumes', productCount: 6 },
      { name: 'Women Perfumes', slug: 'women-perfumes', productCount: 6 },
      { name: 'Luxury Fragrances', slug: 'luxury-fragrances', productCount: 5 },
      { name: 'Body Sprays', slug: 'body-sprays', productCount: 3 },
    ]
  },
  {
    name: 'Beauty', slug: 'beauty', image: '/assets/placeholders/beauty.jpg',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M8 22v-4a4 4 0 0 1 8 0v4"/><path d="M4 12v10"/><path d="M20 12v10"/></svg>',
    productCount: 18, description: 'Premium beauty and skincare essentials from La Mer, Sisley, and other luxury cosmetic houses.',
    subcategories: [
      { name: 'Lipsticks', slug: 'lipsticks', productCount: 3 },
      { name: 'Foundation', slug: 'foundation', productCount: 3 },
      { name: 'Face Wash', slug: 'face-wash', productCount: 3 },
      { name: 'Serum', slug: 'serum', productCount: 3 },
      { name: 'Perfumes', slug: 'perfumes', productCount: 3 },
      { name: 'Hair Care', slug: 'hair-care', productCount: 2 },
      { name: 'Skin Care', slug: 'skin-care', productCount: 1 },
    ]
  },
  {
    name: 'Makeup', slug: 'makeup', image: '/assets/placeholders/makeup.jpg',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2L6 14l4 4L22 6l-4-4z"/><path d="M10 14l-4 4"/><path d="M6 18l-2 4 4-2"/><circle cx="16" cy="8" r="1"/></svg>',
    productCount: 15, description: 'Professional-grade makeup collections from Tom Ford, Charlotte Tilbury, and Dior Beauty.',
    subcategories: [
      { name: 'Lipsticks', slug: 'lipsticks', productCount: 3 },
      { name: 'Brushes', slug: 'brushes', productCount: 3 },
      { name: 'Foundation', slug: 'foundation', productCount: 3 },
      { name: 'Kits', slug: 'kits', productCount: 3 },
      { name: 'Eye Makeup', slug: 'eye-makeup', productCount: 3 },
    ]
  },
  {
    name: 'Skincare', slug: 'skincare', image: '/assets/placeholders/skincare.jpg',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v1h6V5a3 3 0 0 0-3-3z"/><path d="M12 6v8"/><path d="M8 14h8a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2z"/></svg>',
    productCount: 16, description: 'Advanced clinical skincare featuring serums, moisturizers, and treatments from La Prairie and Dr. Barbara Sturm.',
    subcategories: [
      { name: 'Face Wash', slug: 'face-wash', productCount: 4 },
      { name: 'Serums', slug: 'serums', productCount: 4 },
      { name: 'Moisturizers', slug: 'moisturizers', productCount: 3 },
      { name: 'Sunscreen', slug: 'sunscreen', productCount: 3 },
      { name: 'Masks', slug: 'masks', productCount: 2 },
    ]
  },
  {
    name: 'Jewelry', slug: 'jewelry', image: '/assets/placeholders/jewelry.jpg',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3 5-5 5 3 5-3 5"/><path d="M2 12h8"/><path d="M14 12h8"/><circle cx="12" cy="7" r="1"/><circle cx="12" cy="17" r="1"/></svg>',
    productCount: 24, description: 'Fine jewelry collections from Cartier, Tiffany & Co., Van Cleef & Arpels with diamonds and precious gemstones.',
    subcategories: [
      { name: 'Rings', slug: 'rings', productCount: 7 },
      { name: 'Bracelets', slug: 'bracelets', productCount: 6 },
      { name: 'Necklaces', slug: 'necklaces', productCount: 6 },
      { name: 'Earrings', slug: 'earrings', productCount: 5 },
    ]
  },
  {
    name: 'Sports', slug: 'sports', image: '/assets/placeholders/sports.jpg',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a15 15 0 0 0 0 20 15 15 0 0 0 0-20z"/><path d="M2 12h20"/></svg>',
    productCount: 14, description: 'Premium sportswear and equipment from Nike, Adidas, and performance luxury brands.',
    subcategories: [
      { name: 'Gym Bags', slug: 'gym-bags', productCount: 3 },
      { name: 'Dumbbells', slug: 'dumbbells', productCount: 3 },
      { name: 'Water Bottles', slug: 'water-bottles', productCount: 2 },
      { name: 'Sports Shoes', slug: 'sports-shoes', productCount: 4 },
      { name: 'Accessories', slug: 'accessories', productCount: 2 },
    ]
  },
  {
    name: 'Electronics', slug: 'electronics', image: '/assets/placeholders/electronics.jpg',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8"/><path d="M12 18h.01"/></svg>',
    productCount: 12, description: 'Cutting-edge luxury electronics from Bang & Olufsen, Apple, and high-end audio brands.',
    subcategories: [
      { name: 'Smartphones', slug: 'smartphones', productCount: 3 },
      { name: 'Earbuds', slug: 'earbuds', productCount: 3 },
      { name: 'Smart Watches', slug: 'smart-watches', productCount: 2 },
      { name: 'Chargers', slug: 'chargers', productCount: 2 },
      { name: 'Accessories', slug: 'accessories', productCount: 2 },
    ]
  },
  {
    name: 'Travel Accessories', slug: 'travel-accessories', image: '/assets/placeholders/travel.jpg',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7h18v14H3z"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M12 12v4"/><path d="M10 14h4"/></svg>',
    productCount: 10, description: "Refined travel essentials from Rimowa, Tumi, and Bric's for the discerning global traveler.",
    subcategories: [
      { name: 'Backpacks', slug: 'backpacks', productCount: 2 },
      { name: 'Luggage', slug: 'luggage', productCount: 3 },
      { name: 'Passport Holders', slug: 'passport-holders', productCount: 2 },
      { name: 'Travel Pillows', slug: 'travel-pillows', productCount: 1 },
      { name: 'Travel Organizers', slug: 'travel-organizers', productCount: 2 },
    ]
  },
];

const productsData = [
  { id: 1, name: 'Classic Leather Sneakers', category: 'Men', subCategory: 'Sneakers', brand: 'Gucci', image: '/assets/placeholders/product.svg', price: 890, originalPrice: 890, discountPercentage: null, rating: 4.8, totalReviews: 234, description: 'Handcrafted Italian leather sneakers with signature Gucci detailing. Premium calfskin leather with rubber sole.', stock: 45, colors: ['White', 'Black', 'Navy'], sizes: ['M', 'L', 'XL', 'XXL'], featured: true, trending: true, createdAt: '2025-11-15T10:00:00Z' },
  { id: 2, name: 'Tailored Wool Suit', category: 'Men', subCategory: 'Jackets', brand: 'Hugo Boss', image: '/assets/placeholders/product.svg', price: 1290, originalPrice: 1590, discountPercentage: 20, rating: 4.9, totalReviews: 189, description: 'Slim-fit two-piece suit in Super 120s virgin wool. Fully lined with horn buttons and classic notch lapel.', stock: 20, colors: ['Black', 'Navy', 'Gray'], sizes: ['S', 'M', 'L', 'XL'], featured: true, trending: false, createdAt: '2025-10-20T10:00:00Z' },
  { id: 3, name: 'Cashmere Crew Neck Sweater', category: 'Men', subCategory: 'T-Shirts', brand: 'Prada', image: '/assets/placeholders/product.svg', price: 680, originalPrice: 680, rating: 4.7, totalReviews: 156, description: 'Luxuriously soft Mongolian cashmere crew neck sweater. Ribbed cuffs and hem with a relaxed fit.', stock: 60, colors: ['Black', 'Gray', 'Beige', 'Navy'], sizes: ['S', 'M', 'L', 'XL', 'XXL'], featured: false, trending: true, createdAt: '2025-12-01T10:00:00Z' },
  { id: 4, name: 'Slim Fit Designer Jeans', category: 'Men', subCategory: 'Jeans', brand: "Dolce & Gabbana", image: '/assets/placeholders/product.svg', price: 520, originalPrice: 650, discountPercentage: 20, rating: 4.6, totalReviews: 312, description: 'Slim-fit jeans in premium Japanese selvedge denim. Five-pocket styling with logo hardware.', stock: 80, colors: ['Black', 'Navy'], sizes: ['XS', 'S', 'M', 'L', 'XL'], featured: false, trending: false, createdAt: '2025-09-10T10:00:00Z' },
  { id: 5, name: 'Leather Bomber Jacket', category: 'Men', subCategory: 'Jackets', brand: 'Saint Laurent', image: '/assets/placeholders/product.svg', price: 2450, originalPrice: 2450, rating: 4.9, totalReviews: 98, description: 'Luxurious lambskin leather bomber jacket with ribbed collar, cuffs, and hem. Zip-front closure.', stock: 15, colors: ['Black', 'Brown'], sizes: ['M', 'L', 'XL'], featured: true, trending: true, createdAt: '2025-11-25T10:00:00Z' },
  { id: 6, name: 'Luxury Chronograph Watch', category: 'Men', subCategory: 'Watches', brand: 'Tag Heuer', image: '/assets/placeholders/product.svg', price: 3200, originalPrice: 3800, discountPercentage: 15, rating: 4.8, totalReviews: 145, description: 'Automatic chronograph with 43mm stainless steel case. Sapphire crystal with date window.', stock: 10, colors: ['Black', 'Navy'], sizes: ['M', 'L'], featured: true, trending: false, createdAt: '2025-08-15T10:00:00Z' },
  { id: 7, name: 'Designer Polo Shirt', category: 'Men', subCategory: 'Shirts', brand: 'Ralph Lauren', image: '/assets/placeholders/product.svg', price: 195, originalPrice: 195, rating: 4.5, totalReviews: 523, description: 'Classic-fit cotton pique polo shirt with embroidered pony logo. Ribbed collar and two-button placket.', stock: 120, colors: ['White', 'Black', 'Navy', 'Red', 'Green'], sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'], featured: false, trending: false, createdAt: '2025-12-10T10:00:00Z' },
  { id: 8, name: 'Italian Leather Belt', category: 'Men', subCategory: 'Accessories', brand: 'Gucci', image: '/assets/placeholders/product.svg', price: 450, originalPrice: 450, rating: 4.7, totalReviews: 267, description: 'Genuine Italian leather belt with signature GG buckle. 30mm width, reversible design.', stock: 90, colors: ['Black', 'Brown'], sizes: ['S', 'M', 'L', 'XL'], featured: false, trending: false, createdAt: '2025-11-05T10:00:00Z' },
  { id: 9, name: 'Premium Cotton T-Shirt', category: 'Men', subCategory: 'T-Shirts', brand: 'Prada', image: '/assets/placeholders/product.svg', price: 320, originalPrice: 320, rating: 4.4, totalReviews: 412, description: 'Supima cotton jersey tee with enamel logo triangle. Relaxed fit with ribbed crew neck.', stock: 150, colors: ['White', 'Black', 'Gray', 'Navy'], sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'], featured: false, trending: true, createdAt: '2026-01-05T10:00:00Z' },
  { id: 10, name: 'Leather Loafers', category: 'Men', subCategory: 'Formal Shoes', brand: "Tod's", image: '/assets/placeholders/product.svg', price: 750, originalPrice: 750, rating: 4.6, totalReviews: 178, description: 'Hand-stitched suede loafers with rubber pebble sole. Penny keeper strap with signature detailing.', stock: 35, colors: ['Brown', 'Black', 'Beige'], sizes: ['M', 'L', 'XL'], featured: false, trending: false, createdAt: '2025-10-30T10:00:00Z' },
];

const remainingProducts = [
  { id: 11, name: 'Silk Evening Gown', category: 'Women', subCategory: 'Dresses', brand: 'Valentino', image: '/assets/placeholders/product.svg', price: 3200, originalPrice: 3800, discountPercentage: 15, rating: 4.9, totalReviews: 87, description: 'Floor-length silk chiffon gown with delicate floral embroidery. V-neckline with sheer cape sleeves.', stock: 8, colors: ['Black', 'Red', 'Gold'], sizes: ['XS', 'S', 'M', 'L'], featured: true, trending: true, createdAt: '2025-12-05T10:00:00Z' },
  { id: 12, name: 'Leather Crossbody Bag', category: 'Women', subCategory: 'Handbags', brand: 'Chanel', image: '/assets/placeholders/product.svg', price: 4800, originalPrice: 4800, rating: 5.0, totalReviews: 64, description: 'Quilted lambskin leather crossbody bag with gold-tone chain strap. Iconic CC turn-lock closure.', stock: 5, colors: ['Black', 'Beige', 'Gold'], sizes: ['M'], featured: true, trending: true, createdAt: '2025-11-20T10:00:00Z' },
  { id: 13, name: 'Stiletto Heels', category: 'Women', subCategory: 'Heels', brand: 'Christian Louboutin', image: '/assets/placeholders/product.svg', price: 895, originalPrice: 895, rating: 4.8, totalReviews: 203, description: 'Classic patent leather stiletto pumps with signature red lacquered sole. 100mm heel height.', stock: 30, colors: ['Black', 'Red', 'Nude'], sizes: ['S', 'M', 'L'], featured: true, trending: false, createdAt: '2025-09-25T10:00:00Z' },
  { id: 14, name: 'Pearl Drop Earrings', category: 'Women', subCategory: 'Jewelry', brand: 'Mikimoto', image: '/assets/placeholders/product.svg', price: 2200, originalPrice: 2200, rating: 4.9, totalReviews: 42, description: 'South Sea pearl drop earrings set in 18k white gold with diamond accents.', stock: 12, colors: ['Gold', 'White'], sizes: ['M'], featured: false, trending: true, createdAt: '2025-12-15T10:00:00Z' },
  { id: 15, name: 'Cashmere Wrap Coat', category: 'Women', subCategory: 'Tops', brand: 'Burberry', image: '/assets/placeholders/product.svg', price: 2600, originalPrice: 2600, rating: 4.7, totalReviews: 134, description: 'Double-face cashmere wrap coat with oversized collar. Belted waist with leather trim details.', stock: 18, colors: ['Beige', 'Black', 'Navy'], sizes: ['XS', 'S', 'M', 'L'], featured: true, trending: false, createdAt: '2025-10-10T10:00:00Z' },
  { id: 16, name: 'Silk Blouse', category: 'Women', subCategory: 'Tops', brand: 'Dior', image: '/assets/placeholders/product.svg', price: 980, originalPrice: 980, rating: 4.6, totalReviews: 198, description: 'Luxurious silk crepe blouse with bow neckline. Relaxed fit with French cuffs.', stock: 40, colors: ['White', 'Black', 'Pink', 'Gold'], sizes: ['XS', 'S', 'M', 'L'], featured: false, trending: false, createdAt: '2025-11-10T10:00:00Z' },
  { id: 17, name: 'High-Waist Trousers', category: 'Women', subCategory: 'Jeans', brand: 'Givenchy', image: '/assets/placeholders/product.svg', price: 720, originalPrice: 900, discountPercentage: 20, rating: 4.5, totalReviews: 167, description: 'Wide-leg trousers in stretch wool crepe. High-waist with side zip and satin stripe detail.', stock: 35, colors: ['Black', 'Navy', 'Gray'], sizes: ['XS', 'S', 'M', 'L', 'XL'], featured: false, trending: false, createdAt: '2025-08-20T10:00:00Z' },
  { id: 18, name: 'Leather Gloves', category: 'Women', subCategory: 'Tops', brand: 'Gucci', image: '/assets/placeholders/product.svg', price: 380, originalPrice: 380, rating: 4.4, totalReviews: 89, description: 'Italian lambskin leather gloves with cashmere lining. Embroidered GG motif at cuff.', stock: 55, colors: ['Black', 'Brown', 'Beige'], sizes: ['S', 'M', 'L'], featured: false, trending: false, createdAt: '2025-10-05T10:00:00Z' },
  { id: 19, name: 'Floral Midi Dress', category: 'Women', subCategory: 'Dresses', brand: 'Zimmermann', image: '/assets/placeholders/product.svg', price: 450, originalPrice: 450, rating: 4.7, totalReviews: 234, description: 'Floral print midi dress in lightweight cotton voile. Smocked bodice with ruffled hem.', stock: 50, colors: ['Pink', 'Blue', 'White'], sizes: ['XS', 'S', 'M', 'L'], featured: false, trending: true, createdAt: '2026-01-10T10:00:00Z' },
  { id: 20, name: 'Knit Cardigan', category: 'Women', subCategory: 'Tops', brand: 'Max Mara', image: '/assets/placeholders/product.svg', price: 580, originalPrice: 580, rating: 4.5, totalReviews: 145, description: 'Oversized alpaca wool blend cardigan with tortoiseshell buttons. Ribbed cuffs and hem.', stock: 42, colors: ['Beige', 'Black', 'Gray', 'Navy'], sizes: ['XS', 'S', 'M', 'L', 'XL'], featured: false, trending: false, createdAt: '2025-11-30T10:00:00Z' },
  { id: 21, name: 'Oversized Graphic Tee', category: 'Fashion', subCategory: 'T-Shirts', brand: 'Balenciaga', image: '/assets/placeholders/product.svg', price: 450, originalPrice: 450, rating: 4.3, totalReviews: 312, description: 'Oversized cotton jersey tee with bold graphic print. Dropped shoulders and raw hem.', stock: 100, colors: ['Black', 'White', 'Gray'], sizes: ['S', 'M', 'L', 'XL', 'XXL'], featured: false, trending: true, createdAt: '2026-01-15T10:00:00Z' },
  { id: 22, name: 'Designer Hoodie', category: 'Fashion', subCategory: 'Hoodies', brand: 'Off-White', image: '/assets/placeholders/product.svg', price: 520, originalPrice: 650, discountPercentage: 20, rating: 4.6, totalReviews: 278, description: 'Heavyweight cotton fleece hoodie with signature diagonal print. Adjustable drawstring hood.', stock: 65, colors: ['Black', 'White', 'Navy'], sizes: ['S', 'M', 'L', 'XL', 'XXL'], featured: true, trending: true, createdAt: '2025-12-20T10:00:00Z' },
  { id: 23, name: 'Cargo Pants', category: 'Fashion', subCategory: 'Jeans', brand: 'Fear of God', image: '/assets/placeholders/product.svg', price: 680, originalPrice: 680, rating: 4.7, totalReviews: 189, description: 'Relaxed-fit cargo pants in cotton twill. Multiple utility pockets with adjustable cuffs.', stock: 45, colors: ['Black', 'Olive', 'Beige'], sizes: ['XS', 'S', 'M', 'L', 'XL'], featured: false, trending: true, createdAt: '2025-11-28T10:00:00Z' },
  { id: 24, name: 'Varsity Jacket', category: 'Fashion', subCategory: 'Jackets', brand: 'Tommy Hilfiger', image: '/assets/placeholders/product.svg', price: 350, originalPrice: 350, rating: 4.5, totalReviews: 201, description: 'Wool blend varsity jacket with leather sleeves. Snap-button front with embroidered logo patch.', stock: 55, colors: ['Navy', 'Black', 'Red'], sizes: ['S', 'M', 'L', 'XL'], featured: false, trending: false, createdAt: '2025-10-15T10:00:00Z' },
  { id: 25, name: 'Street Sneakers', category: 'Fashion', subCategory: 'Shoes', brand: 'Nike', image: '/assets/placeholders/product.svg', price: 220, originalPrice: 220, rating: 4.8, totalReviews: 567, description: 'Limited edition street sneakers with chunky silhouette. Premium leather and mesh upper.', stock: 70, colors: ['White', 'Black', 'Red', 'Navy'], sizes: ['M', 'L', 'XL', 'XXL'], featured: true, trending: true, createdAt: '2026-01-20T10:00:00Z' },
  { id: 26, name: 'Chain Necklace', category: 'Fashion', subCategory: 'Accessories', brand: 'MCM', image: '/assets/placeholders/product.svg', price: 280, originalPrice: 280, rating: 4.4, totalReviews: 145, description: 'Statement chunky chain necklace in brass with gold finish. Lobster clasp closure.', stock: 85, colors: ['Gold', 'Silver'], sizes: ['M', 'L'], featured: false, trending: false, createdAt: '2025-12-08T10:00:00Z' },
  { id: 27, name: 'Trucker Cap', category: 'Fashion', subCategory: 'Accessories', brand: 'Supreme', image: '/assets/placeholders/product.svg', price: 148, originalPrice: 148, rating: 4.3, totalReviews: 423, description: 'Classic cotton twill trucker cap with front logo embroidery. Snapback closure with mesh back.', stock: 200, colors: ['Black', 'Red', 'Navy', 'White'], sizes: ['M', 'L', 'XL'], featured: false, trending: false, createdAt: '2026-01-02T10:00:00Z' },
  { id: 28, name: 'Denim Jacket', category: 'Fashion', subCategory: 'Jackets', brand: "Levi's", image: '/assets/placeholders/product.svg', price: 198, originalPrice: 198, rating: 4.6, totalReviews: 389, description: 'Classic denim trucker jacket in rigid selvedge denim. Chest pockets with button closure.', stock: 90, colors: ['Blue', 'Black', 'Navy'], sizes: ['S', 'M', 'L', 'XL', 'XXL'], featured: false, trending: false, createdAt: '2025-09-05T10:00:00Z' },
  { id: 29, name: 'Track Pants', category: 'Fashion', subCategory: 'Jeans', brand: 'Adidas', image: '/assets/placeholders/product.svg', price: 120, originalPrice: 150, discountPercentage: 20, rating: 4.4, totalReviews: 456, description: 'Classic track pants in brushed cotton fleece. Tapered leg with ribbed cuffs and zip pockets.', stock: 130, colors: ['Black', 'Navy', 'White'], sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'], featured: false, trending: false, createdAt: '2025-11-01T10:00:00Z' },
  { id: 30, name: 'Bucket Hat', category: 'Fashion', subCategory: 'Accessories', brand: 'Palm Angels', image: '/assets/placeholders/product.svg', price: 180, originalPrice: 180, rating: 4.2, totalReviews: 98, description: 'Cotton twill bucket hat with all-over print. UV protection with embroidered eyelets.', stock: 110, colors: ['Black', 'Green', 'Pink'], sizes: ['M', 'L'], featured: false, trending: false, createdAt: '2025-12-12T10:00:00Z' },
  { id: 31, name: 'Running Performance Shoes', category: 'Shoes', subCategory: 'Running Shoes', brand: 'Nike', image: '/assets/placeholders/product.svg', price: 240, originalPrice: 240, rating: 4.7, totalReviews: 890, description: 'Lightweight performance running shoes with responsive cushioning. Flyknit upper with rubber outsole.', stock: 150, colors: ['Black', 'White', 'Red', 'Blue'], sizes: ['M', 'L', 'XL', 'XXL'], featured: true, trending: false, createdAt: '2025-10-25T10:00:00Z' },
  { id: 32, name: 'Italian Leather Oxfords', category: 'Shoes', subCategory: 'Formal Shoes', brand: 'Salvatore Ferragamo', image: '/assets/placeholders/product.svg', price: 890, originalPrice: 890, rating: 4.8, totalReviews: 156, description: 'Handcrafted calfskin leather oxfords with Goodyear welt construction. Cap toe with blind eyelets.', stock: 30, colors: ['Black', 'Brown'], sizes: ['M', 'L', 'XL'], featured: false, trending: false, createdAt: '2025-09-15T10:00:00Z' },
  { id: 33, name: 'Leather Ankle Boots', category: 'Shoes', subCategory: 'Sneakers', brand: 'Prada', image: '/assets/placeholders/product.svg', price: 1100, originalPrice: 1300, discountPercentage: 15, rating: 4.7, totalReviews: 134, description: 'Chelsea-style ankle boots in polished leather. Elastic side panels with pull tab.', stock: 25, colors: ['Black', 'Brown'], sizes: ['M', 'L', 'XL'], featured: true, trending: true, createdAt: '2025-11-18T10:00:00Z' },
  { id: 34, name: 'Leather Sandals', category: 'Shoes', subCategory: 'Sandals', brand: 'Hermès', image: '/assets/placeholders/product.svg', price: 680, originalPrice: 680, rating: 4.6, totalReviews: 98, description: 'Hand-stitched leather sandals with H-shaped straps. Cushioned leather footbed with rubber outsole.', stock: 40, colors: ['Brown', 'Black', 'Beige'], sizes: ['M', 'L'], featured: false, trending: false, createdAt: '2025-12-02T10:00:00Z' },
  { id: 35, name: 'Suede Chelsea Boots', category: 'Shoes', subCategory: 'Sneakers', brand: 'Bottega Veneta', image: '/assets/placeholders/product.svg', price: 950, originalPrice: 950, rating: 4.8, totalReviews: 112, description: 'Intrecciato woven suede Chelsea boots. Leather sole with rubber grip pad.', stock: 20, colors: ['Brown', 'Black', 'Green'], sizes: ['M', 'L', 'XL'], featured: false, trending: true, createdAt: '2025-12-22T10:00:00Z' },
  { id: 36, name: 'Espadrilles', category: 'Shoes', subCategory: 'Sneakers', brand: 'Chanel', image: '/assets/placeholders/product.svg', price: 520, originalPrice: 520, rating: 4.5, totalReviews: 167, description: 'Canvas espadrilles with jute rope sole and leather trim. Embroidered CC logo at vamp.', stock: 55, colors: ['Beige', 'Black', 'Navy'], sizes: ['S', 'M', 'L'], featured: false, trending: false, createdAt: '2025-10-08T10:00:00Z' },
  { id: 37, name: 'Tennis Sneakers', category: 'Shoes', subCategory: 'Sneakers', brand: 'Adidas', image: '/assets/placeholders/product.svg', price: 180, originalPrice: 180, rating: 4.6, totalReviews: 345, description: 'Classic tennis-inspired sneakers in perforated leather. EVA midsole with herringbone outsole.', stock: 120, colors: ['White', 'Black', 'Green'], sizes: ['M', 'L', 'XL', 'XXL'], featured: false, trending: false, createdAt: '2025-11-05T10:00:00Z' },
  { id: 38, name: "Leather Monk Strap Shoes", category: 'Shoes', subCategory: 'Formal Shoes', brand: "Church's", image: '/assets/placeholders/product.svg', price: 780, originalPrice: 780, rating: 4.7, totalReviews: 89, description: 'Double monk strap shoes in burnished calf leather. Single leather sole with metal toe tap.', stock: 22, colors: ['Brown', 'Black'], sizes: ['M', 'L', 'XL'], featured: false, trending: false, createdAt: '2025-09-28T10:00:00Z' },
  { id: 39, name: 'Slide Sandals', category: 'Shoes', subCategory: 'Sandals', brand: 'Gucci', image: '/assets/placeholders/product.svg', price: 320, originalPrice: 320, rating: 4.4, totalReviews: 278, description: 'Leather slide sandals with horsebit detail. Memory foam footbed with rubber sole.', stock: 80, colors: ['Black', 'Brown', 'Gold'], sizes: ['M', 'L', 'XL'], featured: false, trending: true, createdAt: '2026-01-08T10:00:00Z' },
  { id: 40, name: 'Hiking Boots', category: 'Shoes', subCategory: 'Sports Shoes', brand: 'Timberland', image: '/assets/placeholders/product.svg', price: 210, originalPrice: 210, rating: 4.5, totalReviews: 412, description: 'Premium waterproof hiking boots with Gore-Tex membrane. Vibram outsole with anti-fatigue technology.', stock: 65, colors: ['Brown', 'Black', 'Navy'], sizes: ['M', 'L', 'XL', 'XXL'], featured: false, trending: false, createdAt: '2025-10-18T10:00:00Z' },
  { id: 41, name: 'Automatic Diver Watch', category: 'Watches', subCategory: 'Luxury Watches', brand: 'Rolex', image: '/assets/placeholders/product.svg', price: 8500, originalPrice: 8500, rating: 5.0, totalReviews: 56, description: 'Submariner date automatic watch with 41mm Oystersteel case. Cerachrom bezel with 300m water resistance.', stock: 3, colors: ['Black', 'Navy'], sizes: ['M', 'L'], featured: true, trending: true, createdAt: '2025-11-01T10:00:00Z' },
  { id: 42, name: 'Elegance Automatic Watch', category: 'Watches', subCategory: 'Luxury Watches', brand: 'Patek Philippe', image: '/assets/placeholders/product.svg', price: 28500, originalPrice: 32000, discountPercentage: 10, rating: 5.0, totalReviews: 23, description: 'Calatrava automatic watch in 18k rose gold. Sunburst dial with applied gold markers. Alligator strap.', stock: 2, colors: ['Gold', 'Brown'], sizes: ['M'], featured: true, trending: false, createdAt: '2025-10-05T10:00:00Z' },
  { id: 43, name: 'Speedmaster Chronograph', category: 'Watches', subCategory: 'Luxury Watches', brand: 'Omega', image: '/assets/placeholders/product.svg', price: 6200, originalPrice: 6200, rating: 4.9, totalReviews: 134, description: 'Speedmaster Moonwatch professional chronograph. Manual-winding movement with hesalite crystal.', stock: 6, colors: ['Black', 'Silver'], sizes: ['M', 'L'], featured: false, trending: true, createdAt: '2025-12-10T10:00:00Z' },
  { id: 44, name: 'Royal Oak Offshore', category: 'Watches', subCategory: 'Luxury Watches', brand: 'Audemars Piguet', image: '/assets/placeholders/product.svg', price: 22000, originalPrice: 22000, rating: 5.0, totalReviews: 31, description: 'Royal Oak Offshore self-winding chronograph. Stainless steel case with octagonal bezel and rubber strap.', stock: 1, colors: ['Gray', 'Black'], sizes: ['L'], featured: true, trending: false, createdAt: '2025-09-20T10:00:00Z' },
  { id: 45, name: 'Smartwatch Pro', category: 'Watches', subCategory: 'Smart Watches', brand: 'Apple', image: '/assets/placeholders/product.svg', price: 799, originalPrice: 799, rating: 4.7, totalReviews: 1245, description: 'Ultra smartwatch with titanium case and precision dual-frequency GPS. Action button with 36hr battery.', stock: 50, colors: ['Black', 'White', 'Gold'], sizes: ['M', 'L'], featured: false, trending: true, createdAt: '2026-01-05T10:00:00Z' },
  { id: 46, name: 'Nautilus Automatic', category: 'Watches', subCategory: 'Luxury Watches', brand: 'Patek Philippe', image: '/assets/placeholders/product.svg', price: 42000, originalPrice: 42000, rating: 5.0, totalReviews: 18, description: 'Nautilus automatic in stainless steel with blue dial. Iconic porthole design with integrated bracelet.', stock: 1, colors: ['Blue', 'Black'], sizes: ['M', 'L'], featured: true, trending: false, createdAt: '2025-08-15T10:00:00Z' },
  { id: 47, name: 'Tank Francaise Watch', category: 'Watches', subCategory: 'Luxury Watches', brand: 'Cartier', image: '/assets/placeholders/product.svg', price: 4200, originalPrice: 4200, rating: 4.8, totalReviews: 89, description: 'Tank Francaise stainless steel watch with quartz movement. Silver dial with Roman numerals.', stock: 8, colors: ['Gold', 'Silver'], sizes: ['S', 'M'], featured: false, trending: false, createdAt: '2025-11-15T10:00:00Z' },
  { id: 48, name: 'Big Bang Unico', category: 'Watches', subCategory: 'Luxury Watches', brand: 'Hublot', image: '/assets/placeholders/product.svg', price: 15800, originalPrice: 18000, discountPercentage: 12, rating: 4.7, totalReviews: 45, description: 'Big Bang Unico chronograph in King Gold. Skeleton dial with ceramic bezel and rubber strap.', stock: 4, colors: ['Gold', 'Black'], sizes: ['L'], featured: false, trending: false, createdAt: '2025-10-30T10:00:00Z' },
  { id: 49, name: 'Seamaster Diver', category: 'Watches', subCategory: 'Luxury Watches', brand: 'Omega', image: '/assets/placeholders/product.svg', price: 4800, originalPrice: 4800, rating: 4.8, totalReviews: 167, description: 'Seamaster Diver 300M with ceramic bezel and wave-pattern dial. Helium escape valve and 42mm case.', stock: 7, colors: ['Black', 'Blue', 'Green'], sizes: ['M', 'L'], featured: false, trending: false, createdAt: '2025-12-05T10:00:00Z' },
  { id: 50, name: 'Neverfull Tote Bag', category: 'Bags', subCategory: 'Handbags', brand: 'Louis Vuitton', image: '/assets/placeholders/product.svg', price: 1560, originalPrice: 1560, rating: 4.8, totalReviews: 345, description: 'Iconic Neverfull MM tote in Monogram canvas. Natural cowhide leather trim with textile lining.', stock: 15, colors: ['Brown', 'Beige'], sizes: ['M', 'L'], featured: true, trending: true, createdAt: '2025-11-10T10:00:00Z' },
];

const moreProducts = [
  { id: 51, name: 'Classic Flap Bag', category: 'Bags', subCategory: 'Handbags', brand: 'Chanel', image: '/assets/placeholders/product.svg', price: 6800, originalPrice: 6800, rating: 5.0, totalReviews: 78, description: 'Classic 11.12 flap bag in black lambskin leather. Gold-tone chain strap with CC turn-lock closure.', stock: 4, colors: ['Black', 'Beige', 'Red'], sizes: ['M'], featured: true, trending: false, createdAt: '2025-10-15T10:00:00Z' },
  { id: 52, name: 'Backpack', category: 'Bags', subCategory: 'Backpacks', brand: 'Gucci', image: '/assets/placeholders/product.svg', price: 1350, originalPrice: 1350, rating: 4.6, totalReviews: 156, description: 'GG Supreme canvas backpack with leather trim. Padded laptop compartment with front zip pocket.', stock: 22, colors: ['Black', 'Brown'], sizes: ['M', 'L'], featured: false, trending: true, createdAt: '2025-12-15T10:00:00Z' },
  { id: 53, name: 'Duffle Bag', category: 'Bags', subCategory: 'Travel Bags', brand: 'Prada', image: '/assets/placeholders/product.svg', price: 2100, originalPrice: 2400, discountPercentage: 12, rating: 4.7, totalReviews: 98, description: 'Saffiano leather duffle bag with removable shoulder strap. Double zip closure with padlock.', stock: 12, colors: ['Black', 'Navy', 'Gray'], sizes: ['L'], featured: false, trending: false, createdAt: '2025-09-28T10:00:00Z' },
  { id: 54, name: 'Belt Bag', category: 'Bags', subCategory: 'Travel Bags', brand: 'Fendi', image: '/assets/placeholders/product.svg', price: 890, originalPrice: 890, rating: 4.5, totalReviews: 134, description: 'FF jacquard fabric belt bag with leather trim. Adjustable strap with zip-around closure.', stock: 35, colors: ['Black', 'Brown', 'Red'], sizes: ['M', 'L'], featured: false, trending: false, createdAt: '2025-11-22T10:00:00Z' },
  { id: 55, name: 'Mini Top Handle Bag', category: 'Bags', subCategory: 'Handbags', brand: 'Dior', image: '/assets/placeholders/product.svg', price: 3200, originalPrice: 3200, rating: 4.9, totalReviews: 67, description: 'Lady Dior mini bag in lambskin leather with cannage stitching. D.I.O.R. charm and removable chain.', stock: 6, colors: ['Black', 'Pink', 'Gold'], sizes: ['S'], featured: true, trending: false, createdAt: '2025-10-08T10:00:00Z' },
  { id: 56, name: 'Shoulder Bag', category: 'Bags', subCategory: 'Handbags', brand: 'Saint Laurent', image: '/assets/placeholders/product.svg', price: 1790, originalPrice: 1790, rating: 4.7, totalReviews: 112, description: 'Lulu shoulder bag in quilted lambskin leather. Chain and leather strap with YSL signature hardware.', stock: 18, colors: ['Black', 'Beige', 'Gold'], sizes: ['M'], featured: false, trending: true, createdAt: '2026-01-02T10:00:00Z' },
  { id: 57, name: 'Clutch Bag', category: 'Bags', subCategory: 'Handbags', brand: 'Bottega Veneta', image: '/assets/placeholders/product.svg', price: 1400, originalPrice: 1400, rating: 4.6, totalReviews: 89, description: 'Intrecciato leather clutch with magnetic closure. Removable wrist strap with knot detail.', stock: 14, colors: ['Black', 'Green', 'Red'], sizes: ['M'], featured: false, trending: false, createdAt: '2025-12-28T10:00:00Z' },
  { id: 58, name: 'Bleu de Chanel EDP', category: 'Perfumes', subCategory: 'Men Perfumes', brand: 'Chanel', image: '/assets/placeholders/product.svg', price: 145, originalPrice: 145, rating: 4.9, totalReviews: 890, description: 'A sophisticated aromatic-woody fragrance with notes of grapefruit, labdanum, and sandalwood.', stock: 60, colors: [], sizes: ['S', 'M', 'L'], featured: true, trending: true, createdAt: '2025-11-20T10:00:00Z' },
  { id: 59, name: 'Sauvage Elixir', category: 'Perfumes', subCategory: 'Men Perfumes', brand: 'Dior', image: '/assets/placeholders/product.svg', price: 195, originalPrice: 195, rating: 4.8, totalReviews: 567, description: 'An intense oriental-woody elixir with notes of cinnamon, nutmeg, and vanilla absolute.', stock: 45, colors: [], sizes: ['S', 'M', 'L'], featured: false, trending: true, createdAt: '2025-12-05T10:00:00Z' },
  { id: 60, name: 'La Vie Est Belle', category: 'Perfumes', subCategory: 'Women Perfumes', brand: 'Lancôme', image: '/assets/placeholders/product.svg', price: 128, originalPrice: 128, rating: 4.7, totalReviews: 1123, description: 'A captivating floral-gourmand fragrance with iris, jasmine, patchouli, and vanilla.', stock: 75, colors: [], sizes: ['S', 'M', 'L'], featured: false, trending: false, createdAt: '2025-10-20T10:00:00Z' },
  { id: 61, name: 'Acqua di Gio', category: 'Perfumes', subCategory: 'Men Perfumes', brand: 'Giorgio Armani', image: '/assets/placeholders/product.svg', price: 112, originalPrice: 112, rating: 4.6, totalReviews: 1456, description: 'A fresh aquatic fragrance with notes of bergamot, neroli, rosemary, and patchouli.', stock: 90, colors: [], sizes: ['S', 'M', 'L'], featured: false, trending: false, createdAt: '2025-09-12T10:00:00Z' },
  { id: 62, name: 'Black Opium EDP', category: 'Perfumes', subCategory: 'Women Perfumes', brand: 'Yves Saint Laurent', image: '/assets/placeholders/product.svg', price: 135, originalPrice: 150, discountPercentage: 10, rating: 4.7, totalReviews: 789, description: 'An addictive coffee-floral fragrance with notes of black coffee, white flowers, and vanilla.', stock: 55, colors: [], sizes: ['S', 'M', 'L'], featured: true, trending: false, createdAt: '2025-11-10T10:00:00Z' },
  { id: 63, name: 'Aventus Cologne', category: 'Perfumes', subCategory: 'Luxury Fragrances', brand: 'Creed', image: '/assets/placeholders/product.svg', price: 435, originalPrice: 435, rating: 4.9, totalReviews: 234, description: 'An iconic fragrance with notes of pineapple, blackcurrant, birch, and musk.', stock: 20, colors: [], sizes: ['S', 'M', 'L'], featured: true, trending: true, createdAt: '2025-12-20T10:00:00Z' },
  { id: 64, name: 'Flowerbomb EDP', category: 'Perfumes', subCategory: 'Women Perfumes', brand: 'Viktor & Rolf', image: '/assets/placeholders/product.svg', price: 165, originalPrice: 165, rating: 4.8, totalReviews: 567, description: 'An explosive floral bouquet with notes of jasmine, rose, orchid, and patchouli.', stock: 48, colors: [], sizes: ['S', 'M', 'L'], featured: false, trending: false, createdAt: '2025-10-30T10:00:00Z' },
  { id: 65, name: 'Tobacco Vanille', category: 'Perfumes', subCategory: 'Luxury Fragrances', brand: 'Tom Ford', image: '/assets/placeholders/product.svg', price: 290, originalPrice: 290, rating: 4.8, totalReviews: 312, description: 'A warm spicy fragrance with notes of tobacco leaf, vanilla, cocoa, and dried fruits.', stock: 30, colors: [], sizes: ['S', 'M', 'L'], featured: false, trending: true, createdAt: '2025-12-08T10:00:00Z' },
  { id: 66, name: 'Santos de Cartier', category: 'Perfumes', subCategory: 'Men Perfumes', brand: 'Cartier', image: '/assets/placeholders/product.svg', price: 120, originalPrice: 120, rating: 4.5, totalReviews: 178, description: 'A classic aromatic fougere with lavender, rosemary, sandalwood, and oakmoss.', stock: 40, colors: [], sizes: ['S', 'M', 'L'], featured: false, trending: false, createdAt: '2025-11-05T10:00:00Z' },
  { id: 67, name: 'Luxury Skincare Set', category: 'Beauty', subCategory: 'Skin Care', brand: 'La Mer', image: '/assets/placeholders/product.svg', price: 520, originalPrice: 520, rating: 4.9, totalReviews: 145, description: 'The Regenerating Skincare Collection includes Crème de la Mer, treatment lotion, and eye concentrate.', stock: 15, colors: [], sizes: ['S', 'M'], featured: true, trending: true, createdAt: '2025-12-01T10:00:00Z' },
  { id: 68, name: 'Rose Gold Beauty Set', category: 'Beauty', subCategory: 'Skin Care', brand: 'Charlotte Tilbury', image: '/assets/placeholders/product.svg', price: 235, originalPrice: 285, discountPercentage: 18, rating: 4.7, totalReviews: 234, description: 'Rose Gold Collection with magic cream, lipsticks, eyeshadow palette, and Hollywood contour wands.', stock: 30, colors: ['Gold', 'Pink'], sizes: ['S', 'M'], featured: false, trending: false, createdAt: '2025-11-15T10:00:00Z' },
  { id: 69, name: 'Haircare Treatment Set', category: 'Beauty', subCategory: 'Hair Care', brand: 'Olaplex', image: '/assets/placeholders/product.svg', price: 89, originalPrice: 89, rating: 4.6, totalReviews: 2345, description: 'Complete haircare system with bond maintenance shampoo, conditioner, and treatment oil.', stock: 120, colors: [], sizes: ['S', 'M', 'L'], featured: false, trending: false, createdAt: '2025-10-10T10:00:00Z' },
  { id: 70, name: 'Body Care Collection', category: 'Beauty', subCategory: 'Skin Care', brand: 'Jo Malone', image: '/assets/placeholders/product.svg', price: 145, originalPrice: 145, rating: 4.5, totalReviews: 312, description: 'Luxurious body care collection with body wash, lotion, and hand cream in Pomegranate Noir.', stock: 65, colors: [], sizes: ['S', 'M'], featured: false, trending: false, createdAt: '2025-12-12T10:00:00Z' },
  { id: 71, name: 'Makeup Brush Set', category: 'Beauty', subCategory: 'Skin Care', brand: 'Fenty Beauty', image: '/assets/placeholders/product.svg', price: 120, originalPrice: 120, rating: 4.4, totalReviews: 567, description: 'Professional 10-piece brush set with synthetic bristles. Includes foundation, concealer, and eye brushes.', stock: 90, colors: [], sizes: ['S'], featured: false, trending: false, createdAt: '2025-11-28T10:00:00Z' },
  { id: 72, name: 'LED Face Mask', category: 'Beauty', subCategory: 'Skin Care', brand: 'Dr. Dennis Gross', image: '/assets/placeholders/product.svg', price: 435, originalPrice: 435, rating: 4.3, totalReviews: 198, description: 'SpectraLite FaceWare Pro with red and blue LED lights. Anti-aging and acne treatment in one device.', stock: 25, colors: [], sizes: ['M'], featured: false, trending: true, createdAt: '2026-01-05T10:00:00Z' },
  { id: 73, name: 'Nail Art Kit', category: 'Beauty', subCategory: 'Skin Care', brand: 'Chanel', image: '/assets/placeholders/product.svg', price: 95, originalPrice: 95, rating: 4.2, totalReviews: 145, description: 'Le Vernis nail color collection with top coat, base coat, and 5 iconic shades.', stock: 80, colors: ['Red', 'Pink', 'Black', 'White'], sizes: ['S'], featured: false, trending: false, createdAt: '2025-09-20T10:00:00Z' },
  { id: 74, name: 'Matte Lipstick Collection', category: 'Makeup', subCategory: 'Lipsticks', brand: 'Tom Ford', image: '/assets/placeholders/product.svg', price: 72, originalPrice: 72, rating: 4.8, totalReviews: 456, description: 'Luxurious matte lipstick with shea butter and vitamin E. Creamy texture with full coverage.', stock: 100, colors: ['Red', 'Pink', 'Nude', 'Berry'], sizes: ['S'], featured: true, trending: true, createdAt: '2025-12-05T10:00:00Z' },
  { id: 75, name: 'Luminous Foundation', category: 'Makeup', subCategory: 'Foundation', brand: 'Dior', image: '/assets/placeholders/product.svg', price: 68, originalPrice: 68, rating: 4.7, totalReviews: 678, description: 'Diorskin Forever foundation with 24-hour wear. Natural luminous finish with SPF 35.', stock: 120, colors: ['Beige', 'Nude', 'Ivory', 'Tan'], sizes: ['S'], featured: false, trending: false, createdAt: '2025-11-10T10:00:00Z' },
  { id: 76, name: 'Eyeshadow Palette', category: 'Makeup', subCategory: 'Eye Makeup', brand: 'Pat McGrath', image: '/assets/placeholders/product.svg', price: 128, originalPrice: 128, rating: 4.9, totalReviews: 345, description: 'Mothership VII: Divine Rose eyeshadow palette with 10 shades. Includes matte, shimmer, and glitter finishes.', stock: 40, colors: ['Gold', 'Pink', 'Brown', 'Purple'], sizes: ['S'], featured: true, trending: true, createdAt: '2025-12-15T10:00:00Z' },
  { id: 77, name: 'Setting Spray', category: 'Makeup', subCategory: 'Kits', brand: 'Urban Decay', image: '/assets/placeholders/product.svg', price: 33, originalPrice: 33, rating: 4.6, totalReviews: 2345, description: 'All Nighter long-lasting makeup setting spray. Keeps makeup fresh for up to 16 hours.', stock: 200, colors: [], sizes: ['S', 'M'], featured: false, trending: false, createdAt: '2025-10-25T10:00:00Z' },
  { id: 78, name: 'Concealer Wand', category: 'Makeup', subCategory: 'Foundation', brand: 'Nars', image: '/assets/placeholders/product.svg', price: 32, originalPrice: 32, rating: 4.7, totalReviews: 1890, description: 'Radiant creamy concealer with medium-to-full coverage. Brightening formula with light-diffusing particles.', stock: 150, colors: ['Beige', 'Nude', 'Ivory', 'Tan'], sizes: ['S'], featured: false, trending: false, createdAt: '2025-11-05T10:00:00Z' },
  { id: 79, name: 'Eyebrow Pencil', category: 'Makeup', subCategory: 'Eye Makeup', brand: 'Anastasia Beverly Hills', image: '/assets/placeholders/product.svg', price: 24, originalPrice: 24, rating: 4.5, totalReviews: 3456, description: 'Brow Wiz mechanical eyebrow pencil with ultra-fine tip. Natural-looking hair-like strokes.', stock: 250, colors: ['Brown', 'Blonde', 'Gray', 'Black'], sizes: ['S'], featured: false, trending: false, createdAt: '2025-10-15T10:00:00Z' },
  { id: 80, name: 'Mascara', category: 'Makeup', subCategory: 'Eye Makeup', brand: 'Lancôme', image: '/assets/placeholders/product.svg', price: 30, originalPrice: 30, rating: 4.6, totalReviews: 2789, description: 'Hypnôse mascara with volume-maximizing formula. Patented brush for dramatic lash impact.', stock: 180, colors: ['Black'], sizes: ['S'], featured: false, trending: false, createdAt: '2025-12-01T10:00:00Z' },
  { id: 81, name: 'Contour Kit', category: 'Makeup', subCategory: 'Kits', brand: 'Fenty Beauty', image: '/assets/placeholders/product.svg', price: 48, originalPrice: 58, discountPercentage: 17, rating: 4.6, totalReviews: 890, description: 'Match Stix contour kit with 3 shades. Creamy formula for sculpting, highlighting, and concealing.', stock: 75, colors: ['Beige', 'Brown', 'Nude'], sizes: ['S'], featured: false, trending: false, createdAt: '2025-11-20T10:00:00Z' },
  { id: 82, name: 'Vitamin C Serum', category: 'Skincare', subCategory: 'Serums', brand: 'SkinCeuticals', image: '/assets/placeholders/product.svg', price: 182, originalPrice: 182, rating: 4.9, totalReviews: 678, description: 'CE Ferulic antioxidant serum with 15% pure vitamin C. Brightens skin and reduces fine lines.', stock: 40, colors: [], sizes: ['S', 'M'], featured: true, trending: true, createdAt: '2025-12-10T10:00:00Z' },
  { id: 83, name: 'Retinol Night Cream', category: 'Skincare', subCategory: 'Moisturizers', brand: 'La Mer', image: '/assets/placeholders/product.svg', price: 245, originalPrice: 245, rating: 4.8, totalReviews: 234, description: 'Genaissance de la Mer night cream with retinol. Rejuvenates skin texture while sleeping.', stock: 20, colors: [], sizes: ['S', 'M'], featured: false, trending: false, createdAt: '2025-11-08T10:00:00Z' },
  { id: 84, name: 'Cleansing Balm', category: 'Skincare', subCategory: 'Face Wash', brand: 'Eve Lom', image: '/assets/placeholders/product.svg', price: 80, originalPrice: 80, rating: 4.7, totalReviews: 456, description: 'Award-winning cleansing balm with eucalyptus oil and clove oil. Dissolves makeup and impurities.', stock: 65, colors: [], sizes: ['S', 'M', 'L'], featured: false, trending: false, createdAt: '2025-10-08T10:00:00Z' },
  { id: 85, name: 'Hyaluronic Acid Moisturizer', category: 'Skincare', subCategory: 'Moisturizers', brand: 'Dr. Barbara Sturm', image: '/assets/placeholders/product.svg', price: 165, originalPrice: 165, rating: 4.6, totalReviews: 312, description: 'Face cream rich with hyaluronic acid and purslane. Deep hydration for a plump, radiant complexion.', stock: 55, colors: [], sizes: ['S', 'M'], featured: false, trending: true, createdAt: '2025-12-22T10:00:00Z' },
  { id: 86, name: 'Eye Cream', category: 'Skincare', subCategory: 'Moisturizers', brand: 'Estée Lauder', image: '/assets/placeholders/product.svg', price: 72, originalPrice: 72, rating: 4.5, totalReviews: 890, description: 'Advanced Night Repair eye cream with Chronolux Power Signal technology. Reduces dark circles and puffiness.', stock: 80, colors: [], sizes: ['S'], featured: false, trending: false, createdAt: '2025-11-12T10:00:00Z' },
  { id: 87, name: 'Face Sunscreen SPF 50', category: 'Skincare', subCategory: 'Sunscreen', brand: 'Supergoop!', image: '/assets/placeholders/product.svg', price: 42, originalPrice: 42, rating: 4.4, totalReviews: 1234, description: 'Unseen sunscreen with SPF 50. Invisible, weightless formula with blue light protection.', stock: 150, colors: [], sizes: ['S', 'M'], featured: false, trending: false, createdAt: '2025-10-20T10:00:00Z' },
  { id: 88, name: 'Exfoliating Toner', category: 'Skincare', subCategory: 'Face Wash', brand: "Paula's Choice", image: '/assets/placeholders/product.svg', price: 35, originalPrice: 35, rating: 4.7, totalReviews: 5678, description: 'Skin Perfecting 2% BHA liquid exfoliant. Unclogs pores and smooths fine lines with salicylic acid.', stock: 200, colors: [], sizes: ['S', 'M', 'L'], featured: false, trending: false, createdAt: '2025-09-15T10:00:00Z' },
  { id: 89, name: 'Sheet Mask Set', category: 'Skincare', subCategory: 'Masks', brand: 'Dr. Jart+', image: '/assets/placeholders/product.svg', price: 58, originalPrice: 58, rating: 4.5, totalReviews: 3456, description: 'Cicapair facial sheet mask set with tea tree and cica. Soothes irritated skin with intensive moisture.', stock: 180, colors: [], sizes: ['S'], featured: false, trending: false, createdAt: '2025-12-18T10:00:00Z' },
  { id: 90, name: 'Diamond Engagement Ring', category: 'Jewelry', subCategory: 'Rings', brand: 'Tiffany & Co.', image: '/assets/placeholders/product.svg', price: 12500, originalPrice: 12500, rating: 5.0, totalReviews: 34, description: 'Tiffany Setting engagement ring with round brilliant diamond. 18k platinum with 1.5-carat center stone.', stock: 2, colors: ['Gold', 'Silver'], sizes: ['S', 'M', 'L'], featured: true, trending: false, createdAt: '2025-10-05T10:00:00Z' },
  { id: 91, name: 'Love Bracelet', category: 'Jewelry', subCategory: 'Bracelets', brand: 'Cartier', image: '/assets/placeholders/product.svg', price: 6800, originalPrice: 6800, rating: 4.9, totalReviews: 89, description: 'Iconic Love bracelet in 18k yellow gold. Oval shape with screw motif and included screwdriver.', stock: 5, colors: ['Gold', 'Silver'], sizes: ['S', 'M', 'L'], featured: true, trending: true, createdAt: '2025-12-01T10:00:00Z' },
  { id: 92, name: 'Alhambra Necklace', category: 'Jewelry', subCategory: 'Necklaces', brand: 'Van Cleef & Arpels', image: '/assets/placeholders/product.svg', price: 3200, originalPrice: 3200, rating: 4.9, totalReviews: 56, description: 'Vintage Alhambra pendant necklace in 18k gold with mother-of-pearl. Iconic clover design.', stock: 4, colors: ['Gold', 'White'], sizes: ['M'], featured: false, trending: true, createdAt: '2025-11-15T10:00:00Z' },
  { id: 93, name: 'Hoop Earrings', category: 'Jewelry', subCategory: 'Earrings', brand: 'Bvlgari', image: '/assets/placeholders/product.svg', price: 1800, originalPrice: 2100, discountPercentage: 14, rating: 4.7, totalReviews: 98, description: 'Serpenti hoop earrings in 18k rose gold with pave diamond scales. Screw-back closure.', stock: 8, colors: ['Gold'], sizes: ['S', 'M'], featured: false, trending: false, createdAt: '2025-10-20T10:00:00Z' },
  { id: 94, name: 'Diamond Tennis Bracelet', category: 'Jewelry', subCategory: 'Bracelets', brand: 'Tiffany & Co.', image: '/assets/placeholders/product.svg', price: 8500, originalPrice: 8500, rating: 4.8, totalReviews: 45, description: 'Tennis bracelet with round brilliant diamonds set in platinum. 5 carats total weight.', stock: 3, colors: ['Gold', 'Silver'], sizes: ['S', 'M', 'L'], featured: true, trending: false, createdAt: '2025-09-25T10:00:00Z' },
  { id: 95, name: 'Gold Chain Necklace', category: 'Jewelry', subCategory: 'Necklaces', brand: 'David Yurman', image: '/assets/placeholders/product.svg', price: 1200, originalPrice: 1200, rating: 4.6, totalReviews: 134, description: 'Cable chain necklace in 14k yellow gold. Classic twisted cable design with lobster clasp.', stock: 15, colors: ['Gold'], sizes: ['M', 'L'], featured: false, trending: false, createdAt: '2025-11-28T10:00:00Z' },
  { id: 96, name: 'Signet Ring', category: 'Jewelry', subCategory: 'Rings', brand: 'Gucci', image: '/assets/placeholders/product.svg', price: 480, originalPrice: 480, rating: 4.5, totalReviews: 178, description: 'Sterling silver signet ring with engraved GG logo. Polished finish with sturdy weight.', stock: 35, colors: ['Gold', 'Silver'], sizes: ['S', 'M', 'L', 'XL'], featured: false, trending: false, createdAt: '2025-12-08T10:00:00Z' },
  { id: 97, name: 'Pearl Stud Earrings', category: 'Jewelry', subCategory: 'Earrings', brand: 'Mikimoto', image: '/assets/placeholders/product.svg', price: 650, originalPrice: 650, rating: 4.7, totalReviews: 89, description: 'Akoya cultured pearl stud earrings set in 18k white gold. 7.5mm perfectly round pearls.', stock: 20, colors: ['Gold', 'White'], sizes: ['S'], featured: false, trending: true, createdAt: '2026-01-10T10:00:00Z' },
  { id: 98, name: "Chaîne d'Ancre Bracelet", category: 'Jewelry', subCategory: 'Bracelets', brand: 'Hermès', image: '/assets/placeholders/product.svg', price: 890, originalPrice: 890, rating: 4.6, totalReviews: 112, description: "Chaîne d'Ancre bracelet in sterling silver with gold plate. Iconic anchor chain links.", stock: 18, colors: ['Gold', 'Silver'], sizes: ['S', 'M', 'L'], featured: false, trending: false, createdAt: '2025-10-30T10:00:00Z' },
  { id: 99, name: 'Yoga Mat Premium', category: 'Sports', subCategory: 'Accessories', brand: 'Lululemon', image: '/assets/placeholders/product.svg', price: 98, originalPrice: 98, rating: 4.7, totalReviews: 1234, description: 'The Reversible Mat 5mm with natural rubber base. Non-slip surface with antimicrobial technology.', stock: 80, colors: ['Black', 'Navy', 'Purple', 'Green'], sizes: ['M', 'L'], featured: false, trending: false, createdAt: '2025-11-05T10:00:00Z' },
  { id: 100, name: 'Dumbbell Set', category: 'Sports', subCategory: 'Dumbbells', brand: 'Nike', image: '/assets/placeholders/product.svg', price: 199, originalPrice: 250, discountPercentage: 20, rating: 4.6, totalReviews: 456, description: 'Neoprene dumbbell set with 3 pairs (3lb, 5lb, 8lb). Hexagon shape prevents rolling.', stock: 45, colors: ['Black', 'Gray'], sizes: ['S', 'M', 'L'], featured: false, trending: false, createdAt: '2025-10-12T10:00:00Z' },
  { id: 101, name: 'Water Bottle', category: 'Sports', subCategory: 'Water Bottles', brand: 'Hydro Flask', image: '/assets/placeholders/product.svg', price: 45, originalPrice: 45, rating: 4.8, totalReviews: 3456, description: '32oz insulated stainless steel water bottle with Flex Straw Cap. TempShield keeps drinks cold 24hrs.', stock: 200, colors: ['Black', 'White', 'Green', 'Pink', 'Blue'], sizes: ['M', 'L'], featured: false, trending: false, createdAt: '2025-12-02T10:00:00Z' },
  { id: 102, name: 'Gym Duffel Bag', category: 'Sports', subCategory: 'Gym Bags', brand: 'Under Armour', image: '/assets/placeholders/product.svg', price: 85, originalPrice: 85, rating: 4.5, totalReviews: 678, description: 'UA Undeniable duffel bag with water-resistant coating. Ventilated shoe pocket and multiple compartments.', stock: 60, colors: ['Black', 'Navy', 'Red'], sizes: ['M', 'L'], featured: false, trending: false, createdAt: '2025-11-18T10:00:00Z' },
  { id: 103, name: 'Performance Leggings', category: 'Sports', subCategory: 'Accessories', brand: 'Lululemon', image: '/assets/placeholders/product.svg', price: 128, originalPrice: 128, rating: 4.8, totalReviews: 2345, description: 'Align high-rise leggings with Nulu fabric. Buttery-soft feel with four-way stretch and sweat-wicking.', stock: 90, colors: ['Black', 'Navy', 'Pink', 'Green'], sizes: ['XS', 'S', 'M', 'L', 'XL'], featured: true, trending: true, createdAt: '2026-01-02T10:00:00Z' },
  { id: 104, name: 'Resistance Bands Set', category: 'Sports', subCategory: 'Accessories', brand: 'TheraBand', image: '/assets/placeholders/product.svg', price: 29, originalPrice: 29, rating: 4.4, totalReviews: 4567, description: 'Set of 5 resistance bands with different levels. Latex-free with door anchor and handles.', stock: 300, colors: ['Red', 'Green', 'Blue', 'Black'], sizes: ['S'], featured: false, trending: false, createdAt: '2025-09-30T10:00:00Z' },
  { id: 105, name: 'Foam Roller', category: 'Sports', subCategory: 'Accessories', brand: 'TriggerPoint', image: '/assets/placeholders/product.svg', price: 45, originalPrice: 45, rating: 4.5, totalReviews: 1234, description: 'Grid foam roller with multi-density foam surface. Relieves muscle tension and improves recovery.', stock: 100, colors: ['Black', 'Blue', 'Pink'], sizes: ['M', 'L'], featured: false, trending: false, createdAt: '2025-10-25T10:00:00Z' },
  { id: 106, name: 'Jump Rope', category: 'Sports', subCategory: 'Accessories', brand: 'Rogue Fitness', image: '/assets/placeholders/product.svg', price: 38, originalPrice: 38, rating: 4.6, totalReviews: 890, description: 'Speed jump rope with ball bearing handles. Adjustable 10ft coated steel cable for fast rotations.', stock: 150, colors: ['Black', 'Red'], sizes: ['M'], featured: false, trending: false, createdAt: '2025-12-10T10:00:00Z' },
  { id: 107, name: 'Wireless Noise-Cancelling Headphones', category: 'Electronics', subCategory: 'Accessories', brand: 'Bose', image: '/assets/placeholders/product.svg', price: 349, originalPrice: 379, discountPercentage: 8, rating: 4.8, totalReviews: 3456, description: 'QuietComfort Ultra wireless headphones with spatial audio. Industry-leading noise cancellation.', stock: 50, colors: ['Black', 'White'], sizes: ['M', 'L'], featured: true, trending: true, createdAt: '2025-12-05T10:00:00Z' },
  { id: 108, name: 'Smartphone Pro Max', category: 'Electronics', subCategory: 'Smartphones', brand: 'Apple', image: '/assets/placeholders/product.svg', price: 1199, originalPrice: 1199, rating: 4.9, totalReviews: 5678, description: 'iPhone Pro Max with A18 chip, 48MP camera system, and ProMotion display. Titanium design.', stock: 75, colors: ['Black', 'Gold', 'White'], sizes: ['M', 'L'], featured: true, trending: true, createdAt: '2025-11-01T10:00:00Z' },
  { id: 109, name: 'Wireless Earbuds', category: 'Electronics', subCategory: 'Earbuds', brand: 'Apple', image: '/assets/placeholders/product.svg', price: 249, originalPrice: 249, rating: 4.7, totalReviews: 7890, description: 'AirPods Pro with adaptive audio and USB-C. Active noise cancellation with transparency mode.', stock: 120, colors: ['White', 'Black'], sizes: ['S', 'M', 'L'], featured: false, trending: true, createdAt: '2025-12-15T10:00:00Z' },
  { id: 110, name: 'Bluetooth Speaker', category: 'Electronics', subCategory: 'Accessories', brand: 'Marshall', image: '/assets/placeholders/product.svg', price: 299, originalPrice: 299, rating: 4.6, totalReviews: 1234, description: 'Stanmore III Bluetooth speaker with iconic design. Dynamic sound with HDMI and RCA inputs.', stock: 35, colors: ['Black', 'Brown', 'White'], sizes: ['M'], featured: false, trending: false, createdAt: '2025-10-18T10:00:00Z' },
  { id: 111, name: 'Laptop Pro', category: 'Electronics', subCategory: 'Accessories', brand: 'Apple', image: '/assets/placeholders/product.svg', price: 2499, originalPrice: 2799, discountPercentage: 10, rating: 4.8, totalReviews: 2345, description: 'MacBook Pro 16-inch with M4 chip, 36GB RAM, and 1TB SSD. Liquid Retina XDR display.', stock: 25, colors: ['Gray', 'Silver', 'Black'], sizes: ['M', 'L'], featured: true, trending: false, createdAt: '2025-11-20T10:00:00Z' },
  { id: 112, name: 'Smartwatch', category: 'Electronics', subCategory: 'Smart Watches', brand: 'Samsung', image: '/assets/placeholders/product.svg', price: 399, originalPrice: 399, rating: 4.5, totalReviews: 1567, description: 'Galaxy Watch Ultra with titanium grade case. Sapphire crystal with water resistance to 100m.', stock: 40, colors: ['Gray', 'Black', 'White'], sizes: ['M', 'L'], featured: false, trending: false, createdAt: '2025-12-20T10:00:00Z' },
  { id: 113, name: 'Tablet Pro', category: 'Electronics', subCategory: 'Accessories', brand: 'Apple', image: '/assets/placeholders/product.svg', price: 1099, originalPrice: 1099, rating: 4.7, totalReviews: 1890, description: 'iPad Pro 13-inch with M4 chip and Ultra Retina XDR display. Apple Pencil Pro support.', stock: 30, colors: ['Black', 'Silver'], sizes: ['M', 'L'], featured: false, trending: false, createdAt: '2025-10-28T10:00:00Z' },
  { id: 114, name: 'Luggage Set', category: 'Travel Accessories', subCategory: 'Luggage', brand: 'Rimowa', image: '/assets/placeholders/product.svg', price: 2450, originalPrice: 2800, discountPercentage: 12, rating: 4.8, totalReviews: 234, description: 'Essential trunk luggage set with 3 pieces (cabin, medium, large). Aluminum-magnesium alloy construction.', stock: 10, colors: ['Silver', 'Black', 'Navy'], sizes: ['S', 'M', 'L'], featured: true, trending: true, createdAt: '2025-12-01T10:00:00Z' },
  { id: 115, name: 'Passport Holder', category: 'Travel Accessories', subCategory: 'Passport Holders', brand: 'Tumi', image: '/assets/placeholders/product.svg', price: 95, originalPrice: 95, rating: 4.5, totalReviews: 456, description: 'Leather passport holder with RFID-blocking technology. Multiple card slots and boarding pass pocket.', stock: 100, colors: ['Black', 'Brown', 'Navy'], sizes: ['S'], featured: false, trending: false, createdAt: '2025-11-10T10:00:00Z' },
  { id: 116, name: 'Travel Wallet', category: 'Travel Accessories', subCategory: 'Passport Holders', brand: "Bric's", image: '/assets/placeholders/product.svg', price: 145, originalPrice: 145, rating: 4.6, totalReviews: 312, description: 'RFID-blocking travel wallet with removable passport case. Multiple compartments for currency and cards.', stock: 65, colors: ['Brown', 'Black', 'Navy'], sizes: ['M'], featured: false, trending: false, createdAt: '2025-10-15T10:00:00Z' },
  { id: 117, name: 'Travel Neck Pillow', category: 'Travel Accessories', subCategory: 'Travel Pillows', brand: 'Tempur-Pedic', image: '/assets/placeholders/product.svg', price: 69, originalPrice: 69, rating: 4.4, totalReviews: 2345, description: 'Memory foam travel pillow with washable velour cover. Ergonomic design with snap closure.', stock: 150, colors: ['Gray', 'Navy', 'Black'], sizes: ['M'], featured: false, trending: false, createdAt: '2025-12-08T10:00:00Z' },
  { id: 118, name: 'Eye Mask & Earplug Set', category: 'Travel Accessories', subCategory: 'Travel Pillows', brand: 'Muji', image: '/assets/placeholders/product.svg', price: 28, originalPrice: 28, rating: 4.3, totalReviews: 1678, description: 'Silk sleep mask with adjustable strap and wax earplugs. Light-blocking design for restful travel.', stock: 200, colors: ['Black', 'Gray', 'Pink'], sizes: ['S'], featured: false, trending: false, createdAt: '2025-11-05T10:00:00Z' },
  { id: 119, name: 'Packing Cubes Set', category: 'Travel Accessories', subCategory: 'Travel Organizers', brand: 'Eagle Creek', image: '/assets/placeholders/product.svg', price: 55, originalPrice: 65, discountPercentage: 15, rating: 4.5, totalReviews: 3456, description: 'Set of 5 compression packing cubes in different sizes. Lightweight ripstop nylon with mesh panels.', stock: 180, colors: ['Navy', 'Green', 'Gray'], sizes: ['S', 'M', 'L'], featured: false, trending: false, createdAt: '2025-10-20T10:00:00Z' },
  { id: 120, name: 'Weekender Bag', category: 'Travel Accessories', subCategory: 'Luggage', brand: 'Filson', image: '/assets/placeholders/product.svg', price: 495, originalPrice: 495, rating: 4.7, totalReviews: 189, description: 'Rugged twill weekender bag with bridle leather handles. Water-repellent finish with brass zipper.', stock: 25, colors: ['Brown', 'Navy', 'Green'], sizes: ['M', 'L'], featured: false, trending: true, createdAt: '2026-01-05T10:00:00Z' },
  { id: 121, name: 'Toiletry Bag', category: 'Travel Accessories', subCategory: 'Travel Organizers', brand: 'Dover', image: '/assets/placeholders/product.svg', price: 78, originalPrice: 78, rating: 4.4, totalReviews: 567, description: 'Waterproof toiletry bag with hanging hook. Multiple compartments with TSA-compliant clear pocket.', stock: 120, colors: ['Black', 'Navy', 'Gray'], sizes: ['S', 'M'], featured: false, trending: false, createdAt: '2025-12-12T10:00:00Z' },
  { id: 122, name: 'Cashmere Scarf', category: 'Men', subCategory: 'Accessories', brand: 'Burberry', image: '/assets/placeholders/product.svg', price: 420, originalPrice: 420, rating: 4.8, totalReviews: 278, description: 'Classic cashmere scarf with signature check pattern. Fringed edges with oversized fit.', stock: 85, colors: ['Beige', 'Black', 'Navy', 'Red'], sizes: ['M', 'L'], featured: false, trending: true, createdAt: '2026-01-15T10:00:00Z' },
  { id: 123, name: 'Leather Messenger Bag', category: 'Men', subCategory: 'Accessories', brand: 'Coach', image: '/assets/placeholders/product.svg', price: 550, originalPrice: 550, rating: 4.6, totalReviews: 189, description: 'Genuine leather messenger bag with adjustable strap. Padded laptop compartment with zip closure.', stock: 30, colors: ['Black', 'Brown'], sizes: ['M', 'L'], featured: false, trending: false, createdAt: '2025-10-22T10:00:00Z' },
  { id: 124, name: 'Aviator Sunglasses', category: 'Men', subCategory: 'Accessories', brand: 'Ray-Ban', image: '/assets/placeholders/product.svg', price: 180, originalPrice: 180, rating: 4.7, totalReviews: 3456, description: 'Classic aviator sunglasses with gold-tone frame and green gradient lenses. UV protection.', stock: 150, colors: ['Gold', 'Silver', 'Black'], sizes: ['M', 'L'], featured: false, trending: false, createdAt: '2025-11-25T10:00:00Z' },
  { id: 125, name: 'Designer Silk Scarf', category: 'Women', subCategory: 'Tops', brand: 'Hermès', image: '/assets/placeholders/product.svg', price: 520, originalPrice: 520, rating: 4.9, totalReviews: 145, description: 'Twilly silk scarf in hand-rolled edges. Iconic wildlife print with vibrant colorway.', stock: 25, colors: ['Gold', 'Pink', 'Blue', 'Red'], sizes: ['S'], featured: false, trending: true, createdAt: '2025-12-28T10:00:00Z' },
  { id: 126, name: 'Cat Eye Sunglasses', category: 'Women', subCategory: 'Tops', brand: 'Prada', image: '/assets/placeholders/product.svg', price: 320, originalPrice: 380, discountPercentage: 15, rating: 4.6, totalReviews: 198, description: 'Cat eye sunglasses with acetate frame and gradient lenses. Gold-tone metal temples with logo.', stock: 40, colors: ['Black', 'Gold', 'Pink'], sizes: ['M'], featured: false, trending: false, createdAt: '2025-11-08T10:00:00Z' },
];

const ordersData = [
  { orderId: 'ORD-001', userId: null, items: [{ productId: null, name: 'Classic Leather Sneakers', image: '/assets/placeholders/product.svg', price: 890, quantity: 1, size: 'M', color: 'White' }, { productId: null, name: 'Italian Leather Belt', image: '/assets/placeholders/product.svg', price: 450, quantity: 2, size: 'M', color: 'Black' }], totalAmount: 1790, status: 'Delivered', shippingAddress: { firstName: 'James', lastName: 'Whitfield', street: '45 Park Lane', city: 'London', state: 'Greater London', zip: 'W1K 1PN', country: 'UK', phone: '' }, paymentMethod: 'Credit Card', createdAt: '2025-11-20T14:30:00Z', updatedAt: '2025-11-28T10:00:00Z' },
  { orderId: 'ORD-002', userId: null, items: [{ productId: null, name: 'Leather Crossbody Bag', image: '/assets/placeholders/product.svg', price: 4800, quantity: 1, size: 'M', color: 'Black' }], totalAmount: 4800, status: 'Shipped', shippingAddress: { firstName: 'Sophia', lastName: 'Laurent', street: '15 Avenue Montaigne', city: 'Paris', state: 'Île-de-France', zip: '75008', country: 'France', phone: '' }, paymentMethod: 'PayPal', createdAt: '2025-12-01T09:15:00Z', updatedAt: '2025-12-03T16:00:00Z' },
  { orderId: 'ORD-003', userId: null, items: [{ productId: null, name: 'Running Performance Shoes', image: '/assets/placeholders/product.svg', price: 240, quantity: 1, size: 'L', color: 'Black' }, { productId: null, name: 'Water Bottle', image: '/assets/placeholders/product.svg', price: 45, quantity: 2, size: 'M', color: 'Green' }], totalAmount: 330, status: 'Delivered', shippingAddress: { firstName: 'Benjamin', lastName: 'Hart', street: '890 Madison Avenue', city: 'New York', state: 'NY', zip: '10021', country: 'USA', phone: '' }, paymentMethod: 'Credit Card', createdAt: '2025-12-05T11:00:00Z', updatedAt: '2025-12-10T14:00:00Z' },
  { orderId: 'ORD-004', userId: null, items: [{ productId: null, name: 'Automatic Diver Watch', image: '/assets/placeholders/product.svg', price: 8500, quantity: 1, size: 'M', color: 'Black' }], totalAmount: 8500, status: 'Processing', shippingAddress: { firstName: 'Isabella', lastName: 'Rossi', street: 'Via Monte Napoleone 8', city: 'Milan', state: 'Lombardy', zip: '20121', country: 'Italy', phone: '' }, paymentMethod: 'Bank Transfer', createdAt: '2025-12-08T15:45:00Z', updatedAt: '2025-12-09T10:00:00Z' },
  { orderId: 'ORD-005', userId: null, items: [{ productId: null, name: 'Designer Hoodie', image: '/assets/placeholders/product.svg', price: 520, quantity: 1, size: 'L', color: 'Black' }, { productId: null, name: 'Wireless Noise-Cancelling Headphones', image: '/assets/placeholders/product.svg', price: 349, quantity: 1, size: 'M', color: 'Black' }], totalAmount: 869, status: 'Pending', shippingAddress: { firstName: 'Oliver', lastName: 'Chen', street: '10 Orchard Road', city: 'Singapore', state: 'Singapore', zip: '238801', country: 'Singapore', phone: '' }, paymentMethod: 'Credit Card', createdAt: '2025-12-12T08:30:00Z', updatedAt: '2025-12-12T08:30:00Z' },
  { orderId: 'ORD-006', userId: null, items: [{ productId: null, name: 'Bleu de Chanel EDP', image: '/assets/placeholders/product.svg', price: 145, quantity: 2, size: 'M', color: '' }, { productId: null, name: 'Aventus Cologne', image: '/assets/placeholders/product.svg', price: 435, quantity: 1, size: 'L', color: '' }], totalAmount: 725, status: 'Cancelled', shippingAddress: { firstName: 'Charlotte', lastName: 'Dubois', street: 'Kurfürstendamm 34', city: 'Berlin', state: 'Berlin', zip: '10719', country: 'Germany', phone: '' }, paymentMethod: 'PayPal', createdAt: '2025-12-15T12:00:00Z', updatedAt: '2025-12-16T09:00:00Z' },
  { orderId: 'ORD-007', userId: null, items: [{ productId: null, name: 'Vitamin C Serum', image: '/assets/placeholders/product.svg', price: 182, quantity: 1, size: 'M', color: '' }, { productId: null, name: 'Hyaluronic Acid Moisturizer', image: '/assets/placeholders/product.svg', price: 165, quantity: 1, size: 'M', color: '' }], totalAmount: 347, status: 'Delivered', shippingAddress: { firstName: 'Amara', lastName: 'Okafor', street: '12 Sandton Drive', city: 'Johannesburg', state: 'Gauteng', zip: '2196', country: 'South Africa', phone: '' }, paymentMethod: 'Credit Card', createdAt: '2025-12-10T10:30:00Z', updatedAt: '2025-12-18T15:00:00Z' },
  { orderId: 'ORD-008', userId: null, items: [{ productId: null, name: 'Diamond Engagement Ring', image: '/assets/placeholders/product.svg', price: 12500, quantity: 1, size: 'M', color: 'Gold' }], totalAmount: 12500, status: 'Shipped', shippingAddress: { firstName: 'Lucas', lastName: 'Weber', street: 'Bahnhofstrasse 20', city: 'Zurich', state: 'Zurich', zip: '8001', country: 'Switzerland', phone: '' }, paymentMethod: 'Bank Transfer', createdAt: '2025-12-14T16:20:00Z', updatedAt: '2025-12-16T11:00:00Z' },
  { orderId: 'ORD-009', userId: null, items: [{ productId: null, name: 'Smartphone Pro Max', image: '/assets/placeholders/product.svg', price: 1199, quantity: 1, size: 'M', color: 'Black' }, { productId: null, name: 'Wireless Earbuds', image: '/assets/placeholders/product.svg', price: 249, quantity: 1, size: 'M', color: 'White' }], totalAmount: 1448, status: 'Processing', shippingAddress: { firstName: 'Emily', lastName: 'Park', street: '123 Gangnam-daero', city: 'Seoul', state: 'Gangnam-gu', zip: '06100', country: 'South Korea', phone: '' }, paymentMethod: 'Credit Card', createdAt: '2025-12-18T13:00:00Z', updatedAt: '2025-12-19T09:00:00Z' },
  { orderId: 'ORD-010', userId: null, items: [{ productId: null, name: 'Luggage Set', image: '/assets/placeholders/product.svg', price: 2450, quantity: 1, size: 'L', color: 'Silver' }], totalAmount: 2450, status: 'Pending', shippingAddress: { firstName: 'James', lastName: 'Whitfield', street: '45 Park Lane', city: 'London', state: 'Greater London', zip: 'W1K 1PN', country: 'UK', phone: '' }, paymentMethod: 'PayPal', createdAt: '2025-12-20T10:00:00Z', updatedAt: '2025-12-20T10:00:00Z' },
  { orderId: 'ORD-011', userId: null, items: [{ productId: null, name: 'Silk Evening Gown', image: '/assets/placeholders/product.svg', price: 3200, quantity: 1, size: 'S', color: 'Gold' }, { productId: null, name: 'Pearl Drop Earrings', image: '/assets/placeholders/product.svg', price: 2200, quantity: 1, size: 'M', color: 'Gold' }], totalAmount: 5400, status: 'Delivered', shippingAddress: { firstName: 'Sophia', lastName: 'Laurent', street: '15 Avenue Montaigne', city: 'Paris', state: 'Île-de-France', zip: '75008', country: 'France', phone: '' }, paymentMethod: 'Credit Card', createdAt: '2025-11-28T14:00:00Z', updatedAt: '2025-12-05T16:00:00Z' },
  { orderId: 'ORD-012', userId: null, items: [{ productId: null, name: 'Tailored Wool Suit', image: '/assets/placeholders/product.svg', price: 1290, quantity: 1, size: 'M', color: 'Navy' }, { productId: null, name: 'Leather Loafers', image: '/assets/placeholders/product.svg', price: 750, quantity: 1, size: 'M', color: 'Brown' }], totalAmount: 2040, status: 'Shipped', shippingAddress: { firstName: 'Benjamin', lastName: 'Hart', street: '890 Madison Avenue', city: 'New York', state: 'NY', zip: '10021', country: 'USA', phone: '' }, paymentMethod: 'Credit Card', createdAt: '2025-12-22T11:30:00Z', updatedAt: '2025-12-23T14:00:00Z' },
  { orderId: 'ORD-013', userId: null, items: [{ productId: null, name: 'Eyeshadow Palette', image: '/assets/placeholders/product.svg', price: 128, quantity: 2, size: 'S', color: 'Gold' }, { productId: null, name: 'Matte Lipstick Collection', image: '/assets/placeholders/product.svg', price: 72, quantity: 3, size: 'S', color: 'Red' }], totalAmount: 472, status: 'Pending', shippingAddress: { firstName: 'Isabella', lastName: 'Rossi', street: 'Via Monte Napoleone 8', city: 'Milan', state: 'Lombardy', zip: '20121', country: 'Italy', phone: '' }, paymentMethod: 'PayPal', createdAt: '2025-12-24T09:45:00Z', updatedAt: '2025-12-24T09:45:00Z' },
  { orderId: 'ORD-014', userId: null, items: [{ productId: null, name: 'Neverfull Tote Bag', image: '/assets/placeholders/product.svg', price: 1560, quantity: 1, size: 'M', color: 'Brown' }], totalAmount: 1560, status: 'Cancelled', shippingAddress: { firstName: 'Oliver', lastName: 'Chen', street: '10 Orchard Road', city: 'Singapore', state: 'Singapore', zip: '238801', country: 'Singapore', phone: '' }, paymentMethod: 'Bank Transfer', createdAt: '2025-12-15T15:00:00Z', updatedAt: '2025-12-17T10:00:00Z' },
  { orderId: 'ORD-015', userId: null, items: [{ productId: null, name: 'Luxury Skincare Set', image: '/assets/placeholders/product.svg', price: 520, quantity: 1, size: 'M', color: '' }, { productId: null, name: 'Rose Gold Beauty Set', image: '/assets/placeholders/product.svg', price: 235, quantity: 1, size: 'M', color: 'Gold' }], totalAmount: 755, status: 'Delivered', shippingAddress: { firstName: 'Amara', lastName: 'Okafor', street: '12 Sandton Drive', city: 'Johannesburg', state: 'Gauteng', zip: '2196', country: 'South Africa', phone: '' }, paymentMethod: 'Credit Card', createdAt: '2025-12-02T10:15:00Z', updatedAt: '2025-12-09T12:00:00Z' },
  { orderId: 'ORD-016', userId: null, items: [{ productId: null, name: 'Leather Ankle Boots', image: '/assets/placeholders/product.svg', price: 1100, quantity: 1, size: 'M', color: 'Black' }], totalAmount: 1100, status: 'Shipped', shippingAddress: { firstName: 'Charlotte', lastName: 'Dubois', street: 'Kurfürstendamm 34', city: 'Berlin', state: 'Berlin', zip: '10719', country: 'Germany', phone: '' }, paymentMethod: 'PayPal', createdAt: '2025-12-28T12:30:00Z', updatedAt: '2025-12-30T09:00:00Z' },
  { orderId: 'ORD-017', userId: null, items: [{ productId: null, name: 'Leather Bomber Jacket', image: '/assets/placeholders/product.svg', price: 2450, quantity: 1, size: 'L', color: 'Black' }], totalAmount: 2450, status: 'Processing', shippingAddress: { firstName: 'Lucas', lastName: 'Weber', street: 'Bahnhofstrasse 20', city: 'Zurich', state: 'Zurich', zip: '8001', country: 'Switzerland', phone: '' }, paymentMethod: 'Credit Card', createdAt: '2025-12-30T15:00:00Z', updatedAt: '2025-12-31T10:00:00Z' },
];

const notificationsData = [
  { userId: null, type: 'order_confirmation', title: 'Order Confirmed', message: 'Your order ORD-001 has been confirmed and is being processed.', read: true, createdAt: '2025-11-20T14:35:00Z' },
  { userId: null, type: 'shipping_update', title: 'Order Shipped', message: 'Your order ORD-001 has been shipped and is on its way.', read: true, createdAt: '2025-11-22T10:00:00Z' },
  { userId: null, type: 'delivery_confirmation', title: 'Order Delivered', message: 'Your order ORD-001 has been delivered successfully. Enjoy your purchase!', read: true, createdAt: '2025-11-28T10:00:00Z' },
  { userId: null, type: 'order_confirmation', title: 'Order Confirmed', message: 'Your order ORD-002 has been confirmed and is being processed.', read: true, createdAt: '2025-12-01T09:20:00Z' },
  { userId: null, type: 'shipping_update', title: 'Order Shipped', message: 'Your order ORD-002 has been shipped and is on its way to Paris.', read: false, createdAt: '2025-12-03T16:00:00Z' },
  { userId: null, type: 'order_confirmation', title: 'Order Confirmed', message: 'Your order ORD-003 has been confirmed.', read: true, createdAt: '2025-12-05T11:05:00Z' },
  { userId: null, type: 'delivery_confirmation', title: 'Order Delivered', message: 'Your order ORD-003 has been delivered. Thank you for shopping with AddexStores!', read: true, createdAt: '2025-12-10T14:00:00Z' },
  { userId: null, type: 'order_confirmation', title: 'Order Confirmed', message: 'Your order ORD-004 for the Automatic Diver Watch has been confirmed.', read: true, createdAt: '2025-12-08T15:50:00Z' },
  { userId: null, type: 'processing_update', title: 'Order Processing', message: 'Your order ORD-004 is now being processed by our team.', read: false, createdAt: '2025-12-09T10:00:00Z' },
  { userId: null, type: 'order_confirmation', title: 'Order Placed', message: "Your order ORD-005 has been placed successfully. We're awaiting payment confirmation.", read: true, createdAt: '2025-12-12T08:35:00Z' },
  { userId: null, type: 'order_confirmation', title: 'Order Confirmed', message: 'Your order ORD-006 has been confirmed.', read: true, createdAt: '2025-12-15T12:05:00Z' },
  { userId: null, type: 'cancellation', title: 'Order Cancelled', message: 'Your order ORD-006 has been cancelled as requested.', read: true, createdAt: '2025-12-16T09:00:00Z' },
  { userId: null, type: 'order_confirmation', title: 'Order Confirmed', message: 'Your order ORD-007 for skincare products has been confirmed.', read: true, createdAt: '2025-12-10T10:35:00Z' },
  { userId: null, type: 'delivery_confirmation', title: 'Order Delivered', message: 'Your order ORD-007 has been delivered. Enjoy your skincare essentials!', read: true, createdAt: '2025-12-18T15:00:00Z' },
  { userId: null, type: 'promotion', title: 'Winter Sale is Here!', message: 'Enjoy up to 40% off on selected luxury items. Use code ADX40 at checkout.', read: false, createdAt: '2025-12-20T08:00:00Z' },
  { userId: null, type: 'promotion', title: 'New Arrivals Alert', message: 'Discover our latest collection of luxury watches and accessories.', read: false, createdAt: '2025-12-22T10:00:00Z' },
  { userId: null, type: 'promotion', title: 'Complimentary Gift Wrapping', message: 'All orders placed this week include complimentary luxury gift wrapping.', read: false, createdAt: '2025-12-23T09:00:00Z' },
  { userId: null, type: 'review_request', title: 'Share Your Experience', message: 'How was your shopping experience? Leave a review and earn reward points.', read: true, createdAt: '2025-12-14T11:00:00Z' },
  { userId: null, type: 'order_confirmation', title: 'Order Confirmed', message: 'Your order ORD-008 for the Diamond Engagement Ring has been confirmed.', read: true, createdAt: '2025-12-14T16:25:00Z' },
  { userId: null, type: 'shipping_update', title: 'Order Shipped', message: 'Your precious order ORD-008 has been shipped with insured delivery.', read: false, createdAt: '2025-12-16T11:00:00Z' },
  { userId: null, type: 'order_confirmation', title: 'Order Confirmed', message: 'Your order ORD-009 for electronics has been confirmed.', read: true, createdAt: '2025-12-18T13:05:00Z' },
  { userId: null, type: 'processing_update', title: 'Order Processing', message: 'Your order ORD-009 is now being prepared for shipping.', read: false, createdAt: '2025-12-19T09:00:00Z' },
  { userId: null, type: 'system', title: 'Low Stock Alert', message: 'The product "Automatic Diver Watch" (ID: 41) is running low on stock. Only 3 units remaining.', read: false, createdAt: '2025-12-25T08:00:00Z' },
  { userId: null, type: 'system', title: 'New User Registered', message: 'A new user, Emily Park, has registered on the platform.', read: true, createdAt: '2025-12-01T10:00:00Z' },
  { userId: null, type: 'promotion', title: 'VIP Early Access', message: 'As a valued AddexStores customer, enjoy early access to our upcoming designer collection.', read: false, createdAt: '2025-12-26T12:00:00Z' },
];

const bannersData = [
  { title: 'Luxury Redefined', subtitle: 'Discover the finest collections from world-renowned designers', cta: 'Explore Collection', ctaLink: '/products', bgColor: '#1A1A1A', image: '/assets/placeholders/banner1.svg', active: true, order: 0 },
  { title: 'Summer Collection 2026', subtitle: 'Express yourself with our latest arrivals', cta: 'Shop Now', ctaLink: '/products?category=Fashion', bgColor: '#F5F2ED', image: '/assets/placeholders/banner2.svg', active: true, order: 1 },
  { title: 'Timeless Elegance', subtitle: 'Curated watches and jewelry for the discerning', cta: 'Discover More', ctaLink: '/products?category=Watches', bgColor: '#C6A972', image: '/assets/placeholders/banner3.svg', active: true, order: 2 },
  { title: 'Up to 40% Off', subtitle: 'Season-end sale on luxury fashion and accessories', cta: 'Shop Sale', ctaLink: '/products?sale=true', bgColor: '#2D1810', image: '/assets/placeholders/banner4.svg', active: false, order: 3 },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      Category.deleteMany({}),
      Order.deleteMany({}),
      Notification.deleteMany({}),
      Banner.deleteMany({}),
      Settings.deleteMany({}),
    ]);
    console.log('Cleared existing data');

    const users = await User.create(
      usersData.map(u => ({
        name: u.name,
        email: u.email,
        password: u.password,
        avatar: u.avatar,
        role: u.role,
        phone: u.phone,
        address: u.address,
        isBlocked: u.isBlocked,
        createdAt: u.joinDate,
      }))
    );
    console.log(`Seeded ${users.length} users`);

    const userMap = {};
    users.forEach(u => {
      const match = usersData.find(ud => ud.email === u.email);
      if (match) userMap[match.id] = u._id;
    });

    const allProducts = [...productsData, ...remainingProducts, ...moreProducts];
    const products = await Product.create(
      allProducts.map(p => ({
        name: p.name,
        category: p.category,
        subCategory: p.subCategory,
        brand: p.brand,
        image: p.image,
        price: p.price,
        originalPrice: p.originalPrice || p.price,
        discountPercentage: p.discountPercentage || null,
        rating: p.rating,
        totalReviews: p.totalReviews,
        description: p.description,
        stock: p.stock,
        colors: p.colors || [],
        sizes: p.sizes || [],
        featured: p.featured || false,
        trending: p.trending || false,
        createdAt: p.createdAt,
      }))
    );
    console.log(`Seeded ${products.length} products`);

    const productMap = {};
    allProducts.forEach((p, i) => {
      productMap[p.id] = products[i]._id;
    });

    const categories = await Category.create(categoriesData);
    console.log(`Seeded ${categories.length} categories`);

    const orders = await Order.create(
      ordersData.map(o => ({
        orderId: o.orderId,
        userId: userMap[Object.keys(userMap).find(k => {
          const u = usersData.find(ud => ud.id === Number(k));
          return u && u.name.includes(o.shippingAddress.firstName);
        })] || users[2]._id,
        items: o.items.map(item => ({
          ...item,
          productId: productMap[allProducts.findIndex(p => p.name === item.name)] || products[0]._id,
        })),
        totalAmount: o.totalAmount,
        status: o.status,
        shippingAddress: o.shippingAddress,
        paymentMethod: o.paymentMethod,
        createdAt: o.createdAt,
        updatedAt: o.updatedAt,
      }))
    );
    console.log(`Seeded ${orders.length} orders`);

    const notifications = await Notification.create(
      notificationsData.map(n => ({
        userId: n.type === 'system' || n.type === 'promotion'
          ? users.find(u => u.role === 'admin')._id
          : users[Math.floor(Math.random() * users.length)]._id,
        type: n.type,
        title: n.title,
        message: n.message,
        read: n.read,
        createdAt: n.createdAt,
      }))
    );
    console.log(`Seeded ${notifications.length} notifications`);

    const banners = await Banner.create(bannersData);
    console.log(`Seeded ${banners.length} banners`);

    await Settings.create({});
    console.log('Seeded default settings');

    console.log('\nSeed completed successfully!');
    console.log('Admin login: alex.mitchell@example.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
