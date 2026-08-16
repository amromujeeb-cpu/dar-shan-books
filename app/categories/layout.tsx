import {Suspense} from "react";
export default function CategoriesLayout({children}:{children:React.ReactNode}){return <Suspense fallback={<div className="min-h-screen grid place-items-center">جاري تحميل الكتب…</div>}>{children}</Suspense>}
