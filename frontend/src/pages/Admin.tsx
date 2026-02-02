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
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
      <Navbar />

      {/* Barhaye huye Padding taake Search Bar se niche rahe */}
      <main className="flex-1 pt-32 md:pt-36 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Mobile Navigation - Added mt-6 for extra spacing from search bar */}
          <div className="md:hidden overflow-x-auto no-scrollbar mb-6 mt-6 flex gap-2 pb-2 border-b">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || (item.path !== "/admin" && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all ${isActive ? "bg-primary text-white shadow-md" : "bg-white text-muted-foreground border"
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar - Desktop Sticky adjustment */}
            <aside className="hidden md:block w-64 flex-shrink-0">
              <div className="bg-white rounded-xl border shadow-sm p-4 sticky top-32">
                <div className="mb-6 px-4">
                  <h2 className="font-extrabold text-xl tracking-tight text-gray-800">Admin Panel</h2>
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
                          : "text-gray-500 hover:bg-slate-100 hover:text-gray-900"
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

            {/* Main Content Area - mt-4 for mobile spacing */}
            <div className="flex-1 mt-4 md:mt-0 min-w-0">
              <div className="bg-white md:bg-transparent rounded-2xl">
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