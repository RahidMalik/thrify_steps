import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductCard from "./ProductCard";
import api from "@/lib/api"; // Aapka api helper

interface IProduct {
  _id: string;
  title: string;
  brand: string;
  price: number;
  discountPrice?: number;
  description: string;
  sizes: string[];
  colors: string[];
  stock: number;
  category: any;
  images: string[];
  isFeatured?: boolean;
}

const FeaturedProducts = () => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setLoading(true);
        const response = await api.getProducts({ featured: true, limit: 12 });

        if (response.data?.products) {
          setProducts(response.data.products);
        }
      } catch (error) {
        console.error("Error fetching featured products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  return (
    <section className="section-padding bg-background">
      <div className="container-custom">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <div>
            <p className="text-primary font-medium mb-2">FEATURED</p>
            <h2 className="text-3xl md:text-4xl font-bold">
              Trending Right Now
            </h2>
          </div>
          <Link to="/products">
            <Button variant="outline" className="gap-2">
              View All Products
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          /* Products Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {products.map((product, index) => (
              <div
                key={product._id}
                className="animate-fade-up opacity-0"
                style={{ animationDelay: `${index * 0.1}s`, animationFillMode: "forwards" }}
              >
                <ProductCard
                  id={product._id}
                  name={product.title}
                  price={product.discountPrice || product.price}
                  originalPrice={product.discountPrice ? product.price : undefined}
                  image={product.images?.[0]}
                  // FIX: Added optional chaining and null check to prevent crash
                  category={typeof product.category === 'object' && product.category !== null ? product.category.name : "General"}
                  isNew={index === 0}
                  isBestSeller={product.isFeatured}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;