"use client";

import Link from "next/link";
import {useState} from "react";
import {useCart} from "@/lib/cart-context";
import {useAuth} from "@/lib/auth-context";
import {useExperience} from "@/lib/experience-context";

function MoonIcon(){
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.2 15.3A8.5 8.5 0 0 1 8.7 3.8 8.7 8.7 0 1 0 20.2 15.3Z"/></svg>;
}

function SunIcon(){
  return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>;
}

function UserIcon(){
  return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.4"/><path d="M5.5 20c.5-4 2.7-6 6.5-6s6 2 6.5 6"/></svg>;
}

function HeartIcon(){
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 5.8a5.2 5.2 0 0 0-7.4 0L12 7.2l-1.4-1.4a5.2 5.2 0 0 0-7.4 7.4L12 22l8.8-8.8a5.2 5.2 0 0 0 0-7.4Z"/></svg>;
}

function BagIcon(){
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 8.5h15l-1 12h-13l-1-12Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/></svg>;
}

export default function SiteNav(){
  const {count}=useCart();
  const {user,logout}=useAuth();
  const {favorites,dark,toggleDark}=useExperience();
  const [open,setOpen]=useState(false);

  return <nav className="site-nav surface sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
    <div className="site-container flex h-[76px] items-center justify-between gap-5">
      <Link href="/" aria-label="دار شأن" className="brand-lockup">
        <span className="brand-logo"><img src="/dar-shaan-logo.png" alt="شعار دار شأن"/></span>
        <span><b>دار شأن</b><small>للنشر والتوزيع</small></span>
      </Link>
      <button className="nav-menu-button md:hidden" onClick={()=>setOpen(!open)} aria-label="القائمة">☰</button>
      <div className={`${open?"flex":"hidden"} nav-links md:flex`}>
        <Link href="/">الرئيسية</Link>
        <Link href="/categories">الكتب</Link>
        <Link href="/about">عن دار شأن</Link>
        {user?.role==="admin"&&<Link href="/admin">الإدارة</Link>}
      </div>
      <div className="nav-actions" dir="ltr">
        <button onClick={toggleDark} aria-label="تغيير وضع الألوان" title="الوضع الليلي">{dark?<SunIcon/>:<MoonIcon/>}</button>
        <Link href={user?(user.role==="admin"?"/admin":"/dashboard"):"/login"} aria-label="الحساب" title="الحساب"><UserIcon/></Link>
        <Link href="/favorites" aria-label="المفضلة" title="المفضلة"><HeartIcon/>{favorites.length>0&&<span>{favorites.length}</span>}</Link>
        <Link href="/cart" aria-label="السلة" title="السلة"><BagIcon/>{count>0&&<span>{count}</span>}</Link>
        {user&&<button onClick={logout} className="nav-logout hidden lg:grid">خروج</button>}
      </div>
    </div>
  </nav>;
}
