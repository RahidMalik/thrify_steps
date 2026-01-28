import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import api from "@/lib/api";
import ProductCard from "@/components/home/ProductCard";
import { Loader2, ChevronLeft, ChevronRight, ListFilter } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { toast } from "sonner";
// Shadcn Select Imports
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const ShopPage = () => {
    const { categoryName } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);

    // Sorting States
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const currentPage = parseInt(searchParams.get("page") || "1");
    const limit = 20;

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const response = await api.getProducts({
                    category: categoryName,
                    page: currentPage,
                    limit: limit,
                    sortBy: sortBy, // Added sorting
                    sortOrder: sortOrder // Added sorting
                });

                if (response.data) {
                    setProducts(response.data.products);
                    setTotalPages(response.data.pagination.totalPages);
                    setTotalProducts(response.data.pagination.totalProducts);
                }
            } catch (error) {
                toast.error("Failed to load products.");
                console.error("Fetch Error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
        window.scrollTo(0, 0);
    }, [categoryName, currentPage, sortBy, sortOrder]); // Dependency array updated

    const handlePageChange = (newPage: number) => {
        setSearchParams((prev) => {
            prev.set("page", newPage.toString());
            return prev;
        });
    };

    // Sorting Handler for Shadcn Select
    const handleSortChange = (value: string) => {
        setSearchParams((prev) => {
            if (value === "price-asc") {
                prev.set("sortBy", "price");
                prev.set("sortOrder", "asc");
            } else if (value === "price-desc") {
                prev.set("sortBy", "price");
                prev.set("sortOrder", "desc");
            } else {
                prev.set("sortBy", "createdAt");
                prev.set("sortOrder", "desc");
            }
            prev.set("page", "1"); // Reset to page 1 on sort
            return prev;
        });
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow pt-28 pb-12 bg-slate-50">
                <div className="container-custom max-w-7xl mx-auto px-4">

                    {/* Header with Sort Option */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
                        <div>
                            <h1 className="text-4xl font-extrabold capitalize tracking-tight">
                                {categoryName ? categoryName : "All Collections"}
                            </h1>
                            <p className="text-muted-foreground mt-2 font-medium">
                                Showing {products.length} of {totalProducts} products
                            </p>
                        </div>

                        {/* SHADCN SORT SELECT */}
                        <div className="flex items-center gap-3 bg-white p-2 rounded-xl shadow-sm border">
                            <ListFilter className="w-4 h-4 text-muted-foreground ml-2" />
                            <Select
                                defaultValue={`${sortBy}-${sortOrder}`}
                                onValueChange={handleSortChange}
                            >
                                <SelectTrigger className="w-[180px] border-none shadow-none focus:ring-0">
                                    <SelectValue placeholder="Sort By" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="createdAt-desc">Newest Arrivals</SelectItem>
                                    <SelectItem value="price-asc">Price: Low to High</SelectItem>
                                    <SelectItem value="price-desc">Price: High to Low</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="w-10 h-10 animate-spin text-primary" />
                        </div>
                    ) : (
                        <>
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

                            {/* Pagination UI */}
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