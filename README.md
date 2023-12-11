## PDF VIEWER

### Inside document-viewer/workspace `npm install`; Also inside projects/document-viewer `npm install`, then `cd ../..`
### Build library - `ng build document-viewer`
### Linking library - `npm link` inside dist/document-viewer folder of a library; `npm link ngx-view-document` inside project where you want library to to be visible

### Track live changes (watch): command starts from workspace `ng build document-viewer --watch=true`
### Architecture v1

- Main component - document-viewer
- Child components - document, document-actions, page-change, page-thumbnail
- Shared components - modals ( search )

![viewer-archv1](https://user-images.githubusercontent.com/18723426/111987901-10a63e00-8b10-11eb-93af-eb511f1624a9.png)
