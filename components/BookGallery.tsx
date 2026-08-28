"use client";

import { useState } from "react";
import BookCover from "./BookCover";

const views = ["front", "left", "right", "detail"] as const;

export default function BookGallery({ title, cover }: { title: string; cover?: string }) {
  const [active, setActive] = useState(0);
  const move = (step: number) => setActive((current) => (current + step + views.length) % views.length);

  return (
    <section className="book-gallery" aria-label={`صور كتاب ${title}`}>
      <div className="book-gallery-stage">
        <button type="button" className="gallery-arrow gallery-arrow-prev" onClick={() => move(-1)} aria-label="الصورة السابقة">‹</button>
        <div className={`book-gallery-book view-${views[active]}`}>
          <span className="book-gallery-pages" aria-hidden="true" />
          <BookCover title={title} cover={cover} className="book-gallery-cover" />
        </div>
        <button type="button" className="gallery-arrow gallery-arrow-next" onClick={() => move(1)} aria-label="الصورة التالية">›</button>
      </div>
      <div className="book-gallery-thumbs" role="list" aria-label="زوايا الكتاب">
        {views.map((view, index) => (
          <button key={view} type="button" role="listitem" className={`book-gallery-thumb ${active === index ? "active" : ""}`} onClick={() => setActive(index)} aria-label={`عرض الزاوية ${index + 1}`} aria-current={active === index ? "true" : undefined}>
            <span className={`book-thumb-book view-${view}`}>
              <BookCover title={title} cover={cover} className="book-thumb-cover" />
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
