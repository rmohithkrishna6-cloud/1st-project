import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { fetchEmbedCode } from '../services/api';
import { X, Code2, Copy, Check, ExternalLink } from 'lucide-react';

export const EmbedModal: React.FC = () => {
  const { isEmbedOpen, setIsEmbedOpen, activeSnippetId, currentLanguage, theme } = useAppStore();
  const isDark = theme === 'dark';
  const [embedData, setEmbedData] = useState<{ embedHtml: string; directUrl: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isEmbedOpen && activeSnippetId) {
      fetchEmbedCode(activeSnippetId)
        .then((data) => setEmbedData(data))
        .catch((err) => console.error(err));
    } else if (isEmbedOpen && currentLanguage) {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
      const url = `${origin}/editor?lang=${currentLanguage.id}`;
      const code = `<iframe src="${url}&embed=true" width="100%" height="500" frameborder="0" style="border-radius:16px; border:1px solid #FF5A1F;"></iframe>`;
      setEmbedData({ embedHtml: code, directUrl: url });
    }
  }, [isEmbedOpen, activeSnippetId, currentLanguage]);

  if (!isEmbedOpen) return null;

  const handleCopy = () => {
    if (embedData) {
      navigator.clipboard.writeText(embedData.embedHtml);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className={`glass-box max-w-lg w-full p-8 relative overflow-hidden shadow-2xl border transition-colors duration-300 ${
        isDark ? 'border-white/15 bg-[#121620]/95 text-[#F4F7FB]' : 'border-slate-200 bg-white/95 text-[#0F172A]'
      }`}>
        <button
          onClick={() => setIsEmbedOpen(false)}
          className={`absolute top-6 right-6 transition-colors ${
            isDark ? 'text-white/50 hover:text-white' : 'text-slate-400 hover:text-slate-800'
          }`}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF5A1F] to-[#FF304F] text-[#F4F7FB] flex items-center justify-center font-bold text-lg shadow-[0_0_18px_rgba(255,90,31,0.45)]">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Embed Code Snippet</h2>
            <p className={`text-xs ${isDark ? 'text-white/50' : 'text-slate-500'}`}>Copy HTML iframe snippet to embed in docs or web pages</p>
          </div>
        </div>

        {embedData && (
          <div className="space-y-4">
            <div>
              <label className={`text-xs font-semibold mb-1 block ${isDark ? 'text-white/60' : 'text-slate-700'}`}>HTML Iframe Embed Code</label>
              <div className="relative">
                <textarea
                  readOnly
                  rows={4}
                  value={embedData.embedHtml}
                  className={`w-full p-3 rounded-xl text-xs font-mono resize-none focus:outline-none focus:border-[#FF5A1F]/50 border ${
                    isDark ? 'bg-[#080A0F] border-white/10 text-[#F4F7FB] neo-inset' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
                <button
                  onClick={handleCopy}
                  className="absolute right-3 top-3 px-3 py-1.5 bg-gradient-to-r from-[#FF5A1F] to-[#FF304F] text-[#F4F7FB] font-bold rounded-lg text-xs flex items-center gap-1 hover:brightness-110 shadow-[0_0_12px_rgba(255,90,31,0.35)] transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied!' : 'Copy Code'}
                </button>
              </div>
            </div>

            <div>
              <label className={`text-xs font-semibold mb-1 block ${isDark ? 'text-white/60' : 'text-slate-700'}`}>Direct Compiler Link</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={embedData.directUrl}
                  className={`flex-1 p-2.5 rounded-xl text-xs font-mono focus:outline-none focus:border-[#FF5A1F]/50 border ${
                    isDark ? 'bg-[#080A0F] border-white/10 text-white/80 neo-inset' : 'bg-slate-50 border-slate-300 text-slate-800'
                  }`}
                />
                <a
                  href={embedData.directUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={`p-2.5 rounded-xl transition-colors border ${
                    isDark
                      ? 'neo-inset text-white/70 hover:text-[#FF5A1F] hover:border-[#FF5A1F]/40'
                      : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-[#FF5A1F] hover:border-[#FF5A1F]/40'
                  }`}
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
