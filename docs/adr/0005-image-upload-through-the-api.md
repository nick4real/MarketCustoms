# 0005: Image upload through the API

- **Status:** Accepted
- **Date:** 2026-11-19

## Context

Phase 1 adds listing images, stored in Azure Blob Storage (Azurite locally through Aspire). The images are small photos: at most 5 MB each and 10 per listing. Their type and size have to be checked before anything is kept, only the listing's owner (or a holder of `listings:moderate`) may add or remove them, and integration tests run against Azurite.

## Options considered

1. **Upload through the Catalog API.** The browser sends a multipart request through the gateway; Catalog checks ownership, the type (from the file's first bytes) and the size, then writes the blob. Simple to test and the same path as every other call. The image bytes pass through the API.
2. **SAS URL for direct-to-Blob upload.** Catalog hands out a short-lived write SAS and the browser uploads straight to Blob. Saves API bandwidth for large files. The checks can only happen after the blob exists, so it needs a second step to confirm or clean up, plus CORS on the storage account.

## Decision

Option 1. At this file size the bytes passing through the API don't matter, and checking before storing keeps invalid files out of Blob entirely. SAS fits large files and private downloads better; Phase 8 chat attachments (a read SAS) are the natural place to learn it.

- Container `listing-images` with anonymous read on blobs, so the browser loads images straight from their URLs.
- Blob names are `{listingId}/{random}.{ext}`. A listing stores image **names**, not URLs (seeded listings keep their Unsplash photo ids). Catalog builds the full URL for each response, so a change of Azurite port or a move to Azure (Phase 5) doesn't break stored data.
- Accepted types: `image/jpeg`, `image/png`, `image/webp`.

## Consequences

- Catalog gets the Aspire Blob client integration, and the AppHost and the test composition get Azurite.
- Responses carry both name and URL per image, so the client deletes by name and its own URL-building helper goes away.
- Image URLs point at the Blob endpoint the browser can reach, which locally is Azurite's host port.
- Images are public to anyone with the URL, including images of draft listings. Fine for a marketplace; private files would need a read SAS.
