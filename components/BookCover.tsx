export default function BookCover({ title, cover, className = "h-52" }: { title: string; cover?:string; className?: string }) {
  const letter = title?.trim()?.[0] || "ش";
  return (
    <div className={`book-cover ${cover?"has-image":""} ${className}`}>
      {cover ? <img src={cover} alt={`غلاف ${title}`} className="book-cover-image" /> : <>
      <span className="monogram text-4xl">{letter}</span>
      <div className="diamonds">
        <span /><span /><span />
      </div></>}
    </div>
  );
}
