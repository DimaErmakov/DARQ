# DARQ — Dynamic Adaptive Redirect QR

Dynamic Adaptive Redirect QR: a lightweight web app for creating, storing, and managing QR codes linked to documents. The app demonstrates a simple CRUD workflow (Create, Read, Update, Delete) for QR codes and their associated documents.

## Features

- Create: Upload a document and generate a QR code that points to a stable redirect URL for that document.
- Read: View a gallery/listing of generated QR codes with document metadata (name, filename, created date, and redirect URL).
- Update: Replace the underlying document while keeping the same QR code and redirect link (so printed/posted QR codes continue to work).
- Delete: Remove QR codes and their associated metadata from the local store.

## How it works (high level)

- Frontend: React UI (`my-qr-app/src/App.jsx`) provides a modal to upload files, create QR codes, and manage existing items. Tailwind utility classes are used for layout and styling in the current UI. QR codes are generated as data-URL images and shown inline.
- Storage (demo): QR items are stored in browser `localStorage` for the demo app.
- Server (recommended): For production use, run a server to accept file uploads, store files in a file store or DB, and return a stable redirect URL for each uploaded document.

## Recommended production architecture

- File storage: Store uploaded documents in durable shared storage (Azure Blob Storage, AWS S3, or similar). If you need metadata search or relationships, store document metadata in a database such as MongoDB.
- Redirect service: The stable URL embedded in the QR should be a redirect endpoint on your server. When someone scans the QR, the server looks up the current document location (from DB or storage metadata) and issues an HTTP redirect to the actual file URL.
- QR generation: You can generate the QR on the server (Node.js with `qrcode` npm package) or on the client. Generating on the server is more robust for batch processing and avoids exposing implementation details to clients.
- CDN & caching: Serve static assets and files from a CDN to improve performance and availability.
- Security: Authenticate uploads, validate file types and sizes, scan for malware if needed, and use signed download URLs for private documents.

## Server suggestions

- Node/Express or Fastify backend that exposes endpoints:
	- POST /upload — accept multipart file upload, store file, create a DB record with a stable id, and return a redirect URL (e.g. `/redirect/:id`).
	- GET /redirect/:id — lookup record and 302/307 redirect to the file's current URL (storage or signed URL).
	- PUT /document/:id — replace the underlying file/document (keep same id and redirect URL).
	- DELETE /document/:id — delete record and file.

- Storage options: MongoDB for metadata + Azure Blob Storage (or S3) for files. Using MongoDB's ObjectId or a UUID as the stable id is common.
- Cloud: Azure App Service / Azure Functions + Azure Blob Storage is a straightforward path if you want an Azure-native stack.

## Local setup (developer)

1. Open a terminal and install frontend dependencies:

```powershell
cd 'my-qr-app'
npm install
```

2. Install the QR generator package (if not already installed):

```powershell
npm install qrcode
```

3. Start the dev server:

```powershell
npm run dev
```

4. Open the URL printed by Vite (usually http://localhost:5173) and use the UI to create and manage QR codes.

## Notes & next steps

- Current demo stores data in `localStorage`. Move to a server-backed store for persistence across devices and users.
- Add server-side uploads, virus scanning, and signed URLs for secure downloads.
- Consider writing small integration tests for the server redirect flow and a basic E2E test for the create → scan → redirect scenario.
