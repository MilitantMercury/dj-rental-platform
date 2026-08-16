import Link from "next/link";
import { signOut } from "@/app/auth/actions";
export function UserMenu({ name }: { name: string }) { return <details className="user-menu"><summary>{name}<span aria-hidden="true">⌄</span></summary><div className="user-menu-panel"><Link href="/area-riservata">Area riservata</Link><Link href="/area-riservata/richieste">Le mie richieste</Link><Link href="/area-riservata/preventivi">I miei preventivi</Link><form action={signOut}><button type="submit">Esci</button></form></div></details>; }
