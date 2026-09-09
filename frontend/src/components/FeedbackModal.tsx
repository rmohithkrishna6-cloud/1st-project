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
  const { isFeedbackOpen, setIsFeedbackOpen, user } = useAppStore();
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
      
      // Reload feedbacks list and switch to feed tab after 1.5s
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
      return; // Each user can only upvote a feedback item once
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
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/15 text-red-400 border border-red-500/30 flex items-center gap-1">
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
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#B4FF00]/15 text-[#B4FF00] border border-[#B4FF00]/30 flex items-center gap-1">
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
      <div className="glass-box max-w-2xl w-full p-6 sm:p-7 relative overflow-hidden shadow-2xl border border-white/15 bg-[#0B1A12]/95 flex flex-col max-h-[90vh]">
        
        {/* Header Prompt Banner */}
        <div className="flex items-start justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#B4FF00] text-[#0B1A12] flex items-center justify-center font-bold shadow-[0_0_20px_rgba(180,255,0,0.5)]">
              <Bug className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold text-white">Feedback & Bug Reports</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-mono font-bold border border-red-500/30">
                  Public Feed
                </span>
              </div>
              <p className="text-xs text-[#B4FF00] font-semibold flex items-center gap-1 mt-0.5">
                <Sparkles className="w-3.5 h-3.5" />
                "If you face any bug, let me know that!"
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsFeedbackOpen(false)}
            className="neo-inset p-2 rounded-xl text-white/50 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-2 mt-4 mb-4 bg-[#0E2117] p-1.5 rounded-xl border border-white/10 neo-inset">
          <button
            onClick={() => setActiveTab('submit')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'submit'
                ? 'bg-[#B4FF00] text-[#0B1A12] shadow-[0_0_15px_rgba(180,255,0,0.4)]'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            Submit Feedback / Bug
          </button>

          <button
            onClick={() => setActiveTab('feed')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'feed'
                ? 'bg-[#B4FF00] text-[#0B1A12] shadow-[0_0_15px_rgba(180,255,0,0.4)]'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
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
              <div className="p-3.5 rounded-xl bg-[#B4FF00]/15 border border-[#B4FF00]/40 text-[#B4FF00] text-xs flex items-center gap-2 font-semibold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Category Selector */}
            <div>
              <label className="text-xs text-white/70 font-semibold mb-1.5 block">Select Feedback Type</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setCategory('bug')}
                  className={`p-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                    category === 'bug'
                      ? 'bg-red-500/20 text-red-300 border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.3)]'
                      : 'bg-[#0E2117] text-white/60 border-white/10 hover:text-white'
                  }`}
                >
                  <Bug className="w-4 h-4" /> Bug Report
                </button>
                <button
                  type="button"
                  onClick={() => setCategory('feature')}
                  className={`p-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                    category === 'feature'
                      ? 'bg-blue-500/20 text-blue-300 border-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.3)]'
                      : 'bg-[#0E2117] text-white/60 border-white/10 hover:text-white'
                  }`}
                >
                  <Lightbulb className="w-4 h-4" /> Feature Idea
                </button>
                <button
                  type="button"
                  onClick={() => setCategory('performance')}
                  className={`p-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                    category === 'performance'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                      : 'bg-[#0E2117] text-white/60 border-white/10 hover:text-white'
                  }`}
                >
                  <Zap className="w-4 h-4" /> Performance
                </button>
                <button
                  type="button"
                  onClick={() => setCategory('general')}
                  className={`p-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                    category === 'general'
                      ? 'bg-[#B4FF00]/20 text-[#B4FF00] border-[#B4FF00] shadow-[0_0_12px_rgba(180,255,0,0.3)]'
                      : 'bg-[#0E2117] text-white/60 border-white/10 hover:text-white'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" /> General
                </button>
              </div>
            </div>

            {/* Name & Email (optional for guests, auto-filled if logged in) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-white/60 font-semibold mb-1 block">Your Name</label>
                <input
                  type="text"
                  placeholder="e.g. Mohith Krishna"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0E2117] border border-white/10 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#B4FF00] neo-inset"
                />
              </div>

              <div>
                <label className="text-xs text-white/60 font-semibold mb-1 block">Your Email (Optional)</label>
                <input
                  type="email"
                  placeholder="developer@nexora.com"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0E2117] border border-white/10 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#B4FF00] neo-inset"
                />
              </div>
            </div>

            {/* Title / Summary */}
            <div>
              <label className="text-xs text-white/60 font-semibold mb-1 block">Bug / Feedback Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Stdin input detection hint doesn't clear on reset"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#0E2117] border border-white/10 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#B4FF00] neo-inset"
              />
            </div>

            {/* Message Description */}
            <div>
              <label className="text-xs text-white/60 font-semibold mb-1 block">Detailed Description / Steps to Reproduce</label>
              <textarea
                required
                rows={4}
                placeholder="Describe what happened or what feature you would like to see..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#0E2117] border border-white/10 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#B4FF00] neo-inset"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full neo-button py-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(180,255,0,0.4)] disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {loading ? 'Submitting & Saving...' : 'Submit Feedback & Post to Community Feed'}
            </button>
          </form>
        )}

        {/* TAB 2: COMMUNITY FEED (SHOWN TO ALL USERS) */}
        {activeTab === 'feed' && (
          <div className="overflow-y-auto pr-1 space-y-3 flex-1 min-h-[300px]">
            {fetchLoading ? (
              <div className="text-center py-12 text-white/50 text-xs font-mono animate-pulse">
                Loading community bug reports & feedbacks...
              </div>
            ) : feedbacks.length === 0 ? (
              <div className="text-center py-12 text-white/40 text-xs">
                No feedback submitted yet. Be the first to report a bug or suggest a feature!
              </div>
            ) : (
              feedbacks.map((fb) => (
                <div
                  key={fb.id}
                  className="neo-inset p-4 rounded-xl border border-white/5 bg-[#0E2117]/80 hover:border-white/15 transition-all space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {getCategoryBadge(fb.category)}
                      {getStatusBadge(fb.status)}
                    </div>
                    <span className="text-[10px] text-white/40 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(fb.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-white">{fb.title}</h4>
                    <p className="text-xs text-white/70 mt-1 leading-relaxed whitespace-pre-wrap">{fb.message}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <div className="flex items-center gap-1.5 text-xs text-white/50">
                      <UserCheck className="w-3.5 h-3.5 text-[#B4FF00]" />
                      <span className="font-semibold text-white/80">{fb.userName}</span>
                    </div>

                    {upvotedIds.includes(fb.id) ? (
                      <span
                        className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#B4FF00]/20 text-[#B4FF00] border border-[#B4FF00]/40 text-xs font-bold shadow-[0_0_10px_rgba(180,255,0,0.2)]"
                        title="You have upvoted this feedback (1 time per user)"
                      >
                        <ThumbsUp className="w-3.5 h-3.5 fill-[#B4FF00]" />
                        <span>Liked ({fb.upvotes})</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleUpvote(fb.id)}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 hover:bg-[#B4FF00]/15 text-white/80 hover:text-[#B4FF00] border border-white/10 hover:border-[#B4FF00]/30 transition-all text-xs font-bold"
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
