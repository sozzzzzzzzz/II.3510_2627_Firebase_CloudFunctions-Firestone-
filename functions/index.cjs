const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { moderate } = require('./moderation.cjs');

initializeApp();
const db = getFirestore();

exports.moderateListing = onDocumentCreated(
  { document: 'listings/{listingId}', retry: true },
  async ({ data, params }) => {
    if (!data) return;
    // TODO 2 : relire l’annonce avec db.runTransaction et vérifier le statut.
    // TODO 3 : appeler moderate, mettre l’annonce à jour et créer la notification.
    // Utiliser FieldValue.serverTimestamp() pour les deux dates serveur.
  },
);