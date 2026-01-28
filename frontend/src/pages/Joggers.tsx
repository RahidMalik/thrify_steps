import { useState } from "react";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/home/ProductCard";
import { getProductsByCategory } from "@/data/products";

const Joggers = () => {
  const [sortBy, setSortBy] = useState("featured");
  const products = getProductsByCategory("joggers");

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-20">
        {/* Header */}
        <section className="bg-surface-dark text-surface-dark-foreground py-16 md:py-24">
          <div className="container-custom">
            <div className="max-w-2xl">
              <p className="text-primary font-medium mb-2">COLLECTION</p>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Joggers</h1>
              <p className="text-surface-dark-foreground/70">
                Premium joggers designed for comfort and style. From essential basics to statement pieces.
              </p>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="py-6 border-b border-border bg-background sticky top-16 md:top-20 z-40">
          <div className="container-custom">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="w-4 h-4" />
                  Filters
                </Button>
                <span className="text-sm text-muted-foreground">
                  {products.length} products
                </span>
              </div>
              <div className="flex items-center gap-4">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-sm bg-transparent border-none focus:outline-none cursor-pointer"
                >
                  <option value="featured">Featured</option>
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="section-padding bg-background">
          <div className="container-custom">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              {products.map((product, index) => (
                <div
                  key={product.id}
                  className="animate-fade-up opacity-0"
                  style={{ animationDelay: `${index * 0.1}s`, animationFillMode: "forwards" }}
                >
                  <ProductCard
                    id={product.id}
                    name={product.name}
                    price={product.price}
                    originalPrice={product.originalPrice}
                    image={product.image}
                    category={product.category}
                    isNew={product.isNew}
                    isBestSeller={product.isBestSeller}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Joggers;
