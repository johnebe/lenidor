import { db } from '../src/lib/db'
import imagesData from '../seed-images.json'

const images: Record<string, string> = imagesData as Record<string, string>

interface SeedProduct {
  key: string
  name: string
  description: string
  price: number
  compareAtPrice?: number
  brand: string
  category: string
  stock: number
  rating: number
  reviewCount: number
  featured?: boolean
  tags: string[]
}

const categories = [
  { name: 'Electronics', slug: 'electronics', icon: 'Cpu' },
  { name: 'Home & Kitchen', slug: 'home-kitchen', icon: 'Home' },
  { name: 'Fashion', slug: 'fashion', icon: 'Shirt' },
  { name: 'Sports & Outdoors', slug: 'sports-outdoors', icon: 'Dumbbell' },
  { name: 'Books', slug: 'books', icon: 'BookOpen' },
]

const products: SeedProduct[] = [
  // Electronics
  {
    key: 'wireless-headphones',
    name: 'AuraSound Pro Wireless Over-Ear Headphones',
    description:
      'Immerse yourself in studio-grade sound with the AuraSound Pro. Featuring 40mm dynamic drivers, active noise cancellation, and a 40-hour battery life, these over-ear headphones deliver crystal-clear highs and deep, resonant bass. Memory-foam ear cushions provide all-day comfort, while Bluetooth 5.3 ensures a rock-solid connection up to 50ft.',
    price: 199.99,
    compareAtPrice: 279.99,
    brand: 'AuraSound',
    category: 'electronics',
    stock: 48,
    rating: 4.7,
    reviewCount: 2841,
    featured: true,
    tags: ['Best Seller', 'Noise Cancelling'],
  },
  {
    key: 'noise-cancelling-earbuds',
    name: 'AuraSound AirBuds 3 True Wireless Earbuds',
    description:
      'Pocket-sized power. The AirBuds 3 pack hybrid active noise cancellation, transparent mode, and personalized EQ into a featherlight case. Enjoy 8 hours per charge and 32 total hours with the case. IPX5 water resistance makes them perfect for workouts and commutes alike.',
    price: 129.0,
    compareAtPrice: 159.0,
    brand: 'AuraSound',
    category: 'electronics',
    stock: 120,
    rating: 4.5,
    reviewCount: 1530,
    featured: true,
    tags: ['New', 'Water Resistant'],
  },
  {
    key: 'smartwatch',
    name: 'PulseFit Series 7 Smartwatch',
    description:
      'Track every heartbeat, step, and sleep cycle with the PulseFit Series 7. A vivid 1.9" AMOLED display, built-in GPS, SpO2 monitoring, and 100+ sport modes keep you informed and motivated. Receive calls, texts, and app notifications right on your wrist. Up to 14-day battery life on a single charge.',
    price: 249.99,
    compareAtPrice: 329.99,
    brand: 'PulseFit',
    category: 'electronics',
    stock: 67,
    rating: 4.6,
    reviewCount: 980,
    featured: true,
    tags: ['Best Seller', 'GPS'],
  },
  {
    key: 'bluetooth-speaker',
    name: 'SoundWave Boom Portable Bluetooth Speaker',
    description:
      'Bring the party anywhere. The SoundWave Boom delivers 360° room-filling sound with thundering bass from its passive radiator. IP67 waterproof and dustproof, it floats and survives poolside splashes. Pair two speakers for true stereo, and enjoy 24 hours of playback per charge.',
    price: 89.99,
    compareAtPrice: 119.99,
    brand: 'SoundWave',
    category: 'electronics',
    stock: 95,
    rating: 4.4,
    reviewCount: 2120,
    tags: ['Waterproof'],
  },
  {
    key: 'mechanical-keyboard',
    name: 'KeyForge T87 RGB Mechanical Gaming Keyboard',
    description:
      'Tactile, responsive, and built to last. The KeyForge T87 features hot-swappable red switches, doubleshot PBT keycaps, and per-key RGB lighting with 19 effects. A full aluminum frame provides a satisfying, stable typing feel. USB-C connectivity and a detachable cable make it travel-ready.',
    price: 109.99,
    compareAtPrice: 139.99,
    brand: 'KeyForge',
    category: 'electronics',
    stock: 54,
    rating: 4.8,
    reviewCount: 743,
    featured: true,
    tags: ['RGB', 'Hot-Swappable'],
  },
  {
    key: '4k-camera',
    name: 'OptiVue M50 Mirrorless 4K Camera',
    description:
      'Capture life in breathtaking detail. The OptiVue M50 sports a 24.1MP APS-C sensor, 4K30 video, and a vari-angle touchscreen. Dual-pixel autofocus locks onto moving subjects instantly. Built-in Wi-Fi lets you share instantly. Includes a versatile 15-45mm kit lens.',
    price: 749.0,
    compareAtPrice: 899.0,
    brand: 'OptiVue',
    category: 'electronics',
    stock: 22,
    rating: 4.6,
    reviewCount: 412,
    tags: ['4K Video'],
  },
  {
    key: 'laptop-stand',
    name: 'ElevateAlum Adjustable Laptop Stand',
    description:
      'Ergonomic, sturdy, and beautifully machined. The ElevateAlum stand raises your laptop to eye level with six height adjustments, reducing neck and back strain. Aircraft-grade aluminum supports up to 17" laptops and dissipates heat efficiently. Folds flat for easy storage.',
    price: 39.99,
    compareAtPrice: 54.99,
    brand: 'ElevateAlum',
    category: 'electronics',
    stock: 210,
    rating: 4.5,
    reviewCount: 3210,
    tags: ['Ergonomic'],
  },
  {
    key: 'usb-c-hub',
    name: 'PortMaster 9-in-1 USB-C Hub',
    description:
      'Turn one USB-C port into a full workstation. The PortMaster hub adds dual 4K HDMI, Gigabit Ethernet, 100W PD passthrough, SD/microSD readers, and three USB 3.0 ports. Sleek aluminum housing matches your laptop and stays cool under load.',
    price: 59.99,
    compareAtPrice: 79.99,
    brand: 'PortMaster',
    category: 'electronics',
    stock: 180,
    rating: 4.4,
    reviewCount: 1890,
    tags: ['Dual 4K'],
  },
  // Home & Kitchen
  {
    key: 'coffee-maker',
    name: 'BrewCraft Deluxe 12-Cup Coffee Maker',
    description:
      'Start every morning right. The BrewCraft Deluxe brews a full 12 cups of rich, aromatic coffee in minutes. A programmable timer, pause-and-serve function, and auto-shutoff make mornings effortless. The reusable gold-tone filter means no paper filters ever again.',
    price: 79.99,
    compareAtPrice: 99.99,
    brand: 'BrewCraft',
    category: 'home-kitchen',
    stock: 73,
    rating: 4.5,
    reviewCount: 1560,
    featured: true,
    tags: ['Programmable'],
  },
  {
    key: 'blender',
    name: 'PureMix Pro 1500W High-Speed Blender',
    description:
      'Crush ice, blend smoothies, and mill nuts with a 1500W motor and aircraft-grade stainless steel blades. The 2L BPA-free pitcher handles family-size batches, while six preset programs take the guesswork out of perfect textures. Self-cleaning mode rinses in 30 seconds.',
    price: 119.99,
    compareAtPrice: 159.99,
    brand: 'PureMix',
    category: 'home-kitchen',
    stock: 64,
    rating: 4.6,
    reviewCount: 890,
    tags: ['1500W', 'Self-Cleaning'],
  },
  {
    key: 'air-fryer',
    name: 'CrispAir 6-Quart Digital Air Fryer',
    description:
      'Enjoy crispy, golden favorites with up to 85% less oil. The CrispAir 6-Quart fits a whole chicken or 2 lbs of fries. Eight one-touch presets, a touch screen, and a nonstick dishwasher-safe basket make healthy cooking effortless. Rapid air technology cooks food evenly and fast.',
    price: 99.99,
    compareAtPrice: 139.99,
    brand: 'CrispAir',
    category: 'home-kitchen',
    stock: 88,
    rating: 4.7,
    reviewCount: 4210,
    featured: true,
    tags: ['Best Seller', '8 Presets'],
  },
  {
    key: 'desk-lamp',
    name: 'LumenGlow LED Architect Desk Lamp',
    description:
      'Illuminate your workspace with adjustable brightness and color temperature. The LumenGlow lamp offers five color modes and ten brightness levels, a built-in USB charging port, and a 60-minute timer. The sleek aluminum arm folds compactly and rotates 180° for perfect positioning.',
    price: 44.99,
    compareAtPrice: 64.99,
    brand: 'LumenGlow',
    category: 'home-kitchen',
    stock: 150,
    rating: 4.5,
    reviewCount: 2670,
    tags: ['Eye-Care'],
  },
  {
    key: 'cookware-set',
    name: 'ChefPrime 10-Piece Stainless Steel Cookware Set',
    description:
      'Professional-grade cookware for the home chef. This 10-piece set features tri-ply construction for even heat distribution, tempered glass lids, and ergonomic stay-cool handles. Oven-safe to 500°F and compatible with all stovetops including induction. A lifetime of reliable cooking.',
    price: 189.99,
    compareAtPrice: 269.99,
    brand: 'ChefPrime',
    category: 'home-kitchen',
    stock: 41,
    rating: 4.6,
    reviewCount: 612,
    tags: ['Induction Ready'],
  },
  // Fashion
  {
    key: 'leather-jacket',
    name: 'Heritage Genuine Leather Biker Jacket',
    description:
      'Timeless style meets rugged quality. Crafted from genuine lambskin leather, this biker jacket features an asymmetrical zipper, quilted shoulders, and a soft polyester lining. The tailored fit ages beautifully, developing a unique patina over time. Available in classic black.',
    price: 229.99,
    compareAtPrice: 329.99,
    brand: 'Heritage',
    category: 'fashion',
    stock: 35,
    rating: 4.5,
    reviewCount: 478,
    featured: true,
    tags: ['Genuine Leather'],
  },
  {
    key: 'running-sneakers',
    name: 'StrideMax Pro Cushioned Running Shoes',
    description:
      'Run farther, recover faster. The StrideMax Pro pairs a responsive foam midsole with a breathable knit upper and a durable rubber outsole. A cushioned heel collar and reflective accents keep you comfortable and visible. Lightweight at just 9.2 oz per shoe.',
    price: 119.99,
    compareAtPrice: 149.99,
    brand: 'StrideMax',
    category: 'fashion',
    stock: 142,
    rating: 4.6,
    reviewCount: 3120,
    featured: true,
    tags: ['Best Seller', 'Breathable'],
  },
  {
    key: 'leather-backpack',
    name: 'Voyager Full-Grain Leather Backpack',
    description:
      'Carry it all in style. The Voyager backpack is handcrafted from full-grain leather with a padded 15.6" laptop sleeve, multiple organizer pockets, and a hidden anti-theft pocket. Solid brass hardware and YKK zippers ensure years of dependable use. Develops a rich patina over time.',
    price: 179.99,
    compareAtPrice: 239.99,
    brand: 'Voyager',
    category: 'fashion',
    stock: 58,
    rating: 4.7,
    reviewCount: 845,
    tags: ['Full-Grain Leather'],
  },
  {
    key: 'wrist-watch',
    name: 'Meridian Automatic Analog Wrist Watch',
    description:
      'A timepiece that never needs a battery. The Meridian Automatic features a self-winding movement visible through an exhibition case back, a sapphire crystal, and a 42mm stainless steel case. Water-resistant to 100m. The genuine leather strap adds a touch of refined elegance.',
    price: 199.99,
    compareAtPrice: 289.99,
    brand: 'Meridian',
    category: 'fashion',
    stock: 47,
    rating: 4.6,
    reviewCount: 390,
    tags: ['Automatic', 'Sapphire Crystal'],
  },
  {
    key: 'sunglasses',
    name: 'Solis Polarized Aviator Sunglasses',
    description:
      'See the world in vivid clarity. Solis aviators feature polarized, UV400-protected lenses that cut glare and reduce eye strain. The lightweight metal frame includes adjustable nose pads and spring hinges for all-day comfort. Includes a hard case and microfiber pouch.',
    price: 49.99,
    compareAtPrice: 79.99,
    brand: 'Solis',
    category: 'fashion',
    stock: 176,
    rating: 4.4,
    reviewCount: 1980,
    tags: ['Polarized', 'UV400'],
  },
  // Sports & Outdoors
  {
    key: 'yoga-mat',
    name: 'ZenGrip Premium Non-Slip Yoga Mat',
    description:
      'Find your flow with confidence. The ZenGrip mat uses a dual-layer, eco-friendly TPE construction that grips the floor and your hands, even when sweaty. 6mm of cushioning protects joints, and the included strap makes carrying easy. Free from PVC, latex, and toxic odors.',
    price: 34.99,
    compareAtPrice: 49.99,
    brand: 'ZenGrip',
    category: 'sports-outdoors',
    stock: 204,
    rating: 4.7,
    reviewCount: 5230,
    featured: true,
    tags: ['Eco-Friendly', 'Non-Slip'],
  },
  {
    key: 'dumbbells-set',
    name: 'IronCore Adjustable Dumbbells Set (5-52.5 lbs)',
    description:
      'A full rack in a single pair. IronCore adjustable dumbbells dial from 5 to 52.5 lbs per hand in 2.5-lb increments, replacing 15 sets of weights. The quick-select dial lets you change weight in seconds. A compact cradle saves floor space. Built to last with a steel construction.',
    price: 329.99,
    compareAtPrice: 429.99,
    brand: 'IronCore',
    category: 'sports-outdoors',
    stock: 29,
    rating: 4.6,
    reviewCount: 712,
    featured: true,
    tags: ['Space-Saving'],
  },
  {
    key: 'mountain-bike',
    name: 'TrailBlazer 29" Hardtail Mountain Bike',
    description:
      'Conquer any trail. The TrailBlazer 29er features a lightweight aluminum frame, a 21-speed Shimano drivetrain, and front suspension with lockout. Mechanical disc brakes deliver reliable stopping power in any condition. 29" wheels roll over obstacles with ease. Assembly tools included.',
    price: 549.99,
    compareAtPrice: 699.99,
    brand: 'TrailBlazer',
    category: 'sports-outdoors',
    stock: 18,
    rating: 4.5,
    reviewCount: 256,
    tags: ['29" Wheels'],
  },
  {
    key: 'water-bottle',
    name: 'HydraSteel Insulated Stainless Steel Water Bottle',
    description:
      'Cold for 24 hours, hot for 12. The HydraSteel 25oz bottle uses double-wall vacuum insulation and food-grade 18/8 stainless steel. The leak-proof lid with a carry loop is perfect for the gym, office, or trail. BPA-free and comes in 8 vibrant colors.',
    price: 24.99,
    compareAtPrice: 34.99,
    brand: 'HydraSteel',
    category: 'sports-outdoors',
    stock: 320,
    rating: 4.7,
    reviewCount: 8920,
    tags: ['Best Seller', 'Leak-Proof'],
  },
  // Books
  {
    key: 'programming-book',
    name: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    description:
      'Even bad code can function. But if code isn\'t clean, it can bring a development organization to its knees. In this timeless classic, Robert C. Martin reveals how to write code that reads well, adapts easily, and lasts for years. A must-read for every serious programmer.',
    price: 39.99,
    compareAtPrice: 54.99,
    brand: 'Prentice Hall',
    category: 'books',
    stock: 140,
    rating: 4.6,
    reviewCount: 6710,
    featured: true,
    tags: ['Best Seller'],
  },
  {
    key: 'cookbook',
    name: 'The Home Chef: 500 Recipes for Every Day',
    description:
      'From quick weeknight dinners to impressive weekend feasts, The Home Chef has you covered. This beautifully photographed cookbook features 500 tested recipes, meal-planning tips, and pantry essentials. Hardbound with a ribbon marker, it\'s a kitchen companion you\'ll reach for daily.',
    price: 29.99,
    compareAtPrice: 39.99,
    brand: 'Culinary Press',
    category: 'books',
    stock: 96,
    rating: 4.5,
    reviewCount: 1240,
    tags: ['Hardcover'],
  },
]

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

async function main() {
  console.log('Clearing existing data...')
  await db.orderItem.deleteMany()
  await db.order.deleteMany()
  await db.product.deleteMany()
  await db.category.deleteMany()

  console.log('Creating categories...')
  const catMap: Record<string, string> = {}
  for (const c of categories) {
    const created = await db.category.create({ data: { name: c.name, slug: c.slug, icon: c.icon } })
    catMap[c.slug] = created.id
  }

  console.log(`Creating ${products.length} products...`)
  for (const p of products) {
    const img = images[p.key]
    if (!img) {
      console.warn(`Missing image for ${p.key}, skipping`)
      continue
    }
    await db.product.create({
      data: {
        name: p.name,
        slug: slugify(p.name) + '-' + p.key,
        description: p.description,
        price: p.price,
        compareAtPrice: p.compareAtPrice ?? null,
        images: JSON.stringify([img]),
        categoryId: catMap[p.category],
        stock: p.stock,
        rating: p.rating,
        reviewCount: p.reviewCount,
        brand: p.brand,
        featured: !!p.featured,
        tags: JSON.stringify(p.tags),
      },
    })
  }

  console.log('Seed complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
