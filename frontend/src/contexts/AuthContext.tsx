import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api, { User } from '@/lib/api';
import { toast } from 'sonner';
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithPopup } from "firebase/auth";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>; // Added this
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.setToken(token);
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  const loadUser = async () => {
    try {
      setLoading(true);
      const response = await api.getMe();
      if (response.success && response.data?.user) {
        setUser(response.data.user);
      } else {
        localStorage.removeItem('token');
        api.setToken(null);
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to load user:', error);
      localStorage.removeItem('token');
      api.setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await api.login(email, password);
      if (response.success && response.data?.token && response.data?.user) {
        api.setToken(response.data.token);
        setUser(response.data.user);
        toast.success('Login successful!');
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || 'Login failed');
      throw err;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await api.register(name, email, password);
      if (response.success && response.data?.token && response.data?.user) {
        api.setToken(response.data.token);
        setUser(response.data.user);
        toast.success('Registration successful!');
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || 'Registration failed');
      throw err;
    }
  };

  //  GOOGLE LOGIN FIXED HERE (Inside the Provider)
  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const googleUser = result.user;

      // Send data to backend (Ensure your api.googleLogin is working)
      const response = await api.googleLogin({
        email: googleUser.email,
        name: googleUser.displayName,
        uid: googleUser.uid
      });

      if (response.success && response.data?.token) {
        api.setToken(response.data.token);
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
        toast.success('Welcome with Google!');
      }
    } catch (error) {
      const err = error as Error;
      const errorMessage = err.message || "Google Sign-in failed";
      toast.error(errorMessage);
      console.error('Google Auth Error:', err);
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    api.setToken(null);
    localStorage.removeItem('token');
    toast.success('Logged out successfully');
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        loginWithGoogle, // Added to Provider
        logout,
        updateUser,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}