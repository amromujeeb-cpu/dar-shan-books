"use client";
import Link from"next/link";
import SiteNav from"@/components/SiteNav";
import SiteFooter from"@/components/SiteFooter";
import BookCard from"@/components/BookCard";
import{useStore}from"@/lib/store-context";
import{useCommerce}from"@/lib/commerce-context";

export default function Home(){
 const{books,orders}=useStore(),{featuredIds}=useCommerce();
 const cats=[...new Set(books.map(b=>b.category))];
 const sold=new Map<string,number>();orders.forEach(o=>o.items.forEach(i=>sold.set(i.id,(sold.get(i.id)||0)+i.qty)));
 const best=[...books].sort((a,b)=>(sold.get(b.id)||0)-(sold.get(a.id)||0));
 const chosen=featuredIds.length?books.filter(b=>featuredIds.includes(b.id)):books.slice(0,5);
 return <><SiteNav/><main>
  <section className="home-hero">
   <div className="home-hero-image" role="img" aria-label="كتب دار شأن"/>
   <div className="home-hero-copy"><span>دار شأن للنشر والتوزيع</span><h1>نشر المعرفة<br/>بأسلوب يليق بك</h1><p>كتب مختارة بعناية في مختلف المجالات، لتثري فكرك وتلهمك.</p><Link href="/categories" className="brand-button">تسوّق الآن</Link></div>
  </section>
  <div className="site-container"><Services/>
   <Section title="تصفّح التصنيفات" subtitle="اكتشف عالماً من الكتب بحسب اهتماماتك" centered>
    <div className="category-grid">{cats.slice(0,6).map(c=><Link href={`/categories?q=${encodeURIComponent(c)}`} key={c} className="category-tile"><b>{c}</b><small>{books.filter(b=>b.category===c).length} عنوان</small></Link>)}</div>
   </Section>
   <section id="new"><Section title="وصل حديثًا" action="عرض جميع الكتب"><BookGrid>{books.slice(0,5).map(b=><BookCard key={b.id} book={b} badge="جديد"/>)}</BookGrid></Section></section>
   <section id="best"><Section title="الأكثر مبيعًا"><BookGrid>{best.slice(0,5).map(b=><BookCard key={b.id} book={b} badge="الأكثر مبيعًا"/>)}</BookGrid></Section></section>
   <Section title="اختيارات دار شأن"><BookGrid>{chosen.slice(0,5).map(b=><BookCard key={b.id} book={b} badge="اختيارنا"/>)}</BookGrid></Section>
  </div>
 </main><a href="https://wa.me/962797272110" target="_blank" rel="noopener noreferrer" aria-label="تواصل عبر واتساب" className="floating-whatsapp">واتساب</a><SiteFooter/></>
}
function ServiceIcon({type}:{type:'support'|'payment'|'package'|'shipping'}){
  const common={width:32,height:32,viewBox:'0 0 32 32',fill:'none',stroke:'currentColor',strokeWidth:1.6,strokeLinecap:'round' as const,strokeLinejoin:'round' as const,'aria-hidden':true}
  if(type==='shipping') return <svg {...common}><path d="M3.5 8.5h15v14h-15zM18.5 13h5l4.5 5v4.5h-9.5z"/><path d="M22 13v5h6M8.5 26a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM23.5 26a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/></svg>
  if(type==='package') return <svg {...common}><path d="M5 9.5 16 4l11 5.5v13L16 28 5 22.5z"/><path d="m5 9.5 11 5.7 11-5.7M16 15.2V28M11 6.5l11 5.6"/><path d="M8 17.5h4"/></svg>
  if(type==='payment') return <svg {...common}><rect x="3.5" y="6" width="25" height="19" rx="2.5"/><path d="M3.5 11h25M8 20h5M21.5 17.5v4"/><path d="M19.5 19.5h4"/></svg>
  return <svg {...common}><path d="M6 17v-2a10 10 0 0 1 20 0v2"/><path d="M6 16H4.5A2.5 2.5 0 0 0 2 18.5v3A2.5 2.5 0 0 0 4.5 24H8v-8zM26 16h1.5a2.5 2.5 0 0 1 2.5 2.5v3a2.5 2.5 0 0 1-2.5 2.5H24v-8zM24 24c-1 2.5-3.3 4-7 4"/><circle cx="15" cy="28" r="1" fill="currentColor" stroke="none"/></svg>
}

function Services(){return <div className="service-strip"><div><i><ServiceIcon type="support"/></i><b>خدمة عملاء مميزة</b><small>نحن هنا لمساعدتك</small></div><div><i><ServiceIcon type="payment"/></i><b>دفع آمن</b><small>وسائل دفع متعددة</small></div><div><i><ServiceIcon type="package"/></i><b>تغليف آمن</b><small>يحافظ على الكتب</small></div><div><i><ServiceIcon type="shipping"/></i><b>شحن سريع</b><small>لكل مناطق الأردن</small></div></div>}
function Section({title,subtitle,action,centered=false,children}:{title:string;subtitle?:string;action?:string;centered?:boolean;children:React.ReactNode}){return <section className={`home-section${centered?' home-section-centered':''}`}><div className="section-heading"><div><h2>{title}</h2>{subtitle&&<p>{subtitle}</p>}</div>{action&&<Link href="/categories">{action}</Link>}</div>{children}</section>}
function BookGrid({children}:{children:React.ReactNode}){return <div className="book-grid">{children}</div>}
