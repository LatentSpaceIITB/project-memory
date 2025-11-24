import Link from 'next/link';
import { Camera, Video, Users, Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white">
      {/* Header */}
      <header className="py-6 px-4 border-b border-white/10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold">Project Memory</h1>
          <Link
            href="https://github.com/yourusername/project-memory"
            className="text-sm text-white/70 hover:text-white transition"
          >
            GitHub
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full mb-6">
            <Sparkles size={16} className="text-yellow-400" />
            <span className="text-sm font-semibold">MVP · In Development</span>
          </div>

          <h2 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            Every photo has a story
          </h2>

          <p className="text-xl md:text-2xl text-white/70 mb-8 max-w-3xl mx-auto">
            Transform your photos into interactive memories by combining your voice prompts with your friends' responses.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/SETUP.md"
              className="bg-white text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-white/90 transition shadow-lg"
            >
              Get Started
            </Link>
            <Link
              href="/README.md"
              className="bg-white/10 backdrop-blur border border-white/20 px-8 py-4 rounded-full font-bold text-lg hover:bg-white/20 transition"
            >
              Read Docs
            </Link>
          </div>
        </div>

        {/* How It Works */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="bg-white/5 border border-white/10 p-8 rounded-2xl">
            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
              <Camera size={24} className="text-blue-400" />
            </div>
            <h3 className="text-xl font-bold mb-3">1. Upload & Ask</h3>
            <p className="text-white/70">
              Upload a photo and record a video asking a question about it.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 p-8 rounded-2xl">
            <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mb-4">
              <Video size={24} className="text-purple-400" />
            </div>
            <h3 className="text-xl font-bold mb-3">2. Share & Record</h3>
            <p className="text-white/70">
              Friends open the link, see your prompt, and record their response.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 p-8 rounded-2xl">
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
              <Users size={24} className="text-green-400" />
            </div>
            <h3 className="text-xl font-bold mb-3">3. Enjoy Together</h3>
            <p className="text-white/70">
              View both videos side-by-side. Share the memory with everyone.
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="bg-gradient-to-r from-white/5 to-white/10 border border-white/10 p-12 rounded-3xl mb-20">
          <h3 className="text-3xl font-bold mb-8 text-center">Built for Speed</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-black text-xs">✓</span>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Immediate Playback</h4>
                <p className="text-sm text-white/70">See your recording instantly after stopping</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-black text-xs">✓</span>
              </div>
              <div>
                <h4 className="font-semibold mb-1">3-Attempt Limit</h4>
                <p className="text-sm text-white/70">Quality control without pressure</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-black text-xs">✓</span>
              </div>
              <div>
                <h4 className="font-semibold mb-1">No App Required</h4>
                <p className="text-sm text-white/70">Works in any browser on any device</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-black text-xs">✓</span>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Responsive Design</h4>
                <p className="text-sm text-white/70">Split view on desktop, stacked on mobile</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="text-center mb-20">
          <h3 className="text-2xl font-bold mb-6">Built With</h3>
          <div className="flex flex-wrap justify-center gap-4">
            {['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Firebase', 'Vercel'].map((tech) => (
              <span
                key={tech}
                className="bg-white/5 border border-white/10 px-4 py-2 rounded-full text-sm font-semibold"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-white/20 p-12 rounded-3xl text-center">
          <h3 className="text-3xl font-bold mb-4">Ready to Get Started?</h3>
          <p className="text-white/70 mb-8 max-w-2xl mx-auto">
            Follow the setup guide to create your first memory. Takes less than 10 minutes.
          </p>
          <Link
            href="/SETUP.md"
            className="inline-block bg-white text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-white/90 transition shadow-lg"
          >
            View Setup Guide
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/10 mt-20">
        <div className="max-w-6xl mx-auto text-center text-sm text-white/50">
          <p>
            Built by Suraj Prasad · Inspired by Remento, VideoAsk, and Loom
          </p>
          <p className="mt-2">
            MIT License · Feel free to fork and build on this
          </p>
        </div>
      </footer>
    </div>
  );
}
