# Activity Gym - GitHub-Version

Das ist die lauffähige kostenlose Web-App-Version für GitHub Pages.

## 1. Lokal testen
```bash
npm install
npm run dev
```

## 2. Für GitHub Pages vorbereiten
Diese Version ist bereits für ein Repository mit dem Namen `fitness-app` vorbereitet, weil in `vite.config.js` steht:

```js
base: "/fitness-app/"
```

Wenn dein Repository anders heißt, ändere diese Zeile entsprechend.

Beispiel:
- Repository heißt `mein-fitness-tracker`
- dann setze:
```js
base: "/mein-fitness-tracker/"
```

## 3. Build erstellen
```bash
npm install
npm run build
```

## 4. Auf GitHub hochladen
- Neues Repository anlegen
- Alle Dateien hochladen
- Commit machen

## 5. GitHub Pages aktivieren
- GitHub Repository öffnen
- Settings
- Pages
- Source: `GitHub Actions` oder alternativ statisches Deployment nutzen

Der einfachste kostenlose Weg ist häufig:
- lokal `npm run build`
- Inhalt des `dist`-Ordners deployen

## 6. Auf dem iPhone nutzen
- Link in Safari öffnen
- Teilen
- Zum Home-Bildschirm

## Hinweise
- Speicherung läuft lokal im Browser über `localStorage`
- Benachrichtigungen funktionieren browserbasiert und nicht wie komplett native iPhone-Push-Notifications
