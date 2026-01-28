import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/lib/api';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

interface CartItem {
  _id: string;
  product: any;
  quantity: number;
  size: string;
  color: string;
}

interface CartContextType {
  cart: CartItem[];
  loading: boolean;
  addToCart: (productId: string, quantity: number, size: string, color: string) => Promise<void>;
  updateCartItem: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  getCartTotal: () => number;
  getCartCount: () => number;
  refreshCart: () => Promise<void>;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadCart();
    } else {
      setCart([]);
    }
  }, [user]);

  const loadCart = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await api.getCart();

      if (response.data?.cart) {

        const cartArray = Array.isArray(response.data.cart)
          ? response.data.cart
          : response.data.cart.items || [];

        setCart(cartArray as CartItem[]);
      }
    } catch (error) {
      console.error('Failed to load cart:', error);
      setCart([]);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId: string, quantity: number, size: string, color: string) => {
    if (!user) {
      toast.error('Please login to add items to cart');
      return;
    }

    try {
      const response = await api.addToCart(productId, quantity, size, color);

      if (response.data?.cart) {
        const cartArray = Array.isArray(response.data.cart)
          ? response.data.cart
          : response.data.cart.items || [];

        setCart(cartArray as CartItem[]);
        toast.success('Item added to cart!');
      }
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || 'Failed to add item to cart');
      throw err;
    }
  };

  const updateCartItem = async (itemId: string, quantity: number) => {
    if (!user) return;

    try {
      const response = await api.updateCartItem(itemId, quantity);

      if (response.data?.cart) {
        const cartArray = Array.isArray(response.data.cart)
          ? response.data.cart
          : response.data.cart.items || [];

        setCart(cartArray as CartItem[]);
        toast.success('Cart updated');
      }
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || 'Failed to update');
      console.error('Update error:', err);
    }
  };

  const removeFromCart = async (itemId: string) => {
    if (!user) return;

    try {
      const response = await api.removeFromCart(itemId);

      if (response.data?.cart) {
        const cartArray = Array.isArray(response.data.cart)
          ? response.data.cart
          : response.data.cart.items || [];

        setCart(cartArray as CartItem[]);
        toast.success('Item removed');
      }
    } catch (error) {
      const err = error as Error;
      toast.error('Failed to remove item');
      console.error('Remove error:', err);
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const price = item.product?.discountPrice || item.product?.price || 0;
      return total + price * item.quantity;
    }, 0);
  };

  const getCartCount = () => {
    return cart.length;
  };

  const refreshCart = async () => {
    await loadCart();
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        addToCart,
        updateCartItem,
        removeFromCart,
        getCartTotal,
        getCartCount,
        refreshCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}