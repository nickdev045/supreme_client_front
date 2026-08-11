type UserAvatarProps = {
  name: string;
  photoUrl: string | null;
  size?: number;
};

function initialFromName(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  return trimmed.charAt(0).toUpperCase();
}

export function UserAvatar({ name, photoUrl, size = 40 }: UserAvatarProps) {
  const dimension = `${size}px`;

  if (photoUrl) {
    return (
      // User photo hosts vary by API; native img avoids remotePatterns gaps.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photoUrl}
        alt=""
        width={size}
        height={size}
        className="rounded-full object-cover"
        style={{ width: dimension, height: dimension }}
      />
    );
  }

  return (
    <span
      aria-hidden
      className="inline-flex items-center justify-center rounded-full bg-[var(--cream)] font-bold text-[var(--navy)]"
      style={{ width: dimension, height: dimension, fontSize: size * 0.42 }}
    >
      {initialFromName(name)}
    </span>
  );
}
