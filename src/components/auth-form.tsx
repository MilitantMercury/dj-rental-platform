import type { FormEventHandler, ReactNode } from "react";
import Link from "next/link";
import { AppMessage } from "@/components/app-message";

export function AuthForm({ title, intro, action, children, message }: { title: string; intro: string; action: (data: FormData) => void | Promise<void>; children: ReactNode; message?: string }) {
  return <main className="auth-shell"><section className="auth-card">
    <Link className="brand" href="/"><span className="brand-mark">ND</span><span>Noleggio DJ</span></Link>
    <h1>{title}</h1><p>{intro}</p>{message ? <AppMessage message={message} /> : null}
    <form action={action} className="auth-form">{children}</form>
  </section></main>;
}

export function FieldLabel({ children, required = true }: { children: ReactNode; required?: boolean }) {
  return <span className="field-label">{children}{required && <span className="required-mark" aria-hidden="true">*</span>}</span>;
}

export function Field({ label, name, type = "text", autoComplete, minLength, maxLength, pattern, title, defaultValue, required = true, onInput }: { label: string; name: string; type?: string; autoComplete?: string; minLength?: number; maxLength?: number; pattern?: string; title?: string; defaultValue?: string; required?: boolean; onInput?: FormEventHandler<HTMLInputElement> }) {
  return <label><FieldLabel required={required}>{label}</FieldLabel><input name={name} type={type} autoComplete={autoComplete} minLength={minLength} maxLength={maxLength} pattern={pattern} title={title} defaultValue={defaultValue} required={required} onInput={onInput} /></label>;
}
