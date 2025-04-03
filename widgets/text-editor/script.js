let selectedRecord;
let editor;
const params = new URLSearchParams(document.location.search);
const rawColumn = params.get("rawColumn") || "Raw";

export const reset = record => {
  editor = document.getElementById("editor");
  if (editor) {
    editor.value = record[rawColumn] || "";
    editor.addEventListener("input", async () => {
      if (!selectedRecord) return;
      const table = grist.selectedTable;
      await table.update({
        id: selectedRecord.id,
        fields: {
          ...selectedRecord.fields,
          [rawColumn]: editor.value,
        },
      });
    });
  }
};

export const onRecord = async record => {
  selectedRecord = record;
  if (editor) {
    editor.value = record[rawColumn] || "";
  }
};
