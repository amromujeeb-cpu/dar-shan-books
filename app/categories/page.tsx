"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import BookCard from "@/components/BookCard";
import { useStore } from "@/lib/store-context";

export default function Categories() {
  const { books } = useStore();
  const sp = useSearchParams();
  const [q, setQ] = useState(sp.get("q") || "");
  const [selected, setSelected] = useState<string[]>([]);
  const [sort, setSort] = useState("new");
  const [max, setMax] = useState(50);
  const [available, setAvailable] = useState(false);
  const cats = [...new Set(books.map((book) => book.category))];
  const shown = useMemo(() => {
    let result = books.filter((book) => (!q || `${book.title} ${book.author} ${book.category}`.toLowerCase().includes(q.toLowerCase())) && (!selected.length || selected.includes(book.category)) && book.price <= max && (!available || book.stock > 0));
    if (sort === "asc") result = [...result].sort((a, b) => a.price - b.price);
    if (sort === "desc") result = [...result].sort((a, b) => b.price - a.price);
    if (sort === "name") result = [...result].sort((a, b) => a.title.localeCompare(b.title, "ar"));
    return result;
  }, [books, q, selected, sort, max, available]);

  return <><SiteNav/><main className="catalog-page page-shell">
    <header className="page-heading"><span>مكتبة دار شأن</span><h1>جميع الكتب</h1><p>اكتشف عناوين مختارة بعناية، وابحث حسب التصنيف أو المؤلف.</p></header>
    <div className="catalog-search"><span aria-hidden="true">⌕</span><input value={q} onChange={(event) => setQ(event.target.value)} placeholder="ابحث باسم الكتاب أو المؤلف…" /></div>
    <div className="catalog-layout">
      <aside className="filter-card">
        <div className="filter-title"><b>التصنيفات</b><button onClick={() => setSelected([])}>مسح</button></div>
        {cats.map((category) => <label key={category}><input type="checkbox" checked={selected.includes(category)} onChange={() => setSelected((current) => current.includes(category) ? current.filter((value) => value !== category) : [...current, category])}/><span>{category}</span></label>)}
        <div className="filter-divider"/>
        <label className="price-filter"><b>السعر حتى {max} د.أ</b><input type="range" min="5" max="50" value={max} onChange={(event) => setMax(+event.target.value)}/></label>
        <label><input type="checkbox" checked={available} onChange={(event) => setAvailable(event.target.checked)}/><span>المتوفر فقط</span></label>
      </aside>
      <section className="catalog-results"><div className="catalog-toolbar"><span><b>{shown.length}</b> كتاب</span><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="new">الأحدث</option><option value="asc">الأقل سعرًا</option><option value="desc">الأعلى سعرًا</option><option value="name">حسب الاسم</option></select></div>{shown.length ? <div className="book-grid books-grid-catalog">{shown.map((book) => <BookCard key={book.id} book={book}/>)}</div> : <div className="empty-state">لا توجد كتب مطابقة. جرّب تغيير البحث أو الفلاتر.</div>}</section>
    </div>
  </main><SiteFooter/></>;
}
