import Image from "next/image";
import Link from "next/link";

export default function Logo({
  className = "",
  variant = "dark",
  priority = false,
}: {
  className?: string;
  variant?: "dark" | "light";
  priority?: boolean;
}) {
  const img = (
    <Image
      src="/logo.png"
      alt="La Casa del Eifs"
      width={2168}
      height={882}
      priority={priority}
      className="h-9 w-auto"
    />
  );

  return (
    <Link
      href="/"
      aria-label="La Casa del Eifs — inicio"
      className={`inline-flex items-center ${className}`}
    >
      {variant === "light" ? (
        <span className="rounded-lg bg-white px-3 py-1.5 shadow-sm">{img}</span>
      ) : (
        img
      )}
    </Link>
  );
}
