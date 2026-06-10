import { UploadedImage } from "@/components/shared/uploaded-image";
import { cn, getInitials } from "@/lib/utils";

interface EmployeeAvatarProps {
  firstName: string;
  lastName: string;
  photoUrl?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-12 w-12",
  lg: "h-20 w-20",
};

export function EmployeeAvatar({
  firstName,
  lastName,
  photoUrl,
  size = "lg",
  className,
}: EmployeeAvatarProps) {
  const label = `${firstName} ${lastName}`;

  if (photoUrl) {
    return (
      <UploadedImage
        src={photoUrl}
        alt={label}
        size={size}
        rounded="full"
        className={className}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-flx-blue/20 text-sm font-bold text-flx-blue-light",
        sizeClasses[size],
        className
      )}
    >
      {getInitials(firstName, lastName)}
    </div>
  );
}
