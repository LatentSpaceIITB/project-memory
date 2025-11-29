'use client';

import Image from 'next/image';

interface PolaroidCardProps {
  imageSrc: string;
  caption: string;
  tiltClass: string; // e.g., 'rotate-[-3deg]'
  translateClass: string; // e.g., 'translate-y-[-8px]'
}

export default function PolaroidCard({
  imageSrc,
  caption,
  tiltClass,
  translateClass
}: PolaroidCardProps) {
  return (
    <div
      className={`
        bg-white p-5 pb-16 rounded-lg shadow-2xl
        transition-transform duration-300
        hover:scale-105 hover:shadow-3xl
        ${tiltClass} ${translateClass}
      `}
    >
      {/* Screenshot Image */}
      <div className="relative w-full aspect-[4/5] overflow-hidden rounded-sm">
        <Image
          src={imageSrc}
          alt={caption}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </div>

      {/* Polaroid Caption Strip */}
      <div className="mt-4 text-center">
        <p className="font-caveat text-lg text-gray-700">
          {caption}
        </p>
      </div>
    </div>
  );
}
