import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, collection, doc, getDocs, getDoc, setDoc, updateDoc, deleteDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { getAuth, Auth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getStorage, FirebaseStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { DEFAULT_PRODUCTS, DEFAULT_SETTINGS } from '../data/defaultData';
import { Product, SiteSettings, Order, BellclayEvent, AdCampaign } from '../types';

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
  CAMPAIGNS: 'bellclay_campaigns',
};


export const getEvents = async (): Promise<BellclayEvent[]> => {
  if (db) {
    try {
      const colRef = collection(db, 'events');
      const snap = await getDocs(colRef);
      if (!snap.empty) {
        const events = snap.docs
          .map(d => ({ id: d.id, ...d.data() } as BellclayEvent))
          .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));
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
          infinitePayTag: (remote.infinitePayTag || settingsObj.infinitePayTag || 'isabela-munhoz-4sb').replace(/^[$@]+/, ''),
          banners: Array.isArray(remote.banners)
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
            infinitePayTag: (remote.infinitePayTag || current.infinitePayTag || 'isabela-munhoz-4sb').replace(/^[$@]+/, ''),
            banners: Array.isArray(remote.banners)
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

export const subscribeToEvents = (
  callback: (events: BellclayEvent[]) => void
): (() => void) => {
  if (!db) return () => {};
  try {
    const colRef = collection(db, 'events');
    return onSnapshot(
      colRef,
      (snap) => {
        const events = snap.docs
          .map(d => ({ id: d.id, ...d.data() } as BellclayEvent))
          .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));
        try {
          localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
        } catch {}
        callback(events);
      },
      (err) => {
        console.warn('Listener de eventos do Firestore:', err);
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
        const prods = snap.docs
          .map(d => ({ id: d.id, ...d.data() } as Product))
          .filter(p => p.active !== false);
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
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.filter((p: Product) => p.active !== false);
      }
    } catch {}
  }
  return DEFAULT_PRODUCTS;
};

export const subscribeToProducts = (
  callback: (products: Product[]) => void
): (() => void) => {
  if (!db) return () => {};
  try {
    const colRef = collection(db, 'products');
    return onSnapshot(
      colRef,
      (snap) => {
        const prods = snap.docs
          .map(d => ({ id: d.id, ...d.data() } as Product))
          .filter(p => p.active !== false);
        try {
          localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(prods));
        } catch {}
        callback(prods);
      },
      (err) => {
        console.warn('Listener de produtos do Firestore:', err);
      }
    );
  } catch {
    return () => {};
  }
};

// Recursively remove undefined fields before saving to Firestore while preserving FieldValues
export const sanitizeForFirestore = (obj: any): any => {
  if (obj === undefined) return null;
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return obj.toISOString();
  if (typeof obj._methodName === 'string') return obj; // Preserve Firestore serverTimestamp()
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeForFirestore(item)).filter(item => item !== undefined);
  }
  const cleaned: Record<string, any> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val !== undefined) {
      cleaned[key] = sanitizeForFirestore(val);
    }
  }
  return cleaned;
};

export const saveOrder = async (order: Order): Promise<string> => {
  const cleanOrder = sanitizeForFirestore(order);

  if (db) {
    try {
      const docRef = doc(db, 'orders', order.id);
      await setDoc(docRef, {
        ...cleanOrder,
        firebaseTimestamp: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Automatically decrement product stock in Firestore when order is placed
      for (const item of order.items || []) {
        if (item.product?.id) {
          try {
            const prodRef = doc(db, 'products', item.product.id);
            const prodSnap = await getDoc(prodRef);
            if (prodSnap.exists()) {
              const currentStock = Number(prodSnap.data().stock ?? item.product.stock ?? 0);
              const nextStock = Math.max(0, currentStock - (item.quantity || 1));
              await setDoc(prodRef, { stock: nextStock, updatedAt: serverTimestamp() }, { merge: true });
            }
          } catch (stockErr) {
            console.warn('Aviso ao atualizar estoque do produto:', stockErr);
          }
        }
      }
    } catch (err) {
      console.error('Erro ao salvar pedido no Firestore, salvando localmente:', err);
    }
  }

  // Local sync
  try {
    const savedOrders: Order[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
    const existingIdx = savedOrders.findIndex(o => o.id === order.id);
    if (existingIdx >= 0) {
      savedOrders[existingIdx] = cleanOrder;
    } else {
      savedOrders.unshift(cleanOrder);
    }
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(savedOrders));
  } catch {}

  window.dispatchEvent(new Event('bellclay_order_saved'));
  window.dispatchEvent(new Event('bellclay_orders_updated'));
  return order.id;
};

const matchesCustomerOrder = (
  order: Order,
  criteria: { uid?: string; email?: string; cpf?: string }
): boolean => {
  if (!order || !order.customer) return false;
  const cleanEmail = (criteria.email || '').trim().toLowerCase();
  const cleanCpf = (criteria.cpf || '').replace(/\D/g, '');
  const cleanUid = (criteria.uid || '').trim();

  const orderUid = (order.customer.uid || '').trim();
  const orderEmail = (order.customer.email || '').trim().toLowerCase();
  const orderCpf = (order.customer.cpf || '').replace(/\D/g, '');

  if (cleanUid && orderUid && cleanUid === orderUid) return true;
  if (cleanEmail && orderEmail && cleanEmail === orderEmail) return true;
  if (cleanCpf && cleanCpf.length >= 11 && orderCpf && cleanCpf === orderCpf) return true;
  return false;
};

export const getCustomerOrders = async (criteria: {
  uid?: string;
  email?: string;
  cpf?: string;
}): Promise<Order[]> => {
  const localOrders: Order[] = (() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
    } catch {
      return [];
    }
  })();

  const hasCriteria = Boolean(
    (criteria.uid && criteria.uid.trim()) ||
    (criteria.email && criteria.email.trim()) ||
    (criteria.cpf && criteria.cpf.replace(/\D/g, '').length >= 11)
  );

  if (db) {
    try {
      const snap = await getDocs(collection(db, 'orders'));
      if (!snap.empty) {
        const remoteOrders = snap.docs.map(d => ({ id: d.id, ...d.data() } as Order));
        const orderMap = new Map<string, Order>();

        // Local orders first, then remote overwrites with latest status from panel
        for (const lo of localOrders) {
          if (!hasCriteria || matchesCustomerOrder(lo, criteria)) {
            orderMap.set(lo.id, lo);
          }
        }
        for (const ro of remoteOrders) {
          if (hasCriteria ? matchesCustomerOrder(ro, criteria) : localOrders.some(lo => lo.id === ro.id)) {
            orderMap.set(ro.id, ro);
          }
        }

        const merged = Array.from(orderMap.values()).sort(
          (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );

        // Update local cache with latest statuses from Firestore
        try {
          const updatedLocal = localOrders.map(lo => orderMap.get(lo.id) || lo);
          for (const m of merged) {
            if (!updatedLocal.some(u => u.id === m.id)) {
              updatedLocal.unshift(m);
            }
          }
          localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updatedLocal));
        } catch {}

        return merged;
      }
    } catch (err) {
      console.warn('Erro ao buscar pedidos do cliente no Firestore:', err);
    }
  }

  const filteredLocal = hasCriteria
    ? localOrders.filter(o => matchesCustomerOrder(o, criteria))
    : localOrders;

  return filteredLocal.sort(
    (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  );
};

export const subscribeToCustomerOrders = (
  criteria: { uid?: string; email?: string; cpf?: string },
  callback: (orders: Order[]) => void
): (() => void) => {
  if (!db) return () => {};
  const hasCriteria = Boolean(
    (criteria.uid && criteria.uid.trim()) ||
    (criteria.email && criteria.email.trim()) ||
    (criteria.cpf && criteria.cpf.replace(/\D/g, '').length >= 11)
  );

  try {
    const colRef = collection(db, 'orders');
    return onSnapshot(
      colRef,
      (snap) => {
        const localOrders: Order[] = (() => {
          try {
            return JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
          } catch {
            return [];
          }
        })();

        const remoteOrders = snap.docs.map(d => ({ id: d.id, ...d.data() } as Order));
        const orderMap = new Map<string, Order>();

        for (const lo of localOrders) {
          if (!hasCriteria || matchesCustomerOrder(lo, criteria)) {
            orderMap.set(lo.id, lo);
          }
        }
        for (const ro of remoteOrders) {
          if (hasCriteria ? matchesCustomerOrder(ro, criteria) : localOrders.some(lo => lo.id === ro.id)) {
            orderMap.set(ro.id, ro);
          }
        }

        const merged = Array.from(orderMap.values()).sort(
          (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );

        try {
          const updatedLocal = localOrders.map(lo => orderMap.get(lo.id) || lo);
          for (const m of merged) {
            if (!updatedLocal.some(u => u.id === m.id)) {
              updatedLocal.unshift(m);
            }
          }
          localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updatedLocal));
        } catch {}

        callback(merged);
      },
      (err) => {
        console.warn('Listener de pedidos do cliente no Firestore:', err);
      }
    );
  } catch {
    return () => {};
  }
};

export const getOrderById = async (orderId: string): Promise<Order | null> => {
  if (db) {
    try {
      const docRef = doc(db, 'orders', orderId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() } as Order;
      }
    } catch (err) {
      console.warn('Erro ao buscar pedido no Firestore:', err);
    }
  }

  try {
    const savedOrders: Order[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
    const found = savedOrders.find(o => o.id === orderId);
    if (found) return found;
  } catch {}

  return null;
};

export const confirmOrderPayment = async (
  orderId: string,
  details: {
    captureMethod?: string;
    receiptUrl?: string;
    transactionNsu?: string;
    slug?: string;
  } = {}
): Promise<Order | null> => {
  const resolvedMethod: Order['paymentMethod'] =
    details.captureMethod === 'pix'
      ? 'pix'
      : details.captureMethod === 'credit_card'
      ? 'credit_card'
      : 'infinitepay';

  const updates: Record<string, any> = {
    paymentStatus: 'approved',
    orderStatus: 'paid',
  };

  if (details.captureMethod) {
    updates.paymentMethod = resolvedMethod;
  }
  if (details.receiptUrl) {
    updates.receiptUrl = details.receiptUrl;
  }
  if (details.transactionNsu) {
    updates.transactionNsu = details.transactionNsu;
  }
  if (details.slug) {
    updates.infinitePaySlug = details.slug;
  }

  if (db) {
    try {
      const docRef = doc(db, 'orders', orderId);
      await setDoc(
        docRef,
        {
          ...updates,
          updatedAt: serverTimestamp()
        },
        { merge: true }
      );
    } catch (err) {
      console.warn('Erro ao confirmar pagamento no Firestore:', err);
    }
  }

  // Update local storage order list
  try {
    const savedOrders: Order[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
    const idx = savedOrders.findIndex(o => o.id === orderId);
    if (idx >= 0) {
      savedOrders[idx] = {
        ...savedOrders[idx],
        ...updates
      };
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(savedOrders));
    }
  } catch {}

  window.dispatchEvent(new Event('bellclay_order_saved'));
  return await getOrderById(orderId);
};

export const subscribeToOrder = (
  orderId: string,
  callback: (order: Order) => void
): (() => void) => {
  if (!db) return () => {};
  try {
    const docRef = doc(db, 'orders', orderId);
    return onSnapshot(
      docRef,
      (snap) => {
        if (snap.exists()) {
          const orderData = { id: snap.id, ...snap.data() } as Order;
          // Also sync into localStorage so AccountPage stays up to date
          try {
            const savedOrders: Order[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
            const idx = savedOrders.findIndex(o => o.id === orderId);
            if (idx >= 0) {
              savedOrders[idx] = orderData;
              localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(savedOrders));
            }
          } catch {}
          callback(orderData);
        }
      },
      (err) => {
        console.warn('Listener do pedido no Firestore:', err);
      }
    );
  } catch {
    return () => {};
  }
};

export const subscribeToOrderById = subscribeToOrder;

export const trackEvent = async (eventName: string, data: Record<string, any> = {}) => {
  const eventPayload = sanitizeForFirestore({
    event: eventName,
    data,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent
  });

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

    const eventsList: any[] = JSON.parse(localStorage.getItem('bellclay_events_list') || '[]');
    eventsList.push(eventPayload);
    if (eventsList.length > 500) eventsList.splice(0, eventsList.length - 500);
    localStorage.setItem('bellclay_events_list', JSON.stringify(eventsList));
  } catch {}
};

// ---------------------------------------------------------------------------
// TELAS DE ANÚNCIOS & CAMPANHAS (Landing Pages para Tráfego Pago)
// ---------------------------------------------------------------------------
export const DEFAULT_STORE_CAMPAIGNS: AdCampaign[] = [
  {
    id: "camp-gatinhos",
    name: "Instagram Stories - Coleção Gatinhos",
    slug: "gatinhos-fofos",
    active: true,
    bannerUrl: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1600&q=80",
    mobileBannerUrl: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80",
    overlayOpacity: 50,
    badgeText: "Edição Especial",
    themeStyle: "soft-pink",
    headline: "Peças Únicas em Cerâmica Fria Feitas com Amor",
    subtitle: "Modeladas e pintadas à mão em Campo Mourão - PR. Dê um toque de afeto à sua rotina com chaveiros e bottons colecionáveis.",
    storyText: "Cada detalhe nasce de um pedaço de cerâmica fria moldado pacientemente com as mãos, pintado à mão e selado com verniz vitrificado resistente. Peças que contam histórias e carregam afeto.",
    highlights: [
      "Modelagem 100% Manual",
      "Frete Grátis acima de R$ 149",
      "Embalagem para Presente",
      "Envio para todo o Brasil"
    ],
    showCoupon: true,
    couponCode: "BEMVINDO10",
    couponDiscountText: "10% OFF na Primeira Compra",
    showFeaturedProduct: true,
    featuredProductId: "prod-1",
    showTrustBadges: true,
    trustBadgeText: "Avaliação 5.0 • Mais de 500 pedidos entregues no Brasil",
    buttonText: "Conhecer o site",
    targetUrl: "/",
    secondaryButtonText: "Atendimento no WhatsApp",
    secondaryButtonUrl: "https://wa.me/5544999999999",
    viewsCount: 142,
    clicksCount: 89,
    createdAt: new Date().toISOString()
  }
];


export const getCampaignBySlug = async (slug: string): Promise<AdCampaign | null> => {
  const normalizedSlug = slug.toLowerCase().trim();

  // 1. Fetch from Firestore for authoritative latest updates
  if (db) {
    try {
      const colRef = collection(db, 'campaigns');
      const snap = await getDocs(colRef);
      if (!snap.empty) {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as AdCampaign));
        try {
          localStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify(list));
        } catch {}
        const match = list.find(c => c.slug?.toLowerCase().trim() === normalizedSlug);
        if (match) return match;
      }
    } catch (err) {
      console.warn('Erro ao carregar campanha do Firestore:', err);
    }
  }

  // 2. Fallback to localStorage
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.CAMPAIGNS);
    if (saved) {
      const parsed: AdCampaign[] = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        const found = parsed.find(c => c.slug?.toLowerCase().trim() === normalizedSlug);
        if (found) return found;
      }
    }
  } catch {}

  // 3. Fallback to default sample campaigns
  const fallback = DEFAULT_STORE_CAMPAIGNS.find(c => c.slug?.toLowerCase().trim() === normalizedSlug);
  return fallback || null;
};


export const trackCampaignView = async (campaignId: string): Promise<void> => {
  if (db) {
    try {
      const docRef = doc(db, 'campaigns', campaignId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const currentViews = (snap.data().viewsCount || 0) + 1;
        await updateDoc(docRef, { viewsCount: currentViews, updatedAt: serverTimestamp() });
      }
    } catch {}
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEYS.CAMPAIGNS);
    if (saved) {
      const list: AdCampaign[] = JSON.parse(saved);
      const idx = list.findIndex(c => c.id === campaignId);
      if (idx >= 0) {
        list[idx].viewsCount = (list[idx].viewsCount || 0) + 1;
        localStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify(list));
      }
    }
  } catch {}
};

export const trackCampaignClick = async (campaignId: string): Promise<void> => {
  if (db) {
    try {
      const docRef = doc(db, 'campaigns', campaignId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const currentClicks = (snap.data().clicksCount || 0) + 1;
        await updateDoc(docRef, { clicksCount: currentClicks, updatedAt: serverTimestamp() });
      }
    } catch {}
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEYS.CAMPAIGNS);
    if (saved) {
      const list: AdCampaign[] = JSON.parse(saved);
      const idx = list.findIndex(c => c.id === campaignId);
      if (idx >= 0) {
        list[idx].clicksCount = (list[idx].clicksCount || 0) + 1;
        localStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify(list));
      }
    }
  } catch {}
};

export { app, db, auth, storage, hasValidFirebaseConfig };

