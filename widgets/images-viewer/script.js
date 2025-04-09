let baseUrl;
let token;
let spinnerContainer;
let imgCounter;
let imgContainer;
let singleImageWrapper;

const params = new URLSearchParams(document.location.search);
const attachmentColumn = params.get("attachmentColumn") || "Attachment";

async function renderImgs(record) {
  try {
    const attachments = Array.isArray(record[attachmentColumn]) ? record[attachmentColumn] : [];
    if (attachments.length === 0) return;

    imgContainer.innerHTML = '';
    singleImageWrapper.innerHTML = '';

    spinnerContainer.style.display = 'block';

    if (attachments.length > 1) {
      imgCounter.textContent = `Images: ${attachments.length}`;
      imgCounter.style.display = 'block';
    } else {
      imgCounter.style.display = 'none';
    }

    let loadedImages = 0;
    const totalImages = attachments.length;

    if (attachments.length === 1) {
      imgContainer.style.display = 'none';
      singleImageWrapper.style.display = 'flex';

      const id = attachments[0];
      try {
        const src = `${baseUrl}/attachments/${id}/download?auth=${token}`;

        const img = new Image();
        img.src = src;
        img.alt = "Attachment Image";
        img.style.maxWidth = "75%";
        img.style.height = "auto";

        img.onload = () => {
          loadedImages++;
          if (loadedImages === totalImages) {
            spinnerContainer.style.display = 'none';
          }
        };

        img.onerror = () => {
          singleImageWrapper.innerHTML = "<p>Failed to load image.</p>";
        };

        singleImageWrapper.appendChild(img);
      } catch (error) {
        console.error(`Error fetching image ${id}:`, error);
      }
    } else {
      imgContainer.style.display = 'flex';
      singleImageWrapper.style.display = 'none';

      for (const id of attachments) {
        try {
          const attachment = await fetch(`${baseUrl}/attachments/${id}`);
          const src = `${baseUrl}/attachments/${id}/download?auth=${token}`;

          const imgWrapper = document.createElement('div');
          imgWrapper.classList.add('img-wrapper');

          const img = new Image();
          img.src = src;
          img.alt = "Attachment Image";
          img.style.maxWidth = "100%";
          img.style.height = "auto";

          img.onload = () => {
            loadedImages++;
            if (loadedImages === totalImages) {
              spinnerContainer.style.display = 'none';
            }
          };

          img.onerror = () => {
            imgWrapper.innerHTML = "<p>Failed to load image.</p>";
          };

          imgWrapper.appendChild(img);
          imgContainer.appendChild(imgWrapper);
        } catch (error) {
          console.error(`Error fetching image ${id}:`, error);
        }
      }
    }
  } catch (error) {
    console.error("Error rendering images:", error);
  }
}

export function reset(record) {
  baseUrl = null;
  token = null;
  selectedRecord = record;
  container = document.getElementById("images-viewer");
  spinnerContainer = document.getElementById("spinner-container");
  imgCounter = document.getElementById("img-counter");
  imgContainer = document.getElementById("img-container");
  singleImageWrapper = document.getElementById("single-image-wrapper");
  imgContainer.innerHTML = "";
  singleImageWrapper.innerHTML = "";
}

export async function onRecord(record) {
  if (!record) return;
  selectedRecord = record;

  if (!baseUrl || !token) {
    const access = await grist.getAccessToken();
    baseUrl = access.baseUrl;
    token = access.token;
  }

  if (record[attachmentColumn]) {
    renderImgs(record);
  }
}
