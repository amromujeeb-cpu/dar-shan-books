"use client";
import{createContext,useContext,useEffect,useState,ReactNode}from"react";
import type{Book}from"./store-context";
import{supabase}from"./supabase";
export type Promo={code:string;percent:number;active:boolean};
export type Draft=Omit<Book,"id">&{draftId:string;savedAt:string};
export type StoreSettings={phone:string;whatsapp:string;email:string;facebookUrl:string;instagramUrl:string;workingHours:string;address:string};
type Commerce={promo:Promo;savePromo:(p:Promo)=>void;featuredIds:string[];toggleFeatured:(id:string)=>void;drafts:Draft[];saveDraft:(d:Omit<Draft,"draftId"|"savedAt">)=>void;removeDraft:(id:string)=>void;settings:StoreSettings;saveSettings:(s:StoreSettings)=>void};
const defaults:StoreSettings={phone:"+962 79 727 2110",whatsapp:"+962797272110",email:"dar_shan.a@hotmail.com",facebookUrl:"",instagramUrl:"",workingHours:"10:00–19:00",address:"عمّان، الأردن"};
const C=createContext<Commerce|null>(null);
export function CommerceProvider({children}:{children:ReactNode}){
 const[promo,setPromo]=useState<Promo>({code:"SHAAN10",percent:10,active:true}),[featuredIds,setFeatured]=useState<string[]>([]),[drafts,setDrafts]=useState<Draft[]>([]),[settings,setSettings]=useState<StoreSettings>(defaults);
 const load=async()=>{const[s,f,d]=await Promise.all([supabase.from("store_settings").select("*").eq("id",1).maybeSingle(),supabase.from("featured_books").select("book_id").order("position"),supabase.from("book_drafts").select("*").order("updated_at",{ascending:false})]);if(s.data){setPromo({code:s.data.promo_code,percent:s.data.promo_percent,active:s.data.promo_active});setSettings({phone:s.data.phone||"",whatsapp:s.data.whatsapp||"",email:s.data.email||"",facebookUrl:s.data.facebook_url||"",instagramUrl:s.data.instagram_url||"",workingHours:s.data.working_hours||defaults.workingHours,address:s.data.address||defaults.address})}else{setPromo(JSON.parse(localStorage.getItem("darshan-promo")||"null")||{code:"SHAAN10",percent:10,active:true});setSettings(JSON.parse(localStorage.getItem("darshan-settings")||"null")||defaults)}if(!f.error)setFeatured((f.data||[]).map(x=>x.book_id));else setFeatured(JSON.parse(localStorage.getItem("darshan-featured")||"[]"));if(!d.error)setDrafts((d.data||[]).map((x:any)=>({...x.payload,draftId:x.id,savedAt:new Date(x.updated_at).toLocaleString("en-GB")})));else setDrafts(JSON.parse(localStorage.getItem("darshan-book-drafts")||"[]"))};
 useEffect(()=>{load();const{data}=supabase.auth.onAuthStateChange(()=>setTimeout(load,0));return()=>data.subscription.unsubscribe()},[]);
 const savePromo=(p:Promo)=>{setPromo(p);localStorage.setItem("darshan-promo",JSON.stringify(p));supabase.from("store_settings").update({promo_code:p.code,promo_percent:p.percent,promo_active:p.active,updated_at:new Date().toISOString()}).eq("id",1).then()};
 const toggleFeatured=(id:string)=>setFeatured(x=>{const remove=x.includes(id),n=remove?x.filter(v=>v!==id):[...x,id];localStorage.setItem("darshan-featured",JSON.stringify(n));if(remove)supabase.from("featured_books").delete().eq("book_id",id).then();else supabase.from("featured_books").insert({book_id:id,position:n.length}).then();return n});
 const saveDraft=(d:Omit<Draft,"draftId"|"savedAt">)=>{const id=crypto.randomUUID(),item={...d,draftId:id,savedAt:new Date().toLocaleString("en-GB")};setDrafts(x=>[item,...x]);supabase.auth.getUser().then(({data})=>data.user&&supabase.from("book_drafts").insert({id,owner_id:data.user.id,payload:d}).then())};
 const removeDraft=(id:string)=>{setDrafts(x=>x.filter(d=>d.draftId!==id));supabase.from("book_drafts").delete().eq("id",id).then()};
 const saveSettings=(s:StoreSettings)=>{setSettings(s);localStorage.setItem("darshan-settings",JSON.stringify(s));supabase.from("store_settings").update({phone:s.phone,whatsapp:s.whatsapp,email:s.email,facebook_url:s.facebookUrl,instagram_url:s.instagramUrl,working_hours:s.workingHours,address:s.address,updated_at:new Date().toISOString()}).eq("id",1).then()};
 return <C.Provider value={{promo,savePromo,featuredIds,toggleFeatured,drafts,saveDraft,removeDraft,settings,saveSettings}}>{children}</C.Provider>
}
export const useCommerce=()=>{const x=useContext(C);if(!x)throw Error("CommerceProvider missing");return x};
