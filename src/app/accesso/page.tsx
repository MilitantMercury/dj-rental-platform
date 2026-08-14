import Link from "next/link";
import { AuthForm, Field } from "@/components/auth-form";
import { signIn } from "../auth/actions";

export default async function Accesso({ searchParams }: { searchParams: Promise<{ message?: string }> }) {
  const { message } = await searchParams;
  return <AuthForm title="Bentornato" intro="Accedi alla tua area riservata." action={signIn} message={typeof message === "string" ? message : undefined}>
    <Field label="Email" name="email" type="email" autoComplete="email" /><Field label="Password" name="password" type="password" autoComplete="current-password" />
    <button type="submit">Accedi</button><div className="auth-links"><Link href="/password-dimenticata">Password dimenticata?</Link><Link href="/registrazione">Crea un account</Link></div>
  </AuthForm>;
}
