"use client";

import Image from "next/image";
import { useState } from "react";

export function Gallery({ images }: { images: string[] }) {
  const [current, setCurrent] = useState<string | null>(null);

  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        {images.map((url) => (
          <button key={url} onClick={() => setCurrent(url)} className="overflow-hidden rounded-xl2">
            <Image src={url} alt="Фото события" width={220} height={160} className="h-24 w-full object-cover" />
          </button>
        ))}
      </div>
      {current ? (
        <button onClick={() => setCurrent(null)} className="fixed inset-0 z-50 flex items-center justify-center bg-bg/90 p-4">
          <Image src={current} alt="Полный размер" width={1400} height={1000} className="max-h-full max-w-full rounded-xl2 object-contain" />
        </button>
      ) : null}
    </>
  );
}