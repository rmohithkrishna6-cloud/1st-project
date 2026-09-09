import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { fetchEmbedCode } from '../services/api';
import { X, Code2, Copy, Check, ExternalLink } from 'lucide-react';

export const EmbedModal: React.FC = () => {
  const { isEmbedOpen, setIsEmbedOpen, activeSnippetId, currentLanguage } = useAppStore();
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
      const code = `<iframe src="${url}&embed=true" width="100%" height="500" frameborder="0" style="border-radius:16px; border:1px solid #173525;"></iframe>`;
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="glass-box max-w-lg w-full p-8 relative overflow-hidden shadow-2xl border border-white/15">
        <button
          onClick={() => setIsEmbedOpen(false)}
          className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#B4FF00] text-[#0B1A12] flex items-center justify-center font-bold text-lg">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Embed Code Snippet</h2>
            <p className="text-xs text-white/50">Copy HTML iframe snippet to embed in docs or web pages</p>
          </div>
        </div>

        {embedData && (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-white/60 font-semibold mb-1 block">HTML Iframe Embed Code</label>
              <div className="relative">
                <textarea
                  readOnly
                  rows={4}
                  value={embedData.embedHtml}
                  className="w-full p-3 bg-[#0E2117] border border-white/10 rounded-xl text-xs text-[#B4FF00] font-mono neo-inset resize-none focus:outline-none"
                />
                <button
                  onClick={handleCopy}
                  className="absolute right-3 top-3 px-3 py-1.5 bg-[#B4FF00] text-[#0B1A12] font-bold rounded-lg text-xs flex items-center gap-1 hover:bg-white transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied!' : 'Copy Code'}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs text-white/60 font-semibold mb-1 block">Direct Compiler Link</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={embedData.directUrl}
                  className="flex-1 p-2.5 bg-[#0E2117] border border-white/10 rounded-xl text-xs text-white/80 font-mono neo-inset"
                />
                <a
                  href={embedData.directUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="neo-inset p-2.5 rounded-xl text-white/70 hover:text-[#B4FF00] transition-colors"
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
