# FLX Resource – Fluck Holzbau

Ressourcenplanungs-Software für Holzbauunternehmen. Der Produktionsleiter kann Mitarbeiter und Fahrzeuge verwalten, deren Verfügbarkeit einsehen und auf Baustellen zuweisen.

## Funktionen

- **Dashboard** – KPIs, Auslastung, heutige Einsätze, Mitarbeiter-Verfügbarkeit
- **Mitarbeiter** – Team verwalten, Status (verfügbar, eingesetzt, Ferien, krank)
- **Fahrzeuge** – Flotte verwalten, Status und Einsätze
- **Baustellen** – Projekte erfassen mit zugewiesenen Ressourcen
- **Planung** – Wochenübersicht, Zuweisung von Mitarbeitern/Fahrzeugen auf Baustellen

## Starten

```bash
npm install
npm run db:push
npm run db:seed
npm run dev
```

Die App läuft unter [http://localhost:3000](http://localhost:3000).

## Technologie

- Next.js 15 (App Router)
- Prisma + SQLite
- Tailwind CSS
- TypeScript
