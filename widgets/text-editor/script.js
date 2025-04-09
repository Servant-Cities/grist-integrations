let selectedRecord;
let editor;
const params = new URLSearchParams(document.location.search);
const rawColumn = params.get("rawColumn") || "Raw";

export const reset = record => {
  editor = document.getElementById("editor");

  selectedRecord = record;
  editor.value = record[rawColumn] || "";

  if (editor) {
    editor.addEventListener("input", async () => {
      console.log("saving")
      if (!selectedRecord) return;
      console.log("updating")
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
  if (editor && editor.value !== record[rawColumn]) {
    selectedRecord = record;
    editor.value = record[rawColumn] || "";
  }
};
