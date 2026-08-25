# Osservabilità degli ambienti distribuiti

Il progetto usa due strumenti complementari:

- **Vercel Web Analytics** nel layout globale per visite e visualizzazioni pagina;
- **Grafana Cloud Observability for Supabase** per metriche infrastrutturali del database.

L’integrazione Grafana è configurata esternamente dal dashboard Supabase e non richiede dipendenze applicative o variabili Vercel. La dashboard preconfigurata osserva CPU, memoria, connessioni e pooler, query e transazioni, I/O, spazio database e replica. Le metriche possono richiedere alcuni minuti prima di comparire dopo il collegamento.

L’integrazione usa la Metrics API di Supabase. Non inserire nel repository chiavi segrete, token Grafana o credenziali del database. La disconnessione e la rotazione delle credenziali si gestiscono dai dashboard Supabase e Grafana Cloud.
