"use client";

import { useEffect,useState } from "react";
import {useRouter} from "next/navigation";
import {useAuth} from "@/lib/auth-context";
import {useStore} from "@/lib/store-context";
import Link from "next/link";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import { formatJOD,formatOrderNumber } from "@/lib/format";
import { useCart } from "@/lib/cart-context";
import {useCommerce} from "@/lib/commerce-context";
import {supabase} from "@/lib/supabase";

const governorates=["عمّان","إربد","الزرقاء","البلقاء","مادبا","الكرك","الطفيلة","معان","العقبة","جرش","عجلون","المفرق"];
const internationalPhone=/^\+[1-9]\d{7,14}$/;

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const {user,ready}=useAuth();const {createOrder}=useStore();const router=useRouter();
  const {promo}=useCommerce();
  useEffect(()=>{if(ready&&!user)router.replace("/login")},[ready,user,router]);
  const [shipping,setShipping]=useState<"standard"|"express">("standard"),[coupon,setCoupon]=useState(""),[couponOk,setCouponOk]=useState(false);
  const shippingCost=shipping==="express"?4:2,discount=couponOk?subtotal*(promo.percent/100):0,total = subtotal + shippingCost-discount;
  const [orderPlaced, setOrderPlaced] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", governorate: "عمّان", area: "", street: "", landmark: "" });
  const [formError,setFormError]=useState("");
  useEffect(()=>{if(!user)return;setForm(x=>({...x,name:user.name}));supabase.from("profiles").select("phone,address").eq("id",user.id).maybeSingle().then(({data})=>{if(!data)return;const saved=String(data.address||"").split(" - ");setForm(x=>({...x,phone:data.phone||x.phone,governorate:saved[0]||x.governorate,area:saved[1]||"",street:saved[2]||"",landmark:saved[3]||""}))})},[user]);

  // TODO: بدّلي هالدالة بـ server action حقيقية:
  // 1. أنشئي صف بجدول orders (status: "pending", total, shipping_*)
  // 2. أنشئي صف لكل عنصر بجدول order_items
  // 3. إذا الدفع بطاقة، ابدئي جلسة HyperPay هون بدل ما تأكدي الطلب مباشرة (راجعي SPEC.md § الدفع الإلكتروني)
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    if(form.name.trim().length<2)return setFormError("أدخل الاسم الكامل");
    const normalizedPhone=form.phone.replace(/[\s-]/g,"");
    if(!internationalPhone.test(normalizedPhone))return setFormError("أدخل الرقم مع رمز الدولة، مثال: +962797272110");
    if(form.area.trim().length<2||form.street.trim().length<4)return setFormError("أكمل المنطقة والشارع ورقم البناية أو وصف المنزل");
    if(!user)return;
    const fullAddress=[form.governorate,form.area.trim(),form.street.trim(),form.landmark.trim()].filter(Boolean).join(" - ");
    await supabase.from("profiles").update({phone:normalizedPhone,address:fullAddress}).eq("id",user.id);
    const order=createOrder({userId:user.id,customer:form.name.trim(),phone:normalizedPhone,address:fullAddress,items:items.map(i=>({id:i.id,title:i.title,qty:i.qty,price:i.price})),total});
    setOrderPlaced(order.id);
    clearCart();
  }

  if (orderPlaced) {
    return (
      <>
        <SiteNav />
        <div className="max-w-md mx-auto px-6 py-24 text-center">
          <div className="w-16 h-16 rounded-full bg-green/10 text-green flex items-center justify-center mx-auto mb-6 text-2xl font-bold">✓</div>
          <h2 className="text-2xl font-extrabold mb-3">تم استلام طلبك</h2>
          <p className="text-muted text-sm mb-6">رقم الطلب <bdi dir="ltr">{formatOrderNumber(orderPlaced)}</bdi> — رح نتواصل معك لتأكيد التوصيل.</p>
          <p className="text-xs text-muted mb-8">يمكنك متابعة حالة الطلب من صفحة "طلباتي".</p>
          <Link href="/" className="bg-purple text-white px-8 py-3 rounded font-bold text-sm">رجوع للرئيسية</Link>
        </div>
        <SiteFooter />
      </>
    );
  }

  if (items.length === 0) {
    return (
      <>
        <SiteNav />
        <div className="max-w-md mx-auto px-6 py-24 text-center text-muted">
          <p className="mb-6">السلة فاضية — ما في شي للدفع.</p>
          <Link href="/" className="bg-purple text-white px-8 py-3 rounded font-bold text-sm">تصفّحي الكتب</Link>
        </div>
        <SiteFooter />
      </>
    );
  }

  return (
    <>
      <SiteNav />
      <div className="max-w-6xl mx-auto px-16 py-10">
        <h2 className="text-2xl font-extrabold mb-8">إتمام الطلب</h2>
        <div className="grid md:grid-cols-[1fr_340px] gap-10">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <h3 className="font-extrabold mb-4">١. عنوان الشحن</h3>
              <p className="text-xs text-muted mb-4">نوصل حاليًا داخل الأردن فقط. تم تعبئة بيانات حسابك تلقائيًا ويمكنك تعديلها لهذا الطلب.</p>
              {formError&&<div className="bg-red/10 text-red p-3 rounded mb-4 text-sm font-bold">{formError}</div>}
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <input
                  required
                  placeholder="الاسم الكامل"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="border border-line rounded px-4 py-3 text-sm"
                />
                <input
                  required
                  placeholder="رقم الهاتف مع رمز الدولة — +962..."
                  inputMode="tel"
                  dir="ltr"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="border border-line rounded px-4 py-3 text-sm"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4 mb-4"><label className="text-sm font-bold">المحافظة<select value={form.governorate} onChange={e=>setForm({...form,governorate:e.target.value})} className="w-full mt-2 border border-line rounded px-4 py-3 bg-white">{governorates.map(g=><option key={g}>{g}</option>)}</select></label><label className="text-sm font-bold">المنطقة / الحي<input required placeholder="مثال: الجبيهة" value={form.area} onChange={e=>setForm({...form,area:e.target.value})} className="w-full mt-2 border border-line rounded px-4 py-3"/></label></div>
              <label className="block text-sm font-bold mb-4">الشارع ورقم البناية أو وصف المنزل<input required placeholder="مثال: شارع الجامعة، بناية 12، الطابق الثاني" value={form.street} onChange={e=>setForm({...form,street:e.target.value})} className="w-full mt-2 border border-line rounded px-4 py-3"/></label>
              <label className="block text-sm font-bold">أقرب معلم <span className="text-muted font-normal">(اختياري)</span><input placeholder="مثال: بجانب صيدلية..." value={form.landmark} onChange={e=>setForm({...form,landmark:e.target.value})} className="w-full mt-2 border border-line rounded px-4 py-3"/></label>
            </div>
            <div><h3 className="font-extrabold mb-4">٢. طريقة التوصيل</h3><div className="grid grid-cols-2 gap-3"><label className="border rounded p-4"><input type="radio" checked={shipping==="standard"} onChange={()=>setShipping("standard")} className="ml-2"/>عادي — 2 د.أ</label><label className="border rounded p-4"><input type="radio" checked={shipping==="express"} onChange={()=>setShipping("express")} className="ml-2"/>سريع — 4 د.أ</label></div></div>
            <div>
              <h3 className="font-extrabold mb-4">٣. طريقة الدفع</h3>
              <div className="flex gap-3">
                <label className="flex-1 border border-line rounded p-3 text-center text-sm font-bold cursor-pointer">
                  <input type="radio" name="pay" defaultChecked className="ml-2" /> الدفع عند الاستلام
                </label>
              </div>
            </div>
            {promo.active&&<div><h3 className="font-extrabold mb-4">كوبون الخصم</h3><div className="flex gap-2"><input value={coupon} onChange={e=>setCoupon(e.target.value)} placeholder="أدخلي رمز الكوبون" className="border rounded px-4 py-3"/><button type="button" onClick={()=>setCouponOk(promo.active&&coupon.trim().toUpperCase()===promo.code.toUpperCase())} className="bg-grey px-5 rounded font-bold">تطبيق</button></div>{coupon&&<p className={`text-xs mt-2 ${couponOk?"text-green":"text-red"}`}>{couponOk?`تم تطبيق خصم ${promo.percent}%`:"الكوبون غير صالح"}</p>}</div>}
            <button type="submit" className="bg-purple text-white rounded py-3 px-8 font-bold">تأكيد الطلب</button>
          </form>
          <div className="bg-grey rounded-lg p-6 h-fit">
            <h3 className="font-extrabold mb-5">ملخص الطلب</h3>
            <div className="flex justify-between text-sm text-gray-600 mb-3"><span>{items.length} كتاب</span><span>{formatJOD(subtotal)}</span></div>
            <div className="flex justify-between text-sm text-gray-600 mb-3"><span>الشحن</span><span>{formatJOD(shippingCost)}</span></div>{couponOk&&<div className="flex justify-between text-sm text-green mb-3"><span>الخصم</span><span>-{formatJOD(discount)}</span></div>}
            <div className="flex justify-between font-extrabold border-t border-line pt-3"><span>الإجمالي</span><span>{formatJOD(total)}</span></div>
          </div>
        </div>
      </div>
      <SiteFooter />
    </>
  );
}
