import { AuthForm, Field } from "@/components/auth-form";
import { updatePassword } from "../auth/actions";

export default async function NuovaPassword({ searchParams }: { searchParams: Promise<{ message?: string }> }) {
  const { message } = await searchParams;
  return <AuthForm title="Scegli una nuova password" intro="Usa una password nuova e difficile da indovinare." action={updatePassword} message={typeof message === "string" ? message : undefined}>
    <Field label="Nuova password" name="password" type="password" autoComplete="new-password" minLength={10} /><button type="submit">Aggiorna password</button>
  </AuthForm>;
}
