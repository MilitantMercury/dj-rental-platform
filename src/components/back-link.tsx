import Link from "next/link";
import type { ReactNode } from "react";

export function BackLink({ href, children }: { href: string; children: ReactNode }) {
  return <Link className="back-link" href={href}><span aria-hidden="true">←</span>{children}</Link>;
}
