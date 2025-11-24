# Project Memory - Setup & Testing Guide

## 🚀 Quick Start

### 1. Firebase Setup

#### Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Name it `project-memory` (or your preferred name)
4. Disable Google Analytics (optional for MVP)
5. Click "Create Project"

#### Enable Firestore Database
1. In Firebase Console, go to **Build > Firestore Database**
2. Click "Create database"
3. Choose "Start in test mode" (we'll add security rules later)
4. Select your preferred location (e.g., `us-central`)
5. Click "Enable"

#### Enable Firebase Storage
1. In Firebase Console, go to **Build > Storage**
2. Click "Get Started"
3. Start in test mode
4. Use the same location as Firestore
5. Click "Done"

#### Get Firebase Config
1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll to "Your apps" section
3. Click the **Web** icon `</>`
4. Register your app (name it "Project Memory Web")
5. Copy the `firebaseConfig` object
6. You'll need these values for the `.env.local` file

### 2. Local Setup

#### Install Dependencies
```bash
cd project-memory-app
npm install
```

#### Configure Environment Variables
1. Copy the example env file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` with your Firebase config values:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=project-memory-xxxxx.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=project-memory-xxxxx
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=project-memory-xxxxx.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
   ```

#### Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Manual Testing (Creating Your First Memory)

Since we're building the **friend response page first**, you'll need to manually create a test memory in Firebase.

### Step 1: Upload Test Assets to Firebase Storage

1. **Prepare your test files:**
   - `photo.jpg` - The photo from your memory (e.g., the EF group photo)
   - `creator-video.mp4` or `.webm` - Your video asking the question

2. **Upload to Firebase Storage:**
   - Go to Firebase Console > Storage
   - Create a folder structure: `memories/test-memory-1/`
   - Upload your files:
     - `memories/test-memory-1/photo.jpg`
     - `memories/test-memory-1/creator-video.mp4`

3. **Get the public URLs:**
   - Click on each uploaded file
   - Click "Download URL" or copy the URL from the file details
   - Save these URLs for the next step

### Step 2: Create a Test Memory Document in Firestore

1. **Go to Firebase Console > Firestore Database**

2. **Start a new collection:**
   - Click "Start collection"
   - Collection ID: `memories`
   - Click "Next"

3. **Add your first document:**
   - **Document ID:** `test-memory-1` (or let Firebase auto-generate)
   - **Fields:**
     ```
     createdAt: timestamp (click "timestamp" type, use current time)
     creatorName: string = "Suraj"
     creatorPrompt: string = "Do you remember who took this photo?"
     creatorVideoUrl: string = [paste your creator video URL from Storage]
     photoUrl: string = [paste your photo URL from Storage]
     inviteId: string = "invite-amaresh-1" (this will be in the URL)
     status: string = "pending"
     friendVideoUrl: string = "" (leave empty - will be filled after friend records)
     friendSubmittedAt: timestamp = null
     friendName: string = "" (optional, leave empty)
     ```

4. **Click "Save"**

### Step 3: Test the Friend Response Flow

1. **Get the invite link:**
   - The invite ID you created is `invite-amaresh-1`
   - Your test URL: `http://localhost:3000/r/invite-amaresh-1`

2. **Open the link** (ideally on your phone or in an incognito window to simulate a friend)

3. **Test the flow:**
   - ✅ You should see the photo with your video overlay
   - ✅ Click play on your video to see your prompt
   - ✅ Click "Reply" button
   - ✅ Allow camera/microphone permissions
   - ✅ See camera preview with the photo in background
   - ✅ Click the record button
   - ✅ Record a response (speak for 5-10 seconds)
   - ✅ Click stop button
   - ✅ **IMMEDIATE PLAYBACK** - You should see your recorded video right away
   - ✅ Review your video
   - ✅ Click "Re-record" if you want to try again (max 3 attempts)
   - ✅ Click "Send Memory"
   - ✅ Watch upload progress
   - ✅ Automatically redirected to split view

4. **View the final memory:**
   - After submission, you'll be at: `http://localhost:3000/m/test-memory-1`
   - **Desktop:** Should see 50/50 split (photo+creator left, friend right)
   - **Mobile:** Should see stacked layout (photo+creator top, friend bottom)
   - Both videos should auto-play once
   - Each video has independent controls

### Step 4: Share with Real Friends

1. **Deploy to Vercel (optional but recommended):**
   ```bash
   # Install Vercel CLI
   npm i -g vercel

   # Deploy
   vercel
   ```

2. **Create a new memory for Amaresh:**
   - Go to Firebase Console > Firestore
   - Create a new document with `inviteId: "amaresh-diwali-2023"`
   - Upload his photo and your video prompt
   - Share the link: `https://your-app.vercel.app/r/amaresh-diwali-2023`

3. **Send via WhatsApp:**
   ```
   Hey Amaresh! 👋

   I'm building something new and need your help testing it.
   Can you click this link and record a quick response?

   [Your Link Here]

   Takes 30 seconds. Let me know what you think!
   ```

---

## 🔍 Firestore Data Structure Reference

```
/memories/{memoryId}
├── id: string (document ID)
├── inviteId: string (unique ID for friend invite link)
├── createdAt: timestamp
├── creatorName: string
├── creatorPrompt: string (the question)
├── creatorVideoUrl: string (Firebase Storage URL)
├── photoUrl: string (Firebase Storage URL)
├── status: "pending" | "completed"
├── friendVideoUrl: string (filled after friend submits)
├── friendSubmittedAt: timestamp | null
└── friendName: string (optional)
```

## 🎯 Firebase Storage Structure

```
/memories/
  ├── {memoryId}/
  │   ├── photo.jpg
  │   ├── creator-video.mp4
  │   └── friend-video-[timestamp].webm (uploaded by friend)
  └── test-memory-1/
      ├── photo.jpg
      └── creator-video.mp4
```

---

## 🐛 Troubleshooting

### Camera/Microphone Not Working
- **Chrome/Safari:** Check browser permissions in Settings
- **Mobile:** Ensure you're using HTTPS (or localhost for testing)
- **Error message:** Should show clear error if permission denied

### Video Upload Failing
- Check Firebase Storage rules (should be in test mode for MVP)
- Check browser console for errors
- Ensure your Firebase project has Storage enabled

### "Memory Not Found" Error
- Verify the `inviteId` in Firestore matches the URL
- Check that the document exists in the `memories` collection
- Look for typos in the `inviteId` field

### Videos Not Auto-Playing
- Modern browsers block autoplay for videos with sound
- Users may need to click play manually (expected behavior)
- This is a browser security feature, not a bug

### Page Not Loading After Redirect
- Check that `friendVideoUrl` was successfully written to Firestore
- Verify the memory status changed to "completed"
- Check browser console for errors

---

## 📝 Next Steps (Post-MVP)

After you validate the core flow with friends, you can add:

1. **Creator Upload Page** (`/create`)
   - Allow creators to upload photo + record prompt directly in the app
   - Auto-generate invite links
   - Dashboard to view all created memories

2. **Firebase Security Rules**
   - Lock down Firestore and Storage with proper rules
   - Validate write operations

3. **Better Video Compression**
   - Client-side video compression before upload
   - Multiple quality options

4. **Notifications**
   - Email/SMS when friend submits response
   - Reminder if friend hasn't responded

5. **Analytics**
   - Track completion rates
   - Recording attempt analytics

---

## 🚢 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Initial Project Memory MVP"
   git push
   ```

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repo
   - Add environment variables (copy from `.env.local`)
   - Deploy

3. **Update Firebase Settings:**
   - Go to Firebase Console > Authentication > Settings
   - Add your Vercel domain to authorized domains

### Important for Production
- Change Firebase to **Production mode** and add security rules
- Set up proper Storage rules
- Enable Firebase Authentication (if adding user accounts later)

---

## 💡 Tips for First Test

1. **Start with yourself:**
   - Create a memory with your own photo
   - Record the response yourself on your phone
   - Experience the full flow before sharing with others

2. **Test on mobile first:**
   - This app is designed for mobile recording
   - Desktop works but mobile is the primary use case

3. **Use a real memory:**
   - Don't use a random test image
   - Pick a meaningful photo that will get genuine reactions
   - This helps you feel the emotional impact of the product

4. **Watch them record:**
   - When you share with Amaresh/family, watch them use it
   - Note where they get confused or hesitate
   - This user feedback is gold

---

Need help? Check the main README or open an issue on GitHub.

Happy memory building! 📸🎥✨
