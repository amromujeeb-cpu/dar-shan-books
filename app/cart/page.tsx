"use client";

import Link from "next/link";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import BookCover from "@/components/BookCover";
import { formatJOD } from "@/lib/format";
import { useCart } from "@/lib/cart-context";

const SHIPPING = 2.0;

export default function CartPage() {
  const { items, removeItem, updateQty, subtotal } = useCart();
  const total = items.length > 0 ? subtotal + SHIPPING : 0;

  return (
    <>
      <SiteNav />
      <div className="max-w-6xl mx-auto px-16 py-10">
        <h2 className="text-2xl font-extrabold mb-8">سلة المشتريات</h2>

        {items.length === 0 ? (
          <div className="text-center py-20 text-muted">
            <p className="mb-6">السلة فاضية لسا.</p>
            <Link href="/" className="bg-purple text-white px-8 py-3 rounded font-bold text-sm">تصفّحي الكتب</Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-[1fr_340px] gap-10">
            <div>
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 py-5 border-b border-line items-center">
                  <BookCover title={item.title} cover={item.cover} className="w-16 h-20" />
                  <div className="flex-1">
                    <h4 className="font-bold text-sm">{item.title}</h4>
                    <p className="text-xs text-muted mb-2">{item.author}</p>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-line rounded">
                        <button onClick={() => updateQty(item.id, item.qty - 1)} className="w-7 h-8 text-sm">−</button>
                        <span className="w-7 text-center text-sm font-bold">{item.qty}</span>
                        <button onClick={() => updateQty(item.id, item.qty + 1)} className="w-7 h-8 text-sm">+</button>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="text-xs text-red font-bold">إزالة</button>
                    </div>
                  </div>
                  <div className="font-extrabold text-sm">{formatJOD(item.price * item.qty)}</div>
                </div>
              ))}
            </div>
            <div className="bg-grey rounded-lg p-6 h-fit">
              <h3 className="font-extrabold mb-5">ملخص الطلب</h3>
              <div className="flex justify-between text-sm text-gray-600 mb-3"><span>المجموع الفرعي</span><span>{formatJOD(subtotal)}</span></div>
              <div className="flex justify-between text-sm text-gray-600 mb-3"><span>الشحن</span><span>{formatJOD(SHIPPING)}</span></div>
              <div className="flex justify-between font-extrabold border-t border-line pt-3"><span>الإجمالي</span><span>{formatJOD(total)}</span></div>
              <Link href="/checkout" className="block text-center bg-purple text-white rounded py-3 font-bold mt-4">المتابعة للدفع</Link>
            </div>
          </div>
        )}
      </div>
      <SiteFooter />
    </>
  );
}
