import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";

const Cart = () => {
  const { cart, updateCartItem, removeFromCart, loading, refreshCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  useEffect(() => {
    refreshCart();
  }, []);

  useEffect(() => {
    setSelectedItems(prev => prev.filter(id => cart.some(item => item._id === id)));
  }, [cart]);

  if (!user || loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-pulse font-medium">{!user ? "Please Login..." : "Loading cart..."}</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-bold mb-2">Your cart is empty</h2>
            <Button onClick={() => navigate("/")} className="mt-4">Shop Now</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const selectedCartData = cart.filter(item => selectedItems.includes(item._id));
  const subtotal = selectedCartData.reduce((acc, item) => {
    const price = item.product?.discountPrice || item.product?.price || 0;
    return acc + (price * item.quantity);
  }, 0);

  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const toggleItem = (itemId: string) => {
    setSelectedItems(prev =>
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  };

  const toggleAll = () => {
    if (selectedItems.length === cart.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cart.map(item => item._id));
    }
  };

  return (
    <div className="min-h-screen md:mt-5 flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-20 pb-10">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tighter">YOUR BAG</h1>
            <Button variant="outline" size="sm" onClick={toggleAll} className="text-xs rounded-full">
              {selectedItems.length === cart.length ? "Deselect All" : "Select All Items"}
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => {
                const product = item.product;
                const price = product?.discountPrice || product?.price || 0;

                return (
                  <div
                    key={item._id}
                    className={`bg-card p-4 rounded-2xl border transition-all duration-300 ${selectedItems.includes(item._id) ? "border-primary ring-1 ring-primary/10" : "border-border"
                      }`}
                  >
                    <div className="flex gap-3 md:gap-5">
                      <div className="flex items-center">
                        <Checkbox
                          checked={selectedItems.includes(item._id)}
                          onCheckedChange={() => toggleItem(item._id)}
                          className="rounded-md"
                        />
                      </div>

                      {/* Image - Adjusted for mobile */}
                      <div className="w-20 h-24 md:w-32 md:h-36 bg-muted rounded-xl overflow-hidden shrink-0">
                        <img
                          src={product?.images?.[0]}
                          alt={product?.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Details - Responsive Layout */}
                      <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <div className="min-w-0">
                            <h3 className="font-bold text-sm md:text-lg leading-tight uppercase truncate">
                              {product?.title}
                            </h3>
                            <p className="text-[10px] md:text-xs text-muted-foreground mt-1 uppercase font-semibold">
                              {item.size} / {item.color}
                            </p>
                          </div>
                          <button
                            onClick={() => removeFromCart(item._id)}
                            className="text-muted-foreground hover:text-destructive transition-colors shrink-0 p-1"
                          >
                            <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                          </button>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 mt-4">
                          {/* Quantity Controls */}
                          <div className="flex items-center border rounded-xl bg-background shadow-sm">
                            <button
                              onClick={() => updateCartItem(item._id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="p-2 hover:bg-muted disabled:opacity-30 transition-colors"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-3 text-sm font-bold min-w-[2.5rem] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateCartItem(item._id, item.quantity + 1)}
                              className="p-2 hover:bg-muted transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <p className="font-black text-base md:text-xl tracking-tight">
                            Rs. {(price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary - Sticky on Desktop */}
            <div className="lg:col-span-1">
              <div className="bg-card p-6 rounded-3xl border border-border sticky top-24 shadow-sm">
                <h2 className="text-xl font-black uppercase mb-6 tracking-tighter">Order Summary</h2>
                <div className="space-y-4 mb-6 text-sm font-medium">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Items ({selectedItems.length})</span>
                    <span>Rs. {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estimated Tax (10%)</span>
                    <span>Rs. {tax.toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-4 flex justify-between items-end">
                    <span className="font-bold text-base">Total Amount</span>
                    <span className="text-2xl font-black text-primary tracking-tighter">
                      Rs. {total.toLocaleString()}
                    </span>
                  </div>
                </div>

                <Button
                  className="w-full py-6 rounded-2xl font-bold text-base shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]"
                  disabled={selectedItems.length === 0}
                  onClick={() => navigate("/checkout", { state: { selectedItems } })}
                >
                  CHECKOUT NOW ({selectedItems.length})
                </Button>

                <p className="text-[10px] text-center text-muted-foreground mt-4 uppercase font-bold tracking-widest">
                  Secure Checkout Guaranteed
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Cart;