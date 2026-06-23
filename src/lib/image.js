// Read an image file and return a resized JPEG data URL, so attachments stay small
// enough for localStorage in phase 1 (a real backend would upload to storage later).
export function fileToResizedDataURL(file, maxDim = 900, quality = 0.72) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type?.startsWith('image/')) {
      reject(new Error('not an image'));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => reject(new Error('decode failed'));
      img.src = reader.result;
    };
    reader.onerror = () => reject(new Error('read failed'));
    reader.readAsDataURL(file);
  });
}
