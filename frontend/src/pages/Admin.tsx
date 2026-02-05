import { useEffect } from "react";
import { useNavigate, Routes, Route, Link, useLocation } from "react-router-dom";
import { Package, Users, ShoppingBag, Tag, BarChart3 } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/contexts/AuthContext";
import AdminProducts from "@/components/admin/AdminProducts";
import AdminOrders from "@/components/admin/AdminOrders";
import AdminPromoCodes from "@/components/admin/AdminPromoCodes";
import AdminStats from "@/components/admin/AdminStats";
import { toast } from "sonner";
import AdminUsers from "@/components/admin/AdminUsers";

const Admin = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else if (!isAdmin) {
      toast.error("Access denied. Admin privileges required.");
      navigate("/");
    }
  }, [user, isAdmin, navigate]);

  if (!user || !isAdmin) return null;

  const navItems = [
    { path: "/admin", label: "Stats", icon: BarChart3 },
    { path: "/admin/products", label: "Products", icon: Package },
    { path: "/admin/orders", label: "Orders", icon: ShoppingBag },
    { path: "/admin/promo-codes", label: "Promo", icon: Tag },
    { path: "/admin/users", label: "Users", icon: Users },
  ];

  return (
    // Replaced bg-slate-50 with bg-background
    <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-300">
      <Navbar />

      <main className="flex-1 pt-32 md:pt-36 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Mobile Navigation */}
          <div className="md:hidden overflow-x-auto no-scrollbar mb-6 mt-6 flex gap-2 pb-2 border-b border-border">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || (item.path !== "/admin" && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all ${
                    // bg-white replaced with bg-card
                    isActive ? "bg-primary text-primary-foreground shadow-md" : "bg-card text-muted-foreground border border-border"
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            <aside className="hidden md:block w-64 flex-shrink-0">
              <div className="bg-card rounded-xl border border-border shadow-sm p-4 sticky top-32">
                <div className="mb-6 px-4">
                  <h2 className="font-extrabold text-xl tracking-tight text-foreground">Admin Panel</h2>
                  <p className="text-xs text-muted-foreground">Manage your store</p>
                </div>

                <nav className="space-y-1.5">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path || (item.path !== "/admin" && location.pathname.startsWith(item.path));
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${isActive
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 mt-4 md:mt-0 min-w-0">
              <div className="rounded-2xl">
                <Routes>
                  <Route path="/" element={<AdminStats />} />
                  <Route path="/products" element={<AdminProducts />} />
                  <Route path="/orders" element={<AdminOrders />} />
                  <Route path="/promo-codes" element={<AdminPromoCodes />} />
                  <Route path="/users" element={<AdminUsers />} />
                </Routes>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <div className="h-10 md:hidden"></div>
    </div>
  );
};

export default Admin;