import Link from "next/link";
import { UserMenu } from "@/components/user-menu";
import { CartBadge } from "@/components/cart-badge";
export function SiteHeader({ userName, role }: { userName?: string; role?: "Cliente" | "Owner" | "Collaboratore" }) { return <header className="site-header"><div className="site-header-inner"><Link className="site-brand" href="/"><span className="site-brand-mark">ND</span><span>Noleggio DJ</span></Link><nav className="site-nav" aria-label="Navigazione principale"><Link href="/catalogo">Catalogo</Link><Link className="site-cart" href="/carrello" aria-label="Apri carrello">Carrello <CartBadge /></Link>{userName && role ? <UserMenu name={userName} role={role} /> : <Link className="site-login" href="/accesso">Accedi</Link>}</nav></div></header>; }
