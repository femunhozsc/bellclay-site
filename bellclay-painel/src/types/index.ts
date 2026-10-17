export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  promotionalPrice?: number;
  costPrice?: number;
  category: string;
  images: string[];
  stock: number;
  weightKg: number; // in kg (e.g. 0.05 = 50g)
  dimensions: {
    heightCm: number;
    widthCm: number;
    lengthCm: number;
  };
  featured?: boolean;
  isNew?: boolean;
  active?: boolean;
  tags?: string[];
  rating?: number;
  reviewsCount?: number;
  createdAt?: string;
}

export interface ShippingOption {
  id: string;
  name: string;
  company: string;
  price: number;
  deliveryDays: number;
  badge?: string;
}

export interface Address {
  cep: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  cpf: string;
  notes?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  customObservation?: string;
}

export interface Order {
  id: string;
  customer: CustomerInfo;
  address: Address;
  items: CartItem[];
  shipping: ShippingOption;
  subtotal: number;
  discount: number;
  shippingCost: number;
  total: number;
  paymentMethod: 'pix' | 'credit_card' | 'boleto' | 'infinitepay';
  paymentStatus: 'pending' | 'approved' | 'rejected';
  orderStatus: 'pending' | 'paid' | 'production' | 'shipped' | 'delivered' | 'cancelled';
  trackingCode?: string;
  notes?: string;
  couponCode?: string;
  couponDiscount?: number;
  checkoutUrl?: string;
  receiptUrl?: string;
  transactionNsu?: string;
  infinitePaySlug?: string;
  createdAt: string;
}

export interface BannerSlide {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  imageUrl: string;
  buttonText: string;
  buttonLink: string;
  bgColor?: string;
  active: boolean;
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  iconName: string;
  description: string;
  image?: string;
}

export interface BellclayEvent {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  badge?: string;
  coverImage: string;
  images: string[];
  dateText?: string;
  locationText?: string;
  description: string;
  buttonText?: string;
  active: boolean;
}

export interface SiteSettings {
  welcomeTitle: string;
  welcomeSubtitle: string;
  announcementText: string;
  announcementActive: boolean;
  announcementLink?: string;
  freeShippingThreshold: number;
  originCep: string;
  banners: BannerSlide[];
  categories: CategoryItem[];
  events?: BellclayEvent[];
  promoBannerUrl?: string;
  promoBannerLink?: string;
  promoBannerActive?: boolean;
  instagram: string;
  tiktok?: string;
  whatsapp: string;
  city: string;
  state: string;
  infinitePayTag?: string;
  pixDiscountPercent?: number;
  maxInstallmentsNoInterest?: number;
  mercadoPagoPublicKey?: string;
  mercadoPagoAccessToken?: string;
  melhorEnvioToken?: string;
  catalogBottomText?: string;
  coupons?: Coupon[];
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderValue?: number;
  maxDiscountAmount?: number;
  active: boolean;
  usageCount?: number;
  createdAt?: string;
}

export type DateFilterType = 'today' | '7d' | '30d' | 'all' | 'custom';

export interface ChartDataPoint {
  label: string;
  fullDate?: string;
  visitors: number;
  orders: number;
  revenue: number;
}

export interface AnalyticsEvent {
  id?: string;
  event: string;
  timestamp: string;
  data?: Record<string, any>;
  userAgent?: string;
}

export interface AdCampaign {
  id: string;
  name: string; // Nome identificador interno (ex: "Instagram Stories - Coleção Gatinhos")
  slug: string; // Slug da URL pública (ex: "gatinhos-fofos" -> loja/lp/gatinhos-fofos)
  active: boolean;

  // Visual & Banners
  bannerUrl: string; // Imagem de banner principal (Desktop / Tablet)
  mobileBannerUrl?: string; // Imagem opcional otimizada para celular vertical
  overlayOpacity: number; // 0 a 90% (escurecimento para legibilidade)
  badgeText: string; // Ex: "🌸 Edição Especial Instagram"
  themeStyle?: 'soft-pink' | 'warm-clay' | 'magic-dark' | 'mint-green';

  // Storytelling & Textos Programáveis
  headline: string; // Título principal de boas-vindas
  subtitle: string; // Subtítulo acolhedor
  storyText?: string; // Mensagem com história da peça / marca ("fala alguma coisa")
  highlights?: string[]; // Benefícios em pílulas (ex: "Peças 100% Artesanais", "Frete Grátis acima de R$149")

  // Oferta & Conversão (Ideia de alta conversão para anúncios)
  showCoupon?: boolean;
  couponCode?: string; // Ex: "BEMVINDO10"
  couponDiscountText?: string; // Ex: "10% OFF no primeiro pedido"

  // Produto em Destaque do Anúncio
  showFeaturedProduct?: boolean;
  featuredProductId?: string; // ID do produto

  // Prova Social / Selos de Confiança
  showTrustBadges?: boolean;
  trustBadgeText?: string; // Ex: "⭐ 5.0 estrelas (+500 clientes encantadas em todo o Brasil)"

  // Ação & Animação de Abertura
  buttonText: string; // Ex: "Conhecer o site ✨"
  targetUrl: string; // Destino pós-animação (ex: "/", "/produtos", "/produtos/chaveiros", ou slug de produto)
  secondaryButtonText?: string; // Ex: "Chamar no WhatsApp"
  secondaryButtonUrl?: string; // Link direto WhatsApp

  // Métricas
  viewsCount?: number;
  clicksCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface MetricsSummary {
  pageViews: number;
  uniqueVisitors: number;
  addToCartClicks: number;
  checkoutStarts: number;
  totalOrders: number;
  totalRevenue: number;
  averageTicket: number;
  conversionRate: number;
  // Dynamic comparison indicators
  revenueChange?: string;
  isRevenuePositive?: boolean;
  ordersChange?: string;
  isOrdersPositive?: boolean;
  cartChange?: string;
  isCartPositive?: boolean;
  visitorsChange?: string;
  isVisitorsPositive?: boolean;
  comparisonLabel?: string;
  filterLabel?: string;
  chartData?: ChartDataPoint[];
  peakLabel?: string;
}

