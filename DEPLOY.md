# Deploying WebCoder to Render

The repo is deploy-ready: `render.yaml` defines the service, the app derives its
public URLs from Render's environment, and Github login is optional. What remains
requires an Atlas account and a Render account (about 5 minutes).

## 1. Create the database (MongoDB Atlas)

1. Sign in at [mongodb.com/atlas](https://www.mongodb.com/atlas) and create a
   free **M0** cluster.
2. Under **Database Access**, add a database user with a password.
3. Under **Network Access**, allow access from `0.0.0.0/0` — Render's outbound
   IPs vary on the free tier, so the cluster can't be IP-allowlisted.
4. Copy the connection string (**Connect → Drivers**). It looks like
   `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/webcoder`.

## 2. Deploy the app (Render)

1. Sign in at [dashboard.render.com](https://dashboard.render.com) with Github.
2. Choose **New → Blueprint** and select the `dyang108/webcoder` repo.
3. Render reads `render.yaml` and prompts for `MONGODB_URI` — paste the Atlas
   connection string.
4. Deploy. The app comes up at `https://webcoder.onrender.com` (or whatever
   name Render assigns if that one is taken). `MAIN_URL` and `SOCKET_URL` are
   derived from the assigned hostname automatically.

## 3. (Optional) Enable Github login

Without credentials the app runs with the login button hidden. To enable it:

1. Create a [Github OAuth app](https://github.com/settings/developers) with
   authorization callback URL
   `https://<your-app>.onrender.com/auth/github/callback`.
2. In the Render dashboard, add `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`
   env vars with the OAuth app's values. No code changes needed.

## Notes

- The free Render tier spins down after ~15 minutes idle; the first visit after
  a quiet period takes ~30 seconds to wake.
- Node is pinned to 20.19.4 in `render.yaml` (the version the app was verified
  against); `NODE_ENV=production` makes the server serve the minified
  `bundle-prod.js`, which `npm install` builds via the `postinstall` script.
