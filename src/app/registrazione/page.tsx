import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { RegistrationFields } from "@/components/registration-fields";
import { signUp } from "../auth/actions";

export default async function Registrazione({ searchParams }: { searchParams: Promise<{ message?: string }> }) {
  const { message } = await searchParams;
  return <AuthForm title="Crea il tuo account" intro="Verifica l’email per poter inviare richieste." action={signUp} message={typeof message === "string" ? message : undefined}>
    <RegistrationFields />
    <small>Almeno 10 caratteri, con maiuscole, minuscole e numeri.</small><button type="submit">Registrati</button><div className="auth-links"><Link href="/accesso">Hai già un account?</Link></div>
  </AuthForm>;
}
