import { useState, useEffect } from "react";
import { Filter, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/home/ProductCard";
import api from "@/lib/api";

const Sneakers = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Sorting states
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const limit = 8;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        // Backend API call
        const response = await api.getProducts({
          category: "sneakers",
          page: currentPage,
          limit: limit,
          sortBy: sortField,
          sortOrder: sortOrder
        });

        if (response.data) {
          setProducts(response.data.products);
          // FIX: TypeScript error resolved by accessing pagination object
          setTotalPages(response.data.pagination.totalPages);
        }
      } catch (error) {
        console.error("Error fetching sneakers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage, sortField, sortOrder]);

  // Sort change handler
  const handleSortChange = (value: string) => {
    if (value === "price-low") {
      setSortField("price");
      setSortOrder("asc");
    } else if (value === "price-high") {
      setSortField("price");
      setSortOrder("desc");
    } else {
      setSortField("createdAt");
      setSortOrder("desc");
    }
    setCurrentPage(1); // Sort badalne par page 1 par wapas jao
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-20">
        <section className="bg-slate-900 text-white py-16">
          <div className="container-custom">
            <h1 className="text-4xl font-bold mb-4">Sneakers</h1>
            <p className="opacity-70">Premium sneakers for every occasion.</p>
          </div>
        </section>

        <section className="py-6 border-b sticky top-20 bg-background z-40">
          <div className="container-custom flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="w-4 h-4" /> Filters
              </Button>
              <span className="text-sm text-muted-foreground">
                Showing {products.length} products
              </span>
            </div>

            {/* Sorting Dropdown */}
            <select
              onChange={(e) => handleSortChange(e.target.value)}
              className="text-sm outline-none border p-2 rounded-md bg-transparent"
            >
              <option value="featured">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </section>

        <section className="section-padding min-h-[400px]">
          <div className="container-custom">
            {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>
            ) : (
              <>
                {products.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {products.map((product) => (
                      <ProductCard
                        key={product._id}
                        id={product._id}
                        name={product.title}
                        price={product.price}
                        image={product.images?.[0]}
                        category={product.category?.name || "Sneakers"}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 text-muted-foreground">No sneakers found in this category.</div>
                )}

                {/* Pagination UI */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-16">
                    <Button
                      variant="outline"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(p => p - 1)}
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                    </Button>

                    <span className="text-sm font-medium mx-4">
                      Page {currentPage} of {totalPages}
                    </span>

                    <Button
                      variant="outline"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(p => p + 1)}
                    >
                      Next <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Sneakers;