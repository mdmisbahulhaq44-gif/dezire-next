# DEZIRE — Next.js (Phase 0)

Phase 0 goal: prove the pipeline works end to end — Next.js rendering on a
server, talking to the same Supabase project as the current site, deployed
on Vercel. Nothing here is the real site design yet; that starts in Phase 1.

## 1. Get the code into a new folder (Termux)

```bash
mkdir -p ~/dezire-next
cd ~/dezire-next
# copy all the files from this download into this folder
```

## 2. Install dependencies

```bash
npm install
```

## 3. Add your Supabase key

```bash
cp .env.local.example .env.local
```

Open `.env.local` and paste in your real Supabase anon key (Supabase
dashboard → Project Settings → API → `anon` `public` key). The URL is
already filled in — it's the same project the current site uses.

## 4. Test it locally first

```bash
npm run dev
```

Open the printed `http://localhost:3000` address in your phone's browser.
You should see a "✅ Connected to Supabase" message with the real product
count. If you see a ❌ error instead, double check the key you pasted in
step 3.

## 5. Push to GitHub

Create a **new, separate** GitHub repo for this (don't reuse the old
`venom` repo — that one stays untouched and live while this is being
built).

```bash
git init
git add .
git commit -m "Phase 0: Next.js + Supabase pipeline check"
git branch -M main
git remote add origin https://github.com/<your-username>/dezire-next.git
git push -u origin main
```

## 6. Deploy on Vercel (no CLI needed — do this from the Vercel website)

1. Go to vercel.com on your phone's browser and sign in with your GitHub
   account
2. Click **Add New → Project**
3. Import the `dezire-next` repo you just pushed
4. Before deploying, open **Environment Variables** and add the same two
   keys from your `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Click **Deploy**

Vercel gives you a live `.vercel.app` URL. Open it — you should see the
same "✅ Connected to Supabase" checkpoint page, now live on the internet.

**Once that checkpoint page is live and showing the correct product
count, Phase 0 is done.** Every future `git push` to this repo will
auto-redeploy — no manual `cp`/upload step needed anymore.
