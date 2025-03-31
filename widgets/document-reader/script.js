// TODO: Use widget options instead of hardcoded constants
const FORMAT_COLUMN = "Format";

// Supported widgets
const DOCUMENT_READER_URL = "http://localhost:4000/document-reader";
const HTML_URL = "http://localhost:4000/styled-html";
const DRAW_IO_URL =
  "http://localhost:4000/draw-io-editor/?autosave=1&draw-io-url=https://embed.diagrams.net";

const showError = message => {
  document.body.innerHTML = `<p style='color: red;'>${message}</p>`;
};

const loadWidget = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to load widget from ${url}`);

    const htmlContent = await response.text();
    const parser = new DOMParser();
    const fetchedDocument = parser.parseFromString(htmlContent, "text/html");

    document.body.innerHTML = "";
    fetchedDocument.body.childNodes.forEach((node) => {
      if (node.nodeName === "SCRIPT") {
        const newScript = document.createElement("script");
        newScript.src = node.src;
        newScript.async = true;
        document.head.appendChild(newScript);
      } else {
        document.body.appendChild(node.cloneNode(true));
      }
    });

    document.head.innerHTML = "";
    const rerouteScript = document.createElement("script");
    rerouteScript.src = `${DOCUMENT_READER_URL}/script.js`;
    rerouteScript.async = true;
    document.head.appendChild(rerouteScript);
    fetchedDocument.head.childNodes.forEach((node) => {
      if (node.nodeName === "SCRIPT") {
        const newScript = document.createElement("script");
        newScript.src = node.src;
        newScript.async = true;
        document.head.appendChild(newScript);
      } else {
        document.head.appendChild(node.cloneNode(true));
      }
    });
    
  } catch (error) {
    showError(error.message);
  }
};


grist.onRecord(async record => {
  const existingErrorContainer = document.getElementById("error-container");
  if (existingErrorContainer) {
    existingErrorContainer.remove();
  }

  if (record) {
    switch (record[FORMAT_COLUMN]) {
      case "html":
        loadWidget(HTML_URL);
        break;
      case "draw.io":
        loadWidget(DRAW_IO_URL);
        break;
      default:
        if (window.location.href === DOCUMENT_READER_URL) {
          showError("Unsupported format");
        } else {
          window.location.href = DOCUMENT_READER_URL;
        }
    }
  }
});

grist.ready();
