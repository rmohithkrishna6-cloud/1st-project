import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { fetchExecutionHistory, deleteExecutionHistoryItem, clearAllExecutionHistory } from '../services/api';
import {
  X,
  History,
  Clock,
  HardDrive,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Check,
  Trash2,
  Code2,
  ExternalLink,
  Terminal
} from 'lucide-react';
import { ExecutionResult } from '../types';

export const HistoryDrawer: React.FC = () => {
  const {
    isHistoryOpen,
    setIsHistoryOpen,
    loadCodeToEditor,
    languages,
    currentLanguage,
    theme
  } = useAppStore();
  const isDark = theme === 'dark';

  const navigate = useNavigate();
  const [historyLogs, setHistoryLogs] = useState<(ExecutionResult & { id?: string; createdAt?: string })[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [justRefreshed, setJustRefreshed] = useState(false);

  const loadData = async () => {
    if (loading) return;
    setLoading(true);
    setIsRefreshing(true);
    try {
      const logs = await fetchExecutionHistory();
      setHistoryLogs(logs as any);
      setJustRefreshed(true);
      setTimeout(() => setJustRefreshed(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setTimeout(() => setIsRefreshing(false), 450);
    }
  };

  const handleDeleteItem = async (e: React.MouseEvent, targetId: string) => {
    e.stopPropagation();
    if (!targetId) return;
    setHistoryLogs((prev) => prev.filter((item) => (item.id || item.submissionId) !== targetId));
    try {
      await deleteExecutionHistoryItem(targetId);
    } catch (err) {
      console.error('Failed to delete history item:', err);
    }
  };

  const handleClearAll = async () => {
    if (!historyLogs.length) return;
    setHistoryLogs([]);
    try {
      await clearAllExecutionHistory();
    } catch (err) {
      console.error('Failed to clear execution history:', err);
    }
  };

  const handleOpenInEditor = (
    e: React.MouseEvent,
    log: ExecutionResult & { id?: string; code?: string; stdin?: string }
  ) => {
    e.stopPropagation();
    const langObj = languages.find((l) => l.id.toLowerCase() === log.language.toLowerCase());
    const codeToLoad = log.code || langObj?.defaultCode || '';
    
    // Load code, language, stdin, and previous execution result into the global editor store
    loadCodeToEditor(log.language, codeToLoad, log.stdin || '', log);
    
    // Navigate directly to the editor for this language
    navigate(`/editor?lang=${log.language}`);
  };

  useEffect(() => {
    if (isHistoryOpen) {
      loadData();
    }
  }, [isHistoryOpen]);

  if (!isHistoryOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className={`glass-box max-w-lg w-full h-full flex flex-col p-6 relative overflow-hidden shadow-2xl border-l transition-colors duration-300 ${
        isDark ? 'border-white/15 bg-[#121620]/95 text-[#F4F7FB]' : 'border-slate-200 bg-white/95 text-[#0F172A]'
      }`}>
        
        {/* Header */}
        <div className={`flex items-center justify-between pb-4 border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF5A1F] to-[#FF304F] text-[#F4F7FB] flex items-center justify-center font-bold text-lg shadow-[0_0_18px_rgba(255,90,31,0.45)]">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Execution Logs</h2>
                {justRefreshed && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FF5A1F]/20 text-[#FF5A1F] font-semibold border border-[#FF5A1F]/40 animate-fadeIn flex items-center gap-1">
                    <Check className="w-3 h-3 text-[#FF5A1F]" /> Refreshed
                  </span>
                )}
              </div>
              <p className={`text-[11px] ${isDark ? 'text-white/50' : 'text-slate-500'}`}>Click any run to open its code & output in the editor</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {historyLogs.length > 0 && (
              <button
                onClick={handleClearAll}
                className={`p-2 rounded-xl transition-all ${
                  isDark
                    ? 'neo-inset text-white/40 hover:text-red-400 hover:border-red-500/30'
                    : 'bg-slate-100 border border-slate-200 text-slate-500 hover:text-red-500 hover:border-red-200'
                }`}
                title="Clear All History"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={loadData}
              disabled={loading}
              className={`p-2 rounded-xl transition-all disabled:opacity-50 ${
                isDark
                  ? 'neo-inset text-white/60 hover:text-[#FF5A1F] hover:border-[#FF5A1F]/50'
                  : 'bg-slate-100 border border-slate-200 text-slate-600 hover:text-[#FF5A1F] hover:border-[#FF5A1F]/50'
              }`}
              title="Refresh Logs"
            >
              <RefreshCw className={`w-4 h-4 transition-transform duration-500 ${isRefreshing ? 'animate-spin text-[#FF5A1F]' : ''}`} />
            </button>
            <button
              onClick={() => setIsHistoryOpen(false)}
              className={`p-2 rounded-xl transition-colors ${
                isDark
                  ? 'neo-inset text-white/60 hover:text-white'
                  : 'bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
              title="Close Logs"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Log list */}
        <div className={`flex-1 overflow-y-auto pr-1 space-y-3.5 mt-4 transition-all duration-300 ${isRefreshing ? 'opacity-40 scale-[0.99]' : 'opacity-100 scale-100'}`}>
          {historyLogs.map((log, index) => {
            const targetId = log.id || log.submissionId || `log-${index}`;
            const timeFormatted = log.createdAt
              ? new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
              : null;
            const lineCount = log.code ? log.code.split('\n').length : 0;

            return (
              <div
                key={targetId}
                onClick={(e) => handleOpenInEditor(e, log)}
                className={`p-4 rounded-xl border cursor-pointer space-y-3 group transition-all relative ${
                  isDark
                    ? 'neo-flat border-white/5 hover:border-[#FF5A1F]/50 hover:bg-white/[0.02]'
                    : 'bg-slate-50 border-slate-200 hover:border-[#FF5A1F]/50 hover:bg-slate-100 shadow-sm'
                }`}
              >
                {/* Item Top Bar */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${
                      isDark ? 'bg-white/5 text-[#F4F7FB] border-white/10' : 'bg-slate-200 text-slate-800 border-slate-300'
                    }`}>
                      {log.language}
                    </span>
                    {timeFormatted && (
                      <span className={`text-[10px] font-mono ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
                        {timeFormatted}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-[11px]">
                      {log.status === 'success' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                      )}
                      <span className={log.status === 'success' ? (isDark ? 'text-emerald-300 font-semibold' : 'text-emerald-600 font-semibold') : (isDark ? 'text-red-400 font-semibold' : 'text-red-600 font-semibold')}>
                        {log.status}
                      </span>
                    </span>
                    <button
                      onClick={(e) => handleDeleteItem(e, targetId)}
                      className={`p-1 rounded-lg transition-colors ${
                        isDark ? 'text-white/30 hover:text-red-400 hover:bg-red-500/10' : 'text-slate-400 hover:text-red-500 hover:bg-red-100'
                      }`}
                      title="Delete log item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Code Snapshot Preview */}
                {log.code ? (
                  <div className={`rounded-lg p-2.5 border font-mono text-[11px] overflow-hidden ${
                    isDark ? 'bg-[#080A0F] border-white/5 text-white/80' : 'bg-white border-slate-200 text-slate-800'
                  }`}>
                    <div className={`flex items-center justify-between text-[10px] mb-1.5 font-sans border-b pb-1 ${
                      isDark ? 'text-white/40 border-white/5' : 'text-slate-500 border-slate-200'
                    }`}>
                      <span className={`flex items-center gap-1.5 font-mono font-semibold ${
                        isDark ? 'text-[#F4F7FB]' : 'text-slate-900'
                      }`}>
                        <Code2 className="w-3.5 h-3.5 text-[#FF5A1F]" />
                        Code Snapshot
                      </span>
                      <span className={`text-[10px] font-mono ${isDark ? 'text-white/40' : 'text-slate-500'}`}>{lineCount} line{lineCount === 1 ? '' : 's'}</span>
                    </div>
                    <pre className={`line-clamp-3 overflow-hidden whitespace-pre-wrap select-text font-mono leading-relaxed ${
                      isDark ? 'text-white/70' : 'text-slate-700'
                    }`}>
                      {log.code}
                    </pre>
                  </div>
                ) : (
                  <div className={`rounded-lg px-2.5 py-1.5 border text-[10px] font-mono flex items-center gap-1.5 ${
                    isDark ? 'bg-[#080A0F]/60 border-white/5 text-white/40' : 'bg-white border-slate-200 text-slate-500'
                  }`}>
                    <Code2 className="w-3.5 h-3.5 text-[#FF5A1F]/80 shrink-0" />
                    <span>Click 'Open in Editor' to load this {log.language} session</span>
                  </div>
                )}

                {/* Output Snippet */}
                {log.stdout && (
                  <div className={`p-2 rounded-lg border text-[11px] font-mono whitespace-pre-wrap ${
                    isDark ? 'bg-[#080A0F] border-white/5 text-white/70' : 'bg-slate-100 border-slate-200 text-slate-800'
                  }`}>
                    <div className={`flex items-center gap-1 text-[10px] mb-1 font-sans ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
                      <Terminal className="w-3 h-3 text-[#FF5A1F]" />
                      <span>Console Output</span>
                    </div>
                    <pre className={`line-clamp-2 font-mono ${isDark ? 'text-white/60' : 'text-slate-700'}`}>
                      {log.stdout}
                    </pre>
                  </div>
                )}

                {log.stderr && (
                  <div className={`p-2 rounded-lg border text-[11px] font-mono whitespace-pre-wrap ${
                    isDark ? 'bg-red-950/20 border-red-500/20 text-red-300/80' : 'bg-red-50 border-red-200 text-red-700'
                  }`}>
                    <div className="flex items-center gap-1 text-[10px] text-red-500 mb-1 font-sans">
                      <AlertTriangle className="w-3 h-3 text-red-500" />
                      <span>Errors</span>
                    </div>
                    <pre className={`line-clamp-2 font-mono ${isDark ? 'text-red-300/70' : 'text-red-600'}`}>
                      {log.stderr}
                    </pre>
                  </div>
                )}

                {/* Footer with Performance Stats & Open in Editor Button */}
                <div className={`flex items-center justify-between text-[10px] pt-1 border-t font-mono ${
                  isDark ? 'text-white/40 border-white/5' : 'text-slate-500 border-slate-200'
                }`}>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#FF5A1F]" />
                      {log.wallTimeMs}ms
                    </span>
                    <span className="flex items-center gap-1">
                      <HardDrive className={`w-3 h-3 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
                      {log.memoryKb}KB
                    </span>
                    <span className={isDark ? 'text-white/30' : 'text-slate-400'}>
                      Exit: {log.exitCode ?? 0}
                    </span>
                  </div>

                  <button
                    onClick={(e) => handleOpenInEditor(e, log)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-[#FF5A1F] to-[#FF304F] hover:brightness-110 text-[#F4F7FB] text-xs font-bold transition-all shadow-[0_0_12px_rgba(255,90,31,0.35)] hover:scale-105 active:scale-95 shrink-0"
                    title="Open this code and output in the editor"
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    <span>Open in Editor</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}

          {historyLogs.length === 0 && !loading && (
            <div className={`py-20 text-center text-xs font-mono ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
              <History className={`w-8 h-8 mx-auto mb-2 ${isDark ? 'text-white/20' : 'text-slate-300'}`} />
              <p>No recent execution logs recorded yet.</p>
              <p className={`text-[11px] mt-1 ${isDark ? 'text-white/30' : 'text-slate-400'}`}>Run any code in the compiler to record history.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
