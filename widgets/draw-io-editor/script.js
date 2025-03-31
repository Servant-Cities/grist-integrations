let selectedRecord;
let baseUrl;
let token;

const iframe = document.getElementById("draw-io-editor");

const params = new URLSearchParams(document.location.search);
const drawIoUrl = params.get("draw-io-url");
const autosave = params.get("autosave") || "0";

const defaultXML = `<mxfile>
  <diagram name="Page-1" id="H42mLJITaVdfGOS4gqnu">
    <mxGraphModel dx="1260" dy="781" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="827" pageHeight="1169" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />
        <mxCell id="Hu7yD38lk9dKQbEFSdQO-3" value="" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;" edge="1" parent="1" source="Hu7yD38lk9dKQbEFSdQO-1" target="Hu7yD38lk9dKQbEFSdQO-2">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="Hu7yD38lk9dKQbEFSdQO-1" value="&lt;font style=&quot;color: rgb(255, 255, 255);&quot;&gt;&lt;b&gt;Start your diagram in Grist !&lt;/b&gt;&lt;/font&gt;" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#16B378;strokeColor=#16B378;" vertex="1" parent="1">
          <mxGeometry x="304" y="150" width="220" height="90" as="geometry" />
        </mxCell>
        <mxCell id="Hu7yD38lk9dKQbEFSdQO-2" value="&lt;font style=&quot;color: rgb(255, 255, 255);&quot;&gt;&lt;b&gt;But don&#39;t forget to save !&lt;/b&gt;&lt;/font&gt;" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#16B378;strokeColor=#16B378;" vertex="1" parent="1">
          <mxGeometry x="304" y="320" width="220" height="90" as="geometry" />
        </mxCell>
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;

grist.onRecord(async record => {
  if (record) {
    if (!baseUrl || !token) {
      const access = await grist.getAccessToken();
      baseUrl = access.baseUrl;
      token = access.token;
    }
    selectedRecord = record;
    if (record.Download) {
      fetch(`${baseUrl}/attachments/${record.Download}/download?auth=${token}`)
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
});

document.addEventListener("DOMContentLoaded", () => {
  iframe.src = `${drawIoUrl}?embed=1&proto=json&spin=1`;

  window.addEventListener("message", async event => {
    if (event.data && event.origin === drawIoUrl) {
      try {
        const message = JSON.parse(event.data);
        switch (message.event) {
          case "init":
            console.log("The draw.io client is ready");

            grist.ready({
              requiredAccess: "full",
            });

            break;
          case "save":
          case "autosave":
            console.log(message);
            saveFile(message.xml);
            break;
        }
      } catch (err) {
        console.log(err);
      }
    }
  });
});

const saveFile = async xml => {
  const table = grist.selectedTable;

  const fileName = `${record.Name || record.id}.drawio`;

  console.log({ fileName, table });
  const formData = new FormData();
  formData.append("upload", new Blob([xml], { type: "text/xml" }, fileName));

  const response = await fetch(`${baseUrl}/attachments/?auth=${token}`, {
    method: "POST",
    body: formData,
  });

  console.log(response);
  const fileReferences = await response.json();

  console.log({ selectedRecord });
  await table.update({
    id: selectedRecord.id,
    fields: { ...selectedRecord.fields, Raw: xml, Download: fileReferences },
  });
};
