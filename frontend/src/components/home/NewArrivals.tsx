import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductCard from "./ProductCard";
import api from "@/lib/api";

const NewArrivals = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        setLoading(true);
        const response = await api.getProducts({
          limit: 12,
          sortBy: "createdAt",
          sortOrder: "desc"
        });

        if (response.data?.products) {
          setProducts(response.data.products);
        }
      } catch (error) {
        console.error("Error fetching new arrivals:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNewArrivals();
  }, []);

  return (
    <section className="section-padding bg-secondary">
      <div className="container-custom">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <div>
            <p className="text-primary font-medium mb-2">JUST DROPPED</p>
            <h2 className="text-3xl md:text-4xl font-bold">New Arrivals</h2>
          </div>
          <Link to="/products">
            <Button variant="outline" className="gap-2">
              View All New
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
                  price={product.price}
                  image={product.images?.[0]}
                  category={product.category?.name || "New"}
                  isNew={true}
                />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && products.length === 0 && (
          <p className="text-center text-muted-foreground py-10">No new arrivals at the moment.</p>
        )}
      </div>
    </section>
  );
};

export default NewArrivals;