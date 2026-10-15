"use client";

import { useRef } from "react";
import { GalleryPhoto } from "@/types/profile";

interface MediaSectionProps {
  coverImage: string;
  coverImageAlt: string;
  coverSubtitle: string;
  coverCropY: number; // 0 to 100 vertical alignment %
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
  coverSubtitle,
  coverCropY,
  logoImage,
  galleryImages,
  onRepositionClick,
  onAddGalleryMediaClick,
  onRemoveGalleryPhoto,
  onViewPhotoLightbox,
  onCoverFileSelected,
  onLogoFileSelected,
}: MediaSectionProps) {
  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onCoverFileSelected(file);
      e.target.value = "";
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onLogoFileSelected(file);
      e.target.value = "";
    }
  };

  return (
    <section className="bg-surface-container-lowest p-space-lg rounded-xl border border-outline-variant/60 shadow-xs space-y-space-lg">
      {/* Hidden file inputs */}
      <input
        ref={coverFileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={handleCoverChange}
      />
      <input
        ref={logoFileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={handleLogoChange}
      />

      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-outline-variant/30 pb-space-sm">
        <div className="flex items-center gap-space-xs">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10 text-primary font-label-sm font-bold">
            02
          </span>
          <div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface">
              Imagery &amp; Storefront Media
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Rich dining room atmosphere, branded assets, and visual menu highlights.
            </p>
          </div>
        </div>
        <span className="font-label-sm text-label-sm text-on-surface-variant">
          Recommended 1920×600 px
        </span>
      </div>

      {/* Cover Banner Showcase */}
      <div className="space-y-space-xs">
        <div className="relative w-full h-64 rounded-xl overflow-hidden group border border-outline-variant/60 bg-surface-container">
          <div
            className="w-full h-full bg-cover transition-all duration-300"
            style={{
              backgroundImage: `url('${coverImage}')`,
              backgroundPosition: `center ${coverCropY}%`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent pointer-events-none" />

          {/* Cover Controls Overlay */}
          <div className="absolute bottom-space-md left-space-md right-space-md flex flex-col sm:flex-row sm:items-end justify-between gap-3 text-on-primary">
            <div>
              <span className="px-2 py-0.5 rounded bg-surface/20 backdrop-blur-md text-on-primary font-label-sm text-xs tracking-wide">
                Main Storefront Banner
              </span>
              <p className="font-label-md text-label-md font-semibold mt-1 drop-shadow-sm text-white">
                {coverSubtitle || "Evening Dining Room Setting (Banani Main Hall)"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onRepositionClick}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface/90 text-primary hover:bg-surface font-label-sm text-label-sm font-semibold backdrop-blur-md shadow-xs transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">crop</span>
                <span>Reposition</span>
              </button>
              <button
                type="button"
                onClick={() => coverFileInputRef.current?.click()}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface/90 text-primary hover:bg-surface font-label-sm text-label-sm font-semibold backdrop-blur-md shadow-xs transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">photo_camera</span>
                <span>Change Cover</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Brand Logo & Atmosphere Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-space-md pt-space-xs">
        {/* Brand Logo Tile */}
        <div className="sm:col-span-4 p-space-md rounded-xl bg-surface-container-low border border-outline-variant/60 flex flex-col items-center text-center justify-between gap-space-sm">
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
            Marketplace Avatar
          </span>
          <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-outline-variant/80 shadow-xs bg-surface-container-lowest">
            {logoImage ? (
              <img
                className="w-full h-full object-cover"
                src={logoImage}
                alt="Marketplace Avatar Logo"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
                <span className="material-symbols-outlined text-4xl">storefront</span>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => logoFileInputRef.current?.click()}
            className="w-full py-1.5 rounded-lg border border-outline text-on-surface hover:bg-surface-container font-label-sm text-label-sm font-semibold transition-colors cursor-pointer"
          >
            Upload New Logo
          </button>
        </div>

        {/* Gallery Media Strip */}
        <div className="sm:col-span-8 flex flex-col justify-between gap-space-sm">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-on-surface font-semibold">
              Atmosphere Gallery ({galleryImages.length}/12 Active)
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              JPG, WEBP up to 5MB
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-xs">
            {galleryImages.map((photo) => (
              <div
                key={photo.id}
                className="relative h-24 rounded-lg overflow-hidden border border-outline-variant/60 group bg-surface-container"
              >
                <img
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  src={photo.url}
                  alt={photo.alt}
                />
                <div className="absolute inset-0 bg-primary/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 text-on-primary transition-opacity">
                  <button
                    type="button"
                    onClick={() => onViewPhotoLightbox(photo)}
                    className="p-1 rounded-md hover:bg-white/20 text-white cursor-pointer"
                    title="View Photo"
                  >
                    <span className="material-symbols-outlined text-base">visibility</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemoveGalleryPhoto(photo.id)}
                    className="p-1 rounded-md hover:bg-error/30 text-rose-200 cursor-pointer"
                    title="Remove Photo"
                  >
                    <span className="material-symbols-outlined text-base">delete</span>
                  </button>
                </div>
              </div>
            ))}

            {/* Add Media Slot */}
            {galleryImages.length < 12 && (
              <button
                type="button"
                onClick={onAddGalleryMediaClick}
                className="h-24 rounded-lg border-2 border-dashed border-outline-variant/80 hover:border-primary flex flex-col items-center justify-center gap-1 text-on-surface-variant hover:text-primary transition-colors bg-surface-container-low/50 cursor-pointer"
              >
                <span className="material-symbols-outlined text-xl">add_photo_alternate</span>
                <span className="font-label-sm text-label-sm font-semibold">+ Add Media</span>
              </button>
            )}
          </div>

          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Images are presented in public reservation previews and courier pickup instructions.
          </p>
        </div>
      </div>
    </section>
  );
}
