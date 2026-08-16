"use client";

import { createContext, useContext, useEffect,useState, ReactNode } from "react";

export type CartItem = {
  id: string;
  title: string;
  author: string;
  price: number;
  cover?: string;
  qty: number;
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "qty">, qty?: number) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  subtotal: number;
  count: number;
};

const CartContext = createContext<CartContextType | null>(null);

// TODO: لما تربطي تسجيل الدخول، بدّلي هالـ state بجدول cart_items بقاعدة البيانات
// (أو خزّنيها بـ localStorage للزوار غير المسجلين ودمجيها بالسلة عند تسجيل الدخول)
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready,setReady]=useState(false);
  useEffect(()=>{setItems(JSON.parse(localStorage.getItem("darshan-cart")||"[]"));setReady(true)},[]);
  useEffect(()=>{if(ready)localStorage.setItem("darshan-cart",JSON.stringify(items))},[items,ready]);

  function addItem(item: Omit<CartItem, "qty">, qty = 1) {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, qty: i.qty + qty } : i));
      }
      return [...prev, { ...item, qty }];
    });
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function updateQty(id: string, qty: number) {
    if (qty < 1) return;
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, qty } : i)));
  }

  function clearCart() {
    setItems([]);
  }

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const count = items.reduce((s, i) => s + i.qty, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, subtotal, count }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart لازم تُستخدم جوا CartProvider");
  return ctx;
}
