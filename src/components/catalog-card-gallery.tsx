"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { catalogMediaUrl } from "@/lib/catalog-media-url";

type CardGalleryImage = { storage_path: string; alt_text: string | null };

export function CatalogCardGallery({ images, productName }: { images: CardGalleryImage[]; productName: string }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.35 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (images.length < 2 || paused || !visible || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % images.length), 4200);
    return () => window.clearInterval(timer);
  }, [images.length, paused, visible]);

  const previous = images.length > 1 ? (active - 1 + images.length) % images.length : -1;

  return <div className="catalog-card-gallery" ref={root} onPointerEnter={() => setPaused(true)} onPointerLeave={() => setPaused(false)}>
    {images.map((image, index) => <Image key={image.storage_path} className={index === active ? "is-active" : index === previous ? "is-leaving" : ""} src={catalogMediaUrl(image.storage_path) ?? ""} alt={index === active ? image.alt_text || productName : ""} aria-hidden={index === active ? undefined : true} fill quality={92} sizes="(max-width: 720px) 100vw, 40vw" />)}
    {images.length > 1 && <span className="catalog-card-gallery-flash" key={`flash-${active}`} aria-hidden="true" />}
    {images.length > 1 && <span className="catalog-card-gallery-progress" aria-hidden="true">{images.map((image, index) => <i className={index === active ? "is-active" : ""} key={image.storage_path} />)}</span>}
  </div>;
}
