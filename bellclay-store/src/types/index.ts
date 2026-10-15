export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  promotionalPrice?: number;
  category: string;
  images: string[];
  stock: number;
  weightKg: number;
  dimensions: {
    heightCm: number;
    widthCm: number;
    lengthCm: number;
  };
  featured?: boolean;
  isNew?: boolean;
  tags?: string[];
  rating?: number;
  reviewsCount?: number;
  createdAt?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  customObservation?: string;
}

export interface ShippingOption {
  id: string;
  name: string;
  company: string;
  price: number;
  deliveryDays: number;
  badge?: 'Mais Econômico' | 'Mais Rápido' | 'Grátis' | 'Retirada';
  serviceCode?: string;
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
  paymentMethod: 'pix' | 'credit_card' | 'boleto';
  paymentStatus: 'pending' | 'approved' | 'rejected';
  orderStatus: 'pending' | 'paid' | 'production' | 'shipped' | 'delivered' | 'cancelled';
  trackingCode?: string;
  notes?: string;
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
  mercadoPagoPublicKey?: string;
  melhorEnvioToken?: string;
}
