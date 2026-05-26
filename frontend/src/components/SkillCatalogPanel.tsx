import { FormEvent, useEffect, useState } from 'react';
import { BookOpen, CheckCircle2, Globe, RefreshCw, Search, ShieldAlert, Tag } from 'lucide-react';
import { fetchSkillContent, searchSkills } from '../runtime/skillCatalogClient';
import { SkillCatalogEntry } from '../runtime/types';
import './SkillCatalogPanel.css';

export interface ActiveSkill {
  id: string;
  name: string;
  path: string;
  sourceUrl: string;
  content: string;
}

interface SkillCatalogPanelProps {
  activeSkill?: ActiveSkill;
  onActivateSkill: (skill: ActiveSkill) => void;
  onClearSkill: () => void;
}

type Language = 'pt-BR' | 'en';

// ── Traduções ──────────────────────────────────────────────────────────────
const T = {
  'pt-BR': {
    title: 'Central de Skills',
    subtitle: 'Antigravity Awesome Skills',
    loaded: (n: number) => `${n} skills carregadas do catálogo remoto.`,
    noLoaded: 'Catálogo remoto pronto para busca.',
    refresh: 'Atualizar',
    searchPlaceholder: 'Buscar por nome, categoria ou descrição...',
    search: 'Buscar',
    activeLabel: 'Skill ativa no Runtime',
    remove: 'Remover',
    enable: 'Habilitar',
    enabling: 'Ativando...',
    enabled: 'Ativa',
    uncategorized: 'Sem categoria',
    unknown: 'risco desconhecido',
    community: 'comunidade',
    language: 'Idioma',
    allCategories: 'Todas as categorias',
    categories: {
      dev:       '💻 Desenvolvimento',
      security:  '🔒 Segurança',
      testing:   '🧪 Testes',
      devops:    '⚙️ DevOps / Infra',
      data:      '📊 Dados & IA',
      medicine:  '🏥 Medicina',
      finance:   '💰 Contabilidade / Finanças',
      writing:   '✍️ Redação & Documentação',
      design:    '🎨 Design & UX',
      agent:     '🤖 Agentes & Automação',
      other:     '📦 Outros',
    },
    riskLabels: { safe: '✅ Seguro', ask: '⚠️ Requer aprovação', danger: '🚨 Perigoso' },
    noResults: 'Nenhuma skill encontrada. Tente outro termo ou categoria.',
  },
  'en': {
    title: 'Skill Hub',
    subtitle: 'Antigravity Awesome Skills',
    loaded: (n: number) => `${n} skills loaded from remote catalog.`,
    noLoaded: 'Remote catalog ready for search.',
    refresh: 'Refresh',
    searchPlaceholder: 'Search by name, category or description...',
    search: 'Search',
    activeLabel: 'Active skill in Runtime',
    remove: 'Remove',
    enable: 'Enable',
    enabling: 'Enabling...',
    enabled: 'Active',
    uncategorized: 'Uncategorized',
    unknown: 'unknown risk',
    community: 'community',
    language: 'Language',
    allCategories: 'All categories',
    categories: {
      dev:       '💻 Development',
      security:  '🔒 Security',
      testing:   '🧪 Testing',
      devops:    '⚙️ DevOps / Infra',
      data:      '📊 Data & AI',
      medicine:  '🏥 Medicine',
      finance:   '💰 Accounting / Finance',
      writing:   '✍️ Writing & Docs',
      design:    '🎨 Design & UX',
      agent:     '🤖 Agents & Automation',
      other:     '📦 Other',
    },
    riskLabels: { safe: '✅ Safe', ask: '⚠️ Ask first', danger: '🚨 Danger' },
    noResults: 'No skills found. Try another term or category.',
  },
} as const;

// ── Mapa de categorias por palavras-chave ──────────────────────────────────
type CategoryKey = keyof typeof T['en']['categories'];

const CATEGORY_KEYWORDS: Record<CategoryKey, string[]> = {
  dev:      ['coding', 'code', 'programming', 'development', 'debug', 'refactor', 'git', 'api', 'backend', 'frontend', 'typescript', 'python', 'rust', 'javascript', 'react'],
  security: ['security', 'auth', 'owasp', 'vulnerability', 'exploit', 'pentest', 'secret', 'encrypt', 'token', 'credential'],
  testing:  ['test', 'testing', 'unit', 'e2e', 'integration', 'qa', 'spec', 'mock', 'coverage', 'jest', 'playwright'],
  devops:   ['devops', 'docker', 'kubernetes', 'ci', 'cd', 'pipeline', 'deploy', 'infra', 'server', 'cloud', 'aws', 'azure', 'gcp', 'terraform', 'ansible', 'linux', 'bash', 'shell'],
  data:     ['data', 'database', 'sql', 'nosql', 'analytics', 'ml', 'ai', 'model', 'llm', 'embedding', 'rag', 'pandas', 'spark', 'etl'],
  medicine: ['medicine', 'medical', 'health', 'clinical', 'patient', 'diagnosis', 'drug', 'pharma', 'anatomy', 'nursing'],
  finance:  ['finance', 'accounting', 'tax', 'invoice', 'budget', 'audit', 'fiscal', 'payroll', 'conta', 'imposto'],
  writing:  ['writing', 'documentation', 'docs', 'readme', 'report', 'summary', 'changelog', 'blog', 'copy', 'content'],
  design:   ['design', 'ux', 'ui', 'figma', 'prototype', 'wireframe', 'css', 'tailwind', 'accessibility', 'color'],
  agent:    ['agent', 'automation', 'workflow', 'agentic', 'orchestration', 'tool', 'mcp', 'n8n', 'zapier', 'task'],
  other:    [],
};

function resolveCategory(entry: SkillCatalogEntry): CategoryKey {
  const haystack = [entry.id, entry.name, entry.description, entry.category || '']
    .join(' ')
    .toLowerCase();

  for (const [key, keywords] of Object.entries(CATEGORY_KEYWORDS) as [CategoryKey, string[]][]) {
    if (key === 'other') continue;
    if (keywords.some((kw) => haystack.includes(kw))) return key;
  }
  return 'other';
}

function translateSkillName(entry: SkillCatalogEntry, lang: Language): string {
  if (lang === 'en') return entry.name;

  // Tradução automática dos nomes mais comuns
  const translations: Record<string, string> = {
    'coding': 'Programação',
    'code review': 'Revisão de Código',
    'debugging': 'Depuração',
    'testing': 'Testes',
    'security': 'Segurança',
    'documentation': 'Documentação',
    'refactoring': 'Refatoração',
    'deployment': 'Implantação',
    'git': 'Controle de Versão (Git)',
    'api design': 'Design de API',
    'performance': 'Performance',
    'database': 'Banco de Dados',
    'frontend': 'Frontend',
    'backend': 'Backend',
    'devops': 'DevOps',
    'agent': 'Agente',
    'automation': 'Automação',
    'data analysis': 'Análise de Dados',
    'architecture': 'Arquitetura',
    'planning': 'Planejamento',
  };

  const lower = entry.name.toLowerCase();
  for (const [en, pt] of Object.entries(translations)) {
    if (lower.includes(en)) return entry.name.replace(new RegExp(en, 'gi'), pt);
  }
  return entry.name;
}

function translateDescription(desc: string, lang: Language): string {
  if (lang === 'en' || !desc) return desc;

  const map: Record<string, string> = {
    'code': 'código',
    'Helps': 'Ajuda a',
    'Assists': 'Auxilia em',
    'Generate': 'Gerar',
    'Review': 'Revisar',
    'Debug': 'Depurar',
    'Write': 'Escrever',
    'Create': 'Criar',
    'Build': 'Construir',
    'Analyze': 'Analisar',
    'Fix': 'Corrigir',
    'Improve': 'Melhorar',
    'Explain': 'Explicar',
    'Summarize': 'Resumir',
    'Test': 'Testar',
    'Deploy': 'Implantar',
    'Optimize': 'Otimizar',
  };

  let result = desc;
  for (const [en, pt] of Object.entries(map)) {
    result = result.replace(new RegExp(`\\b${en}\\b`, 'g'), pt);
  }
  return result;
}

// ── Componente principal ───────────────────────────────────────────────────
export function SkillCatalogPanel({ activeSkill, onActivateSkill, onClearSkill }: SkillCatalogPanelProps) {
  const [lang, setLang] = useState<Language>('pt-BR');
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey | ''>('');
  const [allEntries, setAllEntries] = useState<SkillCatalogEntry[]>([]);
  const [totalLoaded, setTotalLoaded] = useState(0);
  const [attribution, setAttribution] = useState('');
  const [loading, setLoading] = useState(false);
  const [activatingId, setActivatingId] = useState<string>();
  const [error, setError] = useState<string>();

  const t = T[lang];

  // Filtro local após carregar tudo
  const filtered = allEntries.filter((entry) => {
    const cat = resolveCategory(entry);
    const matchesCat = !selectedCategory || cat === selectedCategory;
    const q = query.toLowerCase();
    const matchesQuery =
      !q ||
      entry.id.toLowerCase().includes(q) ||
      entry.name.toLowerCase().includes(q) ||
      entry.description.toLowerCase().includes(q) ||
      (entry.category || '').toLowerCase().includes(q);
    return matchesCat && matchesQuery;
  });

  // Contagem por categoria
  const categoryCounts = Object.keys(CATEGORY_KEYWORDS).reduce<Record<string, number>>((acc, key) => {
    acc[key] = allEntries.filter((e) => resolveCategory(e) === key).length;
    return acc;
  }, {});

  async function loadSkills() {
    setLoading(true);
    setError(undefined);
    try {
      const result = await searchSkills({ query: '', limit: 200 });
      setAllEntries(result.entries);
      setTotalLoaded(result.total_loaded);
      setAttribution(result.attribution);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Skill catalog request failed.');
    } finally {
      setLoading(false);
    }
  }

  async function activateSkill(entry: SkillCatalogEntry) {
    setActivatingId(entry.id);
    setError(undefined);
    try {
      const result = await fetchSkillContent(entry.path);
      onActivateSkill({
        id: entry.id,
        name: entry.name,
        path: entry.path,
        sourceUrl: result.source_url,
        content: result.content,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Skill activation failed.');
    } finally {
      setActivatingId(undefined);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  useEffect(() => { loadSkills(); }, []);

  return (
    <section className="skill-catalog-panel">

      {/* ── Header ── */}
      <header className="skill-catalog-header">
        <div>
          <span>{t.title}</span>
          <h2>{t.subtitle}</h2>
          <p>{totalLoaded ? t.loaded(totalLoaded) : t.noLoaded}</p>
        </div>
        <div className="skill-header-actions">
          {/* Seletor de idioma */}
          <div className="lang-selector">
            <Globe size={15} />
            <span>{t.language}:</span>
            <button
              type="button"
              className={lang === 'pt-BR' ? 'active' : ''}
              onClick={() => setLang('pt-BR')}
            >
              🇧🇷 PT
            </button>
            <button
              type="button"
              className={lang === 'en' ? 'active' : ''}
              onClick={() => setLang('en')}
            >
              🇺🇸 EN
            </button>
          </div>
          <button type="button" className="refresh-btn" onClick={loadSkills} disabled={loading}>
            <RefreshCw size={15} />
            {t.refresh}
          </button>
        </div>
      </header>

      {/* ── Barra de busca ── */}
      <form className="skill-search-bar" onSubmit={handleSubmit}>
        <Search size={16} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.searchPlaceholder}
        />
        {query && (
          <button type="button" className="clear-query" onClick={() => setQuery('')}>✕</button>
        )}
      </form>

      {/* ── Filtro de categorias ── */}
      <div className="category-filter">
        <Tag size={14} />
        <button
          type="button"
          className={!selectedCategory ? 'active' : ''}
          onClick={() => setSelectedCategory('')}
        >
          {t.allCategories}
          <span className="cat-count">{allEntries.length}</span>
        </button>
        {(Object.keys(CATEGORY_KEYWORDS) as CategoryKey[]).map((key) => (
          <button
            key={key}
            type="button"
            className={selectedCategory === key ? 'active' : ''}
            onClick={() => setSelectedCategory(selectedCategory === key ? '' : key)}
          >
            {t.categories[key]}
            {categoryCounts[key] > 0 && (
              <span className="cat-count">{categoryCounts[key]}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Skill ativa ── */}
      {activeSkill && (
        <div className="active-skill-banner">
          <CheckCircle2 size={16} />
          <div>
            <span>{t.activeLabel}</span>
            <strong>{translateSkillName({ ...activeSkill, description: '', category: undefined }, lang)}</strong>
          </div>
          <button type="button" onClick={onClearSkill}>{t.remove}</button>
        </div>
      )}

      {/* ── Erro ── */}
      {error && (
        <div className="skill-error" role="alert">
          <ShieldAlert size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* ── Lista de skills ── */}
      <div className="skill-list">
        {loading && (
          <div className="skill-loading">
            <RefreshCw size={20} className="spin" />
            <span>Carregando catálogo...</span>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="skill-empty">{t.noResults}</div>
        )}

        {!loading && filtered.map((entry) => {
          const cat = resolveCategory(entry);
          const risk = entry.risk?.toLowerCase() || '';
          const riskLabel =
            risk === 'safe' ? t.riskLabels.safe :
            risk === 'ask'  ? t.riskLabels.ask  :
            risk === 'danger' ? t.riskLabels.danger : '';

          return (
            <article key={entry.id} className="skill-card">
              <div className="skill-card-main">
                <div className="skill-card-title">
                  <BookOpen size={16} />
                  <h3>{translateSkillName(entry, lang)}</h3>
                  {riskLabel && (
                    <span className={`risk-badge risk-${risk}`}>{riskLabel}</span>
                  )}
                </div>
                <p>{translateDescription(entry.description, lang)}</p>
              </div>
              <div className="skill-card-meta">
                <span className="meta-category">{t.categories[cat] || t.uncategorized}</span>
                <span className="meta-source">{entry.source || t.community}</span>
                {entry.date_added && (
                  <span className="meta-date">{entry.date_added.slice(0, 10)}</span>
                )}
              </div>
              <button
                type="button"
                className={activeSkill?.id === entry.id ? 'btn-active' : 'btn-enable'}
                onClick={() => activateSkill(entry)}
                disabled={activatingId === entry.id}
              >
                {activeSkill?.id === entry.id
                  ? t.enabled
                  : activatingId === entry.id
                    ? t.enabling
                    : t.enable}
              </button>
            </article>
          );
        })}
      </div>

      {attribution && <footer className="skill-attribution">{attribution}</footer>}
    </section>
  );
}

export type { SkillCatalogPanelProps };
