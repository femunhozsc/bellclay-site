/**
 * Converte arquivo de imagem para Base64 preservando 100% da resolução e qualidade originais,
 * sem compressão destrutiva, sem perda de cores e sem re-conversão para JPEG.
 */
export const compressImage = (file: File, _maxWidth?: number, _quality?: number): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};
