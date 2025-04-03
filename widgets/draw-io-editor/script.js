let baseUrl;
let token;
let iframeLoaded = false;
let iframe;
let selectedRecord;

const params = new URLSearchParams(document.location.search);
const drawIoUrl = params.get("draw-io-url") || "https://embed.diagrams.net";
const autosave = params.get("autosave") || "0";
const rawColumn = params.get("rawColumn") || "Raw";
// Wating for an update on this issue: https://github.com/gristlabs/grist-core/issues/1307
//const attachmentColumn = params.get("attachmentColumn") || "Attachment";

const defaultXML = `<mxfile>
  <diagram name="Page-1">
    <mxGraphModel dx="1260" dy="781" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="827" pageHeight="1169" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />
        <mxCell id="start" value="Start your diagram in Grist" style="fillColor=#16B378;" vertex="1" parent="1">
          <mxGeometry x="304" y="150" width="220" height="90" as="geometry" />
        </mxCell>
        <mxCell id="end" value="Don't forget to save" style="fillColor=#16B378;" vertex="1" parent="1">
          <mxGeometry x="304" y="320" width="220" height="90" as="geometry" />
        </mxCell>
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;

const handleMessage = async event => {
  if (event.data && event.origin === drawIoUrl) {
    try {
      const message = JSON.parse(event.data);
      switch (message.event) {
        case "init":
          console.log("Draw.io client is ready");

          grist.ready({ requiredAccess: "full" });
          onRecord(selectedRecord);
          break;
        case "save":
        case "autosave":
          console.log("Saving diagram");
          saveFile(message.xml);
          break;
      }
    } catch (err) {
      console.error("Message parsing error", err);
    }
  }
};

if (!window.drawIoListenerAttached) {
  window.addEventListener("message", handleMessage);
  window.drawIoListenerAttached = true;
}

export const reset = record => {
  baseUrl = null;
  token = null;
  iframeLoaded = false;
  iframe = document.getElementById("draw-io-editor");

  if (!iframe) {
    console.error("Iframe element not found");
    return;
  }

  iframe.src = `${drawIoUrl}?embed=1&proto=json&spin=1`;

  iframe.onload = () => {
    iframeLoaded = true;
    onRecord(record);
    console.log("Iframe loaded");
  };

  console.log("Reset complete");
};

export const onRecord = async record => {
  if (record) {
    selectedRecord = record;
    // Wating for an update on this issue: https://github.com/gristlabs/grist-core/issues/1307
    /*
    if (!baseUrl || !token) {
      const access = await grist.getAccessToken();
      baseUrl = access.baseUrl;
      token = access.token;
    }
    selectedRecord = record;
    if (record[attachmentColumn]) {
      fetch(`${baseUrl}/attachments/${record[attachmentColumn]}/download?auth=${token}`)
        .then(response => response.text())
        .then(fileContent => {
          iframe.contentWindow.postMessage(
            JSON.stringify({
              action: "load",
              autosave: parseInt(autosave, 10),
              xml: fileContent,
            }),
            "*"
          );
        })
        .catch(error => console.error("Error loading draw.io file:", error));
    } else {
      iframe.contentWindow.postMessage(
        JSON.stringify({
          action: "load",
          autosave: parseInt(autosave, 10),
          xml: defaultXML,
        }),
        "*"
      );
    }
  }
  */
  if (record[rawColumn]) {
    iframe.contentWindow.postMessage(
      JSON.stringify({
        action: "load",
        autosave: parseInt(autosave, 10),
        xml: record[rawColumn],
      }),
      "*"
    );
  }
  } else {
    iframe.contentWindow.postMessage(
      JSON.stringify({
        action: "load",
        autosave: parseInt(autosave, 10),
        xml: defaultXML,
      }),
      "*"
    );
  }
}

const saveFile = async xml => {
  const table = grist.selectedTable;

  // Wating for an update on this issue: https://github.com/gristlabs/grist-core/issues/1307
  /*
  const fileName = `${selectedRecord.Name || selectedRecord.id}.drawio`;

  console.log({ fileName, table });
  const formData = new FormData();
  formData.append("upload", new Blob([xml], { type: "text/xml" }, fileName));

  const response = await fetch(`${baseUrl}/attachments/?auth=${token}`, {
    method: "POST",
    body: formData,
  });

  console.log(response);
  const fileReferences = await response.json();
  */

  console.log({ selectedRecord });
  await table.update({
    id: selectedRecord.id,
    // Wating for an update on this issue: https://github.com/gristlabs/grist-core/issues/1307
    fields: { ...selectedRecord.fields, [rawColumn]: xml, /*[attachmentColumn]: fileReferences*/ },
  });
};