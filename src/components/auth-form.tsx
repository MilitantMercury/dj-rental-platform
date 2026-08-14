import type { ReactNode } from "react";
import Link from "next/link";

export function AuthForm({ title, intro, action, children, message }: { title: string; intro: string; action: (data: FormData) => void | Promise<void>; children: ReactNode; message?: string }) {
  return <main className="auth-shell"><section className="auth-card">
    <Link className="brand" href="/"><span className="brand-mark">ND</span><span>Noleggio DJ</span></Link>
    <h1>{title}</h1><p>{intro}</p>{message ? <div className="auth-message" role="status">{message}</div> : null}
    <form action={action} className="auth-form">{children}</form>
  </section></main>;
}

export function Field({ label, name, type = "text", autoComplete, minLength }: { label: string; name: string; type?: string; autoComplete?: string; minLength?: number }) {
  return <label>{label}<input name={name} type={type} autoComplete={autoComplete} minLength={minLength} required /></label>;
}
