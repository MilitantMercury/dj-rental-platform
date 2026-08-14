import Link from "next/link";
import { AuthForm, Field } from "@/components/auth-form";
import { signUp } from "../auth/actions";

export default async function Registrazione({ searchParams }: { searchParams: Promise<{ message?: string }> }) {
  const { message } = await searchParams;
  return <AuthForm title="Crea il tuo account" intro="Verifica l’email per poter inviare richieste." action={signUp} message={typeof message === "string" ? message : undefined}>
    <div className="field-row"><Field label="Nome" name="firstName" autoComplete="given-name" /><Field label="Cognome" name="lastName" autoComplete="family-name" /></div>
    <Field label="Email" name="email" type="email" autoComplete="email" /><Field label="Password" name="password" type="password" autoComplete="new-password" minLength={10} />
    <small>Almeno 10 caratteri, con maiuscole, minuscole e numeri.</small><button type="submit">Registrati</button><div className="auth-links"><Link href="/accesso">Hai già un account?</Link></div>
  </AuthForm>;
}
