import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { User as UserIcon, Package, Camera, Loader2, Trash2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { toast } from "sonner";

const Profile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(user?.avatar || "");

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  useEffect(() => {
    if (user) {
      setProfileData({ name: user.name || "", email: user.email || "" });
      setPreviewUrl(user.avatar || "");
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await api.getMyOrders();
      const data = response.data as any;
      if (data?.orders) setOrders(data.orders);
    } catch (error) {
      console.error("Orders error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (previewUrl && previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      // Reset the input value so the same file can be selected again after deletion
      e.target.value = "";
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const formData = new FormData();
      formData.append("name", profileData.name);
      formData.append("email", profileData.email);
      if (selectedFile) formData.append("avatar", selectedFile);

      const response = await api.updateProfile(formData);
      const data = response.data as any;

      if (data?.user) {
        updateUser(data.user);
        toast.success("Profile updated!");
        setSelectedFile(null);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Update failed");
    } finally {
      setUpdating(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!confirm("Remove profile picture?")) return;
    setUpdating(true);
    try {
      const response = await api.removeAvatar();
      const data = response.data as any;

      if (response.success) {
        updateUser(data.user);
        setPreviewUrl("");
        setSelectedFile(null);
        toast.success("Photo removed");
      }
    } catch (error: any) {
      toast.error("Failed to remove photo");
    } finally {
      setUpdating(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50/30 font-sans">
      <Navbar />
      <main className="pt-24 pb-20">
        <section className="container-custom max-w-5xl mx-auto px-4">
          <h1 className="text-3xl font-extrabold mb-8 text-slate-900 tracking-tight">My Account</h1>

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full max-w-[400px] grid-cols-2 mb-8 bg-white border shadow-sm p-1 rounded-xl">
              <TabsTrigger value="profile" className="rounded-lg">Settings</TabsTrigger>
              <TabsTrigger value="orders" className="rounded-lg">Orders History</TabsTrigger>
            </TabsList>

            {/* Profile Settings */}
            <TabsContent value="profile">
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm transition-all">
                <div className="flex flex-col items-center md:items-start gap-8 mb-10">

                  <div className="relative">
                    {/* Avatar Circle - Back to Rounded Full */}
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl bg-slate-100 flex items-center justify-center ring-1 ring-slate-200">
                      {previewUrl ? (
                        <img src={previewUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon className="w-14 h-14 text-slate-400" />
                      )}
                    </div>

                    {/* Delete Icon - Floating Side Top */}
                    {(user.avatar || selectedFile) && (
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        className="absolute top-0 -right-2 p-2 bg-white text-red-500 rounded-full shadow-lg border border-red-50 hover:bg-red-50 transition-all hover:scale-110 z-10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                    {/* Upload Icon - Bottom Right */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 p-2.5 bg-primary text-white rounded-full shadow-xl hover:bg-primary/90 transition-all hover:scale-110 ring-4 ring-white"
                    >
                      <Camera className="w-5 h-5" />
                    </button>

                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                  </div>

                  <div className="text-center md:text-left">
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{user.name}</h2>
                    <p className="text-slate-500 font-medium mb-3">{user.email}</p>
                    <Badge className="bg-primary/10 text-primary border-none px-4 py-1 rounded-full text-xs">
                      {user.role.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-lg">
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-semibold ml-1">Display Name</Label>
                    <Input
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="rounded-xl h-12 border-slate-200 focus:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-semibold ml-1">Email Address</Label>
                    <Input value={profileData.email} disabled className="rounded-xl h-12 bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed italic" />
                  </div>
                  <Button type="submit" className="w-full md:w-auto px-12 h-12 rounded-xl text-md font-bold shadow-lg shadow-primary/20" disabled={updating}>
                    {updating ? <Loader2 className="animate-spin" /> : "Save Changes"}
                  </Button>
                </form>
              </div>
            </TabsContent>

            {/* Orders Tab with Empty State Logic */}
            <TabsContent value="orders">
              <div className="grid gap-4">
                {loading ? (
                  <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-primary w-10 h-10" />
                  </div>
                ) : orders.length > 0 ? (
                  orders.map((order) => (
                    <div key={order._id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-50 rounded-lg">
                            <Package className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Order ID</p>
                            <p className="font-mono font-bold text-sm text-slate-700 uppercase">#{order._id.slice(-10)}</p>
                          </div>
                        </div>
                        <Badge variant={order.orderStatus === 'delivered' ? 'default' : 'secondary'} className="capitalize">
                          {order.orderStatus}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                        <p className="text-sm text-slate-500">{new Date(order.createdAt).toDateString()}</p>
                        <p className="text-lg font-black text-slate-900">Rs. {order.totalAmount.toLocaleString()}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  /* EMPTY STATE - Instead of Error */
                  <div className="bg-white p-16 rounded-3xl border border-dashed border-slate-300 text-center flex flex-col items-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                      <ShoppingBag className="w-10 h-10 text-slate-300" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">Your bag is empty</h3>
                    <p className="text-slate-500 mb-6 max-w-[250px] mx-auto mt-2">Looks like you haven't placed any orders yet. Start exploring our collection!</p>
                    <Button onClick={() => navigate("/products")} className="rounded-full px-8">
                      Shop Now
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;