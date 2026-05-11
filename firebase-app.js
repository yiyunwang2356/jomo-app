import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  GoogleAuthProvider,
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getFirestore,
  serverTimestamp,
  setDoc,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";
import { firebaseConfig, firebaseEnabled } from "./firebase-config.js";

const state = {
  app: null,
  auth: null,
  db: null,
  storage: null,
  user: null,
  role: null,
};

const roleLanding = {
  merchant: "merchantDashboard",
  admin: "admin",
};

function showStatus(message) {
  document.querySelectorAll("[data-firebase-status]").forEach((node) => {
    node.textContent = message;
  });
}

function setSession(user, role) {
  document.querySelectorAll("[data-session-email]").forEach((node) => {
    node.textContent = user?.email || "尚未登入";
  });
  document.querySelectorAll("[data-session-role]").forEach((node) => {
    node.textContent = role === "admin" ? "管理員登入中" : "商家登入中";
  });
}

async function ensureUserProfile(user, requestedRole) {
  const profileRef = doc(state.db, "users", user.uid);
  const snapshot = await getDoc(profileRef);
  const existing = snapshot.exists() ? snapshot.data() : {};
  const role = existing.role || requestedRole || "merchant";

  await setDoc(
    profileRef,
    {
      email: user.email,
      displayName: user.displayName || "",
      photoURL: user.photoURL || "",
      role,
      updatedAt: serverTimestamp(),
      createdAt: existing.createdAt || serverTimestamp(),
    },
    { merge: true }
  );

  return role;
}

async function handleGoogleLogin(role) {
  if (!firebaseEnabled) {
    showStatus("Firebase 尚未設定。請先填入 firebase-config.js。");
    return false;
  }

  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(state.auth, provider);
  const assignedRole = await ensureUserProfile(result.user, role);
  state.role = assignedRole;
  setSession(result.user, assignedRole);
  showStatus(`已登入：${result.user.email}`);
  return assignedRole === role || role === "merchant";
}

async function createVenueDraft(form) {
  if (!firebaseEnabled || !state.user) return null;

  const formData = new FormData(form);
  const venueRef = await addDoc(collection(state.db, "venues"), {
    ownerUserId: state.user.uid,
    ownerEmail: state.user.email,
    name: formData.get("name") || "New Fan Space",
    type: formData.get("type") || "展覽與快閃複合空間",
    location: formData.get("location") || "",
    officialUrl: formData.get("officialUrl") || "",
    tags: formData.get("tags") || "",
    description: formData.get("description") || "",
    status: "pending",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return venueRef.id;
}

async function uploadVenueImage(file, venueId, imageType) {
  if (!firebaseEnabled || !state.user || !file) return null;

  const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const imageRef = ref(state.storage, `venues/${venueId}/${imageType}/${Date.now()}-${cleanName}`);
  await uploadBytes(imageRef, file);
  return getDownloadURL(imageRef);
}

function bindAuthButtons() {
  document.querySelectorAll("[data-google-login]").forEach((button) => {
    button.addEventListener(
      "click",
      async (event) => {
        if (!firebaseEnabled) return;

        event.preventDefault();
        event.stopImmediatePropagation();

        const requestedRole = button.dataset.googleLogin;
        try {
          const allowed = await handleGoogleLogin(requestedRole);
          if (!allowed) {
            showStatus("此 Google 帳號沒有管理員權限。");
            return;
          }
          window.JOMOShowScreen?.(roleLanding[requestedRole] || "merchantDashboard");
        } catch (error) {
          showStatus(`登入失敗：${error.message}`);
        }
      },
      true
    );
  });
}

function bindSignOut() {
  document.querySelectorAll("[data-sign-out]").forEach((button) => {
    button.addEventListener("click", async () => {
      if (!firebaseEnabled) return;
      await signOut(state.auth);
      showStatus("已登出");
      window.JOMOShowScreen?.("account");
    });
  });
}

function initFirebase() {
  if (!firebaseEnabled) {
    showStatus("Firebase 尚未設定，現在使用 prototype 模式。");
    return;
  }

  state.app = initializeApp(firebaseConfig);
  state.auth = getAuth(state.app);
  state.db = getFirestore(state.app);
  state.storage = getStorage(state.app);

  onAuthStateChanged(state.auth, (user) => {
    state.user = user;
    if (user) {
      setSession(user, state.role || "merchant");
      showStatus(`已登入：${user.email}`);
    }
  });
}

window.JOMOFirebase = {
  createVenueDraft,
  uploadVenueImage,
};

initFirebase();
bindAuthButtons();
bindSignOut();
