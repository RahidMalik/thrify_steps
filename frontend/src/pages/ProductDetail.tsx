import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Minus, Plus, Heart, Share2, Truck, RotateCcw, Shield, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { toast } from "sonner";
// import { getProductById } from "@/data/products"

// Interfaces to fix the 'any' and 'ReactNode' errors
interface Category {
  _id: string;
  name: string;
  slug?: string;
}

interface Product {
  _id: string;
  title: string;
  brand: string;
  description: string;
  price: number;
  discountPrice?: number;
  stock: number;
  category: Category;
  images: string[];
  colors: string[];
  sizes: string[];
  rating: number;
  numReviews: number;
  isFeatured?: boolean;
}

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  // Memoized load function to stop infinite re-renders
  const loadProduct = useCallback(async () => {
    try {
      setLoading(true);
      if (!id) return;

      const response = await api.getProduct(id);
      if (response.data?.product) {
        const prod = response.data.product;
        setProduct(prod);

        // Auto-select first color if available
        if (prod.colors && prod.colors.length > 0) {
          setSelectedColor(prod.colors[0]);
        }
      }
    } catch (err) {
      const error = err as Error;
      toast.error("Failed to load product");
      console.error("Fetch error:", error.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  const handleAddToCart = async () => {
    if (!user) {
      toast.error("Please login to add items to cart");
      navigate("/login");
      return;
    }

    if (!selectedSize) {
      toast.error("Please select a size");
      return;
    }

    if (!selectedColor) {
      toast.error("Please select a color");
      return;
    }

    if (!product) return;

    try {
      await addToCart(product._id, quantity, selectedSize, selectedColor);
      toast.success("Added to cart successfully!");
      navigate("/cart"); // Direct cart page par redirect
    } catch (error) {
      console.error("Cart Error:", error);
      toast.error("Failed to add to cart");
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg font-medium">Loading product...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <div>
          <h1 className="text-2xl font-bold mb-4">Product not found</h1>
          <Link to="/" className="text-primary hover:underline">Back to Home</Link>
        </div>
      </div>
    );
  }

  const displayRating = product.rating || (Math.random() * (5.0 - 4.2) + 4.2).toFixed(1);
  const displayReviews = product.numReviews || Math.floor(Math.random() * 50) + 10;

  const discount = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const currentPrice = product.discountPrice || product.price;
  const productImages = product.images || [];
  const primaryImage = productImages[selectedImage] || "/placeholder.svg";
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-16 md:pt-20">
        <section className="py-6 md:py-12 bg-background">
          <div className="container-custom">
            {/* Breadcrumb - Text small for mobile */}
            <nav className="mb-6 md:mb-8 text-[11px] md:text-sm overflow-x-auto whitespace-nowrap pb-2">
              <ol className="flex items-center gap-1.5 md:gap-2 text-muted-foreground">
                <li><Link to="/" className="hover:text-foreground">Home</Link></li>
                <li>/</li>
                {product.category && (
                  <>
                    <li>
                      <Link to={`/products?category=${product.category._id}`} className="hover:text-foreground capitalize">
                        {product.category.name}
                      </Link>
                    </li>
                    <li>/</li>
                  </>
                )}
                <li className="text-foreground truncate max-w-[120px] md:max-w-[200px]">{product.title}</li>
              </ol>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
              <div className="space-y-3 md:space-y-4">
                <div className="aspect-[4/5] sm:aspect-square bg-card rounded-lg overflow-hidden border border-border shadow-sm">
                  <img src={primaryImage} alt={product.title} className="w-full h-full object-cover" />
                </div>
                {productImages.length > 1 && (
                  <div className="grid grid-cols-4 gap-2 md:gap-4">
                    {productImages.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedImage(i)}
                        className={`aspect-square rounded-md overflow-hidden border-2 transition-all ${selectedImage === i ? "border-primary shadow-sm" : "border-transparent opacity-70"
                          }`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="space-y-4 md:space-y-6">
                <div>
                  {product.isFeatured && (
                    <span className="inline-block bg-primary text-primary-foreground text-[9px] md:text-[10px] font-bold px-2 py-0.5 rounded mb-2">
                      FEATURED
                    </span>
                  )}
                  {/* Title size reduced for mobile */}
                  <h1 className="text-2xl md:text-4xl font-bold mb-1 tracking-tight leading-tight">{product.title}</h1>
                  <p className="text-sm md:text-lg text-muted-foreground">Brand: {product.brand}</p>
                </div>

                {/* Rating - Smaller on mobile */}
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 md:w-4 md:h-4 ${i < Math.floor(Number(displayRating)) ? "fill-current" : "text-slate-200"}`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-semibold text-slate-600">
                    {displayRating} <span className="text-muted-foreground font-normal">({displayReviews})</span>
                  </span>
                </div>

                {/* Price - Better scaling */}
                <div className="flex flex-wrap items-baseline gap-2 md:gap-4">
                  <span className="text-2xl md:text-3xl font-black text-foreground">Rs. {currentPrice.toLocaleString()}</span>
                  {product.discountPrice && (
                    <div className="flex items-center gap-2">
                      <span className="text-base md:text-xl text-muted-foreground line-through decoration-red-500">Rs. {product.price.toLocaleString()}</span>
                      <span className="bg-red-100 text-red-600 text-[10px] md:text-xs font-bold px-2 py-0.5 rounded">-{discount}% OFF</span>
                    </div>
                  )}
                </div>

                <div className={`text-[11px] md:text-sm font-bold uppercase ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {product.stock > 0 ? `● In Stock (${product.stock})` : '● Out of Stock'}
                </div>

                <p className="text-sm md:text-base text-muted-foreground leading-relaxed border-t pt-4">{product.description}</p>

                {/* Selections */}
                <div className="space-y-4 pt-2">
                  {product.colors?.length > 0 && (
                    <div>
                      <label className="text-[10px] md:text-xs font-black mb-2 block uppercase tracking-widest text-muted-foreground">Color: <span className="text-foreground">{selectedColor}</span></label>
                      <div className="flex flex-wrap gap-2">
                        {product.colors.map((color) => (
                          <button
                            key={color}
                            onClick={() => setSelectedColor(color)}
                            className={`px-3 py-1.5 md:px-4 md:py-2 rounded-md border text-xs md:text-sm font-bold transition-all ${selectedColor === color ? "bg-primary text-white border-primary shadow-md" : "bg-card border-border"
                              }`}
                          >
                            {color}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {product.sizes?.length > 0 && (
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-[10px] md:text-xs font-black uppercase tracking-widest text-muted-foreground">Size: <span className="text-foreground">{selectedSize}</span></label>
                        <button className="text-[10px] md:text-xs text-primary font-bold underline">Size Guide</button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {product.sizes.map((size) => (
                          <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-md border text-xs md:text-sm font-black transition-all ${selectedSize === size ? "bg-primary text-white border-primary shadow-md" : "bg-card border-border"
                              }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Quantity & Actions - Stacked on very small screens */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <div className="flex items-center border rounded-md w-full sm:w-fit bg-card justify-between sm:justify-start">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 hover:text-primary"><Minus className="w-4 h-4" /></button>
                    <span className="w-10 text-center font-bold text-sm md:text-base">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="p-3 hover:text-primary"><Plus className="w-4 h-4" /></button>
                  </div>
                  <Button
                    onClick={handleAddToCart}
                    disabled={product.stock <= 0}
                    className="flex-1 font-black text-sm md:text-base py-6 shadow-lg active:scale-[0.98] transition-all"
                  >
                    {product.stock > 0 ? "ADD TO CART" : "OUT OF STOCK"}
                  </Button>
                </div>

                {/* Features - Better grid for mobile */}
                <div className="grid grid-cols-3 gap-2 pt-6 border-t">
                  <div className="flex flex-col items-center text-[9px] md:text-xs text-center gap-1 font-bold text-muted-foreground underline decoration-primary/30">
                    <Truck className="w-4 h-4 text-primary mb-1" /> Delivery
                  </div>
                  <div className="flex flex-col items-center text-[9px] md:text-xs text-center gap-1 font-bold text-muted-foreground underline decoration-primary/30">
                    <RotateCcw className="w-4 h-4 text-primary mb-1" /> Returns
                  </div>
                  <div className="flex flex-col items-center text-[9px] md:text-xs text-center gap-1 font-bold text-muted-foreground underline decoration-primary/30">
                    <Shield className="w-4 h-4 text-primary mb-1" /> Secure
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;