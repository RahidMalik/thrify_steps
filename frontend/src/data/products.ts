import sneaker1 from "@/assets/sneaker-1.jpg";
import sneaker2 from "@/assets/sneaker-2.jpg";
import sneaker3 from "@/assets/sneaker-3.jpg";
import jogger1 from "@/assets/jogger-1.jpg";
import jogger2 from "@/assets/jogger-2.jpg";
import jogger3 from "@/assets/jogger-3.jpg";

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  category: "sneakers" | "joggers";
  description: string;
  sizes: string[];
  isNew?: boolean;
  isBestSeller?: boolean;
  rating: number;
  reviews: number;
}

export const products: Product[] = [
  {
    id: "1",
    name: "Classic White Sneakers",
    price: 7999,
    originalPrice: 9999,
    image: sneaker1,
    images: [sneaker1, sneaker1, sneaker1],
    category: "sneakers",
    description: "Premium white leather sneakers with cushioned insole for all-day comfort. Perfect for casual outings and streetwear looks. Features breathable mesh lining and durable rubber outsole.",
    sizes: ["39", "40", "41", "42", "43", "44", "45"],
    isBestSeller: true,
    rating: 4.8,
    reviews: 124,
  },
  {
    id: "2",
    name: "Essential Black Joggers",
    price: 4999,
    image: jogger1,
    images: [jogger1, jogger1, jogger1],
    category: "joggers",
    description: "Ultra-soft cotton blend joggers with a modern slim fit. Features elastic waistband with drawstring, side pockets, and ribbed cuffs. Perfect for lounging or hitting the streets.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    isNew: true,
    rating: 4.9,
    reviews: 89,
  },
  {
    id: "3",
    name: "Retro Orange Runners",
    price: 8999,
    originalPrice: 10999,
    image: sneaker2,
    images: [sneaker2, sneaker2, sneaker2],
    category: "sneakers",
    description: "Vintage-inspired runners with bold orange accents. Combines retro aesthetics with modern comfort technology. Features memory foam insole and lightweight design.",
    sizes: ["39", "40", "41", "42", "43", "44"],
    isNew: true,
    rating: 4.7,
    reviews: 67,
  },
  {
    id: "4",
    name: "Cargo Olive Joggers",
    price: 5499,
    image: jogger2,
    images: [jogger2, jogger2, jogger2],
    category: "joggers",
    description: "Military-inspired cargo joggers with functional pockets. Made from durable cotton twill with a relaxed fit. Perfect for an urban streetwear look.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    isBestSeller: true,
    rating: 4.6,
    reviews: 156,
  },
  {
    id: "5",
    name: "Platform Black Sneakers",
    price: 9999,
    image: sneaker3,
    images: [sneaker3, sneaker3, sneaker3],
    category: "sneakers",
    description: "Bold platform sneakers with chunky sole design. Makes a statement while providing excellent support. Features premium leather upper and cushioned platform.",
    sizes: ["36", "37", "38", "39", "40", "41", "42"],
    isNew: true,
    rating: 4.8,
    reviews: 45,
  },
  {
    id: "6",
    name: "Beige Slim Joggers",
    price: 4499,
    originalPrice: 5999,
    image: jogger3,
    images: [jogger3, jogger3, jogger3],
    category: "joggers",
    description: "Sleek slim-fit joggers in versatile beige. Soft brushed fleece interior for ultimate comfort. Perfect for a clean, minimal streetwear aesthetic.",
    sizes: ["S", "M", "L", "XL"],
    isNew: true,
    rating: 4.5,
    reviews: 78,
  },
  {
    id: "7",
    name: "Street Runner Pro",
    price: 11999,
    originalPrice: 14999,
    image: sneaker2,
    images: [sneaker2, sneaker2, sneaker2],
    category: "sneakers",
    description: "Professional-grade running shoes with advanced cushioning technology. Breathable mesh upper and responsive foam midsole for maximum performance.",
    sizes: ["40", "41", "42", "43", "44", "45"],
    rating: 4.9,
    reviews: 203,
  },
  {
    id: "8",
    name: "Tech Fleece Joggers",
    price: 6999,
    image: jogger1,
    images: [jogger1, jogger1, jogger1],
    category: "joggers",
    description: "Premium tech fleece joggers with zippered pockets. Lightweight yet warm construction perfect for any season. Modern tapered fit.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    rating: 4.7,
    reviews: 134,
  },
];

export const getProductById = (id: string): Product | undefined => {
  return products.find((p) => p.id === id);
};

export const getProductsByCategory = (category: "sneakers" | "joggers"): Product[] => {
  return products.filter((p) => p.category === category);
};
