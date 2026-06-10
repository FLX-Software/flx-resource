import { cn, getInitials } from "@/lib/utils";

interface EmployeeAvatarProps {
  firstName: string;
  lastName: string;
  photoUrl?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-12 w-12 text-sm",
  lg: "h-16 w-16 text-base",
};

export function EmployeeAvatar({
  firstName,
  lastName,
  photoUrl,
  size = "md",
  className,
}: EmployeeAvatarProps) {
  const sizeClass = sizeClasses[size];

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={`${firstName} ${lastName}`}
        className={cn(
          "rounded-full object-cover",
          sizeClass,
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-amber-100 font-bold text-amber-800",
        sizeClass,
        className
      )}
    >
      {getInitials(firstName, lastName)}
    </div>
  );
}
