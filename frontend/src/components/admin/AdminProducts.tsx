import { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Image as ImageIcon,
  Box,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import api from "@/lib/api";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectTrigger, SelectValue, SelectItem } from "../ui/select";

interface ICategory {
  _id: string;
  name: string;
}
interface IProduct {
  _id: string;
  title: string;
  brand?: string;
  price: number;
  discountPrice?: number;
  description: string;
  sizes: string[];
  colors: string[];
  stock: number;
  category: ICategory | string;
  images: string[];
  isFeatured?: boolean;
}

const AdminProducts = () => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<IProduct | null>(null);
  const [newCatName, setNewCatName] = useState("");

  // Naya state images ki files ko store karne ke liye
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    brand: "",
    price: "",
    discountPrice: "",
    description: "",
    sizes: "",
    colors: "",
    stock: "",
    category: "",
    isFeatured: false,
  });

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await api.getProducts({ limit: 100 });
      if (response.data?.products) setProducts(response.data.products);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    const response = await api.getCategories();
    if (response.data?.categories) setCategories(response.data.categories);
  };

  const handleCreateCategory = async () => {
    if (!newCatName.trim()) return toast.error("Category name cannot be empty.");
    try {
      const response = await api.createCategory({
        name: newCatName.trim(),
        slug: newCatName.trim().toLowerCase().replace(/\s+/g, '-')
      });
      if (response) {
        toast.success("Category added!");
        setNewCatName("");
        await loadCategories();
      }
    } catch (error) {
      toast.error("Error adding category!");
    }
  };

  // --- Image Handling Updated for Cloudinary ---
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    setSelectedFiles((prev) => [...prev, ...newFiles]);

    // Preview generation
    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImagePreview((prev) => prev.filter((_, i) => i !== index));
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const mainPrice = parseFloat(formData.price);
    const discPrice = formData.discountPrice ? parseFloat(formData.discountPrice) : 0;

    if (discPrice > 0 && discPrice >= mainPrice) {
      return toast.error("Discount price must be less than Original price");
    }

    // Checking if images exist (either new files or existing URLs if editing)
    if (selectedFiles.length === 0 && imagePreview.length === 0) {
      return toast.error("Please upload at least one product image.");
    }

    try {
      // --- FormData creation for Backend ---
      const data = new FormData();
      data.append("title", formData.title);
      data.append("brand", formData.brand);
      data.append("price", formData.price);
      data.append("discountPrice", formData.discountPrice);
      data.append("description", formData.description);
      data.append("stock", formData.stock);
      data.append("category", formData.category);
      data.append("isFeatured", String(formData.isFeatured));
      data.append("sizes", formData.sizes); // Backend will split it
      data.append("colors", formData.colors); // Backend will split it

      // Nayi files append karein
      selectedFiles.forEach((file) => {
        data.append("images", file);
      });

      // Agar editing ho rahi hai aur purani images bachi hain
      if (editing && selectedFiles.length === 0) {
        // Note: Backend logic handles existing images or we can send URLs
        // For now, if no new files, we assume existing ones stay.
      }

      if (editing) {
        await api.updateProduct(editing._id, data);
        toast.success("Product updated!");
      } else {
        await api.createProduct(data);
        toast.success("Product created!");
      }

      setOpen(false);
      resetForm();
      loadProducts();
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Error saving product");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete product?")) return;
    try {
      await api.deleteProduct(id);
      toast.success("Deleted!");
      loadProducts();
    } catch (error) {
      toast.error("Error deleting");
    }
  };

  const handleEdit = (product: IProduct) => {
    const categoryId = typeof product.category === "object" ? product.category?._id : product.category;
    setEditing(product);
    setFormData({
      title: product.title,
      brand: product.brand || "",
      price: product.price.toString(),
      discountPrice: product.discountPrice?.toString() || "",
      description: product.description,
      sizes: product.sizes?.join(", ") || "",
      colors: product.colors?.join(", ") || "",
      stock: product.stock.toString(),
      category: categoryId || "",
      isFeatured: product.isFeatured || false,
    });
    setImagePreview(product.images || []);
    setSelectedFiles([]); // Reset new files when editing starts
    setOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      brand: "",
      price: "",
      discountPrice: "",
      description: "",
      sizes: "",
      colors: "",
      stock: "",
      category: "",
      isFeatured: false,
    });
    setImagePreview([]);
    setSelectedFiles([]);
    setEditing(null);
  };

  return (
    <div className="container mx-auto px-2 py-4 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold flex items-center gap-2">
            <Box className="w-8 h-8 text-primary" /> Products
          </h1>
          <p className="text-muted-foreground text-sm">Manage your store inventory</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" /> Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto rounded-xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                {editing ? "Update Inventory" : "New Collection Item"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase">Basic Info</Label>
                  <Input
                    placeholder="Product Title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                  <Input
                    placeholder="Brand Name (Optional)"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase">Price (Rs.)</Label>
                    <Input
                      type="number"
                      placeholder="5000"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase">Discounted</Label>
                    <Input
                      type="number"
                      placeholder="4500"
                      value={formData.discountPrice}
                      onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase">Category</Label>
                  <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="New category..."
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      className="h-9"
                    />
                    <Button type="button" onClick={handleCreateCategory} variant="outline" className="h-9">Add</Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase">Colors</Label>
                  <Input
                    placeholder="Red, Blue, Black"
                    value={formData.colors}
                    onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Sizes (S, M, L)"
                    value={formData.sizes}
                    onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                    required
                  />
                  <Input
                    placeholder="Stock Quantity"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase">Description</Label>
                  <Textarea
                    className="min-h-[100px]"
                    placeholder="Product details..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase">Media</Label>
                  <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-slate-50 transition relative">
                    <Input
                      type="file"
                      multiple
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={handleImageUpload}
                    />
                    <ImageIcon className="w-8 h-8 mx-auto text-muted-foreground" />
                    <p className="text-xs mt-2 text-muted-foreground">Click to upload images</p>
                  </div>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {imagePreview.map((img, idx) => (
                      <div key={idx} className="relative group rounded overflow-hidden h-16 border">
                        <img src={img} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl opacity-0 group-hover:opacity-100"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-4">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-4 h-4 accent-primary"
                  />
                  <Label htmlFor="featured" className="font-semibold">Mark as Featured</Label>
                </div>
              </div>

              <Button type="submit" className="md:col-span-2 h-12 text-lg shadow-lg">
                {editing ? "Save Product Changes" : "Publish to Store"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-slate-100 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <Card key={product._id} className="group overflow-hidden border shadow-sm hover:shadow-xl transition-all duration-300">
              <div className="relative aspect-square overflow-hidden bg-slate-100">
                <img
                  src={product.images?.[0] || ""}
                  alt={product.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {product.isFeatured && (
                  <Badge className="absolute top-2 left-2 bg-yellow-400 text-black border-none">Featured</Badge>
                )}
              </div>
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-bold text-sm md:text-base line-clamp-1">{product.title}</h3>
                  <Badge variant="outline" className="text-[10px] shrink-0">{product.brand}</Badge>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-black text-primary">Rs. {product.discountPrice || product.price}</span>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(product)} className="flex-1 h-8 text-xs">
                    <Edit className="w-3 h-3 mr-1" /> Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(product._id)} className="h-8 text-xs text-red-500">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminProducts;