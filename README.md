# Servant cities' Grist integrations
We are using Grist and want to share the tools we use for our workspace.

## How to expose the widgets on localhost ?
Using node.js v20+
```
cd host-grist-widget
yarn
yarn dev
```

## How to use the widgets in Grist ?
The tools have yet to be made user friendly and documented here but they will work if you have the right setup:

Add one of the following custom URLs

### Draw.io editor:
Let you quickly read and write your draw.io documents and save them in Grist. (Soon)

Autosave mode:
http://localhost:4000/draw-io-editor/?autosave=1&draw-io-url=https://embed.diagrams.net

Manual mode:
http://localhost:4000/draw-io-editor/?draw-io-url=https://embed.diagrams.net

### Styled html viewer:
View your html files with css and scripts loaded
http://localhost:4000/styled-html

## Host the widgets
Build the server:
```
cd host-grist-widget
yarn
yarn build
```

run the executable in /dist/server.js

eg: You can use nodejs directly or pm2 to keep the service alive.