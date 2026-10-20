export const S3_CATALOGO_IMAGE_BASE = 'https://puntocell-catalogo-imagenes.s3.us-east-2.amazonaws.com/';
export const DEFAULT_PRODUCT_IMAGE = 'https://picsum.photos/150';

/**
 * Resuelve la URL absoluta de una imagen del catálogo de PuntoCell alojada en Amazon S3.
 */
export function getFullImageUrl(imagePath?: string | null): string {
  if (!imagePath || typeof imagePath !== 'string') {
    return DEFAULT_PRODUCT_IMAGE;
  }
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  return `${S3_CATALOGO_IMAGE_BASE}${imagePath.replace(/^\//, '')}`;
}
