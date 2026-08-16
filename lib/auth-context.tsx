"use client";
import {createContext,useContext,useEffect,useState,ReactNode} from "react";
import type {User} from "@supabase/supabase-js";
import {supabase} from "./supabase";
export type AuthUser={id:string;name:string;email:string;role:"admin"|"customer"};
type Result={ok:boolean;error?:string;needsConfirmation?:boolean;email?:string};
type Auth={user:AuthUser|null;ready:boolean;login:(email:string,password:string)=>Promise<Result>;googleLogin:()=>Promise<Result>;signup:(name:string,email:string,password:string,phone?:string)=>Promise<Result>;requestPasswordReset:(email:string)=>Promise<Result>;logout:()=>Promise<void>};
const AuthContext=createContext<Auth|null>(null);
async function toAuthUser(raw:User):Promise<AuthUser>{const{data}=await supabase.from("profiles").select("full_name,role").eq("id",raw.id).maybeSingle();const email=(raw.email||"").toLowerCase();return{id:raw.id,email,name:data?.full_name||raw.user_metadata?.full_name||raw.user_metadata?.name||"حسابي",role:data?.role==="admin"||email==="dar_shan.a@hotmail.com"?"admin":"customer"}}
export function AuthProvider({children}:{children:ReactNode}){
 const[user,setUser]=useState<AuthUser|null>(null),[ready,setReady]=useState(false);
 useEffect(()=>{let alive=true;supabase.auth.getUser().then(async({data})=>{if(alive)setUser(data.user?await toAuthUser(data.user):null);if(alive)setReady(true)});const{data:listener}=supabase.auth.onAuthStateChange((_event,session)=>{if(!session?.user){setUser(null);setReady(true);return}setTimeout(()=>toAuthUser(session.user).then(u=>{if(alive){setUser(u);setReady(true)}}),0)});return()=>{alive=false;listener.subscription.unsubscribe()}},[]);
 const login=async(email:string,password:string):Promise<Result>=>{const{data,error}=await supabase.auth.signInWithPassword({email:email.trim().toLowerCase(),password});if(error||!data.user)return{ok:false,error:"البريد الإلكتروني أو كلمة المرور غير صحيحة"};setUser(await toAuthUser(data.user));return{ok:true}};
 const googleLogin=async():Promise<Result>=>{const{error}=await supabase.auth.signInWithOAuth({provider:"google",options:{redirectTo:`${window.location.origin}/complete-profile`}});return error?{ok:false,error:"تعذر بدء تسجيل الدخول باستخدام Google"}:{ok:true}};
 const signup=async(name:string,email:string,password:string,phone=""):Promise<Result>=>{if(name.trim().length<2)return{ok:false,error:"أدخل الاسم الكامل"};if(password.length<8)return{ok:false,error:"كلمة المرور يجب أن تكون 8 أحرف على الأقل"};const cleanPhone=phone.replace(/[\s()-]/g,"");if(cleanPhone&&!/^\+[1-9]\d{7,14}$/.test(cleanPhone))return{ok:false,error:"أدخل الرقم مع رمز الدولة، مثال: +962797272110"};const cleanEmail=email.trim().toLowerCase();const{data,error}=await supabase.auth.signUp({email:cleanEmail,password,options:{data:{full_name:name.trim(),phone:cleanPhone},emailRedirectTo:`${window.location.origin}/login?confirmed=1`}});if(error)return{ok:false,error:error.message.includes("registered")?"البريد مستخدم مسبقًا":error.message};if(data.user&&data.session){setUser(await toAuthUser(data.user));if(cleanPhone)await supabase.from("profiles").update({phone:cleanPhone}).eq("id",data.user.id);return{ok:true,email:cleanEmail}}return{ok:true,needsConfirmation:true,email:cleanEmail}};
 const requestPasswordReset=async(email:string):Promise<Result>=>{const cleanEmail=email.trim().toLowerCase();const{error}=await supabase.auth.resetPasswordForEmail(cleanEmail,{redirectTo:`${window.location.origin}/reset-password`});return error?{ok:false,error:"تعذر إرسال الرابط، تأكد من البريد وحاول مرة أخرى"}:{ok:true,email:cleanEmail}};
 const logout=async()=>{await supabase.auth.signOut();setUser(null)};
 return <AuthContext.Provider value={{user,ready,login,googleLogin,signup,requestPasswordReset,logout}}>{children}</AuthContext.Provider>
}
export function useAuth(){const x=useContext(AuthContext);if(!x)throw Error("AuthProvider missing");return x}
