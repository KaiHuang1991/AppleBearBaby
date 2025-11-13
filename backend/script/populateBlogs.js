import mongoose from 'mongoose';
import 'dotenv/config';
import blogModel from '../models/blogModel.js';

const sampleBlogs = [
  {
    title: "Essential Baby Nursing Tips for New Parents",
    content: "Nursing your baby is one of the most important aspects of early parenthood. Whether you choose breastfeeding or bottle-feeding, understanding the fundamentals can make this journey smoother. Find a comfortable position, ensure proper latch, feed on demand, and stay hydrated. Look for signs like 6-8 wet diapers per day, regular weight gain, and content behavior after feeding.",
    category: "baby-nursing",
    author: "Dr. Sarah Johnson",
    excerpt: "Comprehensive guide to baby nursing for new parents, covering breastfeeding and bottle-feeding essentials.",
    tags: ["nursing", "breastfeeding", "bottle-feeding", "new-parents"],
    readTime: 8,
    image: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800"
  },
  {
    title: "Complete Guide to Baby Feeding: From Birth to 12 Months",
    content: "Understanding your baby's feeding development helps ensure they get the nutrition they need at each stage. During the first six months, your baby should receive only breast milk or formula. Around 6 months, start introducing solid foods like single-grain cereals, pureed fruits and vegetables. As your baby grows, expand their diet with soft, mashed foods and finger foods.",
    category: "baby-feeding",
    author: "Dr. Michael Chen",
    excerpt: "A comprehensive timeline of baby feeding from birth through the first year, including milestones and safety tips.",
    tags: ["feeding", "solids", "nutrition", "milestones"],
    readTime: 10,
    image: "https://images.unsplash.com/photo-1544126592-807ade215a0b?w=800"
  },
  {
    title: "Must-Have Baby Products: A Complete Shopping Guide",
    content: "Preparing for a new baby can be overwhelming with so many products available. Essential items include a safe crib or bassinet, firm mattress, sleep sacks, nursing pillow, bottles, diapers, wipes, baby bathtub, gentle soap, car seat, baby monitor, and appropriate clothing like onesies and sleepers. Always prioritize safety and choose products that meet current safety standards.",
    category: "baby-products",
    author: "Emma Rodriguez",
    excerpt: "A comprehensive guide to essential baby products that new parents actually need, organized by category.",
    tags: ["baby-products", "shopping-guide", "essentials", "new-parents"],
    readTime: 12,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800"
  },
  {
    title: "Breastfeeding Positions: Finding What Works for You",
    content: "Every mother and baby pair is unique, and finding the right breastfeeding position can make all the difference. The cradle hold is most common for older babies, cross-cradle is great for newborns, football hold is ideal for large breasts or C-section recovery, and side-lying is perfect for night feedings. Use pillows for support and don't be afraid to ask for help.",
    category: "baby-nursing",
    author: "Dr. Lisa Thompson",
    excerpt: "Learn about different breastfeeding positions and how to find the one that works best for you and your baby.",
    tags: ["breastfeeding", "positions", "latch", "comfort"],
    readTime: 7,
    image: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800"
  },
  {
    title: "Introducing Solid Foods: A Step-by-Step Guide",
    content: "Introducing solid foods is an exciting milestone. Look for signs of readiness around 6 months: holding head up, sitting with support, showing interest in food, opening mouth when food approaches. Start with iron-fortified cereal, sweet potato, avocado, banana, and butternut squash. Introduce one new food at a time and wait 3-5 days between new foods.",
    category: "baby-feeding",
    author: "Dr. Amanda Wilson",
    excerpt: "A comprehensive guide to introducing solid foods to your baby, including signs of readiness and step-by-step instructions.",
    tags: ["solid-foods", "weaning", "nutrition", "allergies"],
    readTime: 9,
    image: "https://images.unsplash.com/photo-1544126592-807ade215a0b?w=800"
  },
  {
    title: "Baby Product Safety: What Every Parent Should Know",
    content: "When it comes to baby products, safety should always be the top priority. Follow safe sleep guidelines: place baby on back, use firm surface, keep area free of soft objects. Choose appropriate car seats and install correctly. Stay informed about product recalls and safety standards. Be aware of common hazards like choking, strangulation, falls, burns, and poisoning.",
    category: "baby-products",
    author: "Safety Expert Mark Davis",
    excerpt: "Essential safety information for baby products, including sleep safety, car seats, and common hazards to avoid.",
    tags: ["safety", "baby-proofing", "car-seats", "sleep-safety"],
    readTime: 11,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800"
  }
];

const populateBlogs = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    await blogModel.deleteMany({});
    console.log('Cleared existing blogs');
    
    const result = await blogModel.insertMany(sampleBlogs);
    console.log(`Successfully inserted ${result.length} blogs`);
    
    console.log('Blog population completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error populating blogs:', error);
    process.exit(1);
  }
};

populateBlogs(); 