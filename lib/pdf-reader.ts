/**
 * Utilitaire de lecture et conversion de PDF côté navigateur (Client-side)
 * Sans dépendance native Node canvas pour compatibilité totale Vercel/Next.js
 */

export interface PdfProcessingResult {
  text: string;
  canvas: HTMLCanvasElement | null;
  previewUrl: string | null;
  fileDataUrl: string | null;
  totalPages: number;
}

// Chargeur dynamique de la librairie PDF.js standard
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function loadPdfJs(): Promise<any> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('PDF.js ne peut être chargé que côté client'));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((window as any).pdfjsLib) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return Promise.resolve((window as any).pdfjsLib);
  }

  return new Promise((resolve, reject) => {
    const existing = document.getElementById('pdfjs-cdn-script');
    if (existing) {
      existing.addEventListener('load', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const lib = (window as any).pdfjsLib;
        if (lib) {
          lib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
          resolve(lib);
        } else {
          reject(new Error('pdfjsLib non initialisé'));
        }
      });
      return;
    }

    const script = document.createElement('script');
    script.id = 'pdfjs-cdn-script';
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.async = true;
    script.onload = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const lib = (window as any).pdfjsLib;
      if (lib) {
        lib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        resolve(lib);
      } else {
        reject(new Error('pdfjsLib introuvable après chargement'));
      }
    };
    script.onerror = (e) => reject(new Error('Échec du chargement du CDN PDF.js: ' + e));
    document.head.appendChild(script);
  });
}

export async function processPdfFile(file: File): Promise<PdfProcessingResult> {
  // Convertir le fichier PDF entier en data:application/pdf URL ou garder le fichier d'origine
  const reader = new FileReader();
  const fileDataUrlPromise = new Promise<string>((resolve) => {
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });

  const arrayBuffer = await file.arrayBuffer();
  const pdfjsLib = await loadPdfJs();

  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages || 1;

  // 1. Extraction du texte numérique sur TOUTES les pages du document
  let fullText = '';
  for (let i = 1; i <= Math.min(numPages, 5); i++) {
    try {
      const p = await pdf.getPage(i);
      const textContent = await p.getTextContent();
      const pageStr = textContent.items
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((item: any) => item.str || '')
        .join(' ');
      fullText += ' ' + pageStr;
    } catch (pageErr) {
      console.warn(`Erreur lecture texte page ${i}:`, pageErr);
    }
  }

  // 2. Rendu de la page 1 en Canvas haute résolution (pour miniature et OCR scan si besoin)
  let canvas: HTMLCanvasElement | null = null;
  let previewUrl: string | null = null;

  try {
    const page1 = await pdf.getPage(1);
    const scale = 2.0;
    const viewport = page1.getViewport({ scale });
    canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      await page1.render({
        canvasContext: ctx,
        viewport: viewport,
      }).promise;

      previewUrl = canvas.toDataURL('image/jpeg', 0.85);
    }
  } catch (renderErr) {
    console.warn('Erreur rendu canvas PDF:', renderErr);
  }

  let fileDataUrl = await fileDataUrlPromise;
  if (!fileDataUrl && typeof window !== 'undefined') {
    // Secours si fileDataUrlPromise est vide : conversion directe arrayBuffer -> base64
    try {
      const bytes = new Uint8Array(arrayBuffer);
      let binary = '';
      const len = bytes.byteLength;
      for (let b = 0; b < len; b++) {
        binary += String.fromCharCode(bytes[b]);
      }
      fileDataUrl = `data:application/pdf;base64,${btoa(binary)}`;
    } catch {
      fileDataUrl = previewUrl || '';
    }
  }

  return {
    text: fullText.trim(),
    canvas,
    previewUrl,
    fileDataUrl: fileDataUrl || previewUrl,
    totalPages: numPages,
  };
}
