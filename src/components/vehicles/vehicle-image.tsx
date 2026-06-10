import { Truck } from "lucide-react";
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
  lg: "h-16 w-16",
};

const iconSizes = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
};

export function VehicleImage({
  name,
  photoUrl,
  size = "md",
  className,
}: VehicleImageProps) {
  const sizeClass = sizeClasses[size];

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name}
        className={cn("rounded-lg object-cover", sizeClass, className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-lg bg-blue-50 text-blue-700",
        sizeClass,
        className
      )}
    >
      <Truck className={iconSizes[size]} />
    </div>
  );
}
