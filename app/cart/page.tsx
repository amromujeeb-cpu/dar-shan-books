"use client";
import Link from "next/link";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import BookCover from "@/components/BookCover";
import { formatJOD } from "@/lib/format";
import { useCart } from "@/lib/cart-context";
const SHIPPING = 2;
export default function CartPage() {
  const { items, removeItem, updateQty, subtotal } = useCart();
  const total = items.length ? subtotal + SHIPPING : 0;
  return <><SiteNav/><main className="cart-page page-shell"><header className="page-heading compact"><span>مشترياتك</span><h1>سلة المشتريات</h1></header>
    {!items.length ? <div className="empty-cart"><div>🛒</div><h2>سلتك فارغة</h2><p>أضف الكتب التي تحبها وسنحتفظ بها هنا.</p><Link href="/categories" className="primary-button">تصفّح الكتب</Link></div> : <div className="cart-layout">
      <section className="cart-lines"><div className="cart-table-head"><span>الكتاب</span><span>الكمية</span><span>السعر</span></div>
        {items.map((item) => <article key={item.id} className="cart-line"><BookCover title={item.title} cover={item.cover} className="cart-thumb"/><div className="cart-book-info"><h3>{item.title}</h3><p>{item.author}</p><button onClick={() => removeItem(item.id)}>إزالة</button></div><div className="quantity-control"><button onClick={() => updateQty(item.id, item.qty - 1)}>−</button><b>{item.qty}</b><button onClick={() => updateQty(item.id, item.qty + 1)}>+</button></div><strong>{formatJOD(item.price * item.qty)}</strong></article>)}
        <Link href="/categories" className="continue-shopping">← متابعة التسوق</Link></section>
      <aside className="order-summary"><h2>ملخص الطلب</h2><div><span>عدد الكتب</span><b>{items.reduce((sum, item) => sum + item.qty, 0)}</b></div><div><span>المجموع الفرعي</span><span>{formatJOD(subtotal)}</span></div><div><span>التوصيل</span><span>{formatJOD(SHIPPING)}</span></div><div className="summary-total"><span>الإجمالي</span><strong>{formatJOD(total)}</strong></div><Link href="/checkout" className="primary-button">إتمام الشراء</Link><p>دفع آمن · تأكيد الطلب قبل التوصيل</p></aside>
    </div>}
  </main><SiteFooter/></>;
}
