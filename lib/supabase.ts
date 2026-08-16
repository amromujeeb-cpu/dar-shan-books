// عميل Supabase — يُستخدم من مكونات العميل (Client Components)
// وثّقي القيم في .env.local محلياً، وفي إعدادات Vercel عند النشر.
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// أنواع البيانات الأساسية — طابقيها مع جداول supabase (راجعي SPEC.md)
export type Book = {
  id: string;
  title: string;
  author: string;
  category: string;
  price: number;
  compare_at_price: number | null;
  stock: number;
  description: string;
  isbn: string | null;
  pages: number | null;
  cover_url: string | null;
  created_at: string;
};

export type Order = {
  id: string;
  user_id: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  total: number;
  shipping_address: Record<string, string>;
  payment_method: "card" | "cod" | "wallet";
  created_at: string;
};
