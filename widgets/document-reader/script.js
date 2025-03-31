let currentWidget = "document-reader";

// TODO: Use widget options instead of hardcoded constants
const FORMAT_COLUMN = "Format";

// Supported widgets
const HTML_URL = "http://localhost:4000/styled-html";
const DRAW_IO_URL = "http://localhost:4000/draw-io-editor";

const showError = message => {
  document.body.innerHTML = `<p style='color: red;'>${message}</p>`;
};

const renderWidget = async (url, record) => {
  if (currentWidget !== url) {
    console.log("Render : ", { url, record });
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to load widget from ${url}`);

    const htmlContent = await response.text();
    const parser = new DOMParser();
    const fetchedDocument = parser.parseFromString(htmlContent, "text/html");

    document.body.innerHTML = "";
    fetchedDocument.body.childNodes.forEach(node => {
      document.body.appendChild(node.cloneNode(true));
    });

    try {
      //TODO: import once only
      const widget = await import(`${url}/script.js`);
      widget.reset && widget.reset(record);
      widget.onRecord && widget.onRecord(record);
    } catch (error) {
      document.body.innerHTML = `<p style='color: red;'>Failed to load widget-loader: ${error.message}</p>`;
    }
  } else {
    //TODO: import once only
    const widget = await import(`${url}/script.js`);
    widget.onRecord && widget.onRecord(record);
  }
  currentWidget = url;
};

grist.onRecord(async record => {
  const existingErrorContainer = document.getElementById("error-container");
  if (existingErrorContainer) {
    existingErrorContainer.remove();
  }

  if (record) {
    switch (record[FORMAT_COLUMN]) {
      case "html":
        renderWidget(HTML_URL, record);
        break;
      case "draw.io":
        renderWidget(DRAW_IO_URL, record);
        break;
      default:
        currentWidget = "document_reader";
        showError("Unsupported format");
    }
  }
});

grist.ready();
