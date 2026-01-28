import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { User, Package, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { toast } from "sonner";

const Profile = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order");

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    loadOrders();
  }, [user]);

  const loadOrders = async () => {
    try {
      const response = await api.getMyOrders();
      if (response.data?.orders) {
        setOrders(response.data.orders);
      }
    } catch (error) {
      console.error("Failed to load orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const response = await api.updateProfile(profileData.name, profileData.email);
      if (response.data?.user) {
        updateUser(response.data.user);
        toast.success("Profile updated successfully!");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-20 pb-20">
        <section className="section-padding bg-background">
          <div className="container-custom max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">My Account</h1>

            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="mb-8">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="orders">Orders</TabsTrigger>
              </TabsList>

              {/* Profile Tab */}
              <TabsContent value="profile">
                <div className="bg-card p-8 rounded-lg border border-border">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{user.name}</h2>
                      <p className="text-muted-foreground">{user.email}</p>
                    </div>
                  </div>

                  <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-md">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        required
                      />
                    </div>

                    <Button type="submit" disabled={updating}>
                      {updating ? "Updating..." : "Update Profile"}
                    </Button>
                  </form>
                </div>
              </TabsContent>

              {/* Orders Tab */}
              <TabsContent value="orders">
                <div className="space-y-4">
                  {loading ? (
                    <div className="text-center py-12">Loading orders...</div>
                  ) : orders.length === 0 ? (
                    <div className="bg-card p-12 rounded-lg border border-border text-center">
                      <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-xl font-bold mb-2">No orders yet</h3>
                      <p className="text-muted-foreground mb-6">
                        Start shopping to see your orders here!
                      </p>
                      <Button onClick={() => navigate("/")}>Start Shopping</Button>
                    </div>
                  ) : (
                    orders.map((order) => (
                      <div
                        key={order._id}
                        className="bg-card p-6 rounded-lg border border-border"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-bold text-lg">
                              Order #{order._id?.slice(-8)?.toUpperCase()}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">
                              Rs. {order.totalAmount?.toLocaleString()}
                            </p>
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                                order.orderStatus === "delivered"
                                  ? "bg-green-100 text-green-800"
                                  : order.orderStatus === "shipped"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {order.orderStatus?.toUpperCase()}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          {order.items?.map((item: any, index: number) => (
                            <div key={index} className="flex gap-4 items-center">
                              <img
                                src={item.image || ""}
                                alt={item.title}
                                className="w-16 h-16 object-cover rounded"
                              />
                              <div className="flex-1">
                                <p className="font-medium">{item.title}</p>
                                <p className="text-sm text-muted-foreground">
                                  Size: {item.size} | Color: {item.color} | Qty: {item.quantity}
                                </p>
                              </div>
                              <p className="font-medium">
                                Rs. {(item.price * item.quantity).toLocaleString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
