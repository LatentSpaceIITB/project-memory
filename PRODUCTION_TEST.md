# Production Testing & Verification Guide

## ✅ What's Working

Your deployment to **https://www.latentspaces.in/** is successful!

- ✅ Landing page loads perfectly
- ✅ Routes are deploying correctly (`/m/test-memory-1` works)
- ✅ Next.js build is working
- ✅ Domain is connected with SSL

## 🔍 Current Issue

The `/r/amaresh-test-1` route shows 404 because:
- Either the Firestore document doesn't exist
- Or Firebase isn't connecting properly on production

## 📋 Step-by-Step Verification

### Step 1: Verify Firebase Connection on Production

Visit: **https://www.latentspaces.in/test-firebase**

This page will show you:
- Which environment variables are set ✅/❌
- Whether Firebase can connect
- Any permission errors

**Expected Result:**
- All 6 environment variables should show "✅ Set"
- Connection status should show "✅ SUCCESS!"
- Should display the memory data for `amaresh-test-1`

**If you see errors:**
- Environment variables missing → Add them in Vercel Dashboard
- Permission denied → Check Firebase rules
- No memory found → The document doesn't exist (see Step 2)

---

### Step 2: Verify Firestore Document Exists

**Go to Firebase Console:**
1. Open https://console.firebase.google.com/
2. Select your project
3. Go to Firestore Database
4. Look in the `memories` collection

**Check for a document with:**
- `inviteId: "amaresh-test-1"`
- `status: "pending"`
- Valid `photoUrl` and `creatorVideoUrl`

**If the document is missing or incorrect:**

Create/update it with these exact fields:
```javascript
{
  id: "test-memory-1",  // Document ID
  inviteId: "amaresh-test-1",  // Must match!
  createdAt: [current timestamp],
  creatorName: "Suraj",
  creatorPrompt: "Do you remember who took this photo?",
  creatorVideoUrl: "[your video URL from Firebase Storage]",
  photoUrl: "[your photo URL from Firebase Storage]",
  status: "pending",
  friendVideoUrl: "",
  friendSubmittedAt: null,
  friendName: ""
}
```

**Important:** Make sure the `inviteId` field exactly matches what's in your URL!

---

### Step 3: Test the Complete Flow

Once Firestore is set up correctly:

1. **Visit the invite link:**
   ```
   https://www.latentspaces.in/r/amaresh-test-1
   ```

2. **You should see:**
   - Your photo in the background
   - Your video prompt in a circular bubble
   - A "Reply" button
   - NO "404" or "Memory not found" errors

3. **Test recording:**
   - Click "Reply"
   - Allow camera permissions
   - Record a short video
   - See immediate playback
   - Click "Submit"

4. **Verify split view:**
   - After submitting, you should be redirected to `/m/test-memory-1`
   - Should show split view (desktop) or stacked (mobile)
   - Both videos should be visible

---

### Step 4: Create a New Memory for Real Testing

Once the test memory works, create a real one:

**In Firebase Storage:**
1. Create folder: `memories/amaresh-real-memory/`
2. Upload:
   - The EF group photo
   - Your video asking a real question
3. Copy the public URLs

**In Firestore:**
1. Create new document with a unique ID (e.g., `amaresh-real-001`)
2. Set these fields:
   ```javascript
   {
     id: "amaresh-real-001",
     inviteId: "amaresh-real",  // Unique invite ID
     createdAt: [timestamp],
     creatorName: "Suraj",
     creatorPrompt: "Hey Amaresh, remember this day at EF house?",
     creatorVideoUrl: "[your new video URL]",
     photoUrl: "[your photo URL]",
     status: "pending",
     friendVideoUrl: "",
     friendSubmittedAt: null
   }
   ```

**Share the link:**
```
Hey Amaresh! 👋

Check this out - I built something for us.
Click this link and record a quick response:

https://www.latentspaces.in/r/amaresh-real

Takes 30 seconds!
```

---

## 🐛 Common Issues & Fixes

### Issue: "Memory not found" on production

**Cause:** Firestore document doesn't exist or `inviteId` doesn't match

**Fix:**
1. Go to Firebase Console → Firestore
2. Find your document
3. Verify `inviteId` field exactly matches URL parameter
4. Check document exists in `memories` collection

---

### Issue: Page loads but shows error after a few seconds

**Cause:** Firebase permissions or environment variables

**Fix:**
1. Check https://www.latentspaces.in/test-firebase
2. Look for which variable is missing
3. Add it in Vercel Dashboard → Settings → Environment Variables
4. Redeploy: Vercel Dashboard → Deployments → Redeploy

---

### Issue: Videos don't load in split view

**Cause:** Storage URLs are wrong or not public

**Fix:**
1. Open the video URL directly in browser
2. Should load without requiring login
3. If it asks for login → Make Storage rules public (already done)
4. If 404 → URL is wrong, check Firebase Storage

---

### Issue: Camera permissions not working

**Cause:** Not using HTTPS (but your domain has SSL, so this shouldn't happen)

**Fix:**
- Verify you're on `https://` not `http://`
- Try a different browser
- Check browser permissions

---

## ✅ Final Checklist

Before sharing with friends:

- [ ] `/test-firebase` shows all environment variables set
- [ ] `/test-firebase` shows "✅ SUCCESS!"
- [ ] `/r/amaresh-test-1` loads without errors
- [ ] Can record a test video successfully
- [ ] Videos play in split view
- [ ] Tested on mobile device
- [ ] Created real memory for Amaresh
- [ ] Sent WhatsApp message

---

## 🎯 Next Steps

Once everything works:

1. **Test with yourself first** - Record a response on your phone
2. **Share with Amaresh** - Get real user feedback
3. **Watch him use it** - Note any confusion or delight
4. **Iterate** - Make small improvements
5. **Share with more friends** - Build momentum

---

## 💡 Pro Tips

1. **Create multiple memories** - Different photos, different friends
2. **Keep inviteIds simple** - Easy to share verbally
3. **Monitor Firebase usage** - Check you're within free tier
4. **Test on different devices** - iOS Safari, Android Chrome
5. **Get feedback early** - Don't wait for perfection

---

Need help with any of these steps? Let me know which part isn't working!
