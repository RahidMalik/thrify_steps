import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge"; // Ensure you have Badge component
import { CreditCard, Banknote, AlertCircle, CheckCircle2, Clock } from "lucide-react";

interface IOrderItem {
  title: string;
  image: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
}

interface IShippingAddress {
  fullName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface IOrder {
  _id: string;
  user: {
    name: string;
    email: string;
  };
  items: IOrderItem[];
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string; // Added this
  shippingAddress: IShippingAddress;
  createdAt: string;
}

const AdminOrders = () => {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    orderStatus: "all_statuses",
    paymentStatus: "all_payments"
  });

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const queryFilters = {
        orderStatus: filters.orderStatus === "all_statuses" ? "" : filters.orderStatus,
        paymentStatus: filters.paymentStatus === "all_payments" ? "" : filters.paymentStatus,
      };

      const response = await api.getAllOrders(1, 50, queryFilters);

      if (response.data?.orders) {
        const transformedOrders = response.data.orders.map((order: any) => ({
          ...order,
          items: order.items.map((item: any) => ({
            ...item,
            title: item.title || item.product?.title || "Product Removed",
            image: item.image || item.product?.images?.[0] || "/placeholder.png",
          }))
        }));
        setOrders(transformedOrders);
      }
    } catch (error) {
      console.error("Failed to load orders:", error);
      toast.error("Could not fetch orders.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleStatusUpdate = async (orderId: string, field: string, value: string) => {
    try {
      await api.updateOrderStatus(orderId, { [field]: value });
      toast.success("Status updated successfully!");
      loadOrders();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Update failed";
      toast.error(message);
    }
  };

  // Helper function for Status Colors
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
      case 'delivered': return 'bg-green-500/10 text-green-600 border-green-200';
      case 'pending':
      case 'processing': return 'bg-yellow-500/10 text-yellow-600 border-yellow-200';
      case 'failed':
      case 'cancelled': return 'bg-red-500/10 text-red-600 border-red-200';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-200';
    }
  };

  if (loading) return <div className="p-20 text-center font-semibold text-muted-foreground bg-background">Loading Orders...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl space-y-8 bg-background text-foreground transition-colors duration-300 min-h-screen">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Orders Management</h1>
          <p className="text-muted-foreground mt-1">Track and manage your customer orders.</p>
        </div>
        <div className="flex items-center gap-2 bg-muted p-2 rounded-lg">
          <Clock size={16} /> <span className="text-xs font-medium">Total: {orders.length} Orders</span>
        </div>
      </header>

      {/* --- Filter Section --- */}
      <section className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl shadow-sm border border-border bg-card">
        <div className="w-full sm:w-64 space-y-1.5">
          <label className="text-xs font-bold uppercase text-muted-foreground ml-1">Order Status</label>
          <Select value={filters.orderStatus} onValueChange={(val) => setFilters(prev => ({ ...prev, orderStatus: val }))}>
            <SelectTrigger className="bg-muted border-border"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all_statuses">All Order Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-64 space-y-1.5">
          <label className="text-xs font-bold uppercase text-muted-foreground ml-1">Payment Status</label>
          <Select value={filters.paymentStatus} onValueChange={(val) => setFilters(prev => ({ ...prev, paymentStatus: val }))}>
            <SelectTrigger className="bg-muted border-border"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all_payments">All Payment Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      {/* --- Orders List --- */}
      <main className="space-y-6">
        {orders.length === 0 ? (
          <div className="bg-muted border-2 border-dashed border-border rounded-2xl py-20 text-center">
            <p className="text-muted-foreground">No orders match your current filters.</p>
          </div>
        ) : (
          orders.map((order) => (
            <Card key={order._id} className="border-border shadow-md hover:shadow-lg transition-all overflow-hidden bg-card">
              <CardHeader className="bg-muted/50 border-b border-border p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg text-foreground">Order #{order._id.slice(-8).toUpperCase()}</CardTitle>
                      {/* PAYMENT METHOD BADGE */}
                      <Badge variant="outline" className={`flex items-center gap-1 font-bold ${order.paymentMethod === 'cod' ? 'border-orange-500 text-orange-600' : 'border-blue-500 text-blue-600'}`}>
                        {order.paymentMethod === 'cod' ? <Banknote size={12} /> : <CreditCard size={12} />}
                        {order.paymentMethod === 'cod' ? 'COD' : 'ONLINE'}
                      </Badge>
                    </div>
                    <div className="text-sm text-foreground font-medium">
                      {order.user?.name}
                      <span className="mx-2 text-border hidden sm:inline">|</span>
                      <span className="block sm:inline font-normal text-muted-foreground">{order.user?.email}</span>
                    </div>
                  </div>
                  <div className="pt-3 sm:pt-0 sm:text-right flex flex-col items-end">
                    <div className={`px-3 py-1 rounded-full border text-[10px] font-bold uppercase mb-2 ${getStatusColor(order.paymentStatus)}`}>
                      Payment: {order.paymentStatus}
                    </div>
                    <span className="text-2xl font-black text-primary">Rs. {order.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-4 sm:p-6 space-y-6">
                {/* STATUS TOGGLES WITH COLOR HINTS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Order Flow</label>
                    <Select value={order.orderStatus} onValueChange={(v) => handleStatusUpdate(order._id, "orderStatus", v)}>
                      <SelectTrigger className={`w-full border-border bg-background ${order.orderStatus === 'cancelled' ? 'border-red-500 text-red-500' : ''}`}><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled" className="text-red-500">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Payment Record</label>
                    <Select value={order.paymentStatus} onValueChange={(v) => handleStatusUpdate(order._id, "paymentStatus", v)}>
                      <SelectTrigger className={`w-full border-border bg-background ${order.paymentStatus === 'paid' ? 'border-green-500 text-green-500' : ''}`}><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="paid" className="text-green-500">Paid</SelectItem>
                        <SelectItem value="failed" className="text-red-500">Failed</SelectItem>
                        <SelectItem value="refunded">Refunded</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* ITEMS LIST */}
                <div className="grid gap-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex gap-4 items-center bg-muted/30 border border-border p-3 rounded-xl">
                      <img src={item.image} alt={item.title} className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-lg border border-border" />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.size} | {item.color} | Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right font-bold text-sm">Rs. {(item.price * item.quantity).toLocaleString()}</div>
                    </div>
                  ))}
                </div>

                {/* ADDRESS & WARNINGS */}
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 bg-muted/50 rounded-xl p-4 border border-border flex items-start gap-3">
                    <div className="text-xl">📍</div>
                    <div className="text-xs">
                      <p className="font-bold uppercase text-muted-foreground mb-1">Shipping To:</p>
                      <p>{order.shippingAddress.fullName} - {order.shippingAddress.address}, {order.shippingAddress.city}</p>
                    </div>
                  </div>

                  {/* UI Alert for Cancelled/Failed */}
                  {(order.orderStatus === 'cancelled' || order.paymentStatus === 'failed') && (
                    <div className="flex-1 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-600">
                      <AlertCircle size={20} />
                      <div className="text-xs font-bold uppercase">
                        Attention: This order is {order.orderStatus === 'cancelled' ? 'CANCELLED' : 'PAYMENT FAILED'}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </main>
    </div>
  );
};

export default AdminOrders;