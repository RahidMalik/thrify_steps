import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Ticket, Calendar, BarChart, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import api from "@/lib/api";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const AdminPromoCodes = () => {
  const [promoCodes, setPromoCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discountType: "percentage" as "percentage" | "fixed",
    discountValue: "",
    minPurchaseAmount: "",
    maxDiscountAmount: "",
    validFrom: "",
    validUntil: "",
    usageLimit: "",
    isActive: true,
  });

  useEffect(() => {
    loadPromoCodes();
  }, []);

  const loadPromoCodes = async () => {
    try {
      setLoading(true);
      const response = await api.getAllPromoCodes(1, 100);
      if (response.data?.promoCodes) {
        setPromoCodes(response.data.promoCodes);
      }
    } catch (error) {
      console.error("Failed to load promo codes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const promoData = {
        ...formData,
        discountValue: parseFloat(formData.discountValue),
        minPurchaseAmount: parseFloat(formData.minPurchaseAmount) || 0,
        maxDiscountAmount: formData.maxDiscountAmount ? parseFloat(formData.maxDiscountAmount) : null,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
      };

      if (editing) {
        await api.updatePromoCode(editing._id, promoData);
        toast.success("Promo code updated!");
      } else {
        await api.createPromoCode(promoData);
        toast.success("Promo code created!");
      }

      setOpen(false);
      resetForm();
      loadPromoCodes();
    } catch (error: any) {
      toast.error(error.message || "Operation failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this promo code?")) return;
    try {
      await api.deletePromoCode(id);
      toast.success("Deleted!");
      loadPromoCodes();
    } catch (error: any) {
      toast.error("Failed to delete");
    }
  };

  const handleEdit = (promo: any) => {
    setEditing(promo);
    setFormData({
      code: promo.code || "",
      description: promo.description || "",
      discountType: promo.discountType || "percentage",
      discountValue: promo.discountValue?.toString() || "",
      minPurchaseAmount: promo.minPurchaseAmount?.toString() || "",
      maxDiscountAmount: promo.maxDiscountAmount?.toString() || "",
      validFrom: promo.validFrom ? new Date(promo.validFrom).toISOString().split("T")[0] : "",
      validUntil: promo.validUntil ? new Date(promo.validUntil).toISOString().split("T")[0] : "",
      usageLimit: promo.usageLimit?.toString() || "",
      isActive: promo.isActive !== false,
    });
    setOpen(true);
  };

  const resetForm = () => {
    setFormData({
      code: "",
      description: "",
      discountType: "percentage",
      discountValue: "",
      minPurchaseAmount: "",
      maxDiscountAmount: "",
      validFrom: "",
      validUntil: "",
      usageLimit: "",
      isActive: true,
    });
    setEditing(null);
  };

  return (
    <div className="container mx-auto px-4 py-4 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Promo Codes</h1>
          <p className="text-muted-foreground text-sm">Create and manage discount offers</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="w-full sm:w-auto shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4 mr-2" />
              Add New Code
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto rounded-xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-primary" />
                {editing ? "Edit Promo Code" : "Create New Offer"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="code" className="text-xs font-bold uppercase text-gray-500 ml-1">Unique Code *</Label>
                  <Input
                    id="code"
                    placeholder="E.G. SUMMER50"
                    className="font-mono font-bold uppercase"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discountType" className="text-xs font-bold uppercase text-gray-500 ml-1">Type *</Label>
                  <select
                    id="discountType"
                    className="w-full h-10 px-3 py-2 border rounded-md bg-transparent text-sm focus:ring-2 focus:ring-primary outline-none"
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value as "percentage" | "fixed" })}
                    required
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (Rs.)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discountValue" className="text-xs font-bold uppercase text-gray-500 ml-1">Value *</Label>
                  <Input
                    id="discountValue"
                    type="number"
                    placeholder="10"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minPurchaseAmount" className="text-xs font-bold uppercase text-gray-500 ml-1">Min. Order</Label>
                  <Input
                    id="minPurchaseAmount"
                    type="number"
                    placeholder="500"
                    value={formData.minPurchaseAmount}
                    onChange={(e) => setFormData({ ...formData, minPurchaseAmount: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 border-t">
                <div className="space-y-2">
                  <Label htmlFor="validFrom" className="text-xs font-bold uppercase text-gray-500 ml-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Starts From *
                  </Label>
                  <Input
                    id="validFrom"
                    type="date"
                    value={formData.validFrom}
                    onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="validUntil" className="text-xs font-bold uppercase text-gray-500 ml-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Ends At *
                  </Label>
                  <Input
                    id="validUntil"
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-xs font-bold uppercase text-gray-500 ml-1">Promo Description</Label>
                <Input
                  id="description"
                  placeholder="Tell customers what this code is for..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="flex items-center gap-2  p-3 rounded-lg border">
                <input
                  type="checkbox"
                  id="isActive"
                  className="w-4 h-4 accent-primary"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                <Label htmlFor="isActive" className="cursor-pointer font-medium">Activate this code immediately</Label>
              </div>

              <Button type="submit" className="w-full h-12 text-lg font-bold">
                {editing ? "Save Changes" : "Launch Promo Code"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Grid Content */}
      {loading ? (
        <div className="text-center py-20 font-medium text-muted-foreground animate-pulse">Fetching Promo Codes...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          {promoCodes.map((promo) => (
            <Card key={promo._id} className="relative group overflow-hidden border shadow-sm hover:shadow-md transition-all duration-300">
              {/* Top Status Bar */}
              <div className={`h-1.5 w-full ${promo.isActive ? "bg-green-500" : "bg-red-400"}`} />

              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="bg-primary/10 text-primary px-3 py-1 rounded-md font-mono font-bold tracking-wider text-lg border border-primary/20">
                    {promo.code}
                  </div>
                  <Badge variant={promo.isActive ? "secondary" : "destructive"} className="text-[10px] uppercase">
                    {promo.isActive ? "Active" : "Disabled"}
                  </Badge>
                </div>
                <CardTitle className="text-sm mt-3 font-semibold text-gray-700">
                  {promo.description || "No description provided"}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className=" p-3 rounded-xl space-y-2.5 border ">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1.5"><Ticket className="w-3.5 h-3.5" /> Benefit</span>
                    <span className="font-bold text-blue-600">
                      {promo.discountType === "percentage" ? `${promo.discountValue}% OFF` : `Rs. ${promo.discountValue} FLAT`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1.5"><BarChart className="w-3.5 h-3.5" /> Usage</span>
                    <span className="font-medium text-gray-700">
                      {promo.usedCount} / {promo.usageLimit || "∞"} used
                    </span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-slate-200">
                    <span className="text-muted-foreground flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Validity</span>
                    <span className="text-[11px] font-medium text-gray-600">
                      {new Date(promo.validUntil).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} expiry
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(promo)}
                    className="flex-1 h-9 border-slate-200 hover:bg-slate-50"
                  >
                    <Edit className="w-3.5 h-3.5 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(promo._id)}
                    className="flex-1 h-9 opacity-80 hover:opacity-100"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && promoCodes.length === 0 && (
        <div className="text-center py-20 rounded-3xl border-2 border-dashed">
          <Ticket className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">No active promo codes found. Start by creating one!</p>
        </div>
      )}
    </div>
  );
};

export default AdminPromoCodes;