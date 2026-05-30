import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from "react";
import Link from "next/link";

const base = "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-45";
const variants = {
  primary: "bg-cyan-300 text-slate-950 shadow-[0_0_35px_rgba(103,232,249,.35)] hover:bg-cyan-200 focus-visible:outline-cyan-200",
  secondary: "border border-white/15 bg-white/8 text-white hover:bg-white/14 focus-visible:outline-white/60",
  ghost: "text-slate-300 hover:bg-white/10 hover:text-white focus-visible:outline-white/40",
  danger: "bg-rose-500 text-white hover:bg-rose-400 focus-visible:outline-rose-300",
};

type Variant = keyof typeof variants;

export function Button({ className = "", variant = "primary", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}

export function ButtonLink({ className = "", variant = "primary", href, children, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { variant?: Variant; href: string; children: ReactNode }) {
  return <Link href={href} className={`${base} ${variants[variant]} ${className}`} {...props}>{children}</Link>;
}
