import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { toast } from "sonner";
import { Banknote, CreditCard } from "lucide-react";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "");

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { cart, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [appliedPromo, setAppliedPromo] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "cod">("stripe");

  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || "",
    address: "",
    city: "",
    state: "", // Backend needs this
    zipCode: "",
    country: "Pakistan",
    phone: "",
  });

  useEffect(() => {
    if (!user) navigate("/login");
    if (cart.length === 0) navigate("/cart");
  }, [user, cart.length, navigate]);

  const cartSubtotal = getCartTotal();
  const subtotalAfterPromo = cartSubtotal - promoDiscount;
  const shipping = 0;
  const tax = subtotalAfterPromo * 0.1;
  const total = subtotalAfterPromo + shipping + tax;

  const handlePromoCode = async () => {
    if (!promoCode.trim()) {
      toast.error("Please enter a promo code");
      return;
    }
    try {
      const response = await api.validatePromoCode(promoCode, cartSubtotal);
      if (response.data) {
        const discountAmount = response.data.discount || 0;
        setPromoDiscount(discountAmount);
        const promoInfo = response.data.promoCode || { code: promoCode, discount: discountAmount };
        setAppliedPromo(promoInfo);
        toast.success(`Promo code applied! Rs. ${discountAmount} discount.`);
      }
    } catch (error: any) {
      toast.error(error.message || "Invalid promo code");
      setPromoDiscount(0);
      setAppliedPromo(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    // Basic Validation
    if (!shippingAddress.state || !shippingAddress.address || !shippingAddress.phone) {
      toast.error("Please fill all required shipping fields including State.");
      return;
    }

    setLoading(true);

    try {
      // Data mapping to match your Backend Model exactly
      const commonOrderData = {
        items: cart.map((item) => ({
          product: item.product._id,
          title: item.product.title, // Required by backend
          image: item.product.images?.[0] || "", // Required by backend
          quantity: item.quantity,
          size: item.size,
          color: item.color,
          price: item.product.price,
        })),
        shippingAddress,
        promoCode: appliedPromo?.code || undefined,
        promoCodeDiscount: promoDiscount, // Backend field name
        totalAmount: total,
      };

      // --- COD LOGIC ---
      if (paymentMethod === "cod") {
        const orderResponse = await api.createOrder({
          ...commonOrderData,
          paymentMethod: "cod",
          paymentStatus: "pending",
          orderStatus: "processing",
        });

        if (orderResponse.success) {
          clearCart();
          toast.success("Order placed successfully with Cash on Delivery!");
          navigate("/profile");
        }
        return;
      }

      // --- STRIPE LOGIC ---
      if (!stripe || !elements) return;

      const stripeAmount = Math.round(total * 100);
      const paymentResponse = await api.createPaymentIntent(stripeAmount, "pkr", `Order by ${user?.email}`);

      const clientSecret = paymentResponse.data?.clientSecret;
      if (!clientSecret) throw new Error("Could not get payment secret");

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
          billing_details: {
            name: shippingAddress.fullName,
            email: user?.email,
            phone: shippingAddress.phone,
          },
        },
      });

      if (stripeError) {
        toast.error(stripeError.message || "Payment failed");
        setLoading(false);
        return;
      }

      if (paymentIntent?.status === "succeeded") {
        const orderResponse = await api.createOrder({
          ...commonOrderData,
          paymentMethod: "stripe",
          paymentStatus: "paid",
          paymentIntentId: paymentIntent.id,
        });

        if (orderResponse.success) {
          clearCart();
          toast.success("Order placed successfully!");
          navigate("/profile");
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || "Order processing failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-card p-6 rounded-xl border shadow-sm">
          <h2 className="text-xl font-bold mb-6">Shipping Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={shippingAddress.fullName} onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={shippingAddress.phone} onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })} required />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label>Address</Label>
              <Textarea value={shippingAddress.address} onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })} required />
            </div>
            <Input placeholder="City" value={shippingAddress.city} onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })} required />
            <Input placeholder="State / Province" value={shippingAddress.state} onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })} required />
            <Input placeholder="Zip Code" value={shippingAddress.zipCode} onChange={(e) => setShippingAddress({ ...shippingAddress, zipCode: e.target.value })} required />
          </div>
        </div>

        <div className="bg-card p-6 rounded-xl border shadow-sm">
          <h2 className="text-xl font-bold mb-6">Payment Method</h2>
          <RadioGroup defaultValue="stripe" onValueChange={(val) => setPaymentMethod(val as "stripe" | "cod")} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <RadioGroupItem value="stripe" id="stripe" className="peer sr-only" />
              <Label htmlFor="stripe" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer">
                <CreditCard className="mb-3 h-6 w-6" />
                Pay with Card
              </Label>
            </div>
            <div>
              <RadioGroupItem value="cod" id="cod" className="peer sr-only" />
              <Label htmlFor="cod" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer">
                <Banknote className="mb-3 h-6 w-6" />
                Cash on Delivery
              </Label>
            </div>
          </RadioGroup>

          {paymentMethod === "stripe" ? (
            <div className="p-4 border rounded-lg animate-in fade-in duration-300">
              <h3 className="text-sm font-medium mb-3">Card Information</h3>
              <CardElement options={{ style: { base: { fontSize: '16px' } } }} />
            </div>
          ) : (
            <div className="p-4 bg-muted/50 rounded-lg border border-dashed animate-in fade-in duration-300 text-center">
              <p className="text-sm text-muted-foreground">Pay in cash on delivery.</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-card p-6 rounded-xl border shadow-sm h-fit sticky top-24">
        <h2 className="text-xl font-bold mb-6">Order Summary</h2>
        <div className="flex gap-2 mb-6">
          <Input placeholder="PROMO10" value={promoCode} onChange={(e) => setPromoCode(e.target.value.toUpperCase())} disabled={!!appliedPromo} />
          <Button variant="outline" onClick={handlePromoCode} disabled={!!appliedPromo}>Apply</Button>
        </div>
        <div className="space-y-3 border-b pb-4 mb-4 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span><span>Rs. {cartSubtotal}</span>
          </div>
          {promoDiscount > 0 && (
            <div className="flex justify-between text-green-600 font-bold">
              <span>Discount</span><span>-Rs. {promoDiscount}</span>
            </div>
          )}
          <div className="flex justify-between text-muted-foreground">
            <span>Tax</span><span>Rs. {tax.toFixed(0)}</span>
          </div>
        </div>
        <div className="flex justify-between text-lg font-bold mb-6">
          <span>Total</span><span>Rs. {total.toFixed(0)}</span>
        </div>
        <Button className="w-full h-12" onClick={handleSubmit} disabled={loading || (paymentMethod === "stripe" && !stripe)}>
          {loading ? "Processing..." : paymentMethod === "cod" ? "Place COD Order" : `Pay Rs. ${total.toFixed(0)}`}
        </Button>
      </div>
    </div>
  );
};

const Checkout = () => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-grow pt-28 pb-12 ">
      <div className="max-w-6xl mx-auto px-4">
        <Elements stripe={stripePromise}>
          <CheckoutForm />
        </Elements>
      </div>
    </main>
    <Footer />
  </div>
);

export default Checkout;