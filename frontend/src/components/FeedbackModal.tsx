import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { fetchFeedbacks, submitFeedback, upvoteFeedback } from '../services/api';
import { FeedbackItem } from '../types';
import {
  X,
  Bug,
  MessageSquare,
  Sparkles,
  ThumbsUp,
  Send,
  CheckCircle2,
  AlertCircle,
  Zap,
  Lightbulb,
  Clock,
  UserCheck,
  Globe
} from 'lucide-react';

export const FeedbackModal: React.FC = () => {
  const { isFeedbackOpen, setIsFeedbackOpen, user, theme } = useAppStore();
  const isDark = theme === 'dark';
  const [activeTab, setActiveTab] = useState<'submit' | 'feed'>('submit');
  
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [category, setCategory] = useState<'bug' | 'feature' | 'general' | 'performance'>('bug');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [upvotedIds, setUpvotedIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('nexora_upvoted_feedbacks') || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (isFeedbackOpen) {
      loadFeedbacks();
      if (user) {
        setUserName(user.displayName);
        setUserEmail(user.email);
      }
    }
  }, [isFeedbackOpen, user]);

  const loadFeedbacks = async () => {
    setFetchLoading(true);
    try {
      const list = await fetchFeedbacks();
      setFeedbacks(list);
    } catch (e) {
      console.error("Failed to load feedbacks:", e);
    } finally {
      setFetchLoading(false);
    }
  };

  if (!isFeedbackOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!title.trim() || !message.trim()) {
      setErrorMsg('Please fill in both the title and detailed feedback description.');
      return;
    }

    setLoading(true);
    try {
      const res = await submitFeedback({
        category,
        title: title.trim(),
        message: message.trim(),
        userName: userName.trim() || (user ? user.displayName : 'Anonymous Developer'),
        userEmail: userEmail.trim() || (user ? user.email : ''),
      });

      setSuccessMsg(res.message || 'Feedback submitted and stored permanently!');
      setTitle('');
      setMessage('');
      
      await loadFeedbacks();
      setTimeout(() => {
        setSuccessMsg(null);
        setActiveTab('feed');
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit feedback.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async (id: string) => {
    if (upvotedIds.includes(id)) {
      return;
    }

    try {
      const res = await upvoteFeedback(id);
      setFeedbacks((prev) =>
        prev.map((fb) => (fb.id === id ? res.feedback : fb))
      );
      const next = [...upvotedIds, id];
      setUpvotedIds(next);
      localStorage.setItem('nexora_upvoted_feedbacks', JSON.stringify(next));
    } catch (e) {
      console.error('Failed to upvote:', e);
    }
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'bug':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FF304F]/15 text-[#FF304F] border border-[#FF304F]/30 flex items-center gap-1">
            <Bug className="w-3 h-3" /> Bug Report
          </span>
        );
      case 'feature':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30 flex items-center gap-1">
            <Lightbulb className="w-3 h-3" /> Feature Request
          </span>
        );
      case 'performance':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1">
            <Zap className="w-3 h-3" /> Performance
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FF5A1F]/15 text-[#FF5A1F] border border-[#FF5A1F]/30 flex items-center gap-1">
            <MessageSquare className="w-3 h-3" /> General
          </span>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'resolved':
        return (
          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-bold uppercase font-mono border border-emerald-500/40">
            Resolved
          </span>
        );
      case 'reviewing':
        return (
          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold uppercase font-mono border border-amber-500/40">
            Under Review
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[9px] font-bold uppercase font-mono border border-cyan-500/40">
            Received
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className={`max-w-2xl w-full p-6 sm:p-7 relative overflow-hidden shadow-2xl border rounded-2xl flex flex-col max-h-[90vh] transition-colors duration-300 ${
        isDark ? 'border-white/10 bg-[#121620] text-[#F4F7FB]' : 'border-slate-200 bg-white text-[#0F172A]'
      }`}>
        
        {/* Header Prompt Banner */}
        <div className={`flex items-start justify-between pb-4 border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#FF5A1F] to-[#FF304F] text-[#F4F7FB] flex items-center justify-center font-bold shadow-[0_0_15px_rgba(255,90,31,0.4)]">
              <Bug className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`text-lg font-extrabold ${isDark ? 'text-[#F4F7FB]' : 'text-slate-900'}`}>Feedback & Bug Reports</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FF304F]/15 text-[#FF304F] font-mono font-bold border border-[#FF304F]/30">
                  Public Feed
                </span>
              </div>
              <p className={`text-xs font-semibold flex items-center gap-1 mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                <Sparkles className="w-3.5 h-3.5 text-[#FF5A1F]" />
                "If you face any bug, let me know that!"
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsFeedbackOpen(false)}
            className={`p-2 rounded-xl transition-colors ${
              isDark
                ? 'text-slate-400 hover:text-white bg-[#080A0F] border border-white/10'
                : 'text-slate-600 hover:text-slate-900 bg-slate-100 border border-slate-200'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className={`flex items-center gap-2 mt-4 mb-4 p-1.5 rounded-xl border ${
          isDark ? 'bg-[#080A0F] border-white/10' : 'bg-slate-100 border-slate-200'
        }`}>
          <button
            onClick={() => setActiveTab('submit')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'submit'
                ? 'bg-gradient-to-r from-[#FF5A1F] to-[#FF304F] text-[#F4F7FB] shadow-[0_0_12px_rgba(255,90,31,0.4)]'
                : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            Submit Feedback / Bug
          </button>

          <button
            onClick={() => setActiveTab('feed')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'feed'
                ? 'bg-gradient-to-r from-[#FF5A1F] to-[#FF304F] text-[#F4F7FB] shadow-[0_0_12px_rgba(255,90,31,0.4)]'
                : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')
            }`}
          >
            <Globe className={`w-3.5 h-3.5 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
            Community Feed ({feedbacks.length})
          </button>
        </div>

        {/* TAB 1: SUBMIT FEEDBACK FORM */}
        {activeTab === 'submit' && (
          <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-1">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3.5 rounded-xl bg-[#FF5A1F]/15 border border-[#FF5A1F]/30 text-xs flex items-center gap-2 font-semibold text-emerald-600">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Category Selector */}
            <div>
              <label className={`text-xs font-semibold mb-1.5 block ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Select Feedback Type</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setCategory('bug')}
                  className={`p-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                    category === 'bug'
                      ? 'bg-[#FF304F]/20 text-[#FF304F] border-[#FF304F] shadow-sm'
                      : (isDark ? 'bg-[#080A0F] text-slate-400 border-white/10 hover:text-white' : 'bg-slate-50 text-slate-600 border-slate-200 hover:text-slate-900')
                  }`}
                >
                  <Bug className="w-4 h-4" /> Bug Report
                </button>
                <button
                  type="button"
                  onClick={() => setCategory('feature')}
                  className={`p-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                    category === 'feature'
                      ? 'bg-blue-500/20 text-blue-400 border-blue-500 shadow-sm'
                      : (isDark ? 'bg-[#080A0F] text-slate-400 border-white/10 hover:text-white' : 'bg-slate-50 text-slate-600 border-slate-200 hover:text-slate-900')
                  }`}
                >
                  <Lightbulb className="w-4 h-4" /> Feature Idea
                </button>
                <button
                  type="button"
                  onClick={() => setCategory('performance')}
                  className={`p-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                    category === 'performance'
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500 shadow-sm'
                      : (isDark ? 'bg-[#080A0F] text-slate-400 border-white/10 hover:text-white' : 'bg-slate-50 text-slate-600 border-slate-200 hover:text-slate-900')
                  }`}
                >
                  <Zap className="w-4 h-4" /> Performance
                </button>
                <button
                  type="button"
                  onClick={() => setCategory('general')}
                  className={`p-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                    category === 'general'
                      ? 'bg-[#FF5A1F]/20 text-[#FF5A1F] border-[#FF5A1F] shadow-sm'
                      : (isDark ? 'bg-[#080A0F] text-slate-400 border-white/10 hover:text-white' : 'bg-slate-50 text-slate-600 border-slate-200 hover:text-slate-900')
                  }`}
                >
                  <MessageSquare className="w-4 h-4" /> General
                </button>
              </div>
            </div>

            {/* Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={`text-xs font-semibold mb-1 block ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Your Name</label>
                <input
                  type="text"
                  placeholder="e.g. Mohith Krishna"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs focus:outline-none focus:border-[#FF5A1F] border ${
                    isDark
                      ? 'bg-[#080A0F] border-white/10 text-[#F4F7FB] placeholder-slate-500'
                      : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>

              <div>
                <label className={`text-xs font-semibold mb-1 block ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Your Email (Optional)</label>
                <input
                  type="email"
                  placeholder="developer@codeticz.com"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs focus:outline-none focus:border-[#FF5A1F] border ${
                    isDark
                      ? 'bg-[#080A0F] border-white/10 text-[#F4F7FB] placeholder-slate-500'
                      : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>
            </div>

            {/* Title / Summary */}
            <div>
              <label className={`text-xs font-semibold mb-1 block ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Bug / Feedback Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Stdin input detection hint doesn't clear on reset"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs focus:outline-none focus:border-[#FF5A1F] border ${
                  isDark
                    ? 'bg-[#080A0F] border-white/10 text-[#F4F7FB] placeholder-slate-500'
                    : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>

            {/* Message Description */}
            <div>
              <label className={`text-xs font-semibold mb-1 block ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Detailed Description / Steps to Reproduce</label>
              <textarea
                required
                rows={4}
                placeholder="Describe what happened or what feature you would like to see..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs focus:outline-none focus:border-[#FF5A1F] border ${
                  isDark
                    ? 'bg-[#080A0F] border-white/10 text-[#F4F7FB] placeholder-slate-500'
                    : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 bg-[#FF5A1F] hover:bg-[#FF6D38] active:bg-[#E04812] text-[#F4F7FB] shadow-[0_0_15px_rgba(255,90,31,0.4)] disabled:opacity-50 transition-all"
            >
              <Send className="w-4 h-4" />
              {loading ? 'Submitting & Saving...' : 'Submit Feedback & Post to Community Feed'}
            </button>
          </form>
        )}

        {/* TAB 2: COMMUNITY FEED */}
        {activeTab === 'feed' && (
          <div className="overflow-y-auto pr-1 space-y-3 flex-1 min-h-[300px]">
            {fetchLoading ? (
              <div className={`text-center py-12 text-xs font-mono animate-pulse ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                Loading community bug reports & feedbacks...
              </div>
            ) : feedbacks.length === 0 ? (
              <div className={`text-center py-12 text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                No feedback submitted yet. Be the first to report a bug or suggest a feature!
              </div>
            ) : (
              feedbacks.map((fb) => (
                <div
                  key={fb.id}
                  className={`p-4 rounded-xl border transition-all space-y-2.5 ${
                    isDark
                      ? 'border-white/5 bg-[#080A0F] hover:border-white/15'
                      : 'border-slate-200 bg-slate-50 hover:border-slate-300 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {getCategoryBadge(fb.category)}
                      {getStatusBadge(fb.status)}
                    </div>
                    <span className={`text-[10px] font-mono flex items-center gap-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      <Clock className="w-3 h-3" />
                      {new Date(fb.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div>
                    <h4 className={`text-sm font-bold ${isDark ? 'text-[#F4F7FB]' : 'text-slate-900'}`}>{fb.title}</h4>
                    <p className={`text-xs mt-1 leading-relaxed whitespace-pre-wrap ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{fb.message}</p>
                  </div>

                  <div className={`flex items-center justify-between pt-2 border-t ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
                    <div className={`flex items-center gap-1.5 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      <UserCheck className="w-3.5 h-3.5 text-[#FF5A1F]" />
                      <span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{fb.userName}</span>
                    </div>

                    {upvotedIds.includes(fb.id) ? (
                      <span
                        className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#FF5A1F]/20 text-[#FF5A1F] border border-[#FF5A1F]/40 text-xs font-bold shadow-sm"
                        title="You have upvoted this feedback (1 time per user)"
                      >
                        <ThumbsUp className="w-3.5 h-3.5 fill-[#FF5A1F]" />
                        <span>Liked ({fb.upvotes})</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleUpvote(fb.id)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all text-xs font-bold border ${
                          isDark
                            ? 'bg-[#121620] hover:bg-[#1A202C] text-slate-300 hover:text-white border-white/10 hover:border-[#FF5A1F]/40'
                            : 'bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border-slate-200 hover:border-[#FF5A1F]/40 shadow-sm'
                        }`}
                        title="Upvote / Agree with this feedback (1 time per user)"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>{fb.upvotes}</span>
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default FeedbackModal;
