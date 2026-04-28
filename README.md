# MyKajy — Application Desktop

Application de gestion financière personnelle, offline-first, avec sync GitHub Gist.

## Prérequis

- [Node.js](https://nodejs.org) v18 ou supérieur
- npm (inclus avec Node.js)

## Installation

```bash
# Dans le dossier mykajy-electron/
npm install
```

## Lancer en développement

```bash
npm start
```

## Construire un exécutable

### Windows (.exe installeur)
```bash
npm run build:win
```
→ Génère `dist/MyKajy Setup 1.0.0.exe`

### macOS (.dmg)
```bash
npm run build:mac
```
→ Génère `dist/MyKajy-1.0.0.dmg`

### Linux (.AppImage)
```bash
npm run build:linux
```
→ Génère `dist/MyKajy-1.0.0.AppImage`

## Structure du projet

```
mykajy-electron/
├── main.js        — Processus principal Electron (fenêtre, CORS, IPC)
├── preload.js     — Bridge sécurisé entre main et renderer
├── index.html     — L'application complète (HTML/CSS/JS)
├── package.json   — Configuration npm + electron-builder
├── assets/        — Icônes (à créer)
│   ├── icon.ico   — Windows
│   ├── icon.icns  — macOS
│   └── icon.png   — Linux (512x512 recommandé)
└── README.md
```

## Icônes (optionnel pour le build)

Pour créer des builds avec une icône personnalisée, place les fichiers dans `assets/` :
- `icon.png` — 512×512px minimum (source)
- Utilisable tel quel pour Linux
- Pour Windows/macOS : convertir avec [electron-icon-builder](https://www.npmjs.com/package/electron-icon-builder)

```bash
npx electron-icon-builder --input=assets/icon.png --output=assets/
```

## Sync GitHub Gist

Dans l'app : **Paramètres → Sync GitHub Gist**

1. Aller sur GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Générer un token avec le scope **gist** uniquement
3. Coller le token dans l'app

La sync fonctionne sans problème CORS dans Electron.

## Données

Les données sont stockées dans `localStorage` via la partition `persist:mykajy` d'Electron.
Emplacement selon OS :
- **Windows** : `%APPDATA%\mykajy\Local Storage\`
- **macOS** : `~/Library/Application Support/mykajy/`
- **Linux** : `~/.config/mykajy/`
