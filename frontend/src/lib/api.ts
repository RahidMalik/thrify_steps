/**
 * API Utility
 * Centralized API client for backend communication
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// --- Interfaces for Type Safety ---

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}


export interface Category {
  _id: string;
  name: string;
  slug?: string;
}

export interface Product {
  _id: string;
  title: string;
  brand: string;
  description: string;
  price: number;
  discountPrice?: number;
  stock: number;
  category: Category;
  images: string[];
  colors: string[];
  sizes: string[];
  rating: number;
  numReviews: number;
  isFeatured?: boolean;
}

export interface CartItem {
  _id: string;
  product: Product;
  quantity: number;
  size: string;
  color: string;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  totalPrice: number;
}

export interface Order {
  _id: string;
  id?: string;
  user: User;
  items: Array<{
    product: Product;
    quantity: number;
    size: string;
    color: string;
    price: number;
  }>;
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone: string;
  };
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  totalAmount: number;
  createdAt: string;
}

export interface PromoCode {
  _id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountAmount: number;
  minOrderAmount: number;
  expiryDate: string;
  isActive: boolean;
}

export interface PromoCodeValidation {
  discount: number;
  code: string;
  promoCode?: {
    _id: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
  };
}
interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}

export interface User {
  _id: string;
  id?: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  avatar?: string;
  isGoogleUser?: boolean;
}

// --- ApiClient Class ---

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  getToken(): string | null {
    return this.token || localStorage.getItem('token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getToken();

    const headers: HeadersInit = { ...options.headers };

    if (options.body && !(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      let data: ApiResponse<T>;
      const contentType = response.headers.get('content-type');

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(text || `HTTP ${response.status}: ${response.statusText}`);
      }

      if (!response.ok) {
        const errorMessage = data.message || data.error || `Request failed with status ${response.status}`;
        const error = new Error(errorMessage) as Error & Record<string, unknown>;
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw error;
      }
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Network error. Please check your connection and ensure the server is running.');
      }
      throw error;
    }
  }

  // Auth endpoints
  async register(name: string, email: string, password: string) {
    const response = await this.request<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    if (response.data?.token) {
      this.setToken(response.data.token);
    }
    return response;
  }

  async login(email: string, password: string) {
    const response = await this.request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (response.data?.token) {
      this.setToken(response.data.token);
    }
    return response;
  }


  async forgotPassword(email: string) {
    return this.request<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, password: string) {
    return this.request<{ message: string }>(`/auth/reset-password/${token}`, {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
  }

  // api.ts file ke andar ApiClient class mein:
  async googleLogin(data: { email: string | null; name: string | null; uid: string }) {
    const response = await this.request<AuthResponse>('/auth/google-login', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (response.success && response.data?.token) {
      this.setToken(response.data.token);
    }

    return response;
  }



  async getMe() {
    return this.request<{ user: User }>('/auth/me');
  }

  async updateProfile(formData: FormData) {
    return this.request<{ user: User }>('/auth/profile', {
      method: 'PUT',
      body: formData,
    });
  }

  async removeAvatar() {
    return this.request('/auth/profile/avatar', { method: 'DELETE' });
  }

  // Cart endpoints
  async getCart() {
    return this.request<{ cart: Cart }>('/auth/cart');
  }

  async addToCart(productId: string, quantity: number, size: string, color: string) {
    return this.request<{ cart: Cart }>('/auth/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity, size, color }),
    });
  }

  async updateCartItem(itemId: string, quantity: number) {
    return this.request<{ cart: Cart }>(`/auth/cart/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  }

  async removeFromCart(itemId: string) {
    return this.request<{ cart: Cart }>(`/auth/cart/${itemId}`, {
      method: 'DELETE',
    });
  }

  // Product endpoints
  async getProducts(params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    sortOrder?: string;
    featured?: boolean;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString();
    return this.request<{
      products: Product[];
      pagination: {
        currentPage: number;
        totalPages: number;
        totalProducts: number;
        limit: number
      }
    }>(`/products${query ? `?${query}` : ''}`);
  }

  async getProduct(id: string) {
    return this.request<{ product: Product }>(`/products/${id}`);
  }

  async getBrands() {
    return this.request<{ brands: string[] }>('/products/brands');
  }

  // Order endpoints
  async createOrder(orderData: object) {
    return this.request<{ order: Order }>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getMyOrders(page = 1, limit = 10) {
    return this.request<{ orders: Order[]; total: number; pages: number }>(`/orders/my?page=${page}&limit=${limit}`);
  }

  async getOrder(id: string) {
    return this.request<{ order: Order }>(`/orders/${id}`);
  }

  // Payment endpoints
  async createPaymentIntent(amount: number, currency = 'usd', description?: string) {
    return this.request<{ clientSecret: string; paymentIntentId: string }>('/payments/create-intent', {
      method: 'POST',
      body: JSON.stringify({ amount, currency, description }),
    });
  }

  // Promo code endpoints
  async validatePromoCode(code: string, subtotal: number) {
    return this.request<PromoCodeValidation>('/promo-codes/validate', {
      method: 'POST',
      body: JSON.stringify({ code, subtotal }),
    });
  }

  async createCategory(data: { name: string; slug: string }) {
    return this.request<{ success: boolean; category: Category }>('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getCategories() {
    return this.request<{ categories: Category[] }>('/categories', {
      method: 'GET'
    });
  }


  // Admin endpoints
  async getAdminStats() {
    return this.request<Record<string, number | string>>('/admin/stats');
  }

  // Admin - User Management
  async getAllUsers(page = 1, limit = 20) {
    // Yahan humne bataya ke response mein users ka array aur pagination ka object aayega
    return this.request<{
      users: User[];
      pagination: {
        currentPage: number;
        totalPages: number;
        totalUsers: number;
        limit: number;
      }
    }>(`/admin/users?page=${page}&limit=${limit}`);
  }

  async deleteUser(id: string) {
    return this.request<{ success: boolean; message: string }>(`/admin/users/${id}`, {
      method: 'DELETE',
    });
  }

  async getAllOrders(page = 1, limit = 20, filters?: Record<string, string>) {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    return this.request<{ orders: Order[]; total: number }>(`/orders?${params}`);
  }

  async updateOrderStatus(orderId: string, statusData: { orderStatus?: string; paymentStatus?: string }) {
    return this.request<{ order: Order }>(`/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify(statusData),
    });
  }
  // --- Promo code Admin endpoints (Fixed Types) ---

  async getAllPromoCodes(page: number = 1, limit: number = 100) {
    return this.request<{ promoCodes: PromoCode[] }>(`/promo-codes?page=${page}&limit=${limit}`, {
      method: 'GET'
    });
  }

  async createPromoCode(promoData: Partial<PromoCode>) {
    return this.request<{ promoCode: PromoCode }>('/promo-codes', {
      method: 'POST',
      body: JSON.stringify(promoData),
    });
  }

  async updatePromoCode(id: string, promoData: Partial<PromoCode>) {
    return this.request<{ promoCode: PromoCode }>(`/promo-codes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(promoData),
    });
  }

  async deletePromoCode(id: string) {
    return this.request<{ message: string }>(`/promo-codes/${id}`, {
      method: 'DELETE',
    });
  }

  // Admin - Products (Cloudinary/Multer Friendly)
  async createProduct(productData: FormData) {
    return this.request<{ product: Product }>('/products', {
      method: 'POST',
      body: productData, // Direct FormData
    });
  }

  async searchProducts(query: string) {
    return this.request<{ products: Product[] }>(`/products?search=${query}&limit=8`);
  }

  async updateProduct(id: string, productData: FormData) {
    return this.request<{ product: Product }>(`/products/${id}`, {
      method: 'PUT',
      body: productData, // Direct FormData
    });
  }

  async deleteProduct(id: string) {
    return this.request<{ message: string }>(`/products/${id}`, {
      method: 'DELETE',
    });
  }
}


export const api = new ApiClient(API_BASE_URL);
export default api;