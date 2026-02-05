import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu, X, ShoppingBag, Search, User, Loader2, ChevronRight,
  LayoutDashboard, LogOut, Info, UserPlus, LogIn, Sun, Moon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useTheme } from "@/contexts/ThemeContext"; // Added theme hook
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
    return <div className="p-6 text-center text-sm text-muted-foreground bg-background border-t">No shoes found.</div>;
  }
  if (searchResults.length === 0) return null;

  return (
    <div className="flex flex-col bg-background text-foreground">
      <div className="px-3 py-2 text-[10px] font-bold uppercase text-muted-foreground bg-muted/50 border-b">
        {searchTerm ? `Results for "${searchTerm}"` : "Products"}
      </div>
      <div className="max-h-[60vh] overflow-y-auto">
        {searchResults.map((product: Product) => (
          <button
            key={product._id}
            className="flex items-center gap-3 px-4 py-3 hover:bg-muted active:bg-muted/80 border-b border-border last:border-none w-full text-left transition-colors"
            onClick={() => onProductClick(product._id)}
          >
            <div className="w-10 h-10 rounded bg-muted overflow-hidden flex-shrink-0 border">
              <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{product.title}</p>
              <p className="text-xs text-muted-foreground font-medium">Rs. {product.price.toLocaleString()}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
          </button>
        ))}
      </div>
      <button
        className="w-full px-4 py-3 text-center text-xs font-bold text-primary hover:bg-muted bg-primary/5 transition-colors border-t"
        onClick={onViewAll}
      >
        VIEW ALL PRODUCTS
      </button>
    </div>
  );
};

const Navbar = () => {
  const { isDarkMode, toggleTheme } = useTheme(); // Use context logic
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
    <nav className="fixed top-0 left-0 right-0 z-[100] bg-background border-b border-border shadow-sm" ref={searchRef}>
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl md:text-2xl font-extrabold tracking-tighter text-foreground">
              Thrifty<span className="text-primary">Steps</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-4 lg:gap-8">
            <Link to="/" className={`text-xs lg:text-sm font-medium ${isActive("/") ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>Home</Link>
            <Link to="/about" className={`text-xs lg:text-sm font-medium ${isActive("/about") ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>About</Link>
            {categories.slice(0, 2).map((cat) => (
              <Link key={cat._id} to={`/products/${cat.name.toLowerCase()}`} className={`text-xs lg:text-sm font-medium capitalize ${isActive(`/products/${cat.name.toLowerCase()}`) ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>{cat.name}</Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 lg:gap-4">

              {/* Desktop Theme Toggle */}
              <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
                {isDarkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5" />}
              </Button>

              <div className="relative z-[110] hidden md:block w-[200px] xl:w-[250px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  className="pl-9 rounded-full bg-muted border-none focus:bg-background transition-all"
                  placeholder="Search shoes..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setShowResults(true); }}
                />
                {showResults && !isOpen && searchTerm && (
                  <div className="absolute left-0 right-0 mt-2 bg-background border border-border shadow-2xl rounded-xl overflow-hidden z-[120]">
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

              <Link to="/cart" className="p-2 hover:bg-muted rounded-full relative">
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-[10px] rounded-full flex items-center justify-center font-bold">{cartCount}</span>}
              </Link>

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-2 hover:bg-muted rounded-full outline-none relative z-[110]"><User className="w-5 h-5" /></button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 z-[160] bg-background border border-border">
                    <DropdownMenuItem onClick={() => navigate("/profile")}>Profile</DropdownMenuItem>
                    {isAdmin && <DropdownMenuItem onClick={() => navigate("/admin")}>Admin Panel</DropdownMenuItem>}
                    <DropdownMenuItem onClick={() => { logout(); navigate("/"); }} className="text-orange-600 font-bold">Logout</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-1 lg:gap-2">
                  <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate("/login")}>Login</Button>
                  <Button size="sm" className="text-xs" onClick={() => navigate("/register")}>Sign Up</Button>
                </div>
              )}
            </div>

            <button className="md:hidden p-2 text-foreground" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
          </div>
        </div>

        <div className="md:hidden pb-3">
          <div className="relative z-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              className="pl-9 h-11 rounded-xl bg-muted border-none focus:bg-background text-foreground"
              placeholder="Search shoes..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setShowResults(true); }}
            />
          </div>
          {showResults && (
            <div className="absolute left-0 right-0 mt-2 bg-background border-b border-border shadow-2xl z-[110]">
              <SearchResultsList searchResults={searchResults} isSearching={isSearching} searchTerm={searchTerm} onProductClick={handleProductClick} onViewAll={handleViewAll} />
            </div>
          )}
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden fixed inset-0 top-[115px] z-[150] bg-background h-[calc(100vh-115px)] overflow-y-auto">
          <div className="flex flex-col px-6 py-8">
            <div className="grid grid-cols-3 gap-3 mb-8">
              {/* Mobile Theme Toggle */}
              <button onClick={toggleTheme} className="flex flex-col items-center justify-center p-5 bg-muted rounded-2xl border border-border">
                {isDarkMode ? <Sun className="w-6 h-6 mb-1 text-yellow-500" /> : <Moon className="w-6 h-6 mb-1 text-foreground" />}
                <span className="text-[10px] font-bold uppercase">Mode</span>
              </button>

              <Link to="/cart" onClick={() => setIsOpen(false)} className="flex flex-col items-center justify-center p-5 bg-muted rounded-2xl border border-border">
                <div className="relative">
                  <ShoppingBag className="w-6 h-6 mb-1" />
                  {cartCount > 0 && <span className="absolute -top-2 -right-2 bg-primary text-white text-[11px] w-5 h-5 rounded-full flex items-center justify-center font-bold">{cartCount}</span>}
                </div>
                <span className="text-[10px] font-bold uppercase">Cart</span>
              </Link>

              {user ? (
                isAdmin ? (
                  <Link to="/admin" onClick={() => setIsOpen(false)} className="flex flex-col items-center justify-center p-5 bg-muted rounded-2xl border border-border">
                    <LayoutDashboard className="w-6 h-6 mb-1" />
                    <span className="text-[10px] font-bold uppercase">Admin</span>
                  </Link>
                ) : (
                  <Link to="/profile" onClick={() => setIsOpen(false)} className="flex flex-col items-center justify-center p-5 bg-muted rounded-2xl border border-border">
                    <User className="w-6 h-6 mb-1" />
                    <span className="text-[10px] font-bold uppercase">Profile</span>
                  </Link>
                )
              ) : (
                <Link to="/register" onClick={() => setIsOpen(false)} className="flex flex-col items-center justify-center p-5 bg-muted rounded-2xl border border-border">
                  <UserPlus className="w-6 h-6 mb-1" />
                  <span className="text-[10px] font-bold uppercase">Join</span>
                </Link>
              )}
            </div>
            {/* ... Rest of the mobile sidebar links use existing text-foreground styles */}
            <div className="space-y-1">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4">Main Menu</p>
              <Link to="/" onClick={() => setIsOpen(false)} className={`flex items-center justify-between py-4 text-xl font-bold border-b border-border ${isActive("/") ? "text-primary" : "text-foreground"}`}>
                Home <ChevronRight className="w-5 h-5 text-muted-foreground/30" />
              </Link>
              <Link to="/about" onClick={() => setIsOpen(false)} className={`flex items-center justify-between py-4 text-xl font-bold border-b border-border ${isActive("/about") ? "text-primary" : "text-foreground"}`}>
                About <Info className="w-5 h-5 text-muted-foreground/30" />
              </Link>
            </div>

            <div className="mt-8">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4">Shop Categories</p>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((cat) => (
                  <Link key={cat._id} to={`/products/${cat.name.toLowerCase()}`} onClick={() => setIsOpen(false)} className="px-4 py-3 bg-muted rounded-xl text-sm font-bold capitalize text-foreground">
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-border space-y-3">
              {user ? (
                <Button variant="destructive" className="w-full bg-orange-500 h-14 rounded-2xl font-bold text-white" onClick={() => { logout(); setIsOpen(false); }}>
                  <LogOut className="w-5 h-5 mr-2" /> Logout
                </Button>
              ) : (
                <>
                  <Button className="w-full h-14 bg-orange-500 rounded-2xl font-bold flex items-center justify-center gap-2 text-white" onClick={() => { navigate("/login"); setIsOpen(false); }}>
                    <LogIn className="w-5 h-5" /> Login
                  </Button>
                  <Button variant="outline" className="w-full h-14 rounded-2xl font-bold border-2" onClick={() => { navigate("/register"); setIsOpen(false); }}>
                    <UserPlus className="w-5 h-5 mr-2" /> Sign Up
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