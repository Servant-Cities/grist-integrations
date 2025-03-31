// TODO: Use widget options instead of hardcoded constants
const RAW_FILE_COLUMN = "Raw";

export const onRecord = async record => {
  document.body.innerHTML = "";

  if (record && record[RAW_FILE_COLUMN]) {
    const rawHTML = record[RAW_FILE_COLUMN];
    document.body.innerHTML = rawHTML;
  } else {
    document.body.innerHTML = `<div style="color: red; font-weight: bold;">Error: No valid content found.</div>`;
  }
}

grist.onRecord(onRecord);

grist.ready();
