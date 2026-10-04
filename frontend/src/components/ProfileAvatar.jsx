import { useEffect, useState } from "react";

const getInitials = (name = "User") => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const ProfileAvatar = ({ name, src, size = "size-10", textSize = "text-sm", className = "" }) => {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [src]);

  const showImage = Boolean(src) && !imageError;

  return (
    <div
      className={`shrink-0 rounded-full overflow-hidden ${size} ${className} bg-primary text-primary-content flex items-center justify-center font-semibold ${textSize}`}
      aria-label={name || "User avatar"}
    >
      {showImage ? (
        <img
          src={src}
          alt={name || "User"}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  );
};

export default ProfileAvatar;
