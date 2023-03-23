## PDF VIEWER
`cd document-viewer
cd workspace
npm install
cd projects/document-viewer
npm install
cd ../../
ng build document-viewer
cd dist/document-viewer
npm link
cd uhura
npm link ngx-view-document`
### Build library - `ng build document-viewer`

### Track live changes (watch): command starts from workspace `ng build document-viewer --watch=true`

### Linking library - `npm link` inside dist folder of a library; `npm link ngx-view-document` inside project where you want library to to be visible

### Architecture v1

- Main component - document-viewer
- Child components - document, document-actions, page-change, page-thumbnail
- Shared components - modals ( search )

![viewer-archv1](https://user-images.githubusercontent.com/18723426/111987901-10a63e00-8b10-11eb-93af-eb511f1624a9.png)
