import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import api from "@/lib/api";
import ProductCard from "@/components/home/ProductCard";
import { Loader2, ChevronLeft, ChevronRight, ListFilter } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { toast } from "sonner";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface Product {
    _id: string;
    title: string;
    price: number;
    images: string[];
    category?: {
        name: string;
    };
}

const ShopPage = () => {
    const { categoryName } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);

    const searchTerm = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const currentPage = parseInt(searchParams.get("page") || "1");
    const limit = 20;

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const response = await api.getProducts({
                    search: searchTerm,
                    category: categoryName as any,
                    page: currentPage,
                    limit: limit,
                    sortBy: sortBy,
                    sortOrder: sortOrder
                });

                console.log('Products Response:', response.data);

                if (response.data) {
                    setProducts(response.data.products || []);
                    setTotalPages(response.data.pagination?.totalPages || 1);
                    setTotalProducts(response.data.pagination?.totalProducts || 0);
                }
            } catch (error) {
                console.error('Failed to load products:', error);
                toast.error("Failed to load products.");
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
        window.scrollTo(0, 0);
    }, [categoryName, currentPage, sortBy, sortOrder, searchTerm]);

    const handlePageChange = (newPage: number) => {
        setSearchParams((prev) => {
            prev.set("page", newPage.toString());
            return prev;
        });
    };

    const handleSortChange = (value: string) => {
        setSearchParams((prev) => {
            const [field, order] = value.split("-");
            prev.set("sortBy", field);
            prev.set("sortOrder", order);
            prev.set("page", "1");
            return prev;
        });
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow pt-20 md:pt-28 pb-12 bg-slate-50">
                <div className="container-custom max-w-7xl mx-auto px-4">

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 md:mb-10 gap-4">
                        <div>
                            <h1 className="text-2xl md:text-4xl font-extrabold capitalize tracking-tight">
                                {searchTerm ? `Results for "${searchTerm}"` : (categoryName || "All Collections")}
                            </h1>
                            <p className="text-muted-foreground mt-2 font-medium text-sm md:text-base">
                                Showing {products.length} of {totalProducts} products
                            </p>
                        </div>

                        <div className="flex items-center gap-3 bg-white p-2 rounded-xl shadow-sm border w-full md:w-auto">
                            <ListFilter className="w-4 h-4 text-muted-foreground ml-2" />
                            <Select value={`${sortBy}-${sortOrder}`} onValueChange={handleSortChange}>
                                <SelectTrigger className="w-full md:w-[180px] border-none shadow-none focus:ring-0">
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
                            {products.length > 0 ? (
                                <>
                                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
                                        {products.map((product) => (
                                            <ProductCard
                                                key={product._id}
                                                id={product._id}
                                                name={product.title}
                                                price={product.price}
                                                image={product.images?.[0]}
                                                category={product.category?.name || "Uncategorized"}
                                            />
                                        ))}
                                    </div>

                                    {/* Pagination */}
                                    {totalPages > 1 && (
                                        <div className="flex justify-center items-center gap-2 mt-8 md:mt-12">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                disabled={currentPage === 1}
                                                className="flex items-center gap-1"
                                            >
                                                <ChevronLeft className="w-4 h-4" />
                                                <span className="hidden sm:inline">Previous</span>
                                            </Button>

                                            <div className="flex items-center gap-1 md:gap-2">
                                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                    let pageNum;
                                                    if (totalPages <= 5) {
                                                        pageNum = i + 1;
                                                    } else if (currentPage <= 3) {
                                                        pageNum = i + 1;
                                                    } else if (currentPage >= totalPages - 2) {
                                                        pageNum = totalPages - 4 + i;
                                                    } else {
                                                        pageNum = currentPage - 2 + i;
                                                    }

                                                    return (
                                                        <Button
                                                            key={pageNum}
                                                            variant={currentPage === pageNum ? "default" : "outline"}
                                                            size="sm"
                                                            onClick={() => handlePageChange(pageNum)}
                                                            className="w-8 h-8 md:w-10 md:h-10 p-0 text-xs md:text-sm"
                                                        >
                                                            {pageNum}
                                                        </Button>
                                                    );
                                                })}
                                            </div>

                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                disabled={currentPage === totalPages}
                                                className="flex items-center gap-1"
                                            >
                                                <span className="hidden sm:inline">Next</span>
                                                <ChevronRight className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                                    <p className="text-base md:text-lg text-muted-foreground mb-4">
                                        No products found.
                                    </p>
                                    <Button variant="default" onClick={() => setSearchParams({})}>
                                        View All Products
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