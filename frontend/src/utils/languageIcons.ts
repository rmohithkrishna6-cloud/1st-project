// Comprehensive icon directory mapping for all 128 languages in Codeticz
// Prioritizes official Devicon colored vector logos and curated Font Awesome 6 icons

export interface LanguageIconInfo {
  iconClass: string;
  color?: string;
}

export const LANGUAGE_ICONS: Record<string, LanguageIconInfo> = {
  // --- Popular & Core Systems ---
  python: { iconClass: 'devicon-python-plain colored' },
  javascript: { iconClass: 'devicon-javascript-plain colored' },
  typescript: { iconClass: 'devicon-typescript-plain colored' },
  cpp: { iconClass: 'devicon-cplusplus-plain colored' },
  c: { iconClass: 'devicon-c-plain colored' },
  java: { iconClass: 'devicon-java-plain colored' },
  go: { iconClass: 'devicon-go-original-wordmark colored' },
  rust: { iconClass: 'devicon-rust-plain colored' },
  php: { iconClass: 'devicon-php-plain colored' },
  ruby: { iconClass: 'devicon-ruby-plain colored' },
  swift: { iconClass: 'devicon-swift-plain colored' },
  csharp: { iconClass: 'devicon-csharp-plain colored' },
  r: { iconClass: 'devicon-r-plain colored' },
  dart: { iconClass: 'devicon-dart-plain colored' },
  kotlin: { iconClass: 'devicon-kotlin-plain colored' },
  scala: { iconClass: 'devicon-scala-plain colored' },
  groovy: { iconClass: 'devicon-groovy-plain colored' },
  julia: { iconClass: 'devicon-julia-plain colored' },
  elixir: { iconClass: 'devicon-elixir-plain colored' },
  haskell: { iconClass: 'devicon-haskell-plain colored' },
  erlang: { iconClass: 'devicon-erlang-plain colored' },
  clojure: { iconClass: 'devicon-clojure-plain colored' },
  fsharp: { iconClass: 'devicon-fsharp-plain colored' },
  lua: { iconClass: 'devicon-lua-plain colored' },
  perl: { iconClass: 'devicon-perl-plain colored' },
  zig: { iconClass: 'devicon-zig-original colored' },
  nim: { iconClass: 'devicon-nim-plain colored' },
  crystal: { iconClass: 'devicon-crystal-original colored' },
  ocaml: { iconClass: 'devicon-ocaml-plain colored' },
  fortran: { iconClass: 'devicon-fortran-original colored' },
  cobol: { iconClass: 'devicon-cobol-plain colored' },
  prolog: { iconClass: 'devicon-prolog-plain colored' },
  racket: { iconClass: 'devicon-racket-plain colored' },
  objc: { iconClass: 'devicon-objectivec-plain colored' },
  visualbasic: { iconClass: 'devicon-visualbasic-plain colored' },
  bash: { iconClass: 'devicon-bash-plain colored' },
  powershell: { iconClass: 'devicon-powershell-plain colored' },
  awk: { iconClass: 'devicon-awk-plain colored' },
  coffeescript: { iconClass: 'devicon-coffeescript-plain colored' },

  // --- Web & Markup ---
  html: { iconClass: 'devicon-html5-plain colored' },
  css: { iconClass: 'devicon-css3-plain colored' },
  scss: { iconClass: 'devicon-sass-original colored' },
  less: { iconClass: 'devicon-less-plain-wordmark colored' },
  stylus: { iconClass: 'devicon-stylus-original colored' },
  postcss: { iconClass: 'devicon-postcss-plain colored' },
  pug: { iconClass: 'devicon-pug-plain colored' },
  handlebars: { iconClass: 'devicon-handlebars-original colored' },
  ejs: { iconClass: 'fa-solid fa-file-code', color: '#FACC15' },
  svg: { iconClass: 'fa-solid fa-vector-square', color: '#FB923C' },
  markdown: { iconClass: 'devicon-markdown-original colored' },

  // --- Databases & Query Engines ---
  sql: { iconClass: 'fa-solid fa-database', color: '#38BDF8' },
  mysql: { iconClass: 'devicon-mysql-plain colored' },
  postgresql: { iconClass: 'devicon-postgresql-plain colored' },
  mongodb: { iconClass: 'devicon-mongodb-plain colored' },
  redis: { iconClass: 'devicon-redis-plain colored' },
  graphql: { iconClass: 'devicon-graphql-plain colored' },
  cypher: { iconClass: 'fa-solid fa-circle-nodes', color: '#F4F7FB' },
  cql: { iconClass: 'fa-solid fa-table-cells', color: '#A78BFA' },

  // --- Mobile & Cross-Platform ---
  reactnative: { iconClass: 'devicon-react-original colored' },
  flutter: { iconClass: 'devicon-flutter-plain colored' },
  ionic: { iconClass: 'devicon-ionic-original colored' },
  cordova: { iconClass: 'fa-solid fa-cube', color: '#818CF8' },
  nativescript: { iconClass: 'fa-solid fa-tablet-screen-button', color: '#38BDF8' },

  // --- Cloud, Containers & DevOps ---
  dockerfile: { iconClass: 'devicon-docker-plain colored' },
  k8s: { iconClass: 'devicon-kubernetes-plain colored' },
  terraform: { iconClass: 'devicon-terraform-plain colored' },
  ballerina: { iconClass: 'devicon-ballerina-original colored' },
  solidity: { iconClass: 'devicon-solidity-plain colored' },
  rego: { iconClass: 'fa-solid fa-shield', color: '#34D399' },

  // --- Data & Config ---
  json: { iconClass: 'devicon-json-plain colored' },
  xml: { iconClass: 'devicon-xml-plain colored' },
  yaml: { iconClass: 'devicon-yaml-plain colored' },
  toml: { iconClass: 'fa-solid fa-gears', color: '#94A3B8' },
  ini: { iconClass: 'fa-solid fa-sliders', color: '#94A3B8' },
  proto: { iconClass: 'fa-solid fa-network-wired', color: '#60A5FA' },
  csv: { iconClass: 'fa-solid fa-table', color: '#34D399' },
  regex: { iconClass: 'fa-solid fa-asterisk', color: '#F472B6' },

  // --- Scientific & Functional ---
  octave: { iconClass: 'fa-solid fa-square-root-variable', color: '#38BDF8' },
  maxima: { iconClass: 'fa-solid fa-infinity', color: '#60A5FA' },
  chapel: { iconClass: 'fa-solid fa-atom', color: '#34D399' },
  purescript: { iconClass: 'devicon-purescript-original colored' },
  gleam: { iconClass: 'devicon-gleam-plain colored' },
  reason: { iconClass: 'fa-solid fa-atom', color: '#FB923C' },
  idris: { iconClass: 'fa-solid fa-shapes', color: '#F87171' },
  lisp: { iconClass: 'fa-solid fa-code', color: '#FB7185' },
  scheme: { iconClass: 'fa-solid fa-feather-pointed', color: '#F87171' },

  // --- Systems & Legacy ---
  assembly: { iconClass: 'fa-solid fa-microchip', color: '#34D399' },
  nasm64: { iconClass: 'fa-solid fa-microchip', color: '#2DD4BF' },
  arm: { iconClass: 'fa-solid fa-microchip', color: '#60A5FA' },
  d: { iconClass: 'fa-solid fa-code-merge', color: '#F43F5E' },
  pascal: { iconClass: 'fa-solid fa-cube', color: '#60A5FA' },
  freebasic: { iconClass: 'fa-solid fa-terminal', color: '#4ADE80' },
  forth: { iconClass: 'fa-solid fa-layer-group', color: '#FBBF24' },
  tcl: { iconClass: 'fa-solid fa-scroll', color: '#60A5FA' },
  qbasic: { iconClass: 'fa-solid fa-laptop-code', color: '#22D3EE' },
  smalltalk: { iconClass: 'fa-solid fa-comment-dots', color: '#38BDF8' },
  pony: { iconClass: 'fa-solid fa-horse', color: '#C084FC' },
  vlang: { iconClass: 'fa-solid fa-bolt', color: '#38BDF8' },
  hack: { iconClass: 'fa-solid fa-terminal', color: '#60A5FA' },
  factor: { iconClass: 'fa-solid fa-calculator', color: '#FBBF24' },
  ada: { iconClass: 'fa-solid fa-shield-halved', color: '#22D3EE' },

  // --- Educational & Proof Assistants ---
  scratch: { iconClass: 'fa-solid fa-puzzle-piece', color: '#FBBF24' },
  snap: { iconClass: 'fa-solid fa-bolt-lightning', color: '#FACC15' },
  logo: { iconClass: 'fa-solid fa-compass', color: '#34D399' },
  karel: { iconClass: 'fa-solid fa-robot', color: '#22D3EE' },
  blockly: { iconClass: 'fa-solid fa-cubes', color: '#60A5FA' },
  alice: { iconClass: 'fa-solid fa-cube', color: '#C084FC' },
  coq: { iconClass: 'fa-solid fa-graduation-cap', color: '#FB923C' },
  agda: { iconClass: 'fa-solid fa-feather-pointed', color: '#C084FC' },
  lean: { iconClass: 'fa-solid fa-tree', color: '#34D399' },

  // --- Scripting & Utilities ---
  applescript: { iconClass: 'fa-brands fa-apple', color: '#F1F5F9' },
  autohotkey: { iconClass: 'fa-solid fa-keyboard', color: '#22C55E' },
  actionscript: { iconClass: 'fa-solid fa-bolt', color: '#EF4444' },
  diff: { iconClass: 'fa-solid fa-code-compare', color: '#34D399' },
  jq: { iconClass: 'fa-solid fa-filter', color: '#38BDF8' },
  sed: { iconClass: 'fa-solid fa-stream', color: '#FBBF24' },
  cron: { iconClass: 'fa-solid fa-clock', color: '#FF5A1F' },

  // --- Esoteric Languages ---
  brainfuck: { iconClass: 'fa-solid fa-brain', color: '#F472B6' },
  befunge: { iconClass: 'fa-solid fa-border-all', color: '#FBBF24' },
  whitespace: { iconClass: 'fa-regular fa-square', color: '#E2E8F0' },
  malbolge: { iconClass: 'fa-solid fa-fire', color: '#EF4444' },
  intercal: { iconClass: 'fa-solid fa-face-smile-beam', color: '#FACC15' },
  chef: { iconClass: 'fa-solid fa-utensils', color: '#FB923C' },
  piet: { iconClass: 'fa-solid fa-palette', color: '#EC4899' },
  lolcode: { iconClass: 'fa-solid fa-cat', color: '#FBBF24' },
  cow: { iconClass: 'fa-solid fa-cow', color: '#D97706' },
  rockstar: { iconClass: 'fa-solid fa-guitar', color: '#F43F5E' },
  emojicode: { iconClass: 'fa-solid fa-face-smile', color: '#FACC15' },
};

/**
 * Returns distinct icon information for a given language ID
 */
export function getLanguageIcon(id: string, fallback?: string): LanguageIconInfo {
  const normalizedId = id.toLowerCase().trim();
  if (LANGUAGE_ICONS[normalizedId]) {
    return LANGUAGE_ICONS[normalizedId];
  }
  return {
    iconClass: fallback || 'fa-solid fa-code',
    color: '#FF5A1F',
  };
}
