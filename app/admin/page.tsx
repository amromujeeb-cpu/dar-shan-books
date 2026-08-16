"use client";

import Link from "next/link";
import {useEffect,useMemo,useState} from "react";
import {useRouter} from "next/navigation";
import {useAuth} from "@/lib/auth-context";
import {useStore} from "@/lib/store-context";
import {formatJOD,formatOrderNumber} from "@/lib/format";
import {useCommerce} from "@/lib/commerce-context";

type Tab="overview"|"books"|"orders"|"stock"|"marketing"|"drafts"|"settings";

export default function AdminPage(){
  const {user,ready:authReady,logout}=useAuth();
  const {books,orders,ready,removeBook,updateOrderStatus,addBook}=useStore();
  const router=useRouter();
  const [tab,setTab]=useState<Tab>("overview");
  const [bookQuery,setBookQuery]=useState("");
  const {promo,savePromo,featuredIds,toggleFeatured,drafts,removeDraft,settings,saveSettings}=useCommerce();

  useEffect(()=>{if(authReady&&user?.role!=="admin")router.replace("/login")},[authReady,user,router]);
  const sales=useMemo(()=>orders.reduce((sum,o)=>sum+o.total,0),[orders]);
  const sold=useMemo(()=>{const map=new Map<string,number>();orders.forEach(o=>o.items.forEach(i=>map.set(i.id,(map.get(i.id)||0)+i.qty)));return map},[orders]);
  const topBooks=useMemo(()=>[...books].sort((a,b)=>(sold.get(b.id)||0)-(sold.get(a.id)||0)).slice(0,5),[books,sold]);

  if(!authReady||!ready||user?.role!=="admin")return <div className="min-h-screen grid place-items-center">جاري التحقق…</div>;
  const goOut=()=>{logout();router.push("/")};

  return <div dir="rtl" className="min-h-screen bg-[#f8f9fb] lg:grid lg:grid-cols-[250px_minmax(0,1fr)]">
    <aside className="bg-[#111115] text-white lg:min-h-screen p-0">
      <Link href="/admin" onClick={()=>setTab("overview")} className="block px-7 py-8 text-2xl font-extrabold border-b border-white/10">دار <span className="text-purple">شأن</span> — إدارة</Link>
      <nav className="py-3 font-bold text-lg">
        <Side label="نظرة عامة" active={tab==="overview"} onClick={()=>setTab("overview")}/>
        <Side label="الكتب" active={tab==="books"} onClick={()=>setTab("books")}/>
        <Side label="الطلبات" active={tab==="orders"} onClick={()=>setTab("orders")}/>
        <Side label="المخزون" active={tab==="stock"} onClick={()=>setTab("stock")}/>
        <Side label="التسويق والكوبون" active={tab==="marketing"} onClick={()=>setTab("marketing")}/>
        <Side label={`المسودات (${drafts.length})`} active={tab==="drafts"} onClick={()=>setTab("drafts")}/>
        <Side label="إعدادات المتجر" active={tab==="settings"} onClick={()=>setTab("settings")}/>
        <Link className="block px-7 py-4 hover:bg-white/10" href="/">الرئيسية والتسوق</Link>
        <Link className="block px-7 py-4 hover:bg-white/10" href="/dashboard">بياناتي الشخصية</Link>
        <button onClick={goOut} className="w-full text-right px-7 py-4 hover:bg-white/10">تسجيل الخروج</button>
      </nav>
    </aside>

    <main className="p-5 md:p-8 lg:p-10 min-w-0 text-[14px]">
      {tab==="overview"&&<>
        <h1 className="text-2xl md:text-3xl font-extrabold mb-7">نظرة عامة</h1>
        <section className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          <Stat label="مبيعات هذا الشهر" value={formatJOD(sales)} note={orders.length?"▲ مبيعات مسجّلة":"لا توجد مبيعات بعد"} tone="green"/><Stat label="عدد الطلبات" value={orders.length} note={orders.length?"▲ طلبات المتجر":"بانتظار أول طلب"} tone="green"/><Stat label="طلبات قيد الشحن" value={orders.filter(o=>o.status==="قيد الشحن").length} note={orders.some(o=>o.status==="قيد الشحن")?"تحتاج متابعة":"لا توجد طلبات معلّقة"} tone="orange"/><Stat label="كتب منخفضة المخزون" value={books.filter(b=>b.stock<=(b.lowStock||10)).length} note={books.some(b=>b.stock<=(b.lowStock||10))?"تحتاج متابعة":"المخزون بحالة جيدة"} tone="red"/>
        </section>
        <Panel title="أحدث الطلبات" action={<button onClick={()=>setTab("orders")} className="btn">عرض الكل</button>}>
          <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-center"><thead><tr><Th>رقم الطلب</Th><Th>العميل</Th><Th>الإجمالي</Th><Th>الحالة</Th><Th>التاريخ</Th></tr></thead><tbody>{orders.length?orders.slice(0,4).map(o=><tr key={o.id} className="border-t"><Td><bdi dir="ltr">{formatOrderNumber(o.id)}</bdi></Td><Td>{o.customer}</Td><Td>{formatJOD(o.total)}</Td><Td><Status value={o.status}/></Td><Td><bdi dir="ltr">{englishDate(o.date)}</bdi></Td></tr>):<tr><td colSpan={5} className="py-12 text-gray-400">لا توجد طلبات حتى الآن</td></tr>}</tbody></table></div>
        </Panel>
        <Panel title="الكتب — الأكثر مبيعاً" action={<Link href="/admin/books/new" className="btn">+ إضافة كتاب</Link>}>
          <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-center"><thead><tr><Th>الكتاب</Th><Th>المؤلف</Th><Th>السعر</Th><Th>الكمية المتوفرة</Th><Th>المبيعات</Th></tr></thead><tbody>{topBooks.map(b=><tr key={b.id} className="border-t"><Td><b>{b.title}</b></Td><Td>{b.author}</Td><Td>{formatJOD(b.price)}</Td><Td><StockBadge stock={b.stock} limit={b.lowStock}/></Td><Td>{sold.get(b.id)||0}</Td></tr>)}</tbody></table></div>
        </Panel>
        <Panel title="نشاط المبيعات"><div className="p-6"><div className="h-40 flex items-end gap-4 border-b px-4">{[35,55,42,70,50,82,65].map((h,i)=><div key={i} className="flex-1 bg-purple/80 rounded-t" style={{height:`${orders.length?Math.max(18,h):8}%`}} title={`اليوم ${i+1}`}/>)}</div><div className="flex justify-between text-xs text-gray-400 mt-2"><span>قبل 7 أيام</span><span>اليوم</span></div></div></Panel>
      </>}

      {tab==="books"&&<><Header title="الكتب" action={<Link href="/admin/books/new" className="btn">+ إضافة كتاب</Link>}/><input value={bookQuery} onChange={e=>setBookQuery(e.target.value)} placeholder="بحث باسم الكتاب أو المؤلف…" className="w-full border rounded-lg px-4 py-3 mb-5 bg-white"/><Panel><div className="overflow-x-auto"><table className="w-full min-w-[900px] text-center"><thead><tr><Th>العنوان</Th><Th>المؤلف</Th><Th>السعر</Th><Th>المخزون</Th><Th>الإجراءات</Th></tr></thead><tbody>{books.filter(b=>`${b.title} ${b.author}`.includes(bookQuery)).map(b=><tr className="border-t" key={b.id}><Td><Link href={`/books/${b.id}`} className="font-extrabold hover:text-purple hover:underline">{b.title}</Link></Td><Td>{b.author}</Td><Td>{formatJOD(b.price)}</Td><Td>{b.stock}</Td><Td><div className="flex flex-wrap justify-center gap-2"><Link className="rounded-md bg-[#eeeeF0] text-ink px-3 py-1.5 text-xs font-bold" href={`/admin/books/${b.id}/edit`}>تعديل</Link><button className={`rounded-md px-3 py-1.5 text-xs font-bold ${featuredIds.includes(b.id)?"bg-purple text-white":"bg-purple/10 text-purple"}`} onClick={()=>toggleFeatured(b.id)}>{featuredIds.includes(b.id)?"مختار ✓":"اختيار الدار"}</button><button className="rounded-md bg-[#f9e7e7] text-red-600 px-3 py-1.5 text-xs font-bold" onClick={()=>confirm("حذف الكتاب؟")&&removeBook(b.id)}>حذف</button></div></Td></tr>)}</tbody></table></div></Panel></>}

      {tab==="orders"&&<><Header title="الطلبات"/><Panel><div className="overflow-x-auto"><table className="w-full min-w-[900px] text-center"><thead><tr><Th>رقم الطلب</Th><Th>العميل</Th><Th>الإجمالي</Th><Th>التاريخ</Th><Th>الحالة</Th></tr></thead><tbody>{orders.length?orders.map(o=><tr className="border-t" key={o.id}><Td><bdi dir="ltr">{formatOrderNumber(o.id)}</bdi></Td><Td>{o.customer}</Td><Td>{formatJOD(o.total)}</Td><Td><bdi dir="ltr">{englishDate(o.date)}</bdi></Td><Td><select value={o.status} onChange={e=>updateOrderStatus(o.id,e.target.value)} className={`rounded-lg border-0 px-4 py-2 text-xs font-extrabold ${statusSelectClass(o.status)}`}><option value="قيد التجهيز">🟠 قيد التجهيز</option><option value="قيد الشحن">🔵 قيد الشحن</option><option value="تم التسليم">🟢 تم التسليم</option><option value="ملغى">🔴 ملغى</option></select></Td></tr>):<tr><td colSpan={5} className="py-12 text-gray-400">لا توجد طلبات حتى الآن</td></tr>}</tbody></table></div></Panel></>}

      {tab==="stock"&&<><Header title="المخزون"/><Panel><div className="overflow-x-auto"><table className="w-full min-w-[650px] text-center"><thead><tr><Th>الكتاب</Th><Th>المؤلف</Th><Th>الكمية</Th><Th>الحالة</Th></tr></thead><tbody>{books.map(b=><tr className="border-t" key={b.id}><Td><b>{b.title}</b></Td><Td>{b.author}</Td><Td><StockBadge stock={b.stock} limit={b.lowStock}/></Td><Td><StockStatus stock={b.stock} limit={b.lowStock}/></Td></tr>)}</tbody></table></div></Panel></>}
      {tab==="marketing"&&<><Header title="التسويق والكوبون"/><PromoForm promo={promo} save={savePromo}/><Panel title="اختيارات دار شأن"><div className="p-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">{books.map(b=><button key={b.id} onClick={()=>toggleFeatured(b.id)} className={`border rounded-lg p-4 text-right ${featuredIds.includes(b.id)?"border-purple bg-purple/5":"bg-white"}`}><b>{b.title}</b><span className="block text-xs text-gray-400">{featuredIds.includes(b.id)?"مختار في الرئيسية ✓":"اضغطي لإضافته"}</span></button>)}</div></Panel></>}
      {tab==="drafts"&&<><Header title="مسودات الكتب" action={<Link href="/admin/books/new" className="btn">مسودة جديدة</Link>}/><Panel>{drafts.length?<div className="divide-y">{drafts.map(d=><div key={d.draftId} className="p-5 flex justify-between items-center"><div><b>{d.title||"كتاب بلا عنوان"}</b><p className="text-xs text-gray-400">حُفظت: <bdi dir="ltr">{d.savedAt}</bdi></p></div><div className="flex gap-2"><Link href={`/admin/drafts/${d.draftId}/preview`} className="bg-blue-50 text-blue-700 rounded px-4 py-2 text-xs font-bold">معاينة</Link><button onClick={()=>{addBook(d);removeDraft(d.draftId)}} className="bg-purple text-white rounded px-4 py-2 text-xs font-bold">نشر الآن</button><button onClick={()=>removeDraft(d.draftId)} className="bg-red-50 text-red-600 rounded px-4 py-2 text-xs font-bold">حذف</button></div></div>)}</div>:<div className="p-14 text-center text-gray-400">لا توجد مسودات محفوظة.</div>}</Panel></>}
      {tab==="settings"&&<><Header title="إعدادات المتجر"/><SettingsForm value={settings} save={saveSettings}/></>}
    </main>
    <style jsx global>{`.btn{display:inline-flex;align-items:center;justify-content:center;border-radius:.35rem;background:#5b1d6b;color:#fff;padding:.6rem 1rem;font-size:.82rem;font-weight:800}.btn:hover{background:#461451}.admin-panel th{background:#f1f1f3;color:#4b4b53;padding:.85rem}.admin-panel td{padding:.78rem}.admin-panel{font-size:.86rem}`}</style>
  </div>
}

function Side({label,active,onClick}:{label:string;active:boolean;onClick:()=>void}){return <button onClick={onClick} className={`block w-full text-right px-7 py-4 border-r-4 ${active?"bg-[#202c3c] border-purple":"border-transparent hover:bg-white/10"}`}>{label}</button>}
function Stat({label,value,note,tone}:{label:string;value:string|number;note:string;tone:"green"|"orange"|"red"}){const color=tone==="green"?"#27844f":tone==="orange"?"#c46b16":"#d33b32";return <div className="bg-white border rounded-xl p-6 min-h-36 flex flex-col justify-between"><div className="text-gray-400 text-sm">{label}</div><div className="text-2xl font-extrabold my-2">{value}</div><div style={{color}} className="text-xs font-bold">{note}</div></div>}
function Header({title,action}:{title:string;action?:React.ReactNode}){return <div className="flex items-center justify-between gap-4 mb-7"><h1 className="text-2xl md:text-3xl font-extrabold">{title}</h1>{action}</div>}
function Panel({title,action,children}:{title?:string;action?:React.ReactNode;children:React.ReactNode}){return <section className="admin-panel bg-white border rounded-xl overflow-hidden mb-7"><div className="flex items-center justify-between gap-4 px-5 py-4"><h2 className="text-lg font-extrabold">{title}</h2>{action}</div>{children}</section>}
function Th({children}:{children:React.ReactNode}){return <th>{children}</th>};function Td({children}:{children:React.ReactNode}){return <td>{children}</td>}
function Status({value}:{value:string}){return <span className={`inline-block rounded-full px-4 py-1 text-xs font-bold ${statusSelectClass(value)}`}>{value}</span>}
function statusSelectClass(value:string){if(value==="تم التسليم")return "bg-green-100 text-green-800";if(value==="ملغى")return "bg-red-100 text-red-700";if(value==="قيد الشحن")return "bg-blue-100 text-blue-800";return "bg-orange-100 text-orange-700"}
function stockStyle(stock:number,limit=10):React.CSSProperties{if(stock<=limit)return{backgroundColor:"#fee2e2",color:"#b91c1c"};if(stock<=limit*2)return{backgroundColor:"#ffedd5",color:"#c2410c"};return{backgroundColor:"#dcfce7",color:"#166534"}}
function StockBadge({stock,limit=10}:{stock:number;limit?:number}){return <span style={stockStyle(stock,limit)} className="inline-block min-w-12 rounded-full px-3 py-1 text-xs font-extrabold">{stock}</span>}
function StockStatus({stock,limit=10}:{stock:number;limit?:number}){const label=stock<=limit?"مخزون منخفض":stock<=limit*2?"مخزون متوسط":"متوفر";return <span style={stockStyle(stock,limit)} className="inline-block rounded-full px-4 py-1 text-xs font-extrabold">{label}</span>}
function englishDate(value:string){const latin=value.replace(/[٠-٩]/g,d=>String("٠١٢٣٤٥٦٧٨٩".indexOf(d))).replace(/[۰-۹]/g,d=>String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)));const nums=latin.match(/\d+/g)||[];if(nums.length<3)return latin.replace(/[\u200e\u200f\u202a-\u202e\u2066-\u2069]/g,"");const first=nums[0]!,second=nums[1]!,third=nums[2]!;const [day,month,year]=first.length===4?[third,second,first]:[first,second,third];return `${day.padStart(2,"0")}/${month.padStart(2,"0")}/${year}`}
function PromoForm({promo,save}:{promo:{code:string;percent:number;active:boolean};save:(p:{code:string;percent:number;active:boolean})=>void}){const[p,setP]=useState(promo);useEffect(()=>setP(promo),[promo]);return <form onSubmit={e=>{e.preventDefault();save(p)}} className="bg-white border rounded-xl p-6 mb-7 max-w-2xl"><h2 className="text-lg font-extrabold mb-5">كوبون الخصم</h2><div className="grid sm:grid-cols-2 gap-4"><label><b className="block mb-2">رمز الكوبون</b><input value={p.code} onChange={e=>setP({...p,code:e.target.value.toUpperCase()})} className="w-full border rounded px-4 py-3"/></label><label><b className="block mb-2">نسبة الخصم %</b><input type="number" min="1" max="90" value={p.percent} onChange={e=>setP({...p,percent:+e.target.value})} className="w-full border rounded px-4 py-3"/></label></div><label className="flex items-center gap-3 mt-5"><input type="checkbox" checked={p.active} onChange={e=>setP({...p,active:e.target.checked})}/><b>{p.active?"الكوبون مفعّل":"الكوبون متوقف"}</b></label><button className="btn mt-5">حفظ إعدادات الكوبون</button></form>}
function SettingsForm({value,save}:{value:{phone:string;whatsapp:string;email:string;facebookUrl:string;instagramUrl:string;workingHours:string;address:string};save:(v:any)=>void}){const[v,setV]=useState(value),[ok,setOk]=useState(false);useEffect(()=>setV(value),[value]);const field=(key:keyof typeof v,label:string,dir?:"ltr")=><label><b className="block mb-2">{label}</b><input dir={dir} value={v[key]} onChange={e=>{setV({...v,[key]:e.target.value});setOk(false)}} className="w-full border rounded px-4 py-3"/></label>;return <form onSubmit={e=>{e.preventDefault();save(v);setOk(true)}} className="bg-white border rounded-xl p-6 max-w-3xl"><div className="grid md:grid-cols-2 gap-5">{field("phone","رقم الهاتف","ltr")}{field("whatsapp","رقم واتساب مع رمز الدولة","ltr")}{field("email","البريد الإلكتروني","ltr")}{field("address","العنوان")}{field("facebookUrl","رابط فيسبوك","ltr")}{field("instagramUrl","رابط إنستغرام","ltr")}{field("workingHours","ساعات العمل")}</div><button className="btn mt-6">حفظ إعدادات المتجر</button>{ok&&<span className="text-green-700 font-bold mr-4">تم الحفظ</span>}</form>}
