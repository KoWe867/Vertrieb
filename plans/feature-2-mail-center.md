# Feature 2 — Mail-Center mit Gmail-Konten — `feature/mail-center`

> Ziel: Mehrere Gmail-Konten anbinden, Mails aus Vorlagen serverseitig senden, hartes Tageslimit je Konto (Standard 300) mit Warm-up, Antworten und Bounces automatisch erkennen.

## Analyse & Entscheidungen
- **Gmail API mit OAuth 2.0** je Konto (Scopes `gmail.send`, `gmail.readonly`, `gmail.modify`). Kein SMTP mit App-Passwort: das wird von Google zunehmend blockiert und liefert keine Antworten-Erkennung.
- Google Cloud Projekt einmal anlegen (OAuth-Client „Desktop“), Client-ID/-Secret in `.env`. Jedes Konto wird über `GET /api/accounts/:id/oauth/start` verbunden; Tokens verschlüsselt in `accounts.oauth_json`.
- **Limit-Logik im `MailService`**, nicht im Frontend: `sentToday(account) < min(limit_tag, warmupLimit(account))`, sonst Queue wartet bis Mitternacht (Zeitzone des Kontos). Warm-up: Tag 1 = 20, +20/Tag bis Limit.
- Verteilung: Round-Robin über verbundene Konten mit freiem Kontingent, Antwort-Adresse = sendendes Konto.
- **Zustellbarkeit:** Pro Konto 50–100 Kalt-Mails/Tag sind realistisch; 300 ist die harte Obergrenze, nicht das Ziel. Google: 500/Tag frei, 2.000/Tag Workspace. SPF/DKIM/DMARC der Domain prüfen (Workspace) bevor Volumen steigt. Bounce-Rate > 3 % → Konto automatisch pausieren.
- Antworten: alle 5 Minuten `messages.list` mit `in:inbox newer_than:1d` je Konto; Thread-ID-Abgleich → Lead auf `rueckruf`, Kanal `anruf` („Antwort erhalten → anrufen“). Mails mit „stop/unsubscribe/nicht mehr“ → Lead `nicht_anrufen`.
- Bounces: Absender `mailer-daemon` → Lead-Mail als ungültig markieren.

## Datenmodell
```
mail_queue(id, lead_id, account_id NULL, template_id, lang, subject, body, status queued|sent|failed|paused,
           scheduled_at, sent_at, gmail_message_id, gmail_thread_id, error)
mail_events(id, account_id, lead_id, typ sent|reply|bounce|unsubscribe, ts, gmail_message_id, snippet)
accounts + warmup_day INT, paused_reason TEXT, last_sync
```

## API-Vertrag
| Methode | Route | Auth | Notizen |
|---|---|---|---|
| GET | /api/accounts/:id/oauth/start | Bearer | leitet zu Google |
| GET | /api/oauth/callback | – | speichert Tokens |
| POST | /api/mail/queue | Bearer | `{ lead_ids[], template_id }` → Anzahl eingereiht |
| GET | /api/mail/queue?status= | Bearer | |
| POST | /api/mail/send-now/:queueId | Bearer | respektiert Limit |
| GET | /api/mail/stats?tag= | Bearer | je Konto: gesendet, Limit, Antworten, Bounces |
| POST | /api/mail/sync | Bearer | Antworten/Bounces abholen |

## Build-Reihenfolge
1. `services/mail/GmailClient.js` (googleapis), OAuth-Flow, Token-Refresh.
2. `MailService.queue()`, `MailService.processQueue()` (Cron alle 5 Min), Limit + Warm-up + Round-Robin.
3. `TemplateService`: Platzhalter wie `fill()` in der App, Signatur je Konto, CAN-SPAM-Fußzeile bei `en`.
4. Sync: Antworten, Bounces, Abmeldungen → Lead-Status.
5. Desktop Mail-Center: Queue-Ansicht, Konto-Verbinden-Button, Statistik live.
6. Tests mit Fixtures (Gmail-Antworten als JSON).

## Rechtliches / Limits
- Nur Leads mit `kanal = email` und Markt außerhalb DE/AT, oder DE mit dokumentierter Einwilligung (`einwilligung_ts` am Lead, sonst lehnt der Service ab).
- Jede Kalt-Mail: Postanschrift, Abmeldehinweis. Abmeldung wird innerhalb 10 Tagen (sofort) umgesetzt.
- Limit ist serverseitig hart. Frontend kann es nicht umgehen.

## ✅ Check vor Abschluss
- [ ] Zwei Testkonten verbunden, Round-Robin nachweisbar in `mail_events`
- [ ] Limit 20 am Tag 1 wird nicht überschritten (Test mit Fake-Clock)
- [ ] Antwort auf Testmail setzt Lead auf Rückruf, „stop“ auf Nicht anrufen
- [ ] DE-Lead ohne Einwilligung wird mit 422 abgelehnt
