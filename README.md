# Noleggio DJ

Fondamenta della piattaforma single-tenant per richieste, preventivi e gestione del noleggio di attrezzatura DJ. Il sistema non è un e-commerce: ogni prenotazione richiede la conferma esplicita del gestore.

## Avvio locale

Richiede Node.js 20.9 o successivo.

```bash
npm ci
npm run dev
```

Aprire `http://localhost:3000`.

## Verifiche

```bash
npm run lint
npm run type-check
npm test
npm run test:e2e
npm run build
```

La specifica approvata si trova in `docs/Noleggio_DJ_Specifica_Tecnica_Fase_0.md`; le decisioni in `docs/DECISIONS.md`.
