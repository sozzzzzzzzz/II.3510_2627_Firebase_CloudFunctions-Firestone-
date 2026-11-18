import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js';
import { connectAuthEmulator, getAuth, signInAnonymously } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js';
import { addDoc, collection, connectFirestoreEmulator, getFirestore, onSnapshot, query, serverTimestamp, where } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';

const app = initializeApp({ projectId: 'demo-swapcampus', apiKey: 'demo-key' });
const auth = getAuth(app);
connectAuthEmulator(auth, 'http://127.0.0.1:9099');
const db = getFirestore(app);
connectFirestoreEmulator(db, '127.0.0.1', 8080);

const form = document.querySelector('#listing-form');
const button = form.querySelector('button');
const feedback = document.querySelector('#feedback');
const connection = document.querySelector('#connection');
const formatPrice = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });
const labels = { pending: 'En attente', approved: 'Publiée', rejected: 'Refusée' };

function subscribe(source, target, describe) {
  const list = document.querySelector(target);
  onSnapshot(source, (snapshot) => {
    const entries = snapshot.docs.map((doc) => doc.data());
    entries.sort((a, b) => (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0));
    const rows = (entries.length ? entries.map(describe) : ['Aucun élément.']).map((text) => {
      const item = document.createElement('li');
      item.textContent = text;
      return item;
    });
    list.replaceChildren(...rows);
  }, (error) => {
    list.textContent = 'Lecture impossible (' + error.code + ').';
  });
}

async function start() {
  const { user: { uid } } = await signInAnonymously(auth);
  connection.textContent = 'Session de démo · ' + uid.slice(0, 8);
  const listings = collection(db, 'listings');
  const describe = (item) => item.title + ' · ' + formatPrice.format(item.priceCents / 100);
  subscribe(query(listings, where('status', '==', 'approved')), '#feed', describe);
  subscribe(query(listings, where('ownerUid', '==', uid)), '#mine',
    (item) => describe(item) + ' · ' + labels[item.status]);
  subscribe(collection(db, 'users', uid, 'notifications'), '#inbox',
    (item) => '« ' + item.title + ' » · ' + labels[item.status]);

  button.disabled = false;
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const fields = new FormData(form);
    const title = fields.get('title').trim();
    if (!title) {
      feedback.textContent = 'Saisissez un titre.';
      return;
    }
    button.disabled = true;
    feedback.textContent = 'Envoi…';
    try {
      await addDoc(listings, {
        title,
        priceCents: Math.round(Number(fields.get('price')) * 100),
        ownerUid: uid,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      form.reset();
      feedback.textContent = 'Annonce envoyée pour modération.';
    } catch (error) {
      feedback.textContent = 'Envoi impossible (' + error.code + ').';
    } finally {
      button.disabled = false;
    }
  });
}

start().catch((error) => {
  connection.textContent = 'Connexion impossible. Lancez les émulateurs Firebase (' + error.code + ').';
});