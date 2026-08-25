export function SiteFooter({ brandName = "Noleggio DJ" }: { brandName?: string }) {
  return <footer className="footer wow-footer site-footer">
    <div className="shell">
      <strong><span aria-hidden="true">ND</span>{brandName}</strong>
      <p>Attrezzatura e servizi per eventi</p>
      <small>Europe/Rome · Esperienze su misura</small>
    </div>
  </footer>;
}
