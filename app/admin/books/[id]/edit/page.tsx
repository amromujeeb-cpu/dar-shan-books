"use client";
import {useEffect,useState} from "react";
import {useRouter} from "next/navigation";
import {useAuth} from "@/lib/auth-context";
import {useStore} from "@/lib/store-context";
import BookCover from "@/components/BookCover";
import {uploadBookCover} from "@/lib/book-covers";

export default function EditBook({params}:{params:{id:string}}){
 const {user,ready}=useAuth(),{books,updateBook}=useStore(),router=useRouter();
 const book=books.find(b=>b.id===params.id),[cover,setCover]=useState(""),[coverFile,setCoverFile]=useState<File|null>(null),[busy,setBusy]=useState(false),[notice,setNotice]=useState("");
 useEffect(()=>{if(ready&&user?.role!=="admin")router.replace("/login")},[ready,user,router]);
 useEffect(()=>{if(book)setCover(book.cover||"")},[book]);
 if(!ready||user?.role!=="admin")return <div className="min-h-screen grid place-items-center">جاري التحقق…</div>;
 if(!book)return <div className="min-h-screen grid place-items-center">الكتاب غير موجود</div>;
 const upload=(f?:File)=>{if(!f)return;if(!f.type.startsWith("image/"))return alert("اختاري صورة");if(f.size>4e6)return alert("الصورة أكبر من 4MB");setCoverFile(f);const r=new FileReader();r.onload=()=>setCover(String(r.result));r.readAsDataURL(f)};
 const submit=async(e:React.FormEvent<HTMLFormElement>)=>{e.preventDefault();setBusy(true);try{const d=Object.fromEntries(new FormData(e.currentTarget)),savedCover=coverFile?await uploadBookCover(coverFile):cover;updateBook(book.id,{title:String(d.title),author:String(d.author),category:String(d.category),publisher:String(d.publisher),price:Number(d.price),discountPrice:Number(d.discountPrice)||undefined,stock:Number(d.stock),lowStock:Number(d.lowStock)||10,description:String(d.description),isbn:String(d.isbn),pages:Number(d.pages),cover:savedCover});router.push("/admin")}catch(err){setNotice(err instanceof Error?err.message:"تعذر حفظ التعديل");setBusy(false)}};
 return <main dir="rtl" className="min-h-screen bg-[#fafafa] p-5 md:p-10 text-[14px]">
  <div className="max-w-[1380px] mx-auto"><div className="flex justify-between items-center mb-7"><h1 className="text-2xl font-extrabold">تعديل الكتاب</h1><button onClick={()=>router.push("/admin")} className="font-bold text-purple">← العودة إلى الكتب</button></div>
   <form onSubmit={submit} className="grid lg:grid-cols-[minmax(0,1fr)_360px] gap-7 items-start">
    <div className="space-y-6">
     <Section title="معلومات الكتاب"><div className="grid md:grid-cols-2 gap-4"><Field n="title" l="عنوان الكتاب" v={book.title}/><Field n="author" l="اسم المؤلف" v={book.author}/><Field n="category" l="التصنيف" v={book.category}/><Field n="publisher" l="دار الطباعة / الطبعة" v={book.publisher||""}/><label className="md:col-span-2"><B>الوصف</B><textarea name="description" defaultValue={book.description} className="control min-h-28 resize-y"/></label><Field n="isbn" l="الترقيم الدولي ISBN" v={book.isbn}/><Field n="pages" l="عدد الصفحات" v={book.pages} type="number"/></div></Section>
     <Section title="السعر والمخزون"><div className="grid md:grid-cols-2 gap-4"><Field n="price" l="السعر (د.أ)" v={book.price} type="number" step="0.001"/><Field n="discountPrice" l="سعر بعد الخصم (اختياري)" v={book.discountPrice||""} type="number" step="0.001" required={false}/><Field n="stock" l="الكمية المتوفرة" v={book.stock} type="number"/><Field n="lowStock" l="حد التنبيه للمخزون المنخفض" v={book.lowStock||10} type="number"/></div></Section>
     <Section title="غلاف الكتاب"><label className="block border-2 border-dashed rounded-lg p-10 text-center cursor-pointer hover:border-purple"><b className="text-purple">اضغطي لرفع غلاف جديد من الجهاز</b><span className="block text-gray-400 mt-1">PNG أو JPG — حتى 4MB</span><input hidden type="file" accept="image/*" onChange={e=>upload(e.target.files?.[0])}/></label></Section>
    </div>
    <aside className="bg-white border rounded-xl p-6 lg:sticky lg:top-6"><h2 className="text-lg font-extrabold mb-5">معاينة الغلاف</h2><BookCover title={book.title} cover={cover} className="aspect-[2/3] h-auto"/><p className="text-gray-400 text-xs leading-6 mt-4">سيظهر الغلاف كاملاً بنفس نسبة أغلفة الكتب.</p><button disabled={busy} className="w-full bg-purple disabled:opacity-60 hover:bg-purple-dark text-white py-3 rounded-md font-extrabold mt-5">{busy?"جاري الرفع والحفظ…":"حفظ التعديلات"}</button>{notice&&<p className="text-red-600 text-center mt-3">{notice}</p>}<button type="button" onClick={()=>router.push("/admin")} className="w-full bg-[#f1f1f3] py-3 rounded-md font-extrabold mt-3">إلغاء</button></aside>
   </form>
  </div><style jsx global>{`.control{display:block;width:100%;border:1px solid #dedee3;border-radius:.4rem;background:#fff;padding:.8rem .9rem;margin-top:.4rem;font-size:.84rem}.control:focus{border-color:#5b1d6b}.field-label{display:block;font-weight:800;color:#161619}`}</style>
 </main>
}
function Section({title,children}:{title:string;children:React.ReactNode}){return <section className="bg-white border rounded-xl p-6"><h2 className="text-lg font-extrabold mb-5">{title}</h2>{children}</section>}
function B({children}:{children:React.ReactNode}){return <span className="field-label">{children}</span>}
function Field({n,l,v,type="text",step,required=true}:{n:string;l:string;v:string|number;type?:string;step?:string;required?:boolean}){return <label><B>{l}</B><input required={required} name={n} type={type} step={step} defaultValue={v} className="control"/></label>}
