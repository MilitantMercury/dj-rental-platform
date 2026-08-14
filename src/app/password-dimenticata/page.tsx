import Link from "next/link";
import { AuthForm, Field } from "@/components/auth-form";
import { requestPasswordReset } from "../auth/actions";
import { getAppUrl } from "@/lib/supabase/config";

export default async function PasswordDimenticata({ searchParams }: { searchParams: Promise<{ message?: string }> }) {
  const { message } = await searchParams;
  return <AuthForm title="Recupera la password" intro="Riceverai un link se l’indirizzo è registrato." action={requestPasswordReset} message={typeof message === "string" ? message : undefined}>
    <input type="hidden" name="origin" value={getAppUrl()} /><Field label="Email" name="email" type="email" autoComplete="email" />
    <button type="submit">Invia istruzioni</button><div className="auth-links"><Link href="/accesso">Torna all’accesso</Link></div>
  </AuthForm>;
}
