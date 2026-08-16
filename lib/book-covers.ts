import {supabase} from "./supabase";
export async function uploadBookCover(file:File){
 if(!file.type.startsWith("image/"))throw new Error("اختاري ملف صورة");
 if(file.size>4_000_000)throw new Error("الصورة أكبر من 4MB");
 const ext=(file.name.split(".").pop()||"jpg").toLowerCase();
 const path=`${crypto.randomUUID()}.${ext}`;
 const{error}=await supabase.storage.from("book-covers").upload(path,file,{cacheControl:"3600",upsert:false});
 if(error)throw error;
 return supabase.storage.from("book-covers").getPublicUrl(path).data.publicUrl;
}
