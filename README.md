# Project Memory 📸

> **"Every photo has a story. Let's preserve them together."**

A web app that transforms photos into interactive memories by combining your voice prompts with your friends' responses.

## 🎯 The Idea

Instead of photos sitting silently in your gallery, Project Memory brings them to life:

1. **You** upload a photo and record a video asking about it
2. **Your friend** opens a link, sees the photo, and records their response
3. **Together** you create a shareable memory with both perspectives

**No writing. No typing. Just stories in your own voice.**

---

## ✨ Key Features

### For the MVP (What's Built):

- 🎥 **VideoAsk-style Interface** - Circular video bubbles that feel conversational
- 📱 **Mobile-First Recording** - One-tap camera access, smooth recording flow
- ⚡ **Immediate Playback** - See your recording right after you stop (builds trust)
- 🔄 **3-Attempt Limit** - Quality control without pressure
- 🎨 **Split View** - Desktop: side-by-side | Mobile: stacked vertically
- 🔗 **Shareable Links** - Each memory gets a unique URL
- 🎬 **Independent Controls** - Both videos can play/pause separately

---

## 🏗️ Tech Stack

- **Frontend:** Next.js 15 (React) + TypeScript + Tailwind CSS
- **Backend:** Firebase (Firestore + Storage)
- **Video:** HTML5 MediaRecorder API
- **Icons:** Lucide React
- **Deployment:** Vercel (recommended)

**Why this stack?**
- **Fast iteration:** Next.js makes pages + APIs easy
- **No video processing:** Videos stay separate (no ffmpeg complexity)
- **Generous free tier:** Firebase gives you Storage + DB for free
- **Mobile-ready:** Works in any browser, no app needed

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- A Firebase account (free)
- Basic familiarity with React (optional but helpful)

### Installation

1. **Clone and install:**
   ```bash
   cd project-memory-app
   npm install
   ```

2. **Set up Firebase:**
   - Follow the detailed guide in [SETUP.md](./SETUP.md)
   - You'll need to create a Firebase project and get your config keys

3. **Configure environment:**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your Firebase credentials
   ```

4. **Run locally:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

5. **Create your first test memory:**
   - Follow the manual testing guide in [SETUP.md](./SETUP.md#-manual-testing-creating-your-first-memory)

---

## 📁 Project Structure

```
project-memory-app/
├── app/
│   ├── r/[inviteId]/        # Friend response page (record video)
│   │   └── page.tsx
│   ├── m/[memoryId]/        # Final split view (shareable memory)
│   │   └── page.tsx
│   └── page.tsx             # Home page (landing)
├── components/
│   └── RecordingInterface.tsx  # Core recording logic
├── lib/
│   └── firebase.ts          # Firebase initialization
├── types/
│   └── memory.ts            # TypeScript types
├── SETUP.md                 # Detailed setup guide
└── README.md                # This file
```

---

## 🎬 User Flow

### Step 1: Creator Creates Memory (Manual for MVP)
```
You → Upload photo + video to Firebase Storage
You → Create Firestore document with inviteId
You → Share link: /r/{inviteId}
```

### Step 2: Friend Records Response
```
Friend → Opens link /r/{inviteId}
Friend → Sees photo + your video prompt
Friend → Clicks "Reply" → Grants camera permission
Friend → Records video (timer shows duration)
Friend → IMMEDIATE playback for review
Friend → Can re-record (max 3 attempts)
Friend → Clicks "Submit" → Video uploads to Firebase
Friend → Redirected to split view
```

### Step 3: Share the Memory
```
Anyone → Opens /m/{memoryId}
Desktop: Photo+CreatorVideo | FriendVideo (50/50 split)
Mobile:  Photo+CreatorVideo (top) / FriendVideo (bottom)
Both videos auto-play once, then user controls them
Shareable via link or native share menu
```

---

## 🛠️ Current Limitations (MVP)

This is a **lean MVP** focused on validating the core experience:

1. **No creator upload page** - You manually create memories via Firebase Console
2. **No authentication** - Anyone with the link can access
3. **No analytics** - No tracking of views, completions, etc.
4. **Basic error handling** - Minimal retry logic
5. **No video compression** - Videos upload at recorded quality
6. **Test mode security** - Firebase rules are wide open (fine for testing)

**Why?** These features take time. We want to test if people even *want* this first.

---

## 🚢 Deployment

### Quick Deploy to Vercel

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Deploy:**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repo
   - Add environment variables from `.env.local`
   - Click "Deploy"

3. **Update Firebase:**
   - Add your Vercel domain to Firebase authorized domains
   - Update Storage CORS if needed

Your app will be live at: `https://your-app.vercel.app`

---

## 🧪 Testing Guide

### Test Locally with Yourself
1. Create a test memory in Firebase (see SETUP.md)
2. Open `/r/{inviteId}` on your phone
3. Record a response
4. View the final split view at `/m/{memoryId}`

### Test with Real Users (The Important Part!)
1. Pick a meaningful photo (e.g., EF group photo)
2. Record a genuine question about it
3. Share the link with 2-3 friends
4. **Watch them use it** (don't just send and wait)
5. Note their reactions, confusions, delights

**Key questions to observe:**
- Do they understand what to do?
- Do they hesitate at camera permissions?
- Do they re-record? Why?
- Do they share the final memory?
- What do they say when they see it?

---

## 🎯 Next Steps (Post-MVP)

Once you validate demand with real users:

### Phase 2: Creator Tools
- [ ] `/create` page for uploading photo + recording prompt
- [ ] Auto-generate invite links
- [ ] Dashboard to view all your memories
- [ ] Edit/delete memories

### Phase 3: Polish
- [ ] Client-side video compression
- [ ] Better loading states
- [ ] Retry logic for failed uploads
- [ ] Email/SMS notifications

### Phase 4: Social
- [ ] Share to Instagram Stories (with watermark)
- [ ] Download final video as MP4
- [ ] "Make your own" CTA on shared memories
- [ ] Analytics dashboard

### Phase 5: Scale
- [ ] Firebase security rules
- [ ] Video CDN optimization
- [ ] Multiple friends per memory (group responses)
- [ ] AI-generated captions/subtitles

---

## 🐛 Known Issues

1. **Autoplay blocked on some browsers** - Videos may not auto-play (user needs to click play)
2. **Safari camera quirks** - iOS Safari sometimes needs page refresh for camera permissions
3. **Large video uploads** - No progress bar for upload (only spinner)
4. **No video preview before recording** - Friend can't see themselves before hitting record

These are acceptable for MVP. Fix after validation.

---

## 💡 Philosophy

This project follows the **"Do Things That Don't Scale"** principle:

- Manual memory creation? ✅ Validates demand first
- No creator dashboard? ✅ Forces you to talk to users
- Limited to 3 attempts? ✅ Creates quality pressure
- Web-only (no app)? ✅ Lower barrier to entry

**First, prove people want this. Then, scale it.**

---

## 📸 Sample Use Cases

1. **Family:**
   - Photo of grandparents at their wedding
   - You ask: "What was your first date like?"
   - They record their story

2. **Friends:**
   - Photo of college group trip
   - You ask: "What's your favorite memory from this trip?"
   - Each friend adds their perspective

3. **Nostalgia:**
   - Old childhood photo
   - You ask: "Do you remember what we were doing here?"
   - Your sibling fills in the missing pieces

---

## 🙏 Credits

Built by Suraj Prasad as an MVP to validate the idea of **conversational photo storytelling**.

Inspired by:
- **Remento** (voice-to-story for seniors)
- **VideoAsk** (conversational video UX)
- **Loom** (async video communication)
- **1 Second Everyday** (life documentation)

---

## 📄 License

MIT License - Feel free to fork and build on this!

---

## 🤝 Contributing

This is an MVP, so there's no formal contribution process yet. If you want to collaborate:
1. Fork the repo
2. Make your changes
3. Open a PR with a clear description

Focus areas that would help:
- Better error handling
- Video compression logic
- Firebase security rules
- Mobile UX improvements

---

## 📬 Contact

Questions? Ideas? Feedback?
- Open an issue on GitHub
- Or reach out directly

---

**Now go build your first memory! 🚀**
