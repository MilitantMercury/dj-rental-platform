"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { signOut } from "@/app/auth/actions";

type MenuItem = { href: string; label: string };
const menuItems: Record<"Cliente" | "Owner" | "Collaboratore", MenuItem[]> = {
  Owner: [
    { href: "/area-riservata", label: "Area riservata" },
    { href: "/area-riservata/notifiche", label: "Notifiche" },
    { href: "/area-riservata/profilo", label: "Profilo" },
    { href: "/area-riservata/impostazioni", label: "Impostazioni" },
  ],
  Collaboratore: [
    { href: "/area-riservata", label: "Dashboard" },
    { href: "/area-riservata/pratiche", label: "Pratiche" },
    { href: "/area-riservata/notifiche", label: "Notifiche" },
    { href: "/area-riservata/profilo", label: "Profilo" },
  ],
  Cliente: [
    { href: "/area-riservata", label: "Area riservata" },
    { href: "/area-riservata/notifiche", label: "Notifiche" },
    { href: "/area-riservata/profilo", label: "Il mio profilo" },
    { href: "/area-riservata/richieste", label: "Le mie richieste" },
    { href: "/area-riservata/preventivi", label: "I miei preventivi" },
  ],
};

export function UserMenu({ name, role }: { name: string; role: "Cliente" | "Owner" | "Collaboratore" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const close = (event: PointerEvent) => { if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false); };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);
  return <details ref={ref} className="user-menu" open={open}><summary onClick={(event) => { event.preventDefault(); setOpen((value) => !value); }}>{name}<span className={`chevron${open ? " is-open" : ""}`} aria-hidden="true" /></summary>{open && <div className="user-menu-panel"><div className="user-menu-heading"><span>{name}</span><small>{role}</small></div><nav aria-label={`Menu ${role.toLowerCase()}`}>{menuItems[role].map(item => <Link key={item.href} onClick={() => setOpen(false)} href={item.href}>{item.label}</Link>)}</nav><form action={signOut}><button type="submit">Esci</button></form></div>}</details>;
}
