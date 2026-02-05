import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

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

  if (loading) return <div className="p-20 text-center font-semibold text-muted-foreground bg-background">Loading Orders...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl space-y-8 bg-background text-foreground transition-colors duration-300 min-h-screen">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Orders Management</h1>
        <p className="text-muted-foreground mt-1">Track and manage your customer orders.</p>
      </header>

      {/* --- Filter Section --- */}
      <section className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl shadow-sm border border-border bg-card">
        <div className="w-full sm:w-64 space-y-1.5">
          <label className="text-xs font-bold uppercase text-muted-foreground ml-1">Order Status</label>
          <Select
            value={filters.orderStatus}
            onValueChange={(val) => setFilters(prev => ({ ...prev, orderStatus: val }))}
          >
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
          <Select
            value={filters.paymentStatus}
            onValueChange={(val) => setFilters(prev => ({ ...prev, paymentStatus: val }))}
          >
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
            <Card key={order._id} className="border-border shadow-md hover:shadow-lg transition-shadow overflow-hidden bg-card">
              <CardHeader className="bg-muted/50 border-b border-border p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="space-y-1">
                    <CardTitle className="text-lg text-foreground">Order #{order._id.slice(-8).toUpperCase()}</CardTitle>
                    <div className="text-sm text-foreground font-medium">
                      {order.user?.name}
                      <span className="mx-2 text-border hidden sm:inline">|</span>
                      <span className="block sm:inline font-normal text-muted-foreground">{order.user?.email}</span>
                    </div>
                    <time className="text-[11px] text-muted-foreground block mt-1">
                      {new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' })}
                    </time>
                  </div>
                  <div className="pt-3 sm:pt-0 sm:text-right border-t sm:border-0 border-border">
                    <span className="text-xs text-muted-foreground uppercase font-bold block mb-1">Total Amount</span>
                    <span className="text-2xl font-black text-primary">Rs. {order.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-4 sm:p-6 space-y-8 bg-card">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Update Order Status</label>
                    <Select value={order.orderStatus} onValueChange={(v) => handleStatusUpdate(order._id, "orderStatus", v)}>
                      <SelectTrigger className="w-full border-border bg-background"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Update Payment Status</label>
                    <Select value={order.paymentStatus} onValueChange={(v) => handleStatusUpdate(order._id, "paymentStatus", v)}>
                      <SelectTrigger className="w-full border-border bg-background"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                        <SelectItem value="refunded">Refunded</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-bold flex items-center gap-2 text-foreground">
                    <span className="w-6 h-px bg-border"></span> Order Items
                  </h4>
                  <div className="grid gap-3">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex gap-4 items-center bg-muted/30 border border-border p-3 rounded-xl">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-14 h-14 sm:w-20 sm:h-20 object-cover rounded-lg shadow-sm border border-border"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm sm:text-base truncate text-foreground">{item.title}</p>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-muted-foreground">
                            <span>Qty: <b className="text-foreground">{item.quantity}</b></span>
                            <span>Size: <b className="text-foreground">{item.size}</b></span>
                            <span>Color: <b className="text-foreground">{item.color}</b></span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-foreground">Rs. {(item.price * item.quantity).toLocaleString()}</p>
                          <p className="text-[10px] text-muted-foreground">Rs. {item.price}/pc</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {order.shippingAddress && (
                  <div className="bg-primary/10 rounded-2xl p-4 border border-primary/20 flex flex-col sm:flex-row gap-4">
                    <div className="bg-primary text-primary-foreground w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                      🚚
                    </div>
                    <div className="text-sm leading-relaxed">
                      <p className="font-bold text-primary mb-1">Shipping Details</p>
                      <p className="text-foreground opacity-90">
                        {order.shippingAddress.fullName} <br />
                        {order.shippingAddress.address}, {order.shippingAddress.city} <br />
                        {order.shippingAddress.state} {order.shippingAddress.zipCode}, {order.shippingAddress.country}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </main>
    </div>
  );
};

export default AdminOrders;