# Firebase Setup for JOMO

JOMO can use Firebase's no-cost Spark plan for the first prototype:

- Firebase Authentication: Google login
- Cloud Firestore: users, venues, review status
- Cloud Storage: listing images

## 1. Create Firebase Project

1. Go to Firebase Console.
2. Create a project, for example `jomo-app`.
3. Keep the project on the Spark plan.

## 2. Enable Google Login

1. Open Authentication.
2. Go to Sign-in method.
3. Enable Google.
4. Add your app domain later if you deploy to GitHub Pages.

## 3. Create Firestore

1. Open Firestore Database.
2. Create database.
3. Start in production mode.
4. Use a location close to your users.

Suggested collections:

```text
users/{uid}
venues/{venueId}
reviews/{reviewId}
```

## 4. Enable Storage

1. Open Storage.
2. Create a default bucket.
3. Store listing images under:

```text
venues/{venueId}/cover
venues/{venueId}/space
venues/{venueId}/case
```

## 5. Add Web App Config

In Firebase Console:

1. Project settings
2. Your apps
3. Add Web App
4. Copy the Firebase config
5. Paste it into `firebase-config.js`

Example:

```js
export const firebaseConfig = {
  apiKey: "...",
  authDomain: "jomo-app.firebaseapp.com",
  projectId: "jomo-app",
  storageBucket: "jomo-app.appspot.com",
  messagingSenderId: "...",
  appId: "...",
};
```

## 6. Suggested Security Rules

Use these as a starting point, then tighten before launch.

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function signedIn() {
      return request.auth != null;
    }

    function isAdmin() {
      return signedIn()
        && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin";
    }

    match /users/{userId} {
      allow read, update: if signedIn() && request.auth.uid == userId;
      allow create: if signedIn() && request.auth.uid == userId;
      allow read, write: if isAdmin();
    }

    match /venues/{venueId} {
      allow read: if resource.data.status == "approved" || isAdmin();
      allow create: if signedIn() && request.resource.data.ownerUserId == request.auth.uid;
      allow update: if isAdmin()
        || (signedIn() && resource.data.ownerUserId == request.auth.uid && resource.data.status in ["draft", "pending", "needs_changes"]);
      allow delete: if isAdmin();
    }
  }
}
```

Storage rules:

```js
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /venues/{venueId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## Notes

Firebase config is not a password. It is safe to keep in frontend code, but Security Rules must protect the data.

For the free Spark plan, keep the app small, avoid Cloud Functions, and monitor Firestore reads/writes and Storage usage.
