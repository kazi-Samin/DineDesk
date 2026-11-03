"use client";

import { useRef } from "react";
import { GalleryPhoto } from "@/types/profile";

interface MediaSectionProps {
  coverImage: string;
  coverImageAlt: string;
  coverSubtitle: string;
  coverCropY: number;
  logoImage: string;
  logoImageAlt: string;
  galleryImages: GalleryPhoto[];
  onChangeCoverClick: () => void;
  onRepositionClick: () => void;
  onUploadLogoClick: () => void;
  onAddGalleryMediaClick: () => void;
  onRemoveGalleryPhoto: (id: string) => void;
  onViewPhotoLightbox: (photo: GalleryPhoto) => void;
  onCoverFileSelected: (file: File) => void;
  onLogoFileSelected: (file: File) => void;
}

export default function MediaSection({
  coverImage,
  coverImageAlt,
  coverSubtitle,
  coverCropY,
  logoImage,
  logoImageAlt,
  galleryImages,
  onRepositionClick,
  onAddGalleryMediaClick,
  onRemoveGalleryPhoto,
  onViewPhotoLightbox,
  onCoverFileSelected,
  onLogoFileSelected,
}: MediaSectionProps) {
  const coverInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#1b3b2b]/10 shadow-xs space-y-6">
      {/* Polished Section Header */}
      <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#1b3b2b]/5 text-[#1b3b2b] flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-xl">photo_library</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#1b3b2b]">Imagery &amp; Storefront Media</h2>
            <p className="text-xs text-neutral-400 font-medium">
              Rich dining room atmosphere, branded assets, and visual menu highlights.
            </p>
          </div>
        </div>
        <span className="text-[11px] font-medium text-neutral-400">
          Recommended: 1920×800 px
        </span>
      </div>

      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={coverInputRef}
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onCoverFileSelected(file);
        }}
      />
      <input
        type="file"
        ref={logoInputRef}
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onLogoFileSelected(file);
        }}
      />

      {/* Cover Banner with Actions */}
      <div className="space-y-3">
        <div className="relative w-full h-52 sm:h-64 rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200 group">
          <img
            src={coverImage}
            alt={coverImageAlt}
            style={{ objectPosition: `center ${coverCropY}%` }}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80";
            }}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end justify-between p-4 sm:p-5">
            <div className="text-white space-y-0.5">
              <span className="text-xs font-bold block">Main Storefront Banner</span>
              <p className="text-[11px] text-white/80">{coverSubtitle}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onRepositionClick}
                className="px-3 py-1.5 rounded-xl bg-white/90 hover:bg-white text-[#1b3b2b] text-xs font-bold backdrop-blur-md shadow-xs flex items-center gap-1 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">crop</span>
                <span>Reposition</span>
              </button>
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                className="px-3 py-1.5 rounded-xl bg-[#1b3b2b] hover:bg-[#1b3b2b]/90 text-white text-xs font-bold shadow-xs flex items-center gap-1 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm text-[#E2B774]">photo_camera</span>
                <span>Change Cover</span>
              </button>
            </div>
          </div>
        </div>

        {/* Brand Avatar and Atmosphere Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start pt-2">
          {/* Brand Avatar */}
          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 flex flex-col items-center text-center space-y-3">
            <span className="text-xs font-bold text-[#1b3b2b]">Marketplace Avatar</span>
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white border border-neutral-200 relative shadow-2xs">
              <img
                src={logoImage}
                alt={logoImageAlt}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=80";
                }}
              />
            </div>
            <button
              type="button"
              onClick={() => logoInputRef.current?.click()}
              className="w-full py-1.5 rounded-xl bg-white hover:bg-neutral-100 text-[#1b3b2b] text-[11px] font-bold border border-neutral-200 transition-colors cursor-pointer"
            >
              Upload Logo
            </button>
          </div>

          {/* Atmosphere Gallery Grid */}
          <div className="md:col-span-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#1b3b2b]">
                Atmosphere Gallery ({galleryImages.length}/12 Active)
              </span>
              <span className="text-[11px] text-neutral-400 font-medium">
                JPG, WEBP up to 5MB
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {galleryImages.map((photo) => (
                <div
                  key={photo.id}
                  className="relative group rounded-xl overflow-hidden aspect-square bg-neutral-100 border border-neutral-200 shadow-2xs"
                >
                  <img src={photo.url} alt={photo.alt} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onViewPhotoLightbox(photo)}
                      className="p-1 rounded-lg bg-white/90 text-[#1b3b2b] hover:bg-white cursor-pointer"
                      title="Enlarge"
                    >
                      <span className="material-symbols-outlined text-sm">zoom_in</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemoveGalleryPhoto(photo.id)}
                      className="p-1 rounded-lg bg-rose-600 text-white hover:bg-rose-700 cursor-pointer"
                      title="Delete"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                </div>
              ))}

              {galleryImages.length < 12 && (
                <button
                  type="button"
                  onClick={onAddGalleryMediaClick}
                  className="border-2 border-dashed border-neutral-200 hover:border-[#1b3b2b]/50 rounded-xl aspect-square flex flex-col items-center justify-center gap-1 text-neutral-400 hover:text-[#1b3b2b] transition-colors cursor-pointer bg-neutral-50"
                >
                  <span className="material-symbols-outlined text-xl">add_photo_alternate</span>
                  <span className="text-[10px] font-bold">Add Photo</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}