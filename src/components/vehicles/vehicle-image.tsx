import { Truck } from "lucide-react";
import { UploadedImage } from "@/components/shared/uploaded-image";
import { cn } from "@/lib/utils";

interface VehicleImageProps {
  name: string;
  photoUrl?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-12 w-12",
  lg: "h-20 w-20",
};

const iconSizes = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
};

export function VehicleImage({
  name,
  photoUrl,
  size = "lg",
  className,
}: VehicleImageProps) {
  if (photoUrl) {
    return (
      <UploadedImage
        src={photoUrl}
        alt={name}
        size={size}
        rounded="lg"
        className={className}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-lg border border-flx-blue/30 bg-flx-blue/10 text-flx-blue-light",
        sizeClasses[size],
        className
      )}
    >
      <Truck className={iconSizes[size]} />
    </div>
  );
}
