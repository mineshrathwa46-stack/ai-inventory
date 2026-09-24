<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/fbaa3625-f815-4cfc-a758-6ec0d8229533

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the server-only `AI_API_KEY` in [.env.local](.env.local)
3. Run the app:
   `npm run dev`

## Deploy Publicly on Render

1. Push this project to a GitHub repository.
2. In Render, choose **New +** -> **Blueprint** and select the repository.
3. Render will use `render.yaml` to build and start the app.
4. Add `AI_API_KEY` in the Render environment variables if AI-generated insights are needed.

The current `server/users.json` is demo data and stores a password in plaintext. Remove that account and move authentication to a database or managed auth provider before sharing the public URL.
