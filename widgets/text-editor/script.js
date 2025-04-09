let selectedRecord;
let editor;
const params = new URLSearchParams(document.location.search);
const rawColumn = params.get("rawColumn") || "Raw";

export const reset = record => {
  console.log("reset !");
  editor = document.getElementById("editor");

  editor.value = record[rawColumn] || "";

  if (editor) {
    editor.addEventListener("input", async () => {
      if (!selectedRecord) return;
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
  console.log("onRecord !", editor);
  if (editor && editor.value !== record[rawColumn]) {
    console.log("onRecord changed !", record[rawColumn]);
    selectedRecord = record;
    editor.value = record[rawColumn] || "";
  }
};
