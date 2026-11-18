# SwapCampus · Atelier Firebase

**Durée indicative** · 25 minutes  
**Objectif** · Relier une création de document Firestore à une décision serveur et à une notification privée.

## Point de départ

Suivre le démarrage du README. Le formulaire et Firestore fonctionnent dès le départ. Une annonce déposée reste en attente et la boîte de réception reste vide.

## À compléter

1. Dans `functions/moderation.cjs`, normaliser les accents et la casse, puis refuser les mots entiers « spam » et « arnaque ». Le filtre doit retourner `approved` ou `rejected`. Lancer `node --test functions/moderation.test.cjs`.
2. Dans `functions/index.cjs`, utiliser le déclencheur Firestore v2 fourni. Dans une transaction, relire le document courant et sortir s’il a disparu ou s’il n’est plus `pending`.
3. Dans la même transaction, enregistrer `status` et `moderatedAt` sur l’annonce, puis écrire la notification sous `users/{ownerUid}/notifications/{listingId}`. La notification attend `listingId`, `title`, `status` et `createdAt`. Utiliser les timestamps serveur.
4. Déposer de nouvelles annonces après avoir ajouté la logique. Jouer le scénario du README, y compris la navigation privée.

## Indices

- La méthode `normalize('NFKD')` décompose les caractères accentués. La classe Unicode `\p{M}` permet de retirer les marques combinantes.
- Une transaction lit avant d’écrire et relance son calcul si un document lu change en parallèle.
- Un événement Firestore peut être remis plusieurs fois. Pourquoi vérifier l’état courant et donner un ID déterministe à la notification ?
- Firestore évalue une requête sur l’ensemble de ses résultats possibles. Pourquoi le fil filtre-t-il explicitement sur `status == 'approved'` ?

## Résultat attendu

| Entrée | Mes annonces | Fil public | Notification privée |
|---|---|---|---|
| Calculatrice TI | Publiée | Visible | Publiée |
| Offre SPAM ! | Refusée | Absente | Refusée |
| Antispam | Publiée | Visible | Publiée |

[Déclencheurs Firestore](https://firebase.google.com/docs/functions/firestore-events) · [Transactions Firestore](https://firebase.google.com/docs/firestore/manage-data/transactions)