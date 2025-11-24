# Production Deployment Guide

## Quick Deploy to Vercel with Custom Domain

### Step 1: Deploy to Vercel (3 minutes)

**Option A: Deploy via Vercel Dashboard (Easiest)**

1. **Push your code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Project Memory MVP - Ready for production"
   git branch -M main
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Go to [Vercel](https://vercel.com)**
   - Sign in with GitHub
   - Click "Add New..." → "Project"
   - Import your `project-memory-app` repository
   - Click "Deploy" (keep all defaults)

**Option B: Deploy via CLI (Faster if you have Vercel CLI)**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name? project-memory
# - Directory? ./
# - Deploy? Yes

# After first deploy, push to production:
vercel --prod
```

### Step 2: Add Environment Variables to Vercel (2 minutes)

**In Vercel Dashboard:**
1. Go to your project → "Settings" → "Environment Variables"
2. Add each variable from your `.env.local`:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`

3. Make sure to select **Production**, **Preview**, and **Development** for each variable
4. Click "Save"

**Redeploy after adding variables:**
- Go to "Deployments" tab
- Click "..." on the latest deployment → "Redeploy"

### Step 3: Connect Your Custom Domain (3 minutes)

**In Vercel Dashboard:**
1. Go to your project → "Settings" → "Domains"
2. Click "Add Domain"
3. Enter your domain (e.g., `projectmemory.com` or `memories.yourdomain.com`)
4. Vercel will show you DNS records to add

**In Your Domain Registrar (GoDaddy/Namecheap/etc):**

**If using root domain (e.g., projectmemory.com):**
- Add `A` record pointing to: `76.76.21.21`
- OR add `CNAME` record with value: `cname.vercel-dns.com`

**If using subdomain (e.g., app.projectmemory.com):**
- Add `CNAME` record with value: `cname.vercel-dns.com`

**Example for Namecheap:**
```
Type: CNAME
Host: app (or @ for root domain)
Value: cname.vercel-dns.com
TTL: Automatic
```

**Example for GoDaddy:**
```
Type: CNAME
Name: app (or @ for root domain)
Value: cname.vercel-dns.com
TTL: 600 seconds
```

5. Wait 5-10 minutes for DNS propagation
6. Vercel will automatically issue an SSL certificate

### Step 4: Update Firebase Settings (2 minutes)

**Add your domain to Firebase authorized domains:**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Authentication** → **Settings** → **Authorized domains**
4. Click "Add domain"
5. Add your Vercel domain:
   - Your Vercel preview domain: `project-memory.vercel.app`
   - Your custom domain: `projectmemory.com` (or whatever you chose)

6. Save

### Step 5: Test Your Deployment (1 minute)

**Visit your deployed site:**
```
https://your-domain.com/test-firebase
```

**Check that:**
- ✅ All environment variables show "Set"
- ✅ Firebase connection works
- ✅ Memory data loads correctly

**Then test the actual flow:**
```
https://your-domain.com/r/amaresh-test-1
```

---

## 🎉 You're Live!

**Your shareable link is now:**
```
https://your-domain.com/r/amaresh-test-1
```

**Share via WhatsApp:**
```
Hey Amaresh! 👋

Check this out - I built something for us.
Can you click this link and record a quick response?

https://your-domain.com/r/amaresh-test-1

Takes 30 seconds. Let me know what you think!
```

---

## 🔧 Troubleshooting

### "Environment variables not found" error

**Problem:** Vercel deployment can't read `.env.local`

**Fix:**
1. Add all variables in Vercel Dashboard → Settings → Environment Variables
2. Redeploy the project

### "Firebase permission denied" on production

**Problem:** Your domain isn't authorized in Firebase

**Fix:**
1. Go to Firebase Console → Authentication → Settings → Authorized domains
2. Add your Vercel domain
3. Wait a few minutes and try again

### Domain not connecting

**Problem:** DNS records not configured correctly

**Check:**
```bash
# Verify DNS propagation
nslookup your-domain.com

# Should show Vercel's IP or CNAME
```

**Fix:**
1. Double-check DNS records in your registrar
2. Wait up to 24 hours for full DNS propagation (usually 5-10 minutes)
3. Try visiting `https://project-memory.vercel.app` directly (the Vercel subdomain always works)

### Videos not loading on production

**Problem:** Storage URLs might be blocked

**Fix:**
1. Check Firebase Storage CORS settings
2. Make sure Storage rules allow public reads
3. Verify video URLs are accessible: Open the `photoUrl` directly in browser

---

## 📱 WhatsApp Link Preview (Optional)

To get a nice preview when sharing on WhatsApp, add Open Graph meta tags.

**I can add these for you if needed**, but for MVP the basic link works fine.

---

## 🔒 Security Checklist for Production

Before sharing widely:

- ✅ Firebase rules are set correctly (currently open for testing)
- ✅ Environment variables are in Vercel (not in code)
- ✅ `.env.local` is in `.gitignore` (already done)
- ⚠️ Consider adding rate limiting (do this after validation)
- ⚠️ Add Firebase Authentication (Phase 2)

For MVP with 5-10 friends, current setup is fine!

---

## 🚀 Quick Deploy Checklist

- [ ] Code pushed to GitHub
- [ ] Deployed to Vercel
- [ ] Environment variables added to Vercel
- [ ] Domain connected in Vercel
- [ ] DNS records added in domain registrar
- [ ] Domain added to Firebase authorized domains
- [ ] Tested `/test-firebase` on production
- [ ] Tested `/r/amaresh-test-1` on production
- [ ] Shared link via WhatsApp!

---

## 💡 Pro Tips

1. **Use Vercel's preview domains** for testing before using your custom domain
2. **Create separate Firebase projects** for dev and production (do this later)
3. **Monitor Vercel Analytics** to see how many people are using it
4. **Check Firebase Usage** dashboard to avoid hitting free tier limits

---

## Next Steps After Deploy

1. **Create a real memory for Amaresh** with the EF group photo
2. **Share the link** via WhatsApp and watch him use it
3. **Get feedback** - What did he love? What confused him?
4. **Iterate** - Make small improvements based on real user feedback
5. **Scale** - If people love it, add the creator upload page next

---

Need help with deployment? Let me know which step you're stuck on!
