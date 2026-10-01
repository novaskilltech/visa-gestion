/**
 * Utilitaire de lecture et conversion de PDF côté navigateur (Client-side)
 * Sans dépendance native Node canvas pour compatibilité totale Vercel/Next.js
 */

export interface PdfProcessingResult {
  text: string;
  canvas: HTMLCanvasElement | null;
  previewUrl: string | null;
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
  const arrayBuffer = await file.arrayBuffer();
  const pdfjsLib = await loadPdfJs();

  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
  const pdf = await loadingTask.promise;
  const page = await pdf.getPage(1);

  // 1. Extraction du texte numérique s'il existe dans le PDF
  let rawText = '';
  try {
    const textContent = await page.getTextContent();
    rawText = textContent.items
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((item: any) => item.str || '')
      .join(' ');
  } catch (err) {
    console.warn('Erreur lecture texte numérique PDF:', err);
  }

  // 2. Rendu de la page 1 en Canvas haute résolution (échelle 2.0 pour OCR optimal)
  let canvas: HTMLCanvasElement | null = null;
  let previewUrl: string | null = null;

  try {
    const scale = 2.0;
    const viewport = page.getViewport({ scale });
    canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // Fond blanc
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      await page.render({
        canvasContext: ctx,
        viewport: viewport,
      }).promise;

      previewUrl = canvas.toDataURL('image/jpeg', 0.9);
    }
  } catch (renderErr) {
    console.warn('Erreur rendu canvas PDF:', renderErr);
  }

  return {
    text: rawText.trim(),
    canvas,
    previewUrl,
  };
}
