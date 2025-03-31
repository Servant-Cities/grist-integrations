console.log('loading styled-html widget')

// TODO: Use widget options instead of hardcoded constants
const RAW_FILE_COLUMN = "Raw";

grist.onRecord(async record => {
  const contentDiv = document.getElementById("content");
  contentDiv.innerHTML = "";

  if (record && record[RAW_FILE_COLUMN]) {
    const rawHTML = record[RAW_FILE_COLUMN];
    contentDiv.innerHTML = rawHTML;
  } else {
    contentDiv.innerHTML = `<div style="color: red; font-weight: bold;">Error: No valid content found.</div>`;
  }
});

grist.ready();
