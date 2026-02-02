import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, ShoppingBag, Search, User, Loader2, ChevronRight, LayoutDashboard, LogOut, Info, UserPlus, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import api, { Category } from "@/lib/api";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Product {
  _id: string;
  title: string;
  price: number;
  images: string[];
}

const SearchResultsList = ({ searchResults, isSearching, searchTerm, onProductClick, onViewAll }: any) => {
  if (isSearching) return <div className="p-4 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto text-primary" /></div>;
  if (searchTerm && searchResults.length === 0) {
    return <div className="p-6 text-center text-sm text-gray-500 bg-white border-t">No shoes found.</div>;
  }
  if (searchResults.length === 0) return null;

  return (
    <div className="flex flex-col bg-white">
      <div className="px-3 py-2 text-[10px] font-bold uppercase text-muted-foreground bg-gray-50 border-b">
        {searchTerm ? `Results for "${searchTerm}"` : "Products"}
      </div>
      <div className="max-h-[60vh] overflow-y-auto">
        {searchResults.map((product: Product) => (
          <button
            key={product._id}
            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 active:bg-gray-100 border-b border-gray-100 last:border-none w-full text-left transition-colors"
            onClick={() => onProductClick(product._id)}
          >
            <div className="w-10 h-10 rounded bg-gray-100 overflow-hidden flex-shrink-0 border">
              <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-black">{product.title}</p>
              <p className="text-xs text-gray-500 font-medium">Rs. {product.price.toLocaleString()}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </button>
        ))}
      </div>
      <button
        className="w-full px-4 py-3 text-center text-xs font-bold text-primary hover:bg-gray-50 bg-primary/5 transition-colors border-t"
        onClick={onViewAll}
      >
        VIEW ALL PRODUCTS
      </button>
    </div>
  );
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();
  const { getCartCount } = useCart();
  const cartCount = getCartCount();
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await api.getCategories();
        if (res.data?.categories) setCategories(res.data.categories);
      } catch (err) { console.error(err); }
    };
    fetchCats();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (!searchTerm.trim()) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const response = await api.getProducts({ search: searchTerm, limit: 5 });
        setSearchResults(response.data?.products || []);
      } catch (err) { console.error(err); } finally { setIsSearching(false); }
    }, 400);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  const handleProductClick = (id: string) => {
    setShowResults(false);
    setSearchTerm("");
    setIsOpen(false);
    navigate(`/product/${id}`);
  };

  const handleViewAll = () => {
    const term = searchTerm.trim();
    setShowResults(false);
    setSearchTerm("");
    setIsOpen(false);
    navigate(term ? `/products?search=${encodeURIComponent(term)}` : '/products');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] bg-white border-b border-border shadow-sm" ref={searchRef}>
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl md:text-2xl font-extrabold tracking-tighter text-black">
              Thrifty<span className="text-primary">Steps</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className={`text-sm font-medium ${isActive("/") ? "text-primary" : "text-gray-600 hover:text-black"}`}>Home</Link>
            <Link to="/about" className={`text-sm font-medium ${isActive("/about") ? "text-primary" : "text-gray-600 hover:text-black"}`}>About</Link>
            {categories.slice(0, 2).map((cat) => (
              <Link key={cat._id} to={`/products/${cat.name.toLowerCase()}`} className={`text-sm font-medium capitalize ${isActive(`/products/${cat.name.toLowerCase()}`) ? "text-primary" : "text-gray-600 hover:text-black"}`}>{cat.name}</Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-4">

              {/* Desktop Search Bar - FIXED Z-INDEX & RESULTS */}
              <div className="relative z-[110] w-[250px]">
                <Search className="absolute hidden lg:flex left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  className="pl-9 rounded-full bg-black/[0.04] border-none focus:bg-white transition-all"
                  placeholder="Search shoes..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setShowResults(true); }}
                />
                {showResults && !isOpen && searchTerm && (
                  <div className="absolute left-0 right-0 mt-2 bg-white border shadow-2xl rounded-xl overflow-hidden z-[120]">
                    <SearchResultsList
                      searchResults={searchResults}
                      isSearching={isSearching}
                      searchTerm={searchTerm}
                      onProductClick={handleProductClick}
                      onViewAll={handleViewAll}
                    />
                  </div>
                )}
              </div>

              <Link to="/cart" className="p-2 hover:bg-gray-100 rounded-full relative">
                <ShoppingBag className="w-5 h-5 text-black" />
                {cartCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-[10px] rounded-full flex items-center justify-center font-bold">{cartCount}</span>}
              </Link>

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-2 hover:bg-gray-100 rounded-full outline-none"><User className="w-5 h-5 text-black" /></button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-white border">
                    <DropdownMenuItem onClick={() => navigate("/profile")}>Profile</DropdownMenuItem>
                    {isAdmin && <DropdownMenuItem onClick={() => navigate("/admin")}>Admin Panel</DropdownMenuItem>}
                    <DropdownMenuItem onClick={() => { logout(); navigate("/"); }} className="text-orange-600 font-bold">Logout</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>Login</Button>
                  <Button size="sm" onClick={() => navigate("/register")}>Register</Button>
                </div>
              )}
            </div>

            <button className="md:hidden p-2 text-black" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-3">
          <div className="relative z-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              className="pl-9 h-11 rounded-xl bg-black/[0.05] border-none focus:bg-white text-black"
              placeholder="Search shoes..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setShowResults(true); }}
            />
          </div>
          {showResults && (
            <div className="absolute left-0 right-0 mt-2 bg-white border-b shadow-2xl z-[110]">
              <SearchResultsList searchResults={searchResults} isSearching={isSearching} searchTerm={searchTerm} onProductClick={handleProductClick} onViewAll={handleViewAll} />
            </div>
          )}
        </div>
      </div>

      {/* Mobile Sidebar */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 top-[115px] z-[150] bg-white h-[calc(100vh-115px)] overflow-y-auto">
          <div className="flex flex-col px-6 py-8">

            {/* Quick Actions Logic Fixed */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <Link to="/cart" onClick={() => setIsOpen(false)} className="flex flex-col items-center justify-center p-5 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="relative">
                  <ShoppingBag className="w-8 h-8 mb-1 text-black" />
                  {cartCount > 0 && <span className="absolute -top-2 -right-2 bg-primary text-white text-[11px] w-6 h-6 rounded-full flex items-center justify-center border-2 border-white font-bold">{cartCount}</span>}
                </div>
                <span className="text-xs font-bold text-black uppercase tracking-tight">Cart</span>
              </Link>

              {user ? (
                isAdmin ? (
                  <Link to="/admin" onClick={() => setIsOpen(false)} className="flex flex-col items-center justify-center p-5 bg-gray-50 rounded-2xl border border-gray-100">
                    <LayoutDashboard className="w-8 h-8 mb-1 text-black" />
                    <span className="text-xs font-bold text-black uppercase tracking-tight">Admin</span>
                  </Link>
                ) : (
                  <Link to="/profile" onClick={() => setIsOpen(false)} className="flex flex-col items-center justify-center p-5 bg-gray-50 rounded-2xl border border-gray-100">
                    <User className="w-8 h-8 mb-1 text-black" />
                    <span className="text-xs font-bold text-black uppercase tracking-tight">Profile</span>
                  </Link>
                )
              ) : (
                <Link to="/register" onClick={() => setIsOpen(false)} className="flex flex-col items-center justify-center p-5 bg-gray-50 rounded-2xl border border-gray-100">
                  <UserPlus className="w-8 h-8 mb-1 text-black" />
                  <span className="text-xs font-bold text-black uppercase tracking-tight">Join</span>
                </Link>
              )}
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Main Menu</p>
              <Link to="/" onClick={() => setIsOpen(false)} className={`flex items-center justify-between py-4 text-xl font-bold border-b border-gray-50 ${isActive("/") ? "text-primary" : "text-black"}`}>
                Home <ChevronRight className="w-5 h-5 text-gray-300" />
              </Link>
              <Link to="/about" onClick={() => setIsOpen(false)} className={`flex items-center justify-between py-4 text-xl font-bold border-b border-gray-50 ${isActive("/about") ? "text-primary" : "text-black"}`}>
                About <Info className="w-5 h-5 text-gray-300" />
              </Link>
            </div>

            <div className="mt-8">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Shop Categories</p>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((cat) => (
                  <Link key={cat._id} to={`/products/${cat.name.toLowerCase()}`} onClick={() => setIsOpen(false)} className="px-4 py-3 bg-gray-50 rounded-xl text-sm font-bold capitalize text-gray-700">
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-100 space-y-3">
              {user ? (
                <Button variant="destructive" className="w-full bg-orange-500 h-14 rounded-2xl font-bold" onClick={() => { logout(); setIsOpen(false); }}>
                  <LogOut className="w-5 h-5 mr-2" /> Logout
                </Button>
              ) : (
                <>
                  <Button className="w-full h-14 bg-orange-500 rounded-2xl font-bold flex items-center justify-center gap-2" onClick={() => { navigate("/login"); setIsOpen(false); }}>
                    <LogIn className="w-5 h-5" /> Login
                  </Button>
                  <Button variant="outline" className="w-full h-14 rounded-2xl font-bold border-2" onClick={() => { navigate("/register"); setIsOpen(false); }}>
                    <UserPlus className="w-5 h-5 mr-2" /> Register
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;