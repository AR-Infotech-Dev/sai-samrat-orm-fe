import { User } from "lucide-react";

function getInitials(name = "") {
  const words = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!words.length) return "";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();

  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
}

function getAvatarTone(name = "") {
  const tones = [
    "bg-orange-100 text-orange-700",
    "bg-emerald-100 text-emerald-700",
    "bg-teal-100 text-teal-700",
    "bg-orange-100 text-amber-700",
    "bg-rose-100 text-rose-700",
  ];
  const total = String(name)
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);

  return tones[total % tones.length];
}

function ProfileAvatar({ size = 32, name = "", image = "", className = "" }) {
  const initials = getInitials(name);
  const dimension = typeof size === "number" ? `${size}px` : size;
  const fontSize = typeof size === "number" ? `${Math.max(10, size * 0.36)}px` : "12px";
  const toneClass = image ? "bg-slate-100 text-slate-500" : getAvatarTone(name);

  return (
    <div
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full ring-1 ring-white/60 ${toneClass} ${className}`}
      style={{ width: dimension, height: dimension }}
      title={name || "User"}
    >
      {image ? (
        <img src={image} alt={name || "Profile"} className="h-full w-full object-cover" />
      ) : initials ? (
        <span style={{ fontSize }} className="font-semibold leading-none">
          {initials}
        </span>
      ) : (
        <User size={Math.max(14, Number(size) * 0.55 || 16)} />
      )}
    </div>
  );
}

export default ProfileAvatar;
