let baseUrl;
let token;
let pdfUrl;
let selectedRecord;
let pdfDoc = null;
let pagesRendered = new Set();

async function loadPdfJs() {
    if (typeof window.pdfjsLib === 'undefined') {
        try {
            const script = document.createElement("script");
            script.src = "https://cdn.jsdelivr.net/npm/pdfjs-dist@2.10.377/build/pdf.min.js";
            script.onload = () => {
                window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdn.jsdelivr.net/npm/pdfjs-dist@2.10.377/build/pdf.worker.min.js";
            };
            script.onerror = (e) => {
                console.error("Failed to load PDF.js:", e);
            };
            document.head.appendChild(script);

            await new Promise((resolve, reject) => {
                script.onload = resolve;
                script.onerror = reject;
            });

        } catch (error) {
            console.error("Error loading PDF.js dynamically:", error);
        }
    }
}

async function loadPdf(url) {
    try {
        const pdfContainer = document.getElementById("pdf-viewer");

        const spinner = document.createElement("div");
        spinner.id = "spinner";
        spinner.style.display = "block";
        spinner.style.position = "absolute";
        spinner.style.top = "50%";
        spinner.style.left = "50%";
        spinner.style.transform = "translate(-50%, -50%)";
        spinner.innerHTML = '<div class="spinner"></div>';
        pdfContainer.appendChild(spinner);

        if (!window.pdfjsLib) {
            console.error("PDF.js is not loaded");
            return;
        }

        pdfDoc = await window.pdfjsLib.getDocument(url).promise;
        const numPages = pdfDoc.numPages;

        pagesRendered.clear();

        for (let pageNum = 1; pageNum <= numPages; pageNum++) {
            if (!pagesRendered.has(pageNum)) {
                await renderPage(pageNum, pdfContainer, numPages);
                pagesRendered.add(pageNum);
            }
        }

        spinner.style.display = "none";

    } catch (error) {
        console.error("Error loading PDF:", error);
    }
}

async function renderPage(num, pdfContainer, totalPages) {
  try {
      const page = await pdfDoc.getPage(num);

      const scale = 1.5;
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({ canvasContext: ctx, viewport }).promise;

      let pageWrapper = pdfContainer.querySelector(`#page-wrapper-${num}`);

      if (pageWrapper) {
         //Quickfix a weird issue where the page is rendered twice in one function call
          pageWrapper.remove();
      }

      pageWrapper = document.createElement("div");
      pageWrapper.classList.add("page-wrapper");
      pageWrapper.id = `page-wrapper-${num}`;


      const pageCounter = document.createElement("span");
      pageCounter.classList.add("page-counter");
      pageCounter.textContent = `Page ${num} of ${totalPages}`;

      const counterWrapper = document.createElement("div");
      counterWrapper.appendChild(pageCounter);

      pageWrapper.appendChild(counterWrapper);

      pageWrapper.appendChild(canvas);

      pdfContainer.appendChild(pageWrapper);

  } catch (error) {
      console.error("Error rendering page", num, ":", error);
  }
}



export function reset(record) {
    baseUrl = null;
    token = null;
    selectedRecord = record;
}

export async function onRecord(record) {
    if (!record) return;
    selectedRecord = record;

    if (!baseUrl || !token) {
        const access = await grist.getAccessToken();
        baseUrl = access.baseUrl;
        token = access.token;
    }

    if (record.Attachment) {
        pdfUrl = `${baseUrl}/attachments/${record.Attachment}/download?auth=${token}`;
        await loadPdfJs();
        await loadPdf(pdfUrl);
    }
}
