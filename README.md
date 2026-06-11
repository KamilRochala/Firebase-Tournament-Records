# Firebase-Tournament-Records

A React + Firebase app providing two tournament score trackers — **Overcooked** and **Dirt Rally 2.0** — each with an entry form, a scores/times table with differences, and podium-style standings.

---

## Setup

### 1. Clone the repo

```bash
git clone https://github.com/KamilRochala/Firebase-Tournament-Records.git
cd Firebase-Tournament-Records
```

### 2. Install dependencies

```bash
npm install
npm install firebase react-router-dom
```

### 3. Create a Firebase project

1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a new **Web** project.
2. Once created, open **Project Settings** and copy your app's config credentials.

### 4. Configure Firebase

Open `src/firebase-config.js` and replace the placeholder values with your actual credentials — keep the quotes, just swap what's inside them:

```js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "PASTE_YOUR_API_KEY_HERE",
  authDomain: "PASTE_YOUR_AUTH_DOMAIN_HERE",
  projectId: "PASTE_YOUR_PROJECT_ID_HERE",
  storageBucket: "PASTE_YOUR_STORAGE_BUCKET_HERE",
  messagingSenderId: "PASTE_YOUR_MESSAGING_SENDER_ID_HERE",
  appId: "PASTE_YOUR_APP_ID_HERE"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export default db;
```

### 5. Start the app

```bash
npm run dev
```

That's it — the app should be running locally.

---

## What does it do?

- **Two tournament trackers**: Overcooked and Dirt Rally 2.0
- **Score entry forms**: Add players and their results to either tournament
- **Scores table**: Displays times/scores with calculated differences between entries
- **Podium styling**: Top positions are visually highlighted