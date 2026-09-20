import * as React from "react";
import { cn } from "@/lib/utils";

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
  variant?: "badge" | "mark";
}

export function Logo({
  size = 32,
  className,
  variant = "badge",
  ...props
}: LogoProps) {
  if (variant === "mark") {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 96 96"
        width={size}
        height={size}
        role="img"
        aria-label="HSA Plus"
        className={cn("shrink-0", className)}
        {...props}
      >
        <defs>
          <linearGradient id="hsaPlusMarkEmerald" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#065f46" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
        </defs>
        <g fill="url(#hsaPlusMarkEmerald)">
          <rect x="16" y="32" width="15" height="50" rx="2" />
          <rect x="65" y="14" width="15" height="68" rx="2" />
          <path d="M31,53 L65,37 L65,51 L31,67 Z" />
        </g>
      </svg>
    );
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 96 96"
      width={size}
      height={size}
      role="img"
      aria-label="HSA Plus"
      className={cn("shrink-0", className)}
      {...props}
    >
      <defs>
        <linearGradient id="hsaPlusBadgeEmerald" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#059669" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>
      </defs>
      <rect width="96" height="96" rx="22" fill="url(#hsaPlusBadgeEmerald)" />
      <g transform="translate(48, 48) scale(0.75) translate(-48, -48)" fill="#ffffff">
        <rect x="16" y="32" width="15" height="50" rx="2.5" />
        <rect x="65" y="14" width="15" height="68" rx="2.5" />
        <path d="M31,53 L65,37 L65,51 L31,67 Z" />
      </g>
    </svg>
  );
}
