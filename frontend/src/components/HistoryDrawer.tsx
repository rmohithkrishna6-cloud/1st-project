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
    currentLanguage
  } = useAppStore();

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
    <div className="fixed inset-0 z-[100] flex justify-end bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="glass-box max-w-lg w-full h-full flex flex-col p-6 relative overflow-hidden shadow-2xl border-l border-white/15 bg-[#0B1A12]/95">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#B4FF00] text-[#0B1A12] flex items-center justify-center font-bold text-lg shadow-[0_0_15px_rgba(180,255,0,0.4)]">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Execution Logs</h2>
                {justRefreshed && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#B4FF00]/20 text-[#B4FF00] font-semibold border border-[#B4FF00]/30 animate-fadeIn flex items-center gap-1">
                    <Check className="w-3 h-3 text-[#B4FF00]" /> Refreshed
                  </span>
                )}
              </div>
              <p className="text-[11px] text-white/50">Click any run to open its code & output in the editor</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {historyLogs.length > 0 && (
              <button
                onClick={handleClearAll}
                className="neo-inset p-2 rounded-xl text-white/40 hover:text-red-400 hover:border-red-500/30 transition-all"
                title="Clear All History"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={loadData}
              disabled={loading}
              className="neo-inset p-2 rounded-xl text-white/60 hover:text-[#B4FF00] hover:border-[#B4FF00]/40 transition-all disabled:opacity-50"
              title="Refresh Logs"
            >
              <RefreshCw className={`w-4 h-4 transition-transform duration-500 ${isRefreshing ? 'animate-spin text-[#B4FF00]' : ''}`} />
            </button>
            <button
              onClick={() => setIsHistoryOpen(false)}
              className="neo-inset p-2 rounded-xl text-white/60 hover:text-white transition-colors"
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
                className="neo-flat p-4 rounded-xl border border-white/5 hover:border-[#B4FF00]/40 cursor-pointer space-y-3 group transition-all relative hover:bg-white/[0.02]"
              >
                {/* Item Top Bar */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-white/5 text-[#B4FF00] border border-white/10">
                      {log.language}
                    </span>
                    {timeFormatted && (
                      <span className="text-[10px] font-mono text-white/40">
                        {timeFormatted}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-[11px]">
                      {log.status === 'success' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#B4FF00]" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                      )}
                      <span className={log.status === 'success' ? 'text-green-300 font-semibold' : 'text-red-400 font-semibold'}>
                        {log.status}
                      </span>
                    </span>
                    <button
                      onClick={(e) => handleDeleteItem(e, targetId)}
                      className="p-1 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Delete log item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Code Snapshot Preview */}
                {log.code ? (
                  <div className="bg-[#0B1A12] rounded-lg p-2.5 border border-white/5 font-mono text-[11px] text-white/80 overflow-hidden">
                    <div className="flex items-center justify-between text-[10px] text-white/40 mb-1.5 font-sans border-b border-white/5 pb-1">
                      <span className="flex items-center gap-1.5 font-mono text-[#B4FF00] font-semibold">
                        <Code2 className="w-3.5 h-3.5" />
                        Code Snapshot
                      </span>
                      <span className="text-[10px] text-white/40 font-mono">{lineCount} line{lineCount === 1 ? '' : 's'}</span>
                    </div>
                    <pre className="line-clamp-3 overflow-hidden text-white/70 whitespace-pre-wrap select-text font-mono leading-relaxed">
                      {log.code}
                    </pre>
                  </div>
                ) : (
                  <div className="bg-[#0B1A12]/40 rounded-lg px-2.5 py-1.5 border border-white/5 text-[10px] text-white/40 font-mono flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-[#B4FF00]/50 shrink-0" />
                    <span>Click 'Open in Editor' to load this {log.language} session</span>
                  </div>
                )}

                {/* Output Snippet */}
                {log.stdout && (
                  <div className="bg-[#0E2117] p-2 rounded-lg border border-white/5 text-[11px] font-mono text-white/70 whitespace-pre-wrap">
                    <div className="flex items-center gap-1 text-[10px] text-white/40 mb-1 font-sans">
                      <Terminal className="w-3 h-3 text-cyan-400" />
                      <span>Console Output</span>
                    </div>
                    <pre className="line-clamp-2 text-white/60 font-mono">
                      {log.stdout}
                    </pre>
                  </div>
                )}

                {log.stderr && (
                  <div className="bg-red-950/20 p-2 rounded-lg border border-red-500/20 text-[11px] font-mono text-red-300/80 whitespace-pre-wrap">
                    <div className="flex items-center gap-1 text-[10px] text-red-400 mb-1 font-sans">
                      <AlertTriangle className="w-3 h-3 text-red-400" />
                      <span>Errors</span>
                    </div>
                    <pre className="line-clamp-2 text-red-300/70 font-mono">
                      {log.stderr}
                    </pre>
                  </div>
                )}

                {/* Footer with Performance Stats & Open in Editor Button */}
                <div className="flex items-center justify-between text-[10px] text-white/40 pt-1 border-t border-white/5 font-mono">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#B4FF00]" />
                      {log.wallTimeMs}ms
                    </span>
                    <span className="flex items-center gap-1">
                      <HardDrive className="w-3 h-3 text-cyan-400" />
                      {log.memoryKb}KB
                    </span>
                    <span className="text-white/30">
                      Exit: {log.exitCode ?? 0}
                    </span>
                  </div>

                  <button
                    onClick={(e) => handleOpenInEditor(e, log)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#B4FF00] hover:bg-[#c4ff33] text-[#0B1A12] text-xs font-bold transition-all shadow-[0_0_10px_rgba(180,255,0,0.3)] hover:scale-105 active:scale-95 shrink-0"
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
            <div className="py-20 text-center text-white/40 text-xs font-mono">
              <History className="w-8 h-8 mx-auto mb-2 text-white/20" />
              <p>No recent execution logs recorded yet.</p>
              <p className="text-[11px] text-white/30 mt-1">Run any code in the compiler to record history.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
