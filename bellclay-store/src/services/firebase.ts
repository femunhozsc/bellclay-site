import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, collection, doc, getDocs, getDoc, setDoc, updateDoc, deleteDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { getAuth, Auth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getStorage, FirebaseStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { DEFAULT_PRODUCTS, DEFAULT_SETTINGS } from '../data/defaultData';
import { Product, SiteSettings, Order } from '../types';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBzTUrdoJnl7A1zkHNzoAB7P39uM8LNvIA",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "bellclay-artesanatos.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "bellclay-artesanatos",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "bellclay-artesanatos.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "133944878228",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:133944878228:web:1bfd1ae87468c47e954081"
};

const hasValidFirebaseConfig = Boolean(
  (import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_API_KEY !== 'YOUR_API_KEY') ||
  firebaseConfig.apiKey.startsWith("AIzaSy")
);

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;
let storage: FirebaseStorage | null = null;

if (hasValidFirebaseConfig) {
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
    auth = getAuth(app);
    storage = getStorage(app);
  } catch (err) {
    console.warn('Falha ao inicializar Firebase nativo, operando com armazenamento persistente resiliente:', err);
  }
}

// Local Storage sync helpers for zero-setup instant operation
const STORAGE_KEYS = {
  SETTINGS: 'bellclay_site_settings',
  PRODUCTS: 'bellclay_products',
  ORDERS: 'bellclay_orders',
  METRICS: 'bellclay_metrics',
};

export const getSiteSettings = async (): Promise<SiteSettings> => {
  if (db) {
    try {
      const docRef = doc(db, 'settings', 'general');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data() as SiteSettings;
      }
    } catch (err) {
      console.warn('Erro ao buscar settings do Firestore, usando fallback:', err);
    }
  }

  const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // fallback
    }
  }
  return DEFAULT_SETTINGS;
};

export const getProducts = async (): Promise<Product[]> => {
  if (db) {
    try {
      const colRef = collection(db, 'products');
      const snap = await getDocs(colRef);
      if (!snap.empty) {
        return snap.docs.map(d => ({ id: d.id, ...d.data() } as Product));
      }
    } catch (err) {
      console.warn('Erro ao buscar produtos do Firestore, usando dados locais:', err);
    }
  }

  const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {}
  }
  return DEFAULT_PRODUCTS;
};

export const saveOrder = async (order: Order): Promise<string> => {
  if (db) {
    try {
      const docRef = doc(db, 'orders', order.id);
      await setDoc(docRef, {
        ...order,
        firebaseTimestamp: serverTimestamp()
      });
      return order.id;
    } catch (err) {
      console.warn('Erro ao salvar pedido no Firestore, salvando localmente:', err);
    }
  }

  // Local fallback
  const savedOrders: Order[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
  savedOrders.unshift(order);
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(savedOrders));

  // Dispatch storage event so admin panel on same browser/subdomain can react immediately if opened
  window.dispatchEvent(new Event('bellclay_order_saved'));
  return order.id;
};

export const trackEvent = async (eventName: string, data: Record<string, any> = {}) => {
  const eventPayload = {
    event: eventName,
    data,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent
  };

  if (db) {
    try {
      const colRef = collection(db, 'analytics_events');
      const eventDoc = doc(colRef);
      await setDoc(eventDoc, eventPayload);
    } catch (err) {
      // silent
    }
  }

  // Also log to metrics in localStorage
  try {
    const metrics = JSON.parse(localStorage.getItem(STORAGE_KEYS.METRICS) || '{}');
    metrics[eventName] = (metrics[eventName] || 0) + 1;
    localStorage.setItem(STORAGE_KEYS.METRICS, JSON.stringify(metrics));
  } catch {}
};

export { app, db, auth, storage, hasValidFirebaseConfig };
