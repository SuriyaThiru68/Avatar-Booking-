import { Sparkles, Mail } from 'lucide-react';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="py-12 px-6 border-t border-gray-100 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-indigo-600">
              <Sparkles size={13} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 text-base">Aura AI</span>
          </div>
          <p className="text-gray-400 text-sm text-center">
            AI-powered appointment booking — fast, simple, always available.
          </p>
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Mail size={14} />
            hello@aura-ai.com
          </div>
        </div>
        <div className="pt-6 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-300 text-[10px] font-bold uppercase tracking-widest">© {year} Aura AI. All Rights Reserved.</p>
          <div className="flex gap-6 text-[10px] font-bold uppercase tracking-widest text-gray-300">
            <span className="hover:text-gray-600 cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-gray-600 cursor-pointer transition-colors">Terms</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
