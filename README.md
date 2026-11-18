# SwapCampus · Démo Firebase

Prototype web autonome reprenant le cas des annonces SwapCampus. Il permet de présenter Firestore et Cloud Functions sans installer Android Studio ou Xcode.

## Lancer la démo

Prérequis : Node.js 22 avec npm, JDK 21, connexion Internet pour le premier démarrage et le SDK web Firebase.

Depuis le dossier qui contient `firebase.json` :

```sh
npm ci --prefix functions
npx --yes firebase-tools@14.27.0 emulators:start --project demo-swapcampus --only auth,firestore,functions,hosting
```

Ouvrir http://127.0.0.1:5000 dans un navigateur et http://127.0.0.1:4000 pour inspecter les écritures. Garder le terminal ouvert. Le projet préfixé par `demo-` fonctionne avec les émulateurs, sans compte Firebase. Les données restent disponibles tant que les émulateurs tournent. Pour les conserver entre deux séances, arrêter une session démarrée avec `--export-on-exit=./emulator-data`, puis utiliser `--import=./emulator-data` au prochain lancement.

## Démonstration et critères de réussite

1. Déposer « Calculatrice TI » à 12,50 €. L’annonce apparaît dans Mes annonces, puis dans le fil comme publiée. La notification de publication apparaît dans la boîte de réception.
2. Déposer « Offre SPAM ! » à 1 €. L’annonce reçoit le statut Refusée et une notification. Elle reste absente du fil public.
3. Ouvrir le site en navigation privée. L’identité anonyme diffère. Le fil affiche la calculatrice, tandis que les annonces refusées et les notifications de la première session restent privées.
4. Dans l’interface des émulateurs, ouvrir `listings/{id}` et `users/{uid}/notifications/{id}`. Vérifier que les deux documents portent la même décision et le même ID d’annonce.
5. Recharger le navigateur. Vérifier que le fil est relu depuis Firestore.

## Test sur les émulateurs

Quand les émulateurs tournent, lancer `node scripts/smoke.mjs` dans un autre terminal. Le script crée deux identités anonymes et vérifie les décisions, les notifications et les règles d’accès. Il ajoute des annonces de test dans la session locale. Dans le projet à compléter, ce scénario doit passer après l’implémentation des TODO.

## Code

- `public/app.js` connecte Firebase Auth et Firestore, soumet les annonces et écoute trois flux via `onSnapshot`.
- `firestore.rules` contrôle les formes des écritures et l’accès par statut ou propriétaire.
- `functions/index.cjs` déclenche une transaction sur la création d’une annonce. Elle change le statut et crée une notification privée dont l’identifiant est celui de l’annonce.
- `functions/moderation.cjs` contient un filtre pédagogique basé sur les mots « spam » et « arnaque ».
- `node --test functions/moderation.test.cjs` teste le filtre sans accès réseau.

La notification est consultable dans l’application. Pour une intégration dans le projet Kotlin, conserver la logique serveur et remplacer la source locale des annonces par un adaptateur au même schéma. L’application mobile doit transmettre l’UID réel de l’utilisateur authentifié et respecter les requêtes autorisées.