/**
 * ============================================================================
 * SERVIÇO DE INTEGRAÇÃO COM CLOUDINARY (BELLCLAY)
 * ============================================================================
 * Este arquivo contém toda a estrutura necessária para enviar imagens diretamente
 * para o Cloudinary através da API REST oficial (sem precisar de backend intermediário).
 *
 * COMO FUNCIONA:
 * 1. O usuário seleciona a imagem no painel da Bellclay.
 * 2. O painel faz um POST para https://api.cloudinary.com/v1_1/<CLOUD_NAME>/image/upload
 * 3. O Cloudinary processa, otimiza e retorna uma URL segura (https://res.cloudinary.com/...).
 * 4. Essa URL é salva no Firestore (produtos, banners ou eventos), mantendo o banco leve e rápido.
 *
 * QUANDO VOCÊ TIVER AS CREDENCIAIS:
 * - Preencha as variáveis abaixo ou coloque no arquivo .env:
 *   VITE_CLOUDINARY_CLOUD_NAME="seu_cloud_name"
 *   VITE_CLOUDINARY_UPLOAD_PRESET="seu_upload_preset"
 * ============================================================================
 */

export interface CloudinaryConfig {
  cloudName: string;
  uploadPreset: string;
  folder?: string;
}

// Configurações do Cloudinary (lê das variáveis de ambiente ou usa credenciais configuradas)
export const CLOUDINARY_CONFIG: CloudinaryConfig = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'mxjxj7as',
  uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'bellclay_uploads',
  folder: 'bellclay'
};

/**
 * Verifica se o Cloudinary já está devidamente configurado com credenciais válidas.
 */
export const isCloudinaryConfigured = (): boolean => {
  return Boolean(
    CLOUDINARY_CONFIG.cloudName &&
    CLOUDINARY_CONFIG.cloudName.trim() !== '' &&
    CLOUDINARY_CONFIG.uploadPreset &&
    CLOUDINARY_CONFIG.uploadPreset.trim() !== ''
  );
};

/**
 * Envia um arquivo de imagem para o Cloudinary e retorna a URL permanente segura (HTTPS).
 * 
 * @param file Arquivo File ou Blob selecionado pelo usuário
 * @param customFolder Pasta opcional dentro do Cloudinary (ex: 'produtos', 'banners', 'eventos')
 * @returns Promise com a URL pública da imagem hospedada no Cloudinary
 */
export const uploadToCloudinary = async (
  file: File | Blob,
  customFolder?: string
): Promise<string> => {
  if (!isCloudinaryConfigured()) {
    throw new Error(
      'Cloudinary não configurado. Por favor defina VITE_CLOUDINARY_CLOUD_NAME e VITE_CLOUDINARY_UPLOAD_PRESET.'
    );
  }

  const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`;
  const formData = new FormData();

  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);

  const targetFolder = customFolder || CLOUDINARY_CONFIG.folder;
  if (targetFolder) {
    formData.append('folder', targetFolder);
  }

  const response = await fetch(url, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Falha no upload para o Cloudinary (Status: ${response.status})`
    );
  }

  const data = await response.json();
  // Retorna a URL segura (https)
  return data.secure_url as string;
};

/**
 * Envia múltiplos arquivos de imagem em paralelo para o Cloudinary.
 * 
 * @param files Lista de arquivos (FileList ou array de File/Blob)
 * @param customFolder Pasta opcional no Cloudinary
 * @returns Promise com array de URLs geradas
 */
export const uploadMultipleToCloudinary = async (
  files: FileList | File[],
  customFolder?: string
): Promise<string[]> => {
  const fileArray = Array.from(files);
  const uploadPromises = fileArray.map(file => uploadToCloudinary(file, customFolder));
  return Promise.all(uploadPromises);
};

/**
 * Utilitário para adicionar transformações em tempo real na URL do Cloudinary:
 * - f_auto: converte automaticamente para WebP/AVIF dependendo do navegador do cliente.
 * - q_auto: ajuste automático inteligente de qualidade sem perda visível.
 * - w_XXX: redimensionamento dinâmico na nuvem.
 */
export const getOptimizedCloudinaryUrl = (
  url: string,
  options?: { width?: number; height?: number; crop?: 'fill' | 'fit' | 'limit' }
): string => {
  if (!url || !url.includes('cloudinary.com')) return url;

  const parts = url.split('/upload/');
  if (parts.length !== 2) return url;

  const transformations: string[] = ['f_auto', 'q_auto'];

  if (options?.width) {
    transformations.push(`w_${options.width}`);
  }
  if (options?.height) {
    transformations.push(`h_${options.height}`);
  }
  if (options?.crop) {
    transformations.push(`c_${options.crop}`);
  }

  return `${parts[0]}/upload/${transformations.join(',')}/${parts[1]}`;
};
