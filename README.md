# 🌸 Bellclay Artesanatos — E-Commerce & Painel Administrativo

Solução completa desenvolvida para a **Bellclay Artesanatos**, ateliê de peças exclusivas em cerâmica fria (cold porcelain) localizado em **Campo Mourão - PR** (CEP de origem: `87302-060`).

O ecossistema é composto por **2 projetos independentes** preparados para deploy na **Vercel** com domínios separados, compartilhando a mesma base de dados no **Firebase**:

1. **`bellclay-store`** — Loja virtual e marketplace para clientes (modo claro, paleta rosa da logo `#FD7687` e verde `#83bc5c`, logo no topo à esquerda, animações fluidas via Framer Motion, cálculo de frete automático com Melhor Envio/Correios, checkout sem login obrigatório e pagamentos via Mercado Pago com Pix QR Code).
2. **`bellclay-painel`** — Painel administrativo exclusivo (sem nenhuma menção ou link na loja principal) com métricas em tempo real (cliques, adicionados ao carrinho, conversão, ticket médio, faturamento), cadastro completo de produtos com fotos, peso e dimensões para envio, gestão de pedidos com rastreio e personalizador visual do site (banners/carrossel, títulos de boas-vindas e categorias).

---

## 🎨 Identidade Visual & Design System

- **Cores Principais**:
  - Rosa da Marca (Logo): `#FD7687`
  - Verde Artesanal: `#83bc5c`
  - Tons Cerâmicos Suaves: Porcelana quente `#FDFBF7`, Argila `#FAF7F2`, Bordas orgânicas `#EAE3DA`
- **Tipografia**: *Fraunces* / *Playfair* (títulos artesanais) e *Plus Jakarta Sans* (textos e interfaces legíveis)
- **Animações Fluidas**: Spring physics, drawer de carrinho com backdrop blur, modais interativos, efeitos de hover suaves, celebração com confetes no checkout.

---

## 🚀 Como Executar Localmente

### 1. Iniciar a Loja do Cliente (`bellclay-store`)
```bash
cd bellclay-store
npm run dev
```
Acesse: [http://localhost:3000](http://localhost:3000)

### 2. Iniciar o Painel Administrativo (`bellclay-painel`)
Em outro terminal:
```bash
cd bellclay-painel
npm run dev
```
Acesse: [http://localhost:3001](http://localhost:3001)  
*Senha padrão de acesso:* `bellclay2026` ou `admin123`

---

## 🚚 Cálculo de Frete Automático & Melhor Envio

- **Origem padrão**: `87302-060` (Campo Mourão - PR).
- **Integração Melhor Envio / SuperFrete**: O sistema possui integração direta via token API configurável no painel administrativo (`Configurações & APIs`), calculando as opções mais baratas do Brasil (com até 80% de desconto):
  - **Mini Envios** (ideal para chaveiros e bottons até 300g)
  - **PAC Correios** (encomenda econômica)
  - **SEDEX** (expresso rápido)
  - **Jadlog .Package**
  - **Retirada no Ateliê** (grátis para clientes de Campo Mourão - PR)
- **Cálculo Regional em Tempo Real**: Caso o proprietário ainda não tenha inserido o token do Melhor Envio, o site conta com uma matriz regional calibrada para todos os estados do Brasil a partir de Campo Mourão PR, garantindo que o cliente sempre veja valores e prazos reais.
- **Auto-preenchimento ViaCEP**: Ao digitar os 8 dígitos do CEP, rua, bairro, cidade e estado são preenchidos instantaneamente.

---

## 💳 Pagamentos Mercado Pago

- **PIX Instantâneo**: Gera código Pix Copia e Cola (padrão EMV) + QR Code para leitura no celular com timer de 30 minutos e confirmação de pagamento.
- **Cartão de Crédito**: Detecção visual da bandeira do cartão (Visa, Mastercard, Elo, Hipercard, Amex) e cálculo de parcelamento em até 12x.
- **Boleto Bancário**: Linha digitável com vencimento em 3 dias úteis.

---

## 🔥 Configuração do Firebase

Ambos os projetos estão prontos para rodar imediatamente em modo local/demonstração e conectam automaticamente ao Firebase Firestore, Auth e Storage assim que você adicionar as chaves no arquivo `.env`:

Crie o arquivo `.env` dentro de `bellclay-store` e `bellclay-painel`:
```env
VITE_FIREBASE_API_KEY=sua_api_key
VITE_FIREBASE_AUTH_DOMAIN=bellclay-artesanatos.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=bellclay-artesanatos
VITE_FIREBASE_STORAGE_BUCKET=bellclay-artesanatos.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
VITE_FIREBASE_APP_ID=seu_app_id
```

---

## ☁️ Deploy na Vercel

1. **Deploy da Loja**: No painel da Vercel, crie um novo projeto apontando para a pasta raiz `bellclay-store`. Configure o domínio (ex: `bellclay.com.br`).
2. **Deploy do Painel**: Crie outro projeto na Vercel apontando para a pasta `bellclay-painel`. Configure outro domínio/subdomínio seguro (ex: `painel-bellclay.vercel.app` ou `gestao.bellclay.com.br`).
3. Ambos já contam com arquivo `vercel.json` configurado para SPA rewrites.
