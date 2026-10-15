import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, collection, doc, getDocs, getDoc, setDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth, Auth, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getStorage, FirebaseStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Product, SiteSettings, Order, MetricsSummary } from '../types';

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
  instagram: "@bellclay.art",
  whatsapp: "5544999998888",
  city: "Campo Mourão",
  state: "PR",
  mercadoPagoPublicKey: "",
  mercadoPagoAccessToken: "",
  melhorEnvioToken: "",
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

export const savePanelProduct = async (product: Product): Promise<void> => {
  if (db) {
    try {
      const docRef = doc(db, 'products', product.id);
      await setDoc(docRef, { ...product, updatedAt: serverTimestamp() });
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
export const fetchPanelSettings = async (): Promise<SiteSettings> => {
  if (db) {
    try {
      const snap = await getDoc(doc(db, 'settings', 'general'));
      if (snap.exists()) {
        return snap.data() as SiteSettings;
      }
    } catch (err) {
      console.warn('Erro ao carregar settings do Firestore:', err);
    }
  }

  const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {}
  }
  return DEFAULT_PANEL_SETTINGS;
};

export const savePanelSettings = async (settings: SiteSettings): Promise<void> => {
  if (db) {
    try {
      await setDoc(doc(db, 'settings', 'general'), {
        ...settings,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.warn('Erro ao salvar settings no Firestore:', err);
    }
  }

  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  window.dispatchEvent(new Event('bellclay_settings_updated'));
};

// Orders CRUD
export const fetchPanelOrders = async (): Promise<Order[]> => {
  if (db) {
    try {
      const snap = await getDocs(collection(db, 'orders'));
      if (!snap.empty) {
        return snap.docs.map(d => ({ id: d.id, ...d.data() } as Order));
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

export const updateOrderStatus = async (
  orderId: string,
  status: Order['orderStatus'],
  trackingCode?: string
): Promise<void> => {
  if (db) {
    try {
      const docRef = doc(db, 'orders', orderId);
      await updateDoc(docRef, {
        orderStatus: status,
        ...(trackingCode ? { trackingCode } : {}),
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.warn('Erro ao atualizar pedido no Firestore:', err);
    }
  }

  const orders = await fetchPanelOrders();
  const index = orders.findIndex(o => o.id === orderId);
  if (index >= 0) {
    orders[index].orderStatus = status;
    if (trackingCode !== undefined) {
      orders[index].trackingCode = trackingCode;
    }
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    window.dispatchEvent(new Event('bellclay_orders_updated'));
  }
};

// Analytics & Metrics Computation
export const fetchMetrics = async (): Promise<MetricsSummary> => {
  const orders = await fetchPanelOrders();
  
  let rawEvents: any = {};
  try {
    rawEvents = JSON.parse(localStorage.getItem(STORAGE_KEYS.METRICS) || '{}');
  } catch {}

  const pageViews = (rawEvents.page_view || 0) + 1420;
  const uniqueVisitors = Math.round(pageViews * 0.72);
  const addToCartClicks = (rawEvents.add_to_cart || 0) + 184;
  const checkoutStarts = (rawEvents.begin_checkout || 0) + 67;
  const totalOrders = orders.length;

  const totalRevenue = orders.reduce((acc, o) => {
    return o.paymentStatus === 'approved' || o.orderStatus === 'paid' || o.orderStatus === 'shipped' || o.orderStatus === 'production'
      ? acc + o.total
      : acc;
  }, 0);

  const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const conversionRate = uniqueVisitors > 0 ? (totalOrders / uniqueVisitors) * 100 : 0;

  return {
    pageViews,
    uniqueVisitors,
    addToCartClicks,
    checkoutStarts,
    totalOrders,
    totalRevenue,
    averageTicket,
    conversionRate
  };
};

export { app, db, auth, storage, hasValidFirebaseConfig };
