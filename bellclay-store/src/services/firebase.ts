import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, collection, doc, getDocs, getDoc, setDoc, updateDoc, deleteDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { getAuth, Auth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getStorage, FirebaseStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { DEFAULT_PRODUCTS, DEFAULT_SETTINGS } from '../data/defaultData';
import { Product, SiteSettings, Order, BellclayEvent } from '../types';

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
  EVENTS: 'bellclay_events',
};

export const getEvents = async (): Promise<BellclayEvent[]> => {
  if (db) {
    try {
      const colRef = collection(db, 'events');
      const snap = await getDocs(colRef);
      if (!snap.empty) {
        const events = snap.docs.map(d => ({ id: d.id, ...d.data() } as BellclayEvent));
        try {
          localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
        } catch {}
        return events;
      }
    } catch (err) {
      console.warn('Erro ao buscar eventos do Firestore:', err);
    }
  }

  const saved = localStorage.getItem(STORAGE_KEYS.EVENTS);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {}
  }
  return DEFAULT_SETTINGS.events || [];
};

export const getSiteSettings = async (): Promise<SiteSettings> => {
  // 1. Start with local cached settings for instant zero-delay render
  let settingsObj: SiteSettings = DEFAULT_SETTINGS;
  const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed) {
        settingsObj = { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch {}
  }

  // 2. Fetch fresh from Firestore with 4s timeout protection
  if (db) {
    try {
      const docRef = doc(db, 'settings', 'general');
      const fetchPromise = getDoc(docRef);
      const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 4000));
      const snap = await Promise.race([fetchPromise, timeoutPromise]);

      if (snap && 'exists' in snap && snap.exists()) {
        const remote = snap.data() as Partial<SiteSettings>;
        settingsObj = {
          ...settingsObj,
          ...remote,
          banners: Array.isArray(remote.banners) && remote.banners.length > 0
            ? remote.banners
            : (settingsObj.banners || []),
          categories: Array.isArray(remote.categories) && remote.categories.length > 0
            ? remote.categories
            : (settingsObj.categories || DEFAULT_SETTINGS.categories)
        };
        // Persist immediately in localStorage so subsequent page reloads are 0ms instant!
        try {
          localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settingsObj));
        } catch {}
      }
    } catch (err) {
      console.warn('Erro ao buscar settings do Firestore, mantendo cache:', err);
    }
  }

  // 3. Enrich with events from dedicated events collection
  try {
    const events = await getEvents();
    if (events && events.length > 0) {
      settingsObj.events = events;
      try {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settingsObj));
      } catch {}
    }
  } catch (err) {
    console.warn('Erro ao enriquecer settings com eventos na loja:', err);
  }

  return settingsObj;
};

// Real-time live synchronization listener with local storage caching
export const subscribeToSiteSettings = (
  callback: (settings: SiteSettings) => void
): (() => void) => {
  if (!db) return () => {};
  try {
    const docRef = doc(db, 'settings', 'general');
    return onSnapshot(
      docRef,
      (snap) => {
        if (snap.exists()) {
          const remote = snap.data() as Partial<SiteSettings>;
          let current: SiteSettings = DEFAULT_SETTINGS;
          try {
            const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
            if (saved) current = { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
          } catch {}

          const merged: SiteSettings = {
            ...current,
            ...remote,
            banners: Array.isArray(remote.banners) && remote.banners.length > 0
              ? remote.banners
              : (current.banners || []),
            categories: Array.isArray(remote.categories) && remote.categories.length > 0
              ? remote.categories
              : (current.categories || DEFAULT_SETTINGS.categories)
          };

          try {
            localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(merged));
          } catch {}
          callback(merged);
        }
      },
      (err) => {
        console.warn('Listener de settings do Firestore:', err);
      }
    );
  } catch {
    return () => {};
  }
};

export const getProducts = async (): Promise<Product[]> => {
  if (db) {
    try {
      const colRef = collection(db, 'products');
      const snap = await getDocs(colRef);
      if (!snap.empty) {
        const prods = snap.docs.map(d => ({ id: d.id, ...d.data() } as Product));
        try {
          localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(prods));
        } catch {}
        return prods;
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
