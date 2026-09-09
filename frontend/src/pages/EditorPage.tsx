import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { useAppStore } from '../store/useAppStore';
import { executeCode, saveSnippet, fetchLanguages } from '../services/api';
import {
  Play,
  RotateCcw,
  Save,
  Terminal,
  FileText,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Clock,
  HardDrive,
  Copy,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Share2,
  Code2,
  Trash2,
  Columns,
  Rows,
  ClipboardPaste,
  HelpCircle,
  Lock,
  ShieldCheck,
  X
} from 'lucide-react';
import { LanguageConfig } from '../types';
import { LanguageIcon } from '../components/LanguageIcon';

const MONACO_OPTIONS = {
  fontSize: 14,
  fontFamily: "'Fira Code', 'Courier New', monospace",
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  smoothScrolling: true,
  cursorBlinking: 'smooth' as const,
  padding: { top: 12, bottom: 12 },
  lineNumbersMinChars: 3,
  bracketPairColorization: { enabled: true },
  automaticLayout: true,
  selectOnLineNumbers: true,
  roundedSelection: true,
  readOnly: false,
  cursorStyle: 'line' as const,
  quickSuggestions: true,
  contextmenu: true,
  formatOnType: true,
  formatOnPaste: true,
  multiCursorPaste: 'full' as const,
  copyWithSyntaxHighlighting: true,
  dragAndDrop: true,
  links: true,
  mouseWheelZoom: true,
  autoClosingBrackets: 'always' as const,
  autoClosingQuotes: 'always' as const,
  tabSize: 4,
  insertSpaces: true,
  fixedOverflowWidgets: true,
};

export const EditorPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const langParam = searchParams.get('lang') || 'python';

  const {
    languages,
    setLanguages,
    currentLanguage,
    setCurrentLanguage,
    switchLanguageAndTranspile,
    requestLanguageSwitch,
    confirmLanguageSwitch,
    cancelLanguageSwitch,
    pendingLanguage,
    isConfirmLangSwitchOpen,
    transpileNotification,
    setTranspileNotification,
    code,
    setCode,
    stdin,
    setStdin,
    isExecuting,
    setIsExecuting,
    executionResult,
    setExecutionResult,
    activeTab,
    setActiveTab,
    setIsLangModalOpen,
    user,
    activeSnippetId,
  } = useAppStore();

  const [copied, setCopied] = useState(false);
  const [pasted, setPasted] = useState(false);
  const [saved, setSaved] = useState(false);
  const [snippetTitle, setSnippetTitle] = useState('Untitled Snippet');
  const [panelLayout, setPanelLayout] = useState<'horizontal' | 'vertical'>('horizontal');
  const [comingSoonNotice, setComingSoonNotice] = useState<{ requestedName: string; requestedId: string } | null>(null);
  const isRedirectingRef = useRef(false);
  const editorRef = useRef<any>(null);
  const handleRunRef = useRef<() => void>(() => {});

  const activeLanguages = React.useMemo(() => {
    return languages.filter((l) => l.status === 'active');
  }, [languages]);

  // Load languages on mount
  useEffect(() => {
    fetchLanguages()
      .then((data) => {
        setLanguages(data);
        const match = data.find((l) => l.id.toLowerCase() === langParam.toLowerCase());
        const defaultActive = data.find((l) => l.status === 'active') || data[0];

        if (match && match.status === 'active') {
          if (currentLanguage?.id === match.id && code) {
            if (isRedirectingRef.current) {
              isRedirectingRef.current = false;
            } else {
              setComingSoonNotice(null);
            }
            return;
          }
          const hasCustomCode = Boolean(code && code.trim() !== '');
          setCurrentLanguage(match, hasCustomCode);
          if (isRedirectingRef.current) {
            isRedirectingRef.current = false;
          } else {
            setComingSoonNotice(null);
          }
        } else {
          // If the requested language is coming_soon or invalid:
          const requestedName = match
            ? match.name
            : (langParam.charAt(0).toUpperCase() + langParam.slice(1));

          isRedirectingRef.current = true;
          setComingSoonNotice({
            requestedName,
            requestedId: langParam,
          });

          // Fall back to default verified active language (Python)
          if (defaultActive) {
            setCurrentLanguage(defaultActive);
            setSearchParams({ lang: defaultActive.id }, { replace: true });
          }
        }
      })
      .catch((err) => console.error(err));
  }, [langParam]);

  const handlePrevLanguage = () => {
    const list = activeLanguages.length > 0 ? activeLanguages : languages;
    if (!list.length || !currentLanguage) return;
    const currentIndex = list.findIndex((l) => l.id === currentLanguage.id);
    const prevIndex = (currentIndex - 1 + list.length) % list.length;
    const prevLang = list[prevIndex];
    const switched = requestLanguageSwitch(prevLang);
    if (switched) {
      setSearchParams({ lang: prevLang.id });
    }
  };

  const handleNextLanguage = () => {
    const list = activeLanguages.length > 0 ? activeLanguages : languages;
    if (!list.length || !currentLanguage) return;
    const currentIndex = list.findIndex((l) => l.id === currentLanguage.id);
    const nextIndex = (currentIndex + 1) % list.length;
    const nextLang = list[nextIndex];
    const switched = requestLanguageSwitch(nextLang);
    if (switched) {
      setSearchParams({ lang: nextLang.id });
    }
  };

  const handleClearAllCode = () => {
    setCode('');
    if (editorRef.current) {
      editorRef.current.setValue('');
      editorRef.current.focus();
    }
  };

  const isInputExpected = React.useMemo(() => {
    if (!code) return false;
    const inputPatterns = [
      /\binput\s*\(/i,
      /\bsys\.stdin\b/i,
      /\bcin\s*>>/i,
      /\bscanf\s*\(/i,
      /\bfgets\s*\(/i,
      /\bScanner\b/i,
      /\bSystem\.in\b/i,
      /\bBufferedReader\b/i,
      /\breadline\s*\(/i,
      /\bConsole\.ReadLine\b/i,
      /\bfmt\.Scan\b/i,
      /\bgets\b/i,
      /\bstdin\(\)/i,
      /\bread\s+-p\b/i
    ];
    return inputPatterns.some((pattern) => pattern.test(code));
  }, [code]);

  const isWebHtml = React.useMemo(() => {
    if (!currentLanguage) return false;
    const webPreviewLangs = ['html', 'css', 'scss', 'less', 'stylus', 'postcss', 'reactnative', 'ionic', 'cordova', 'logo', 'karel', 'blockly', 'scratch', 'snap'];
    if (webPreviewLangs.includes(currentLanguage.id)) return true;
    if (executionResult?.stdout && (executionResult.stdout.includes('<!DOCTYPE') || executionResult.stdout.includes('<div') || executionResult.stdout.includes('<html'))) return true;
    return false;
  }, [currentLanguage, executionResult]);

  const handleRun = async () => {
    if (!currentLanguage || !code.trim() || isExecuting) return;

    if (currentLanguage.status === 'coming_soon') {
      setExecutionResult({
        submissionId: 'coming-soon',
        language: currentLanguage.id,
        status: 'error',
        stdout: '',
        stderr: `[Nexora Policy] Execution for ${currentLanguage.name} (${currentLanguage.id}) is currently disabled (Coming Soon). Only the ${activeLanguages.length} genuinely verified languages can be executed.`,
        exitCode: 1,
        wallTimeMs: 0,
        memoryKb: 0,
      });
      return;
    }

    setIsExecuting(true);
    const visualLangs = ['html', 'logo', 'karel'];
    if (visualLangs.includes(currentLanguage.id)) {
      setActiveTab('webpreview');
    } else {
      setActiveTab('console');
    }

    try {
      const result = await executeCode(currentLanguage.id, code, stdin, activeSnippetId || undefined, user?.id);
      setExecutionResult(result);
    } catch (err: any) {
      setExecutionResult({
        submissionId: 'error-local',
        language: currentLanguage.id,
        status: 'error',
        stdout: '',
        stderr: err.message || 'Execution error occurred',
        exitCode: 1,
        wallTimeMs: 0,
        memoryKb: 0,
      });
    } finally {
      setIsExecuting(false);
    }
  };

  // Keep handleRunRef up-to-date for editor action command
  useEffect(() => {
    handleRunRef.current = handleRun;
  });

  // Global keybinding listener for Ctrl+Enter / Cmd+Enter run code shortcut
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (handleRunRef.current) {
          handleRunRef.current();
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Re-layout Monaco editor when switching between Side-by-Side and Stacked panel layouts
  useEffect(() => {
    if (editorRef.current) {
      const timer = setTimeout(() => {
        editorRef.current.layout();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [panelLayout]);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    editor.focus();

    // Run Code Shortcut (Ctrl+Enter / Cmd+Enter) inside Monaco Editor
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      if (handleRunRef.current) {
        handleRunRef.current();
      }
    });
  };

  // Synchronize Monaco editor value when code is restored from history log or snippets
  useEffect(() => {
    if (editorRef.current && typeof code === 'string' && editorRef.current.getValue() !== code) {
      editorRef.current.setValue(code);
    }
  }, [code]);

  const handleSaveSnippet = async () => {
    if (!currentLanguage) return;
    try {
      await saveSnippet({
        title: snippetTitle,
        language: currentLanguage.id,
        code,
        stdin,
        visibility: 'public',
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      alert('Failed to save snippet');
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePasteCode = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        if (editorRef.current) {
          const selection = editorRef.current.getSelection();
          if (selection) {
            editorRef.current.executeEdits('button-paste', [
              {
                range: selection,
                text,
                forceMoveMarkers: true,
              },
            ]);
          } else {
            editorRef.current.setValue(text);
          }
          editorRef.current.focus();
        } else {
          setCode(text);
        }
        setPasted(true);
        setTimeout(() => setPasted(false), 2000);
      }
    } catch (err) {
      console.error('Clipboard paste failed:', err);
    }
  };

  const handleResetCode = () => {
    if (currentLanguage) {
      setCode(currentLanguage.defaultCode);
      setExecutionResult(null);
      if (editorRef.current) {
        editorRef.current.setValue(currentLanguage.defaultCode);
        editorRef.current.focus();
      }
    }
  };

  return (
    <div className="h-[calc(100vh-65px)] flex flex-col bg-[#0B1A12] overflow-hidden">
      
      {/* Auto-Transpilation Notification Toast Banner */}
      {transpileNotification && (
        <div className="bg-[#B4FF00]/15 border-b border-[#B4FF00]/30 px-6 py-2 flex items-center justify-between text-xs text-[#B4FF00] font-sans animate-fadeIn z-30">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#B4FF00] animate-pulse" />
            <span>
              <strong>Universal Transpiler:</strong> {transpileNotification}. Core program concepts & statements converted automatically.
            </span>
          </div>
          <button
            onClick={() => setTranspileNotification(null)}
            className="px-2 py-0.5 rounded bg-[#B4FF00]/20 hover:bg-[#B4FF00]/30 text-[#B4FF00] font-bold text-[10px]"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Coming Soon / Unavailable Redirect Warning Banner */}
      {comingSoonNotice && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 px-6 py-3 flex items-center justify-between text-xs text-amber-200 animate-fadeIn z-30 shadow-lg backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <Lock className="w-4 h-4" />
            </div>
            <span>
              <strong className="text-amber-300 font-bold">{comingSoonNotice.requestedName} is Coming Soon:</strong> Live execution engine is pending deployment. We've redirected you to a verified active sandbox (<strong>{currentLanguage?.name || 'Python'}</strong>).
            </span>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setIsLangModalOpen(true)}
              className="px-3.5 py-1.5 rounded-lg bg-amber-500/25 hover:bg-amber-500/35 text-amber-200 font-bold text-[11px] border border-amber-500/40 transition-colors shadow-sm"
            >
              Browse {activeLanguages.length} Verified Languages
            </button>
            <button
              onClick={() => setComingSoonNotice(null)}
              className="neo-inset p-1.5 rounded-lg text-white/50 hover:text-white transition-colors"
              title="Dismiss Notice"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Fallback Coming Soon Warning Banner if an unverified language is selected in state */}
      {currentLanguage?.status === 'coming_soon' && (
        <div className="bg-amber-500/10 border-b border-amber-500/30 px-6 py-2.5 flex items-center justify-between text-xs text-amber-300 animate-fadeIn z-30">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-400" />
            <span>
              <strong>{currentLanguage.name} is Coming Soon:</strong> Genuine sandbox execution engine is pending deployment. Live code execution is disabled to prevent fake output.
            </span>
          </div>
          <button
            onClick={() => setIsLangModalOpen(true)}
            className="px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-[11px] border border-amber-500/30 transition-colors"
          >
            Switch to a Verified Language
          </button>
        </div>
      )}

      {/* Cypher In-Memory Subset Limitation Notice Banner */}
      {currentLanguage?.id === 'cypher' && (
        <div className="bg-emerald-500/10 border-b border-emerald-500/30 px-6 py-2 flex items-center justify-between text-xs text-emerald-200 animate-fadeIn z-30 shadow-sm backdrop-blur-md">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg bg-emerald-500/20 text-[#B4FF00]">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span>
              <strong className="text-emerald-300 font-bold">Cypher (In-Memory Subset):</strong> Executed via embedded property graph engine (<code className="text-[#B4FF00] font-mono">cypherdotjs</code>). Supports <code className="font-mono">CREATE</code>, <code className="font-mono">MATCH</code>, <code className="font-mono">WHERE</code>, and <code className="font-mono">RETURN</code>. 
              <span className="text-amber-300 ml-1.5 font-semibold">⚠️ Limitations: ORDER BY, LIMIT, and Aggregations (count, sum, collect) are unsupported in this engine.</span>
            </span>
          </div>
        </div>
      )}

      {/* WORKSPACE TOP CONTROL BAR */}
      <div className="glass-box border-b border-white/10 px-6 py-2.5 flex items-center justify-between gap-4 z-20">
        
        {/* Left Controls: Language Picker & Prev/Next Buttons & Title */}
        <div className="flex items-center gap-2">
          
          {/* Previous Language Button (Left Arrow) */}
          <button
            onClick={handlePrevLanguage}
            onMouseDown={(e) => e.preventDefault()}
            className="neo-inset p-2 rounded-xl text-white/70 hover:text-[#B4FF00] hover:border-[#B4FF00]/40 transition-colors flex items-center justify-center"
            title="Previous Verified Language (Left Arrow)"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Language Selector Button */}
          <button
            onClick={() => setIsLangModalOpen(true)}
            onMouseDown={(e) => e.preventDefault()}
            className="px-3.5 py-1.5 rounded-xl bg-[#0E2117] border border-white/10 hover:border-[#B4FF00]/50 text-xs font-bold text-white flex items-center gap-2 neo-flat transition-all"
          >
            <LanguageIcon id={currentLanguage?.id || ''} fallback={currentLanguage?.icon} className="text-base" />
            <span>{currentLanguage?.name || 'Select Language'}</span>
            {currentLanguage?.status === 'active' ? (
              <span className="text-[10px] text-[#B4FF00] font-mono px-1.5 py-0.5 rounded bg-[#B4FF00]/10 border border-[#B4FF00]/20">
                Verified
              </span>
            ) : (
              <span className="text-[10px] text-amber-400 font-mono px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" /> Coming Soon
              </span>
            )}
            {currentLanguage?.id === 'cypher' && (
              <span className="text-[10px] text-amber-300 font-mono px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/30">
                Subset
              </span>
            )}
            <ChevronDown className="w-3.5 h-3.5 text-white/50" />
          </button>

          {/* Next Language Button (Right Arrow) */}
          <button
            onClick={handleNextLanguage}
            onMouseDown={(e) => e.preventDefault()}
            className="neo-inset p-2 rounded-xl text-white/70 hover:text-[#B4FF00] hover:border-[#B4FF00]/40 transition-colors flex items-center justify-center"
            title="Next Verified Language (Right Arrow)"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Snippet Title */}
          <input
            type="text"
            value={snippetTitle}
            onChange={(e) => setSnippetTitle(e.target.value)}
            className="bg-transparent border border-transparent hover:border-white/10 focus:border-[#B4FF00] px-2 py-1 rounded text-xs font-semibold text-white/90 focus:outline-none focus:bg-[#0E2117]"
          />

        </div>

        {/* Right Controls: Panel Layout Alignment Toggle, Erase All, Reset, Paste, Copy, Save, Run Code */}
        <div className="flex items-center gap-2">
          
          {/* Panel Layout Toggle (Side-by-Side vs Stacked) */}
          <div className="flex items-center gap-1 bg-[#0E2117] p-1 rounded-xl border border-white/10 neo-inset">
            <button
              onClick={() => setPanelLayout('horizontal')}
              onMouseDown={(e) => e.preventDefault()}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                panelLayout === 'horizontal'
                  ? 'bg-[#B4FF00] text-[#0B1A12] font-bold shadow-[0_0_10px_rgba(180,255,0,0.3)]'
                  : 'text-white/60 hover:text-white'
              }`}
              title="Horizontal Split View (Side-by-Side)"
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden xl:inline text-[10px]">Side-by-Side</span>
            </button>

            <button
              onClick={() => setPanelLayout('vertical')}
              onMouseDown={(e) => e.preventDefault()}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                panelLayout === 'vertical'
                  ? 'bg-[#B4FF00] text-[#0B1A12] font-bold shadow-[0_0_10px_rgba(180,255,0,0.3)]'
                  : 'text-white/60 hover:text-white'
              }`}
              title="Vertical Split View (Stacked)"
            >
              <Rows className="w-3.5 h-3.5" />
              <span className="hidden xl:inline text-[10px]">Stacked</span>
            </button>
          </div>

          <button
            onClick={handleClearAllCode}
            onMouseDown={(e) => e.preventDefault()}
            className="neo-inset px-2.5 py-1.5 rounded-xl text-white/60 hover:text-red-400 border border-white/5 transition-colors flex items-center gap-1.5"
            title="Erase All Code (Clear Editor)"
          >
            <Trash2 className="w-4 h-4" />
            <span className="text-[11px] font-semibold hidden sm:inline">Erase All</span>
          </button>

          <button
            onClick={handleResetCode}
            onMouseDown={(e) => e.preventDefault()}
            className="neo-inset p-2 rounded-xl text-white/60 hover:text-white transition-colors"
            title="Reset to Default Template"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handleCopyCode}
            onMouseDown={(e) => e.preventDefault()}
            className="neo-inset p-2 rounded-xl text-white/60 hover:text-white transition-colors"
            title="Copy Code"
          >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            onClick={handlePasteCode}
            onMouseDown={(e) => e.preventDefault()}
            className="neo-inset px-2.5 py-1.5 rounded-xl text-white/60 hover:text-[#B4FF00] border border-white/5 transition-colors flex items-center gap-1.5"
            title="Paste Code from Clipboard"
          >
            {pasted ? <Check className="w-4 h-4 text-[#B4FF00]" /> : <ClipboardPaste className="w-4 h-4" />}
            <span className="text-[11px] font-semibold hidden sm:inline">{pasted ? 'Pasted!' : 'Paste'}</span>
          </button>

          <button
            onClick={handleSaveSnippet}
            onMouseDown={(e) => e.preventDefault()}
            className="neo-flat px-3.5 py-2 rounded-xl border border-white/10 hover:border-[#B4FF00]/40 text-xs font-semibold text-white/90 flex items-center gap-1.5 transition-all"
          >
            {saved ? <Check className="w-4 h-4 text-[#B4FF00]" /> : <Save className="w-4 h-4" />}
            {saved ? 'Saved!' : 'Save'}
          </button>

          {/* Main RUN Code Button */}
          <button
            onClick={handleRun}
            onMouseDown={(e) => e.preventDefault()}
            disabled={isExecuting || currentLanguage?.status === 'coming_soon'}
            className={`neo-button px-6 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-[0_0_20px_rgba(180,255,0,0.4)] disabled:opacity-40 disabled:cursor-not-allowed ${
              currentLanguage?.status === 'coming_soon' ? '!bg-gray-800 !text-gray-400 border border-white/10 shadow-none' : ''
            }`}
            title={currentLanguage?.status === 'coming_soon' ? 'Live execution engine is currently under development' : 'Run Code (Ctrl+Enter)'}
          >
            {isExecuting ? (
              <div className="w-4 h-4 border-2 border-[#0B1A12] border-t-transparent rounded-full animate-spin" />
            ) : currentLanguage?.status === 'coming_soon' ? (
              <Lock className="w-4 h-4 text-amber-400" />
            ) : (
              <Play className="w-4 h-4 fill-[#0B1A12]" />
            )}
            {isExecuting ? 'Running...' : currentLanguage?.status === 'coming_soon' ? 'Coming Soon' : 'Run Code'}
            {currentLanguage?.status !== 'coming_soon' && (
              <span className="hidden md:inline text-[10px] opacity-75 font-mono">(Ctrl+Enter)</span>
            )}
          </button>

        </div>

      </div>



      {/* WORKSPACE MAIN PANELS (SPLIT EDITOR & OUTPUT) */}
      <div className={`flex-1 flex overflow-hidden w-full h-full ${panelLayout === 'vertical' ? 'flex-col' : 'flex-row'}`}>
        
        {/* LEFT / TOP PANEL: MONACO EDITOR */}
        <div className={`flex flex-col min-w-0 min-h-0 bg-[#0E2117]/60 relative ${panelLayout === 'vertical' ? 'w-full h-[55%] border-b border-white/10' : 'flex-1 h-full border-r border-white/10'}`}>
          
          {/* Editor Header Status */}
          <div className="px-4 py-2 border-b border-white/5 bg-[#0B1A12]/50 flex items-center justify-between text-xs text-white/50">
            <span className="flex items-center gap-1.5 font-mono text-[11px]">
              <Code2 className="w-3.5 h-3.5 text-[#B4FF00]" />
              main.{currentLanguage?.fileExtension || 'txt'}
            </span>
          </div>

          {/* Monaco Editor Component */}
          <div
            className="flex-1 overflow-hidden cursor-text"
            onMouseDown={() => {
              if (editorRef.current && !editorRef.current.hasTextFocus()) {
                editorRef.current.focus();
              }
            }}
          >
            <Editor
              height="100%"
              language={currentLanguage?.monacoLanguage || 'javascript'}
              value={code}
              onChange={(value) => setCode(value || '')}
              onMount={handleEditorDidMount}
              theme="vs-dark"
              options={MONACO_OPTIONS}
            />
          </div>

        </div>


        {/* RIGHT / BOTTOM PANEL: STDIN, CONSOLE OUTPUT & WEB PREVIEW */}
        <div className={`flex flex-col bg-[#0B1A12]/90 min-w-0 min-h-0 ${panelLayout === 'vertical' ? 'w-full h-[45%] border-t border-white/10' : 'w-[420px] md:w-[480px] lg:w-[540px] xl:w-[600px] shrink-0 h-full border-l border-white/10'}`}>

          
          {/* Output Panel Header Tabs */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-[#0E2117]">
            
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab('console')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'console'
                    ? 'bg-[#B4FF00] text-[#0B1A12] font-bold shadow-[0_0_10px_rgba(180,255,0,0.3)]'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                Console
              </button>

              {isWebHtml && (
                <button
                  onClick={() => setActiveTab('webpreview')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'webpreview'
                      ? 'bg-[#B4FF00] text-[#0B1A12] font-bold shadow-[0_0_10px_rgba(180,255,0,0.3)]'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  Live Preview
                </button>
              )}
            </div>

            {executionResult && (
              <button
                onClick={() => setExecutionResult(null)}
                className="text-[11px] text-white/40 hover:text-white flex items-center gap-1"
                title="Clear Output"
              >
                <Trash2 className="w-3 h-3" />
                Clear Output
              </button>
            )}

          </div>

          {/* TAB CONTENT BODY */}
          <div className="flex-1 flex flex-col p-4 overflow-y-auto font-mono text-xs">
            
            {/* UNIFIED CONSOLE PANEL: STDIN INPUT AT TOP, OUTPUT BELOW */}
            {activeTab === 'console' && (
              <div className="flex-1 flex flex-col space-y-4">
                
                {/* 1. Input-Detection Hint Banner */}
                {isInputExpected && !stdin.trim() && !executionResult && (
                  <div className="flex items-start gap-2 p-2.5 rounded-xl bg-[#B4FF00]/10 border border-[#B4FF00]/30 text-[11px] text-[#B4FF00] font-sans">
                    <HelpCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                      <strong>Input Detected:</strong> Your code contains input-reading calls (e.g. <code>input()</code>, <code>Scanner</code>, or <code>cin</code>). Enter expected input lines below <strong>before</strong> clicking <strong>Run Code</strong>.
                    </span>
                  </div>
                )}

                {/* 2. Top Stdin Input Field (Embedded in Console View) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1.5 font-bold text-[#B4FF00]">
                      <FileText className="w-3.5 h-3.5" />
                      Standard Input (stdin)
                      {isInputExpected && !stdin.trim() && !executionResult && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#B4FF00]/20 text-[#B4FF00] font-semibold border border-[#B4FF00]/30 animate-pulse">
                          Input Needed
                        </span>
                      )}
                      {isInputExpected && (stdin.trim() || executionResult) && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30 flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-400" />
                          Input Provided
                        </span>
                      )}
                    </span>
                    <span className="text-[10px] text-white/40 font-sans">Batch Mode Input</span>
                  </div>

                  <textarea
                    value={stdin}
                    onChange={(e) => setStdin(e.target.value)}
                    placeholder="Enter standard input lines here (e.g., inputs for input(), Scanner, cin)..."
                    rows={2}
                    className={`w-full p-2.5 bg-[#0B1A12] border rounded-xl text-white font-mono text-xs focus:outline-none neo-inset resize-y min-h-[55px] max-h-[130px] transition-all ${
                      isInputExpected && !stdin.trim() && !executionResult
                        ? 'border-[#B4FF00]/70 focus:border-[#B4FF00]'
                        : 'border-white/10 focus:border-[#B4FF00]'
                    }`}
                  />
                </div>

                <div className="border-t border-white/10 my-1" />

                {/* 3. Program Output Stream (Directly Below Stdin Input) */}
                {executionResult ? (
                  <div className="space-y-4">
                    {/* Execution Metrics Header */}
                    <div className="neo-inset p-3.5 rounded-xl border border-white/5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 font-bold text-xs">
                          {executionResult.status === 'success' ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-[#B4FF00]" />
                              <span className="text-[#B4FF00]">Execution Successful</span>
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="w-4 h-4 text-red-400" />
                              <span className="text-red-400">Execution Error</span>
                            </>
                          )}
                        </span>

                        <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-white/70">
                          Exit Code: {executionResult.exitCode ?? 0}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-[11px] text-white/50 pt-1 border-t border-white/5">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#B4FF00]" />
                          {executionResult.wallTimeMs} ms
                        </span>
                        <span className="flex items-center gap-1">
                          <HardDrive className="w-3 h-3 text-cyan-400" />
                          {executionResult.memoryKb} KB
                        </span>
                      </div>
                    </div>

                    {/* Standard Output (stdout) */}
                    {executionResult.stdout && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">Standard Output (stdout)</span>
                        <pre className="output-pre p-3.5 rounded-xl bg-[#0E2117] border border-white/10 text-green-300 font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed neo-inset">
                          {executionResult.stdout}
                        </pre>
                      </div>
                    )}

                    {/* Standard Error (stderr) */}
                    {executionResult.stderr && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-red-400/80">Standard Error (stderr)</span>
                        <pre className="output-pre p-3.5 rounded-xl bg-red-950/20 border border-red-500/30 text-red-300 font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed">
                          {executionResult.stderr}
                        </pre>
                      </div>
                    )}

                    {!executionResult.stdout && !executionResult.stderr && (
                      <div className="p-3.5 rounded-xl bg-[#0E2117] border border-white/10 text-white/40 text-xs italic">
                        (Program executed successfully with empty output stream)
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-6 text-center text-white/30 my-auto border border-dashed border-white/10 rounded-xl">
                    <Terminal className="w-7 h-7 mx-auto mb-2 text-white/20" />
                    <p className="font-semibold text-xs text-white/40">Console Output Ready</p>
                    <p className="text-[11px] text-white/30 mt-1">Output will appear here below standard input after clicking "Run Code"</p>
                  </div>
                )}

              </div>
            )}

            {/* TAB 3: LIVE WEB PREVIEW */}
            {activeTab === 'webpreview' && (
              <div className="flex-1 flex flex-col bg-white rounded-xl overflow-hidden shadow-2xl">
                <div className="bg-gray-800 text-gray-300 px-3 py-1.5 text-[11px] flex items-center justify-between font-sans">
                  <span>Browser Preview Window</span>
                  <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded">Isolated Sandbox</span>
                </div>
                <iframe
                  title="Nexora Web Sandbox"
                  srcDoc={executionResult?.stdout && (executionResult.stdout.includes('<div') || executionResult.stdout.includes('<!DOCTYPE') || executionResult.stdout.includes('<style')) ? executionResult.stdout : code}
                  className="w-full flex-1 border-none bg-white"
                  sandbox="allow-scripts allow-modals"
                />
              </div>
            )}

          </div>

        </div>

      </div>

      {/* CONFIRMATION DIALOG: SWITCH LANGUAGE WITH NON-DEFAULT CODE */}
      {isConfirmLangSwitchOpen && pendingLanguage && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="glass-box max-w-md w-full p-6 relative overflow-hidden shadow-2xl border border-amber-500/40 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-lg border border-amber-500/30 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">Switch Language?</h3>
                <p className="text-xs text-white/70 mt-0.5 font-sans">
                  Switching languages will clear your current code. Continue?
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-sans leading-relaxed">
              Target runtime: <strong className="text-white">{pendingLanguage.name} (v{pendingLanguage.version})</strong>. Loading default sample snippet for {pendingLanguage.name}.
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={cancelLanguageSwitch}
                className="neo-inset px-4 py-2 rounded-xl text-xs font-semibold text-white/70 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const switchedLang = confirmLanguageSwitch();
                  if (switchedLang) {
                    setSearchParams({ lang: switchedLang.id });
                  }
                }}
                className="neo-button px-4 py-2 rounded-xl text-xs font-extrabold bg-amber-500 hover:bg-amber-400 text-black transition-all shadow-[0_0_15px_rgba(245,158,11,0.4)]"
              >
                Continue (Clear & Switch)
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

