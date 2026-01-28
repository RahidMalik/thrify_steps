import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import api from "@/lib/api";
import ProductCard from "@/components/home/ProductCard";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { toast } from "sonner";

const ShopPage = () => {
    const { categoryName } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);

    const currentPage = parseInt(searchParams.get("page") || "1");
    const limit = 20;

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                // Backend API call with filters
                const response = await api.getProducts({
                    category: categoryName,
                    page: currentPage,
                    limit: limit
                });

                if (response.data) {
                    setProducts(response.data.products);
                    setTotalPages(response.data.pagination.totalPages);
                    setTotalProducts(response.data.pagination.totalProducts);
                }
            } catch (error) {
                toast.error("Failed to load products. Please try again.");
                console.error("Fetch Error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
        window.scrollTo(0, 0); // Page badalne par upar scroll kare
    }, [categoryName, currentPage]); // Jab bhi category ya page badle, data fetch ho

    // Page change handler
    const handlePageChange = (newPage: number) => {
        setSearchParams({ page: newPage.toString() });
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow pt-28 pb-12 bg-slate-50">
                <div className="container-custom max-w-7xl mx-auto px-4">

                    {/* Title Header */}
                    <div className="mb-10">
                        <h1 className="text-4xl font-extrabold capitalize tracking-tight">
                            {categoryName ? categoryName : "All Collections"}
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Showing {products.length} of {totalProducts} products
                        </p>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="w-10 h-10 animate-spin text-primary" />
                        </div>
                    ) : (
                        <>
                            {/* Product Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                                {products.map((product: any) => (
                                    <ProductCard
                                        key={product._id}
                                        id={product._id}
                                        name={product.title}
                                        price={product.price}
                                        image={product.images?.[0]}
                                        category={product.category?.name || "Premium"}
                                    />
                                ))}
                            </div>

                            {/* --- PAGINATION UI --- */}
                            {totalPages > 1 && (
                                <div className="flex justify-center items-center gap-3 mt-16">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        disabled={currentPage === 1}
                                        onClick={() => handlePageChange(currentPage - 1)}
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </Button>

                                    {[...Array(totalPages)].map((_, i) => (
                                        <Button
                                            key={i + 1}
                                            variant={currentPage === i + 1 ? "default" : "outline"}
                                            className="w-10 h-10 hidden sm:flex"
                                            onClick={() => handlePageChange(i + 1)}
                                        >
                                            {i + 1}
                                        </Button>
                                    ))}

                                    <Button
                                        variant="outline"
                                        size="icon"
                                        disabled={currentPage === totalPages}
                                        onClick={() => handlePageChange(currentPage + 1)}
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default ShopPage;