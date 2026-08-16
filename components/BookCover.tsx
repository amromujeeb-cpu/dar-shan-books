export default function BookCover({ title, cover, className = "h-52" }: { title: string; cover?:string; className?: string }) {
  const letter = title?.trim()?.[0] || "ش";
  return (
    <div className={`book-cover rounded-md ${cover?"has-image":""} ${className}`} style={cover?{backgroundImage:`url(${cover})`,backgroundSize:"cover",backgroundRepeat:"no-repeat",backgroundPosition:"center",backgroundColor:"#fff"}:undefined}>
      {!cover&&<>
      <span className="monogram text-4xl">{letter}</span>
      <div className="diamonds">
        <span /><span /><span />
      </div></>}
    </div>
  );
}
