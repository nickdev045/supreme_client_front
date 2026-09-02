"use client";

import Image from "next/image";
import { useState } from "react";

import {
  DEFAULT_COMPANY_LOGO,
  companyLogoSrc,
  isRemoteImageSrc,
} from "@/lib/company-brand";

type CompanyBrandLogoProps = {
  name: string;
  photoUrl: string | null;
  size: number;
  className?: string;
  priority?: boolean;
  decorative?: boolean;
};

export function CompanyBrandLogo({
  name,
  photoUrl,
  size,
  className,
  priority = false,
  decorative = false,
}: CompanyBrandLogoProps) {
  const resolvedSrc = companyLogoSrc(photoUrl);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const src = failedSrc === resolvedSrc ? DEFAULT_COMPANY_LOGO : resolvedSrc;

  return (
    <Image
      src={src}
      alt={decorative ? "" : name}
      width={size}
      height={size}
      className={className}
      unoptimized={isRemoteImageSrc(src)}
      priority={priority}
      onError={() => {
        if (resolvedSrc !== DEFAULT_COMPANY_LOGO) setFailedSrc(resolvedSrc);
      }}
    />
  );
}
