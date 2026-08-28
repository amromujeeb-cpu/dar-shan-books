"use client";
import Link from "next/link";
import BookCover from "./BookCover";
import {formatJOD} from "@/lib/format";
import type{Book} from "@/lib/store-context";
import{useExperience}from"@/lib/experience-context";
import{useCart}from"@/lib/cart-context";

export default function BookCard({book,badge}:{book:Book;badge?:string}){
 const{favorites,toggleFavorite,notify}=useExperience(),{addItem}=useCart();
 const sale=!!book.discountPrice&&book.discountPrice<book.price;
 return <article className="book-card dark-card">
   <div className="book-card-media">
    <button aria-label="المفضلة" onClick={()=>toggleFavorite(book.id)} className="favorite-button">{favorites.includes(book.id)?"♥":"♡"}</button>
    {(badge||sale)&&<span className="book-badge">{sale?"خصم":badge}</span>}
    <Link href={`/books/${book.id}`}><BookCover title={book.title} cover={book.cover} className="aspect-[2/3] h-auto w-full"/></Link>
   </div>
   <div className="book-card-body">
    <Link href={`/books/${book.id}`}><h4>{book.title}</h4><p>{book.author}</p></Link>
    <div className="book-card-price"><b>{formatJOD(sale?book.discountPrice!:book.price)}</b>{sale&&<del>{formatJOD(book.price)}</del>}</div>
    <button disabled={!book.stock} onClick={()=>{addItem({id:book.id,title:book.title,author:book.author,price:sale?book.discountPrice!:book.price,cover:book.cover});notify("تمت إضافة الكتاب إلى السلة")}} className="book-add-button">{book.stock?"أضف إلى السلة":"غير متوفر"}</button>
   </div>
 </article>
}
