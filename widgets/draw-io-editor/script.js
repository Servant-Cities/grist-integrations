const iframe = document.getElementById("draw-io-editor");

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(document.location.search);
  let drawIoUrl = params.get("draw-io-url");

  iframe.src = `${drawIoUrl}?embed=1&proto=json`;

  window.addEventListener("message", event => {
    if (event.data && event.origin === drawIoUrl) {
      console.log(event);
      try {
        const message = JSON.parse(event.data);
        if (message.event === "init") {
          console.log("The draw.io client is ready");

          grist.ready({
            requiredAccess: "full",
          });

          grist.onRecord(async record => {
            console.log("Grist Record:", record);
            if (record && record.Download) {
              const { baseUrl, token } = await grist.getAccessToken();
              const url = `${baseUrl}/attachments/${record.Download}/download?auth=${token}`;
              fetch(url)
                .then(response => response.text())
                .then(fileContent => {
                  console.log("Loaded file content:", fileContent);
                  iframe.contentWindow.postMessage(
                    JSON.stringify({
                      action: "load",
                      autosave: 1,
                      xml: fileContent,
                    }),
                    "*"
                  );
                })
                .catch(error => console.error("Error loading draw.io file:", error));
            }
          });
          
        }
      } catch (err) {
        console.log(err);
      }
    }
  });
});

