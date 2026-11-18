import assert from 'node:assert/strict';
const root = 'http://127.0.0.1:8080/v1/projects/demo-swapcampus/databases/(default)/documents';
async function signup() {
  const response = await fetch('http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-key',
    {method:'POST',headers:{'Content-Type':'application/json'},body:'{"returnSecureToken":true}'});
  assert.equal(response.status, 200);
  return response.json();
}
const alice = await signup();
const bob = await signup();
const call = (path, user, options={}) => fetch(root + path, {
  ...options, headers:{Authorization:'Bearer ' + user.idToken,'Content-Type':'application/json'},
});
async function add(title, status='pending') {
  const id = crypto.randomUUID();
  const fields = {
    title:{stringValue:title}, priceCents:{integerValue:'1250'},
    ownerUid:{stringValue:alice.localId}, status:{stringValue:status},
  };
  const response = await call(':commit', alice, {method:'POST',body:JSON.stringify({writes:[{
    update:{name:'projects/demo-swapcampus/databases/(default)/documents/listings/' + id,fields},
    updateTransforms:[{fieldPath:'createdAt', setToServerValue:'REQUEST_TIME'}],
    currentDocument:{exists:false},
  }]})});
  assert.equal(response.status, status === 'pending' ? 200 : 403, await response.text());
  return id;
}
await add('Écriture falsifiée', 'approved');
for (const [title, expected] of [['Calculatrice TI','approved'], ['Offre SPAM !','rejected']]) {
  const id = await add(title);
  const notif = '/users/' + alice.localId + '/notifications/' + id;
  for (let attempt = 0; attempt < 60; attempt++) {
    const response = await call(notif, alice);
    if (response.ok) {
      const payload = await response.json();
      assert.equal(payload.fields.status.stringValue, expected);
      break;
    }
    assert.equal(response.status, 404);
    assert.ok(attempt < 59, 'Missing notification for ' + title);
    await new Promise(resolve=>setTimeout(resolve,500));
  }
  const listing = await call('/listings/' + id, alice);
  assert.equal((await listing.json()).fields.status.stringValue, expected);
  assert.equal((await call('/listings/' + id, bob)).status, expected === 'approved' ? 200 : 403);
  assert.equal((await call(notif, bob)).status, 403);
}
console.log('Firestore, moderation, notifications and access rules passed.');