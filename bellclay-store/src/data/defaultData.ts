import { Product, SiteSettings } from '../types';

export const DEFAULT_SETTINGS: SiteSettings = {
  welcomeTitle: "Peças Únicas Feitas com Amor em Cerâmica Fria",
  welcomeSubtitle: "Arte modelada à mão em Campo Mourão - PR. Chaveiros, bottons, esculturas e acessórios colecionáveis para deixar seu dia mais colorido e fofo.",
  announcementText: "",
  announcementActive: false,
  announcementLink: "#produtos",
  freeShippingThreshold: 150,
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
  melhorEnvioToken: "",
  promoBannerUrl: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=2100&q=80",
  promoBannerLink: "#produtos",
  promoBannerActive: true,
  banners: [],
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

export const DEFAULT_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    title: "Chaveiro Gatinho Calico com Moranguinho",
    slug: "chaveiro-gatinho-calico-moranguinho",
    description: "Chaveiro artesanal em cerâmica fria modelado 100% à mão. Pintura em aquarela com detalhes manuais e camada dupla de resina vitrificada para alta proteção contra riscos e umidade. Acompanha corrente dourada com mosquetão reforçado.",
    price: 36.90,
    promotionalPrice: 32.90,
    category: "chaveiros",
    images: [
      "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80"
    ],
    stock: 12,
    weightKg: 0.05,
    dimensions: {
      heightCm: 4,
      widthCm: 4,
      lengthCm: 2
    },
    featured: true,
    isNew: true,
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
    category: "bottons",
    images: [
      "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80"
    ],
    stock: 20,
    weightKg: 0.03,
    dimensions: {
      heightCm: 3,
      widthCm: 3,
      lengthCm: 1
    },
    featured: true,
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
    category: "porta-joias",
    images: [
      "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80"
    ],
    stock: 8,
    weightKg: 0.12,
    dimensions: {
      heightCm: 2,
      widthCm: 9,
      lengthCm: 9
    },
    featured: true,
    isNew: true,
    tags: ["porta-jóias", "decoração", "flor", "margarida", "quarto"],
    rating: 5.0,
    reviewsCount: 34,
    createdAt: new Date().toISOString()
  },
  {
    id: "prod-4",
    title: "Mini Escultura Sapinho na Folha de Lótus",
    slug: "mini-escultura-sapinho-folha-lotus",
    description: "Pequena estatueta de sapinho sorridente apoiado em uma folha de vitória-régia com acabamento brilhoso. Um charme para dar vida a vasinhos de suculentas ou estantes de livros.",
    price: 42.00,
    category: "esculturas",
    images: [
      "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80"
    ],
    stock: 7,
    weightKg: 0.08,
    dimensions: {
      heightCm: 5,
      widthCm: 6,
      lengthCm: 6
    },
    featured: true,
    tags: ["sapinho", "natureza", "escultura", "decoração", "verde"],
    rating: 4.8,
    reviewsCount: 15,
    createdAt: new Date().toISOString()
  },
  {
    id: "prod-5",
    title: "Chaveiro Pãozinho de Queijo Sorridente",
    slug: "chaveiro-pao-de-queijo-sorridente",
    description: "Homenagem ao quitute brasileiro mais amado! Modelado em cerâmica fria com textura realista de queijo assado e carinha delicada. Super fofo e resistente.",
    price: 29.90,
    category: "chaveiros",
    images: [
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80"
    ],
    stock: 15,
    weightKg: 0.04,
    dimensions: {
      heightCm: 3,
      widthCm: 3,
      lengthCm: 3
    },
    featured: false,
    tags: ["comida-fofa", "pão-de-queijo", "chaveiro", "presente"],
    rating: 5.0,
    reviewsCount: 22,
    createdAt: new Date().toISOString()
  },
  {
    id: "prod-6",
    title: "Brincos Pendentes Cerejinha Vintage",
    slug: "brincos-pendentes-cerejinha-vintage",
    description: "Par de brincos artesanais com cerejinhas em porcelana fria e ganchos em aço inoxidável cirúrgico anti-alérgico. Extremamente levinhos na orelha, pesando menos de 3g cada.",
    price: 38.00,
    category: "porta-joias",
    images: [
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80"
    ],
    stock: 10,
    weightKg: 0.02,
    dimensions: {
      heightCm: 4,
      widthCm: 2,
      lengthCm: 2
    },
    featured: true,
    tags: ["brinco", "cereja", "retro", "acessório", "rosa"],
    rating: 4.9,
    reviewsCount: 16,
    createdAt: new Date().toISOString()
  },
  {
    id: "prod-7",
    title: "Set Trio de Bottons Bosque Encantado",
    slug: "set-trio-bottons-bosque-encantado",
    description: "Kit especial com 3 bottons: 1 Raposinha dormindo, 1 Bolota de carvalho e 1 Folhinha de outono. Embalagem kraft especial para presente.",
    price: 59.90,
    promotionalPrice: 49.90,
    category: "bottons",
    images: [
      "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80"
    ],
    stock: 6,
    weightKg: 0.07,
    dimensions: {
      heightCm: 3,
      widthCm: 10,
      lengthCm: 8
    },
    featured: true,
    isNew: true,
    tags: ["kit", "raposa", "botton", "promoção", "presente"],
    rating: 5.0,
    reviewsCount: 11,
    createdAt: new Date().toISOString()
  },
  {
    id: "prod-8",
    title: "Mini Vaso Cachepot Ursinho Sonhador",
    slug: "mini-vaso-cachepot-ursinho-sonhador",
    description: "Cachepot pequenino com rosto de ursinho em relevo e detalhes em tom pastel. Ideal para pequenas suculentas, canetas ou pincéis de maquiagem.",
    price: 68.00,
    category: "esculturas",
    images: [
      "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80"
    ],
    stock: 5,
    weightKg: 0.18,
    dimensions: {
      heightCm: 8,
      widthCm: 8,
      lengthCm: 8
    },
    featured: false,
    tags: ["vaso", "suculenta", "urso", "cerâmica", "decoração"],
    rating: 4.9,
    reviewsCount: 14,
    createdAt: new Date().toISOString()
  }
];
