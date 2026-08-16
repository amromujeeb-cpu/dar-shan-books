"use client";
import Link from "next/link";
import {useEffect,useState} from "react";
import {useRouter} from "next/navigation";
import {useAuth} from "@/lib/auth-context";
import {useStore} from "@/lib/store-context";
import {formatJOD,formatOrderNumber} from "@/lib/format";
import {supabase} from "@/lib/supabase";

type Profile={phone:string;address:string};
export default function Dashboard(){
 const {user,ready,logout}=useAuth(),{orders}=useStore(),router=useRouter();
 const [tab,setTab]=useState<"orders"|"profile">("orders"),[profile,setProfile]=useState<Profile>({phone:"",address:""}),[saved,setSaved]=useState(false),[saveError,setSaveError]=useState("");
 useEffect(()=>{if(ready&&!user)router.replace("/login");if(ready&&user?.role==="admin")setTab("profile")},[ready,user,router]);
 useEffect(()=>{if(user)supabase.from("profiles").select("phone,address").eq("id",user.id).maybeSingle().then(({data})=>{if(data)setProfile({phone:data.phone||"",address:data.address||""})})},[user]);
 if(!ready||!user)return <div className="min-h-screen grid place-items-center">جاري التحميل…</div>;
 const mine=orders.filter(o=>o.userId===user.id);
 const save=async(e:React.FormEvent)=>{e.preventDefault();setSaved(false);setSaveError("");const phone=profile.phone.replace(/[\s()-]/g,"");if(!/^\+[1-9]\d{7,14}$/.test(phone)){setSaveError("أدخل رقم الهاتف مع رمز الدولة، مثال: +962797272110");return}const{error}=await supabase.from("profiles").update({...profile,phone}).eq("id",user.id);if(error)setSaveError("تعذّر حفظ البيانات، حاول مرة أخرى.");else{setProfile({...profile,phone});setSaved(true)}};
 return <div dir="rtl" className="grid md:grid-cols-[250px_1fr] min-h-screen bg-[#f8f9fb]">
  <aside className="bg-ink text-gray-300 py-8"><Link href={user.role==="admin"?"/admin":"/"} className="block text-white font-extrabold px-7 pb-7 border-b border-gray-700 text-xl">دار <span className="text-purple">شأن</span></Link><nav className="py-3"><Link href="/" className="nav">الرئيسية والتسوق</Link>{user.role==="customer"&&<><Link href="/categories" className="nav">تصفح الكتب</Link><Link href="/cart" className="nav">سلة المشتريات</Link><button onClick={()=>setTab("orders")} className={`nav w-full text-right ${tab==="orders"?"bg-[#202c3c] text-white":""}`}>طلباتي</button></>}<button onClick={()=>setTab("profile")} className={`nav w-full text-right ${tab==="profile"?"bg-[#202c3c] text-white":""}`}>بياناتي الشخصية</button>{user.role==="admin"&&<Link href="/admin" className="nav">العودة إلى لوحة الإدارة</Link>}<button onClick={()=>{logout();router.push("/")}} className="nav w-full text-right">تسجيل الخروج</button></nav></aside>
  <main className="p-6 md:p-10 lg:p-12">
   {tab==="profile"&&<><h1 className="text-3xl font-extrabold mb-8">بياناتي الشخصية</h1><form onSubmit={save} className="bg-white border rounded-xl p-6 md:p-8 max-w-2xl"><div className="grid md:grid-cols-2 gap-5"><Field label="الاسم الكامل" value={user.name} disabled/><Field label="البريد الإلكتروني" value={user.email} disabled/><Field label="رقم الهاتف الدولي" value={profile.phone} onChange={v=>{setProfile({...profile,phone:v});setSaved(false);setSaveError("")}} placeholder="+962797272110"/><Field label="العنوان" value={profile.address} onChange={v=>{setProfile({...profile,address:v});setSaved(false)}} placeholder="المدينة، المنطقة، الشارع"/></div><p className="text-xs text-gray-400 mt-5">الاسم والبريد مرتبطان بحساب تسجيل الدخول. اكتب رقم الهاتف مع رمز الدولة.</p>{saveError&&<p className="text-red-600 font-bold mt-3">{saveError}</p>}<button className="bg-purple hover:bg-purple-dark text-white rounded-md px-7 py-3 font-extrabold mt-6">حفظ البيانات</button>{saved&&<span className="text-green-700 font-bold mr-4">تم الحفظ بنجاح</span>}</form></>}
   {tab==="orders"&&user.role==="customer"&&<><div className="flex justify-between items-center mb-8"><h1 className="text-3xl font-extrabold">طلباتي</h1><Link href="/categories" className="bg-purple text-white px-5 py-3 rounded font-bold">تسوّق الآن</Link></div>{!mine.length?<div className="bg-white border rounded-xl p-16 text-center text-gray-400">لا توجد لديك طلبات حتى الآن.</div>:<div className="bg-white border rounded-xl overflow-x-auto"><table className="w-full min-w-[650px] text-sm text-center"><thead className="bg-gray-100"><tr><th className="p-4">الطلب</th><th>التاريخ</th><th>الكتب</th><th>الإجمالي</th><th>الحالة</th></tr></thead><tbody>{mine.map(o=><tr key={o.id} className="border-t"><td className="p-4"><bdi dir="ltr">{formatOrderNumber(o.id)}</bdi></td><td>{o.date}</td><td>{o.items.reduce((s,i)=>s+i.qty,0)}</td><td>{formatJOD(o.total)}</td><td className="font-bold">{o.status}</td></tr>)}</tbody></table></div>}</>}
  </main><style jsx global>{`.nav{display:block;padding:.75rem 1.75rem;font-weight:700}.nav:hover{background:#202c3c;color:#fff}`}</style>
 </div>
}
function Field({label,value,onChange,placeholder,disabled=false}:{label:string;value:string;onChange?:(v:string)=>void;placeholder?:string;disabled?:boolean}){return <label><span className="block font-extrabold mb-2">{label}</span><input className={`w-full border rounded-md px-4 py-3 text-sm ${disabled?"bg-gray-100 text-gray-500":"bg-white"}`} value={value} disabled={disabled} placeholder={placeholder} onChange={e=>onChange?.(e.target.value)}/></label>}
