import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, collection, doc, getDocs, getDoc, setDoc, updateDoc, deleteDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { getAuth, Auth, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getStorage, FirebaseStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Product, SiteSettings, Order, MetricsSummary, BellclayEvent, DateFilterType, ChartDataPoint, AnalyticsEvent, AdCampaign } from '../types';

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
    console.warn('Falha no Firebase nativo do painel, operando em modo local resiliente:', err);
  }
}

const STORAGE_KEYS = {
  SETTINGS: 'bellclay_site_settings',
  PRODUCTS: 'bellclay_products',
  ORDERS: 'bellclay_orders',
  METRICS: 'bellclay_metrics',
  EVENTS: 'bellclay_events',
  CAMPAIGNS: 'bellclay_campaigns',
};


const stripUndefined = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(stripUndefined);
  }
  if (obj !== null && typeof obj === 'object') {
    const cleaned: Record<string, any> = {};
    for (const [key, val] of Object.entries(obj)) {
      if (val !== undefined) {
        cleaned[key] = stripUndefined(val);
      }
    }
    return cleaned;
  }
  return obj;
};

// Initial default settings matching store
export const DEFAULT_PANEL_SETTINGS: SiteSettings = {
  welcomeTitle: "Peças Únicas Feitas com Amor em Cerâmica Fria",
  welcomeSubtitle: "Arte modelada à mão em Campo Mourão - PR. Chaveiros, bottons, esculturas e acessórios colecionáveis para deixar seu dia mais colorido e fofo.",
  announcementText: "✨ Frete Grátis para todo o Paraná em compras acima de R$ 149! Peças 100% artesanais.",
  announcementActive: true,
  announcementLink: "#produtos",
  freeShippingThreshold: 149,
  originCep: "87302060",
  instagram: "@bellclayart",
  tiktok: "@bellclayart",
  whatsapp: "5544991074932",
  city: "Campo Mourão",
  state: "PR",
  infinitePayTag: "isabela-munhoz-4sb",
  pixDiscountPercent: 0,
  maxInstallmentsNoInterest: 3,
  mercadoPagoPublicKey: "",
  mercadoPagoAccessToken: "",
  melhorEnvioToken: "",
  catalogBottomText: "✨ Todas as nossas peças são modeladas à mão com amor, paciência e acabamento vitrificado exclusivo Bellclay.",
  coupons: [
    {
      id: "cupom-primeira-compra",
      code: "PRIMEIRACOMPRA",
      type: "percentage",
      value: 10,
      minOrderValue: 50,
      maxDiscountAmount: 30,
      active: true,
      usageCount: 0
    }
  ],
  promoBannerUrl: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=2100&q=80",
  promoBannerLink: "#produtos",
  promoBannerActive: true,
  banners: [
    {
      id: "banner-1",
      title: "Coleção Primavera Encantada",
      subtitle: "Chaveiros e miniaturas de cogumelos, flores e animaizinhos em cerâmica fria com acabamento envernizado vitrificado.",
      badge: "Lançamento Exclusivo",
      imageUrl: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1600&q=80",
      buttonText: "Ver Coleção",
      buttonLink: "#produtos",
      bgColor: "from-[#FFE2E6] to-[#FFF6F7]",
      active: true,
    },
    {
      id: "banner-2",
      title: "Bottons & Acessórios Fofos",
      subtitle: "Personalize sua bolsa, jaqueta ou estojo com bottons artesanais esculpidos e pintados um a um com carinho.",
      badge: "Mais Vendidos",
      imageUrl: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1600&q=80",
      buttonText: "Explorar Bottons",
      buttonLink: "#produtos",
      bgColor: "from-[#EBF6E4] to-[#F7FBF4]",
      active: true,
    },
    {
      id: "banner-3",
      title: "Esculturas & Porta-Jóias Decorativos",
      subtitle: "Decore seu cantinho ou presenteie alguém especial com pratinhos porta-anéis e mini estátuas originais Bellclay.",
      badge: "Edição Especial",
      imageUrl: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1600&q=80",
      buttonText: "Conhecer Peças",
      buttonLink: "#produtos",
      bgColor: "from-[#FFF3E8] to-[#FFFAF5]",
      active: true,
    }
  ],
  categories: [
    {
      id: "cat-chaveiros",
      name: "Chaveiros",
      slug: "chaveiros",
      iconName: "KeyRound",
      description: "Chaveiros fofos modelados à mão com argola reforçada e verniz vitrificador resistente."
    },
    {
      id: "cat-bottons",
      name: "Bottons & Pins",
      slug: "bottons",
      iconName: "Palette",
      description: "Pins e bottons esmaltados em cerâmica fria para dar personalidade aos seus looks."
    },
    {
      id: "cat-esculturas",
      name: "Mini Esculturas",
      slug: "esculturas",
      iconName: "Smile",
      description: "Criaturas encantadas, gatinhos, plantinhas e personagens delicados para decorar sua mesa."
    },
    {
      id: "cat-acessorios",
      name: "Porta-Jóias & Acessórios",
      slug: "porta-joias",
      iconName: "Gem",
      description: "Pratinhos porta-anéis, apoios de incenso e brincos leves em cerâmica fria hipoalergênica."
    },
    {
      id: "cat-colecoes",
      name: "Coleções Especiais",
      slug: "colecoes",
      iconName: "HeartHandshake",
      description: "Sets e conjuntos temáticos limitados para colecionar ou presentear."
    }
  ],
  events: [
    {
      id: "evento-1",
      slug: "feira-criativa-campo-mourao",
      title: "Feira de Artesanato & Criatividade de Campo Mourão",
      subtitle: "Venha conhecer nosso estande repleto de chaveiros, miniaturas e novidades exclusivas em cerâmica fria!",
      badge: "Feira Presencial",
      coverImage: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1600&q=80",
      images: [
        "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80"
      ],
      dateText: "Sábado e Domingo • 09:00 às 18:00",
      locationText: "Praça Getúlio Vargas, Centro - Campo Mourão, PR",
      description: "Um final de semana especial dedicado ao artesanato autoral e à criatividade local! O estande da Bellclay contará com todas as coleções de chaveiros, mini esculturas, bottons colecionáveis e pratinhos porta-jóias, além de brindes e demonstração de modelagem manual ao vivo. Venha bater um papo com a gente, escolher suas peças favoritas de pertinho e aproveitar condições exclusivas para quem visitar nosso espaço!",
      buttonText: "Conhecer Evento",
      active: true
    },
    {
      id: "evento-2",
      slug: "workshop-modelagem-ceramica-fria",
      title: "Oficina Criativa: Modelagem de Miniaturas Fofas",
      subtitle: "Aprenda o passo a passo da porcelana fria, desde a mistura de cores até o acabamento vitrificado.",
      badge: "Workshop",
      coverImage: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1600&q=80",
      images: [
        "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=80"
      ],
      dateText: "Próxima Turma: 14 de Novembro • 14h às 17h",
      locationText: "Ateliê Bellclay - Campo Mourão, PR",
      description: "Uma tarde deliciosa e relaxante para você colocar a mão na massa! Nessa oficina para iniciantes, você vai aprender a modelar seus próprios chaveiros de cogumelos, gatinhos e comidinhas fofas. Todo o material está incluso (massa especial de porcelana fria, estecas, tintas, argolas de chaveiro e resina protetora), com direito a coffee break e você leva suas criações prontas para casa!",
      buttonText: "Ver Detalhes do Workshop",
      active: true
    }
  ]
};

// Initial default products
export const DEFAULT_PANEL_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    title: "Chaveiro Gatinho Calico com Moranguinho",
    slug: "chaveiro-gatinho-calico-moranguinho",
    description: "Chaveiro artesanal em cerâmica fria modelado 100% à mão. Pintura em aquarela com detalhes manuais e camada dupla de resina vitrificada para alta proteção contra riscos e umidade. Acompanha corrente dourada com mosquetão reforçado.",
    price: 36.90,
    promotionalPrice: 32.90,
    costPrice: 8.50,
    category: "chaveiros",
    images: [
      "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80"
    ],
    stock: 12,
    weightKg: 0.05,
    dimensions: { heightCm: 4, widthCm: 4, lengthCm: 2 },
    featured: true,
    isNew: true,
    active: true,
    tags: ["gatinho", "morango", "fofo", "chaveiro", "bestseller"],
    rating: 5.0,
    reviewsCount: 28,
    createdAt: new Date().toISOString()
  },
  {
    id: "prod-2",
    title: "Botton Cogumelo Mágico Amanita Muscaria",
    slug: "botton-cogumelo-magico-amanita",
    description: "Pin/botton esculpido à mão em porcelana fria com fecho borboleta em metal resistente. Ideal para mochilas, jaquetas, chapéus e estojos. Esmaltado com brilho de cerâmica tradicional sem desbotar.",
    price: 24.50,
    costPrice: 4.80,
    category: "bottons",
    images: [
      "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80"
    ],
    stock: 20,
    weightKg: 0.03,
    dimensions: { heightCm: 3, widthCm: 3, lengthCm: 1 },
    featured: true,
    active: true,
    tags: ["cogumelo", "pin", "botton", "natureza", "retro"],
    rating: 4.9,
    reviewsCount: 19,
    createdAt: new Date().toISOString()
  },
  {
    id: "prod-3",
    title: "Porta-Anéis Pratinho Margarida do Campo",
    slug: "porta-aneis-pratinho-margarida-do-campo",
    description: "Pratinho decorativo ondulado no formato de margarida com centro amarelo e relevo fofo. Perfeito para guardar brincos, anéis e pequenas jóias na cabeceira ou penteadeira.",
    price: 49.90,
    promotionalPrice: 44.90,
    costPrice: 12.00,
    category: "porta-joias",
    images: [
      "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80"
    ],
    stock: 8,
    weightKg: 0.12,
    dimensions: { heightCm: 2, widthCm: 9, lengthCm: 9 },
    featured: true,
    isNew: true,
    active: true,
    tags: ["porta-jóias", "decoração", "flor", "margarida", "quarto"],
    rating: 5.0,
    reviewsCount: 34,
    createdAt: new Date().toISOString()
  }
];

// Product CRUD
export const fetchPanelProducts = async (): Promise<Product[]> => {
  if (db) {
    try {
      const snap = await getDocs(collection(db, 'products'));
      if (!snap.empty) {
        return snap.docs.map(d => ({ id: d.id, ...d.data() } as Product));
      }
    } catch (err) {
      console.warn('Erro ao carregar produtos do Firestore:', err);
    }
  }

  const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {}
  }
  return DEFAULT_PANEL_PRODUCTS;
};

export const subscribeToPanelProducts = (
  callback: (products: Product[]) => void
): (() => void) => {
  if (!db) return () => {};
  try {
    const colRef = collection(db, 'products');
    return onSnapshot(
      colRef,
      (snap) => {
        if (!snap.empty) {
          const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as Product));
          try {
            localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(list));
          } catch {}
          callback(list);
        }
      },
      (err) => {
        console.warn('Listener de produtos no painel:', err);
      }
    );
  } catch {
    return () => {};
  }
};

export const savePanelProduct = async (product: Product): Promise<void> => {
  if (db) {
    try {
      const docRef = doc(db, 'products', product.id);
      await setDoc(docRef, { ...stripUndefined(product), updatedAt: serverTimestamp() });
    } catch (err) {
      console.warn('Erro ao salvar no Firestore:', err);
    }
  }

  // Local sync
  const current = await fetchPanelProducts();
  const exists = current.findIndex(p => p.id === product.id);
  let updated: Product[];
  if (exists >= 0) {
    updated = [...current];
    updated[exists] = product;
  } else {
    updated = [product, ...current];
  }
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updated));
  window.dispatchEvent(new Event('bellclay_products_updated'));
};

export const deletePanelProduct = async (productId: string): Promise<void> => {
  if (db) {
    try {
      await deleteDoc(doc(db, 'products', productId));
    } catch (err) {
      console.warn('Erro ao deletar no Firestore:', err);
    }
  }

  const current = await fetchPanelProducts();
  const filtered = current.filter(p => p.id !== productId);
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(filtered));
  window.dispatchEvent(new Event('bellclay_products_updated'));
};

// Site Settings CRUD
// Events CRUD (Dedicated collection to avoid 1MB document limit)
export const fetchPanelEvents = async (): Promise<BellclayEvent[]> => {
  if (db) {
    try {
      const snap = await getDocs(collection(db, 'events'));
      if (!snap.empty) {
        return snap.docs.map(d => ({ id: d.id, ...d.data() } as BellclayEvent));
      }
    } catch (err) {
      console.warn('Erro ao carregar eventos do Firestore:', err);
    }
  }

  const saved = localStorage.getItem(STORAGE_KEYS.EVENTS);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {}
  }
  return DEFAULT_PANEL_SETTINGS.events || [];
};

export const savePanelEvent = async (event: BellclayEvent): Promise<void> => {
  if (db) {
    try {
      const docRef = doc(db, 'events', event.id);
      await setDoc(docRef, { ...stripUndefined(event), updatedAt: serverTimestamp() });
    } catch (err) {
      console.warn('Erro ao salvar evento no Firestore:', err);
    }
  }

  const current = await fetchPanelEvents();
  const exists = current.findIndex(e => e.id === event.id);
  let updated: BellclayEvent[];
  if (exists >= 0) {
    updated = [...current];
    updated[exists] = event;
  } else {
    updated = [event, ...current];
  }

  try {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(updated));
  } catch (err) {
    console.warn('Cota excedida no LocalStorage ao salvar eventos:', err);
  }

  // Also sync to settings local cache
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    const parsed = raw ? JSON.parse(raw) : DEFAULT_PANEL_SETTINGS;
    parsed.events = updated;
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(parsed));
  } catch {}

  window.dispatchEvent(new Event('bellclay_events_updated'));
  window.dispatchEvent(new Event('bellclay_settings_updated'));
};

export const deletePanelEvent = async (eventId: string): Promise<void> => {
  if (db) {
    try {
      await deleteDoc(doc(db, 'events', eventId));
    } catch (err) {
      console.warn('Erro ao deletar evento no Firestore:', err);
    }
  }

  const current = await fetchPanelEvents();
  const updated = current.filter(e => e.id !== eventId);

  try {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(updated));
  } catch {}

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) {
      const parsed = JSON.parse(raw);
      parsed.events = updated;
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(parsed));
    }
  } catch {}

  window.dispatchEvent(new Event('bellclay_events_updated'));
  window.dispatchEvent(new Event('bellclay_settings_updated'));
};

export const saveAllPanelEvents = async (events: BellclayEvent[]): Promise<void> => {
  const currentDb = db;
  if (currentDb) {
    try {
      await Promise.all(
        events.map(ev => setDoc(doc(currentDb, 'events', ev.id), { ...stripUndefined(ev), updatedAt: serverTimestamp() }))
      );
    } catch (err) {
      console.warn('Erro ao salvar lote de eventos no Firestore:', err);
    }
  }

  try {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
  } catch {}

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) {
      const parsed = JSON.parse(raw);
      parsed.events = events;
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(parsed));
    }
  } catch {}

  window.dispatchEvent(new Event('bellclay_events_updated'));
  window.dispatchEvent(new Event('bellclay_settings_updated'));
};

// ---------------------------------------------------------------------------
// TELAS DE ANÚNCIOS & CAMPANHAS (Landing Pages para Tráfego Pago)
// ---------------------------------------------------------------------------
export const DEFAULT_PANEL_CAMPAIGNS: AdCampaign[] = [
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


export const fetchPanelCampaigns = async (): Promise<AdCampaign[]> => {
  // 1. Read local cached campaigns first
  let localList: AdCampaign[] = [];
  const saved = localStorage.getItem(STORAGE_KEYS.CAMPAIGNS);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        localList = parsed;
      }
    } catch {}
  }

  // 2. Fetch fresh from Firestore if available
  if (db) {
    try {
      const snap = await getDocs(collection(db, 'campaigns'));
      if (!snap.empty) {
        const remoteList = snap.docs.map(d => ({ id: d.id, ...d.data() } as AdCampaign));

        // Merge remote with local (keep all unique IDs)
        const map = new Map<string, AdCampaign>();
        remoteList.forEach(c => map.set(c.id, c));
        localList.forEach(c => {
          if (!map.has(c.id)) {
            map.set(c.id, c);
          }
        });

        const merged = Array.from(map.values());
        try {
          localStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify(merged));
        } catch {}
        return merged;
      } else if (localList.length > 0) {
        // Firestore empty: seed it with local items so store can access across ports
        try {
          await Promise.all(
            localList.map(c => setDoc(doc(db!, 'campaigns', c.id), stripUndefined(c)))
          );
        } catch {}
        return localList;
      }
    } catch (err) {
      console.warn('Erro ao carregar campanhas do Firestore, usando cache local:', err);
    }
  }

  return localList.length > 0 ? localList : DEFAULT_PANEL_CAMPAIGNS;
};

export const savePanelCampaign = async (campaign: AdCampaign): Promise<void> => {
  const cleanCampaign: AdCampaign = {
    ...campaign,
    updatedAt: new Date().toISOString()
  };

  // 1. Update localStorage immediately (guarantees instantaneous local UI update)
  const saved = localStorage.getItem(STORAGE_KEYS.CAMPAIGNS);
  let current: AdCampaign[] = [];
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) current = parsed;
    } catch {}
  }
  if (current.length === 0) current = [...DEFAULT_PANEL_CAMPAIGNS];

  const idx = current.findIndex(c => c.id === cleanCampaign.id);
  if (idx >= 0) {
    current[idx] = cleanCampaign;
  } else {
    current = [cleanCampaign, ...current];
  }

  try {
    localStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify(current));
  } catch (err) {
    console.warn('Cota de LocalStorage ao salvar campanha:', err);
  }

  // 2. Persist to Firestore
  if (db) {
    try {
      const docRef = doc(db, 'campaigns', cleanCampaign.id);
      await setDoc(docRef, stripUndefined(cleanCampaign));
    } catch (err) {
      console.warn('Erro ao salvar campanha no Firestore:', err);
    }
  }

  window.dispatchEvent(new Event('bellclay_campaigns_updated'));
};

export const deletePanelCampaign = async (campaignId: string): Promise<void> => {
  // 1. Remove from localStorage immediately
  const saved = localStorage.getItem(STORAGE_KEYS.CAMPAIGNS);
  if (saved) {
    try {
      const list: AdCampaign[] = JSON.parse(saved);
      const filtered = list.filter(c => c.id !== campaignId);
      localStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify(filtered));
    } catch {}
  }

  // 2. Delete from Firestore
  if (db) {
    try {
      await deleteDoc(doc(db, 'campaigns', campaignId));
    } catch (err) {
      console.warn('Erro ao deletar campanha no Firestore:', err);
    }
  }

  window.dispatchEvent(new Event('bellclay_campaigns_updated'));
};


// Site Settings CRUD

export const fetchPanelSettings = async (): Promise<SiteSettings> => {
  let settingsObj: SiteSettings = DEFAULT_PANEL_SETTINGS;

  if (db) {
    try {
      const snap = await getDoc(doc(db, 'settings', 'general'));
      if (snap.exists()) {
        const remote = snap.data() as SiteSettings;
        settingsObj = {
          ...DEFAULT_PANEL_SETTINGS,
          ...remote,
          infinitePayTag: (remote.infinitePayTag || DEFAULT_PANEL_SETTINGS.infinitePayTag || 'isabela-munhoz-4sb').replace(/^[$@]+/, '')
        };
      }
    } catch (err) {
      console.warn('Erro ao carregar settings do Firestore:', err);
    }
  } else {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (saved) {
      try {
        settingsObj = { ...DEFAULT_PANEL_SETTINGS, ...JSON.parse(saved) };
      } catch {}
    }
  }

  // Always enrich with events from dedicated collection
  try {
    const events = await fetchPanelEvents();
    if (events && events.length > 0) {
      settingsObj.events = events;
    }
  } catch (err) {
    console.warn('Erro ao enriquecer settings com eventos:', err);
  }

  return settingsObj;
};

export const savePanelSettings = async (settings: SiteSettings): Promise<void> => {
  // If settings contains events, also save them to dedicated events collection
  if (settings.events && settings.events.length > 0) {
    await saveAllPanelEvents(settings.events);
  }

  const cleanedSettings: SiteSettings = {
    ...settings,
    infinitePayTag: (settings.infinitePayTag || 'isabela-munhoz-4sb').replace(/^[$@]+/, '').trim()
  };

  if (db) {
    try {
      await setDoc(doc(db, 'settings', 'general'), {
        ...stripUndefined(cleanedSettings),
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.warn('Erro ao salvar settings no Firestore:', err);
    }
  }

  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(cleanedSettings));
  } catch (err) {
    console.warn('Cota excedida no LocalStorage ao salvar settings:', err);
  }

  window.dispatchEvent(new Event('bellclay_settings_updated'));
};

// Orders CRUD
export const fetchPanelOrders = async (): Promise<Order[]> => {
  if (db) {
    try {
      const snap = await getDocs(collection(db, 'orders'));
      if (!snap.empty) {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as Order));
        return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
    } catch (err) {
      console.warn('Erro ao carregar pedidos do Firestore:', err);
    }
  }

  const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {}
  }

  // Sample default orders for realistic dashboard feel
  return [
    {
      id: "BC-849201",
      customer: {
        name: "Mariana Souza",
        email: "mariana.souza@gmail.com",
        phone: "(44) 99123-4567",
        cpf: "123.456.789-01"
      },
      address: {
        cep: "87303-100",
        street: "Avenida Capitão Índio Bandeira",
        number: "1420",
        complement: "Apto 402",
        neighborhood: "Centro",
        city: "Campo Mourão",
        state: "PR"
      },
      items: [
        {
          product: DEFAULT_PANEL_PRODUCTS[0],
          quantity: 2,
          customObservation: "Com mosquetão dourado reforçado"
        }
      ],
      shipping: {
        id: "pickup-local",
        name: "Retirada no Ateliê Bellclay",
        company: "Bellclay Campo Mourão",
        price: 0,
        deliveryDays: 1,
        badge: "Retirada"
      },
      subtotal: 65.80,
      discount: 0,
      shippingCost: 0,
      total: 65.80,
      paymentMethod: "pix",
      paymentStatus: "approved",
      orderStatus: "production",
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    {
      id: "BC-731904",
      customer: {
        name: "Camila Ribeiro",
        email: "camila.ribeiro@outlook.com",
        phone: "(11) 98765-4321",
        cpf: "321.654.987-12"
      },
      address: {
        cep: "04571-010",
        street: "Avenida das Nações Unidas",
        number: "12901",
        neighborhood: "Brooklin Paulista",
        city: "São Paulo",
        state: "SP"
      },
      items: [
        {
          product: DEFAULT_PANEL_PRODUCTS[2],
          quantity: 1
        },
        {
          product: DEFAULT_PANEL_PRODUCTS[1],
          quantity: 2
        }
      ],
      shipping: {
        id: "correios-sedex",
        name: "Correios SEDEX Expresso",
        company: "Correios",
        price: 34.90,
        deliveryDays: 2,
        badge: "Mais Rápido"
      },
      subtotal: 93.90,
      discount: 0,
      shippingCost: 34.90,
      total: 128.80,
      paymentMethod: "credit_card",
      paymentStatus: "approved",
      orderStatus: "shipped",
      trackingCode: "NL123456789BR",
      createdAt: new Date(Date.now() - 3600000 * 26).toISOString()
    }
  ];
};

// Real-time orders subscription for instant panel updates when webhook or checkout completes
export const subscribeToPanelOrders = (
  callback: (orders: Order[]) => void
): (() => void) => {
  if (!db) return () => {};
  try {
    const colRef = collection(db, 'orders');
    return onSnapshot(
      colRef,
      (snap) => {
        if (!snap.empty) {
          const list = snap.docs
            .map(d => ({ id: d.id, ...d.data() } as Order))
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          try {
            localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(list));
          } catch {}
          callback(list);
        }
      },
      (err) => {
        console.warn('Listener de pedidos no painel:', err);
      }
    );
  } catch {
    return () => {};
  }
};

export const updateOrderStatus = async (
  orderId: string,
  status: Order['orderStatus'],
  trackingCode?: string
): Promise<void> => {
  const paymentStatus: Order['paymentStatus'] =
    status === 'paid' || status === 'production' || status === 'shipped' || status === 'delivered'
      ? 'approved'
      : status === 'cancelled'
      ? 'rejected'
      : 'pending';

  if (db) {
    try {
      const docRef = doc(db, 'orders', orderId);
      await setDoc(
        docRef,
        {
          orderStatus: status,
          paymentStatus,
          ...(trackingCode !== undefined ? { trackingCode: trackingCode.trim() } : {}),
          updatedAt: serverTimestamp()
        },
        { merge: true }
      );
    } catch (err) {
      console.warn('Erro ao atualizar pedido no Firestore:', err);
    }
  }

  const orders = await fetchPanelOrders();
  const index = orders.findIndex(o => o.id === orderId);
  if (index >= 0) {
    orders[index].orderStatus = status;
    orders[index].paymentStatus = paymentStatus;
    if (trackingCode !== undefined) {
      orders[index].trackingCode = trackingCode.trim();
    }
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    window.dispatchEvent(new Event('bellclay_orders_updated'));
  }
};

// Analytics & Metrics Computation with Real Data & Dynamic Date Filtering
export const fetchAnalyticsEvents = async (): Promise<AnalyticsEvent[]> => {
  if (db) {
    try {
      const snap = await getDocs(collection(db, 'analytics_events'));
      if (!snap.empty) {
        return snap.docs.map(d => ({
          id: d.id,
          event: d.data().event,
          timestamp: d.data().timestamp || new Date().toISOString(),
          data: d.data().data || {},
          userAgent: d.data().userAgent
        } as AnalyticsEvent));
      }
    } catch (err) {
      console.warn('Erro ao carregar analytics_events do Firestore:', err);
    }
  }

  // Fallback to localStorage list
  try {
    const list = JSON.parse(localStorage.getItem('bellclay_events_list') || '[]');
    if (Array.isArray(list) && list.length > 0) {
      return list as AnalyticsEvent[];
    }
  } catch {}

  return [];
};

export const calculatePercentageChange = (
  current: number,
  previous: number
): { text: string; isPositive: boolean } => {
  if (previous === 0) {
    if (current > 0) return { text: '+100%', isPositive: true };
    return { text: '0%', isPositive: true };
  }
  const diff = ((current - previous) / previous) * 100;
  if (Math.abs(diff) < 0.1) return { text: '0%', isPositive: true };
  const sign = diff > 0 ? '+' : '';
  return {
    text: `${sign}${diff.toFixed(1)}%`,
    isPositive: diff >= 0
  };
};

export const computeMetrics = (
  orders: Order[],
  events: AnalyticsEvent[],
  filter: DateFilterType = '7d',
  customStart?: string,
  customEnd?: string
): MetricsSummary => {
  const now = new Date();

  // 1. Determine Window [startDate, endDate] and Previous Window [prevStartDate, prevEndDate]
  let startDate: Date;
  let endDate: Date = new Date();
  let prevStartDate: Date;
  let prevEndDate: Date;
  let comparisonLabel = 'vs período anterior';
  let filterLabel = 'Últimos 7 dias';

  if (filter === 'today') {
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    prevStartDate = new Date(startDate);
    prevStartDate.setDate(prevStartDate.getDate() - 1);
    prevEndDate = new Date(startDate.getTime() - 1);
    comparisonLabel = 'vs ontem';
    filterLabel = 'Hoje';
  } else if (filter === '7d') {
    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    startDate.setHours(0, 0, 0, 0);

    const duration = now.getTime() - startDate.getTime();
    prevEndDate = new Date(startDate.getTime() - 1);
    prevStartDate = new Date(prevEndDate.getTime() - duration);
    comparisonLabel = 'vs 7 dias anteriores';
    filterLabel = 'Últimos 7 dias';
  } else if (filter === '30d') {
    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    startDate.setHours(0, 0, 0, 0);

    const duration = now.getTime() - startDate.getTime();
    prevEndDate = new Date(startDate.getTime() - 1);
    prevStartDate = new Date(prevEndDate.getTime() - duration);
    comparisonLabel = 'vs 30 dias anteriores';
    filterLabel = 'Últimos 30 dias';
  } else if (filter === 'custom' && customStart) {
    startDate = new Date(customStart + 'T00:00:00');
    endDate = customEnd ? new Date(customEnd + 'T23:59:59.999') : new Date(customStart + 'T23:59:59.999');

    const duration = Math.max(24 * 60 * 60 * 1000, endDate.getTime() - startDate.getTime());
    prevEndDate = new Date(startDate.getTime() - 1);
    prevStartDate = new Date(prevEndDate.getTime() - duration);
    comparisonLabel = 'vs período anterior';
    filterLabel = customEnd && customEnd !== customStart
      ? `${new Date(customStart + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} a ${new Date(customEnd + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}`
      : new Date(customStart + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } else {
    // 'all'
    startDate = new Date(0);
    endDate = new Date();
    prevStartDate = new Date(0);
    prevEndDate = new Date(0);
    comparisonLabel = 'histórico total';
    filterLabel = 'Todo o histórico';
  }

  // Date check helper
  const isWithin = (dateStr: string | undefined, start: Date, end: Date) => {
    if (!dateStr) return false;
    const t = new Date(dateStr).getTime();
    return t >= start.getTime() && t <= end.getTime();
  };

  // Filter current period
  const curOrders = orders.filter(o => isWithin(o.createdAt, startDate, endDate));
  const curValidOrders = curOrders.filter(o => o.orderStatus !== 'cancelled');
  const curPaidOrders = curValidOrders.filter(
    o => o.paymentStatus === 'approved' || o.orderStatus === 'paid' || o.orderStatus === 'shipped' || o.orderStatus === 'production' || o.orderStatus === 'delivered'
  );
  const curEvents = events.filter(e => isWithin(e.timestamp, startDate, endDate));

  // Filter previous period for true comparative changes
  const prevOrders = filter === 'all' ? [] : orders.filter(o => isWithin(o.createdAt, prevStartDate, prevEndDate));
  const prevValidOrders = prevOrders.filter(o => o.orderStatus !== 'cancelled');
  const prevPaidOrders = prevValidOrders.filter(
    o => o.paymentStatus === 'approved' || o.orderStatus === 'paid' || o.orderStatus === 'shipped' || o.orderStatus === 'production' || o.orderStatus === 'delivered'
  );
  const prevEvents = filter === 'all' ? [] : events.filter(e => isWithin(e.timestamp, prevStartDate, prevEndDate));

  // Real calculations
  const totalRevenue = curPaidOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const totalOrders = curValidOrders.length;
  const averageTicket = curPaidOrders.length > 0 ? totalRevenue / curPaidOrders.length : 0;

  const pageViewsCount = curEvents.filter(e => e.event === 'page_view').length;
  const curUAs = new Set(curEvents.filter(e => e.event === 'page_view' && e.userAgent).map(e => e.userAgent));
  // Unique visitors reflect real page_view visitors or distinct orders
  const uniqueVisitors = Math.max(
    curUAs.size,
    Math.round(pageViewsCount * 0.75),
    curOrders.length > 0 ? curOrders.length : (pageViewsCount > 0 ? 1 : 0)
  );
  const pageViews = Math.max(pageViewsCount, uniqueVisitors);

  const addToCartClicks = curEvents.filter(e => e.event === 'add_to_cart').length;
  const checkoutStarts = curEvents.filter(e => e.event === 'begin_checkout').length || curOrders.length;
  const conversionRate = uniqueVisitors > 0 ? (totalOrders / uniqueVisitors) * 100 : (totalOrders > 0 ? 100 : 0);

  // Previous comparisons
  const prevRevenue = prevPaidOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const prevOrdersCount = prevValidOrders.length;
  const prevCartClicks = prevEvents.filter(e => e.event === 'add_to_cart').length;
  const prevViews = prevEvents.filter(e => e.event === 'page_view').length;
  const prevVisitors = Math.max(prevViews, prevValidOrders.length);

  const revChange = calculatePercentageChange(totalRevenue, prevRevenue);
  const ordChange = calculatePercentageChange(totalOrders, prevOrdersCount);
  const cartChange = calculatePercentageChange(addToCartClicks, prevCartClicks);
  const visChange = calculatePercentageChange(uniqueVisitors, prevVisitors);

  // 2. Generate Chart Data Points
  const chartData: ChartDataPoint[] = [];

  if (filter === 'today') {
    const blocks = [
      { label: '00h-06h', startH: 0, endH: 6 },
      { label: '06h-12h', startH: 6, endH: 12 },
      { label: '12h-18h', startH: 12, endH: 18 },
      { label: '18h-24h', startH: 18, endH: 24 }
    ];
    blocks.forEach(b => {
      const bEvents = curEvents.filter(e => {
        const d = new Date(e.timestamp);
        return d.getHours() >= b.startH && d.getHours() < b.endH;
      });
      const bOrders = curValidOrders.filter(o => {
        const d = new Date(o.createdAt);
        return d.getHours() >= b.startH && d.getHours() < b.endH;
      });
      chartData.push({
        label: b.label,
        visitors: bEvents.filter(e => e.event === 'page_view').length || bOrders.length,
        orders: bOrders.length,
        revenue: bOrders.reduce((s, o) => s + (Number(o.total) || 0), 0)
      });
    });
  } else if (filter === '7d') {
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
      const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

      const dayEvents = curEvents.filter(e => isWithin(e.timestamp, dayStart, dayEnd));
      const dayOrders = curValidOrders.filter(o => isWithin(o.createdAt, dayStart, dayEnd));
      const dayRev = dayOrders.reduce((s, o) => s + (Number(o.total) || 0), 0);

      const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      const dayName = i === 0 ? 'Hoje' : dayNames[d.getDay()];

      chartData.push({
        label: dayName,
        fullDate: `${d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}`,
        visitors: dayEvents.filter(e => e.event === 'page_view').length || dayOrders.length,
        orders: dayOrders.length,
        revenue: dayRev
      });
    }
  } else if (filter === '30d') {
    const intervalDays = 6;
    for (let i = 4; i >= 0; i--) {
      const endD = new Date(now.getTime() - i * intervalDays * 24 * 60 * 60 * 1000);
      const startD = new Date(endD.getTime() - (intervalDays - 1) * 24 * 60 * 60 * 1000);
      startD.setHours(0, 0, 0, 0);
      endD.setHours(23, 59, 59, 999);

      const periodEvents = curEvents.filter(e => isWithin(e.timestamp, startD, endD));
      const periodOrders = curValidOrders.filter(o => isWithin(o.createdAt, startD, endD));
      const periodRev = periodOrders.reduce((s, o) => s + (Number(o.total) || 0), 0);

      const lbl = `${startD.getDate()}/${startD.getMonth() + 1}`;
      chartData.push({
        label: i === 0 ? 'Atual' : lbl,
        fullDate: `${startD.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} a ${endD.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}`,
        visitors: periodEvents.filter(e => e.event === 'page_view').length || periodOrders.length,
        orders: periodOrders.length,
        revenue: periodRev
      });
    }
  } else if (filter === 'custom' && customStart) {
    const diffDays = Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)));
    if (diffDays <= 1) {
      const blocks = [
        { label: '00h-06h', startH: 0, endH: 6 },
        { label: '06h-12h', startH: 6, endH: 12 },
        { label: '12h-18h', startH: 12, endH: 18 },
        { label: '18h-24h', startH: 18, endH: 24 }
      ];
      blocks.forEach(b => {
        const bEvents = curEvents.filter(e => {
          const d = new Date(e.timestamp);
          return d.getHours() >= b.startH && d.getHours() < b.endH;
        });
        const bOrders = curValidOrders.filter(o => {
          const d = new Date(o.createdAt);
          return d.getHours() >= b.startH && d.getHours() < b.endH;
        });
        chartData.push({
          label: b.label,
          visitors: bEvents.filter(e => e.event === 'page_view').length || bOrders.length,
          orders: bOrders.length,
          revenue: bOrders.reduce((s, o) => s + (Number(o.total) || 0), 0)
        });
      });
    } else {
      const daysCount = Math.min(10, diffDays);
      const step = diffDays / daysCount;
      for (let i = 0; i < daysCount; i++) {
        const segStart = new Date(startDate.getTime() + i * step * 24 * 60 * 60 * 1000);
        const segEnd = new Date(segStart.getTime() + step * 24 * 60 * 60 * 1000);
        const pEvents = curEvents.filter(e => isWithin(e.timestamp, segStart, segEnd));
        const pOrders = curValidOrders.filter(o => isWithin(o.createdAt, segStart, segEnd));
        chartData.push({
          label: `${segStart.getDate()}/${segStart.getMonth() + 1}`,
          fullDate: `${segStart.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}`,
          visitors: pEvents.filter(e => e.event === 'page_view').length || pOrders.length,
          orders: pOrders.length,
          revenue: pOrders.reduce((s, o) => s + (Number(o.total) || 0), 0)
        });
      }
    }
  } else {
    // 'all'
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mStart = new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
      const mEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);

      const mEvents = curEvents.filter(e => isWithin(e.timestamp, mStart, mEnd));
      const mOrders = curValidOrders.filter(o => isWithin(o.createdAt, mStart, mEnd));
      const mRev = mOrders.reduce((s, o) => s + (Number(o.total) || 0), 0);

      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      chartData.push({
        label: monthNames[d.getMonth()],
        fullDate: `${monthNames[d.getMonth()]}/${d.getFullYear()}`,
        visitors: mEvents.filter(e => e.event === 'page_view').length || mOrders.length,
        orders: mOrders.length,
        revenue: mRev
      });
    }
  }

  // Peak Point
  let peakLabel = 'Sem movimentação no período';
  if (chartData.length > 0) {
    let maxPoint = chartData[0];
    for (const pt of chartData) {
      if (pt.orders > maxPoint.orders || (pt.orders === maxPoint.orders && pt.visitors > maxPoint.visitors)) {
        maxPoint = pt;
      }
    }
    if (maxPoint.visitors > 0 || maxPoint.orders > 0) {
      const dateText = maxPoint.fullDate ? `${maxPoint.label} (${maxPoint.fullDate})` : maxPoint.label;
      const revText = maxPoint.revenue > 0 ? ` • R$ ${maxPoint.revenue.toFixed(2).replace('.', ',')}` : '';
      peakLabel = `${dateText}: ${maxPoint.visitors} ${maxPoint.visitors === 1 ? 'visita' : 'visitas'} • ${maxPoint.orders} ${maxPoint.orders === 1 ? 'pedido' : 'pedidos'}${revText}`;
    }
  }

  return {
    pageViews,
    uniqueVisitors,
    addToCartClicks,
    checkoutStarts,
    totalOrders,
    totalRevenue,
    averageTicket,
    conversionRate,
    revenueChange: revChange.text,
    isRevenuePositive: revChange.isPositive,
    ordersChange: ordChange.text,
    isOrdersPositive: ordChange.isPositive,
    cartChange: cartChange.text,
    isCartPositive: cartChange.isPositive,
    visitorsChange: visChange.text,
    isVisitorsPositive: visChange.isPositive,
    comparisonLabel,
    filterLabel,
    chartData,
    peakLabel
  };
};

export const fetchMetrics = async (
  preloadedOrders?: Order[],
  filter: DateFilterType = '7d',
  customStart?: string,
  customEnd?: string
): Promise<MetricsSummary> => {
  const orders = preloadedOrders || (await fetchPanelOrders());
  const events = await fetchAnalyticsEvents();
  return computeMetrics(orders, events, filter, customStart, customEnd);
};

export { app, db, auth, storage, hasValidFirebaseConfig };
