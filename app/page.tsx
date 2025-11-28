import Link from 'next/link';
import { Camera, Video, Users, Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="py-6 px-4 border-b border-gray-200 shadow-sm bg-white">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Project Memory</h1>
          <Link
            href="https://github.com/yourusername/project-memory"
            className="text-sm text-gray-600 hover:text-gray-900 transition"
          >
            GitHub
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 px-4 py-2 rounded-full mb-6">
            <Sparkles size={16} className="text-red-500" />
            <span className="text-sm font-semibold text-red-600">MVP · In Development</span>
          </div>

          <h2 className="text-5xl md:text-7xl font-bold mb-6 text-gray-900 leading-tight">
            Every photo has a story
          </h2>

          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Transform your photos into interactive memories by combining your voice prompts with your friends' responses.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/create"
              className="bg-[#FF6B6B] text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-[#FF5252] transition-all shadow-md hover:shadow-lg hover:scale-105"
            >
              Create a Memory
            </Link>
          </div>
        </div>

        {/* How It Works */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="bg-white border border-gray-200 p-8 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Camera size={24} className="text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-900">1. Upload & Ask</h3>
            <p className="text-gray-600">
              Upload a photo, add your name and question, then record a video prompt for your friend.
            </p>
          </div>

          <div className="bg-white border border-gray-200 p-8 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <Video size={24} className="text-purple-600" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-900">2. Share & Record</h3>
            <p className="text-gray-600">
              Friends open the link, see your prompt, and record their response.
            </p>
          </div>

          <div className="bg-white border border-gray-200 p-8 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Users size={24} className="text-green-600" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-900">3. Enjoy Together</h3>
            <p className="text-gray-600">
              View both videos side-by-side. Share the memory with everyone.
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="bg-gray-50 border border-gray-200 p-12 rounded-3xl mb-20">
          <h3 className="text-3xl font-bold mb-8 text-center text-gray-900">Built for Speed</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-white text-xs">✓</span>
              </div>
              <div>
                <h4 className="font-semibold mb-1 text-gray-900">Immediate Playback</h4>
                <p className="text-sm text-gray-600">See your recording instantly after stopping</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-white text-xs">✓</span>
              </div>
              <div>
                <h4 className="font-semibold mb-1 text-gray-900">3-Attempt Limit</h4>
                <p className="text-sm text-gray-600">Quality control without pressure</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-white text-xs">✓</span>
              </div>
              <div>
                <h4 className="font-semibold mb-1 text-gray-900">No App Required</h4>
                <p className="text-sm text-gray-600">Works in any browser on any device</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-white text-xs">✓</span>
              </div>
              <div>
                <h4 className="font-semibold mb-1 text-gray-900">Responsive Design</h4>
                <p className="text-sm text-gray-600">Split view on desktop, stacked on mobile</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="text-center mb-20">
          <h3 className="text-2xl font-bold mb-6 text-gray-900">Built With</h3>
          <div className="flex flex-wrap justify-center gap-4">
            {['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Firebase', 'Vercel'].map((tech) => (
              <span
                key={tech}
                className="bg-white border border-gray-200 px-4 py-2 rounded-full text-sm font-semibold text-gray-700 shadow-sm"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-red-50 to-blue-50 border border-gray-200 p-12 rounded-3xl text-center">
          <h3 className="text-3xl font-bold mb-4 text-gray-900">Ready to Create Your First Memory?</h3>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Upload a photo, record your question, and share the link with a friend. It takes less than 2 minutes.
          </p>
          <Link
            href="/create"
            className="inline-block bg-[#FF6B6B] text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-[#FF5252] transition-all shadow-md hover:shadow-lg hover:scale-105"
          >
            Create a Memory Now
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-gray-200 mt-20 bg-white">
        <div className="max-w-6xl mx-auto text-center text-sm text-gray-600">
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
