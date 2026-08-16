"use client";
import {useEffect,useState} from "react";
import {useRouter} from "next/navigation";
import BookCover from "@/components/BookCover";
import {useAuth} from "@/lib/auth-context";
import {useStore} from "@/lib/store-context";
import {useCommerce} from "@/lib/commerce-context";
import {uploadBookCover} from "@/lib/book-covers";

export default function NewBook(){
 const {user,ready}=useAuth(),{addBook}=useStore(),router=useRouter();
 const {saveDraft}=useCommerce();
 const [title,setTitle]=useState(""),[cover,setCover]=useState(""),[coverFile,setCoverFile]=useState<File|null>(null),[notice,setNotice]=useState(""),[busy,setBusy]=useState(false);
 useEffect(()=>{if(ready&&user?.role!=="admin")router.replace("/login")},[ready,user,router]);
 if(!ready||user?.role!=="admin")return <div className="min-h-screen grid place-items-center">جاري التحقق…</div>;
 const upload=(f?:File)=>{if(!f)return;if(!f.type.startsWith("image/"))return alert("اختاري صورة");if(f.size>4e6)return alert("الصورة أكبر من 4MB");setCoverFile(f);const r=new FileReader();r.onload=()=>setCover(String(r.result));r.readAsDataURL(f)};
 const values=(form:HTMLFormElement)=>{const d=Object.fromEntries(new FormData(form));return {title,author:String(d.author||""),category:String(d.category||""),publisher:String(d.publisher||""),price:Number(d.price||0),discountPrice:Number(d.discountPrice||0)||undefined,stock:Number(d.stock||0),lowStock:Number(d.lowStock||10),description:String(d.description||""),isbn:String(d.isbn||""),pages:Number(d.pages||0),cover}};
 const publish=async(e:React.FormEvent<HTMLFormElement>)=>{e.preventDefault();setBusy(true);try{const data=values(e.currentTarget);if(coverFile)data.cover=await uploadBookCover(coverFile);addBook(data);router.push("/admin")}catch(err){setNotice(err instanceof Error?err.message:"تعذر رفع الغلاف");setBusy(false)}};
 const draft=(form:HTMLFormElement)=>{saveDraft(values(form));setNotice("تم حفظ المسودة وستجدينها في لوحة الإدارة")};
 return <main dir="rtl" className="min-h-screen bg-[#fafafa] p-5 md:p-10 text-[14px]">
  <div className="max-w-[1380px] mx-auto"><div className="flex justify-between items-center mb-7"><h1 className="text-2xl font-extrabold">إضافة كتاب جديد</h1><button onClick={()=>router.push("/admin")} className="font-bold text-purple">← لوحة الإدارة</button></div>
  <form onSubmit={publish} className="grid lg:grid-cols-[minmax(0,1fr)_360px] gap-7 items-start">
   <div className="space-y-6">
    <Section title="معلومات الكتاب"><div className="grid md:grid-cols-2 gap-4"><Field name="title" label="عنوان الكتاب" placeholder="مثال: ليالي الشام" value={title} onChange={setTitle} required/><Field name="author" label="اسم المؤلف" placeholder="مثال: أحمد الزهراني" required/><Field name="category" label="التصنيف" placeholder="روايات" required/><Field name="publisher" label="دار الطباعة / الطبعة" placeholder="مثال: الطبعة الثالثة، 2025"/><label className="md:col-span-2"><B>الوصف</B><textarea name="description" placeholder="نبذة عن الكتاب تظهر في صفحة تفاصيل المنتج…" className="control min-h-28 resize-y"/></label><Field name="isbn" label="الترقيم الدولي ISBN" placeholder="978-9957-X-XXX-X"/><Field name="pages" label="عدد الصفحات" placeholder="328" type="number"/></div></Section>
    <Section title="السعر والمخزون"><div className="grid md:grid-cols-2 gap-4"><Field name="price" label="السعر (د.أ)" placeholder="12.500" type="number" step="0.001" required/><Field name="discountPrice" label="سعر بعد الخصم (اختياري)" placeholder="—" type="number" step="0.001"/><Field name="stock" label="الكمية المتوفرة" placeholder="50" type="number" required/><Field name="lowStock" label="حد التنبيه للمخزون المنخفض" placeholder="10" type="number"/></div></Section>
    <Section title="غلاف الكتاب"><label className="block border-2 border-dashed rounded-lg p-10 text-center cursor-pointer hover:border-purple"><b className="text-purple">اسحبي صورة الغلاف هنا أو اضغطي للرفع</b><span className="block text-gray-400 mt-1">PNG أو JPG — حتى 4MB</span><input hidden type="file" accept="image/*" onChange={e=>upload(e.target.files?.[0])}/></label></Section>
   </div>
   <aside className="bg-white border rounded-xl p-6 lg:sticky lg:top-6"><h2 className="text-lg font-extrabold mb-5">معاينة الغلاف</h2><BookCover title={title||"كتاب"} cover={cover} className="aspect-[2/3] h-auto"/><p className="text-gray-400 text-xs leading-6 mt-4">يظهر الغلاف كاملاً بنسبة الكتاب، وإذا لم ترفعي صورة يظهر تصميم دار شأن.</p><button disabled={busy} className="w-full bg-purple disabled:opacity-60 hover:bg-purple-dark text-white py-3 rounded-md font-extrabold mt-5">{busy?"جاري الرفع والحفظ…":"نشر الكتاب"}</button><button type="button" onClick={e=>draft((e.currentTarget.form)!)} className="w-full bg-[#f1f1f3] py-3 rounded-md font-extrabold mt-3">حفظ كمسودة</button>{notice&&<p className="text-red-600 text-center mt-3">{notice}</p>}</aside>
  </form></div>
  <style jsx global>{`.control{display:block;width:100%;border:1px solid #dedee3;border-radius:.4rem;background:#fff;padding:.8rem .9rem;margin-top:.4rem;font-size:.84rem}.control:focus{border-color:#5b1d6b}.field-label{display:block;font-weight:800;color:#161619}`}</style>
 </main>
}
function Section({title,children}:{title:string;children:React.ReactNode}){return <section className="bg-white border rounded-xl p-6"><h2 className="text-lg font-extrabold mb-5">{title}</h2>{children}</section>}
function B({children}:{children:React.ReactNode}){return <span className="field-label">{children}</span>}
function Field({name,label,placeholder,type="text",step,required=false,value,onChange}:{name:string;label:string;placeholder:string;type?:string;step?:string;required?:boolean;value?:string;onChange?:(v:string)=>void}){return <label><B>{label}</B><input className="control" name={name} type={type} step={step} required={required} placeholder={placeholder} value={value} onChange={onChange?e=>onChange(e.target.value):undefined}/></label>}
