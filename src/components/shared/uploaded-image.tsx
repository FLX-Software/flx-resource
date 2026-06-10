import Image from "next/image";
import { cn } from "@/lib/utils";

const UPLOAD_SIZE = 512;

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-12 w-12",
  lg: "h-20 w-20",
};

const sizePixels = {
  sm: 32,
  md: 48,
  lg: 80,
};

interface UploadedImageProps {
  src: string;
  alt: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  rounded?: "full" | "lg";
}

export function UploadedImage({
  src,
  alt,
  size = "md",
  className,
  rounded = "lg",
}: UploadedImageProps) {
  const isBlob = src.startsWith("blob:");
  const isUpload = src.startsWith("/uploads/");
  const displayPx = sizePixels[size];

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden",
        rounded === "full" ? "rounded-full" : "rounded-lg",
        sizeClasses[size],
        className
      )}
    >
      <Image
        src={src}
        alt={alt}
        width={isUpload ? UPLOAD_SIZE : displayPx * 2}
        height={isUpload ? UPLOAD_SIZE : displayPx * 2}
        sizes={`${displayPx * 2}px`}
        quality={95}
        unoptimized={isUpload || isBlob}
        className="h-full w-full object-cover"
        draggable={false}
      />
    </div>
  );
}
