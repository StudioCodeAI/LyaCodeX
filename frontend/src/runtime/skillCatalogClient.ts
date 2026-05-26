import { invoke } from '@tauri-apps/api/core';
import {
  SkillCatalogSearchRequest,
  SkillCatalogSearchResponse,
  SkillContentResponse,
} from './types';
import { isTauriRuntime } from './environment';

const INDEX_URL =
  'https://raw.githubusercontent.com/sickn33/antigravity-awesome-skills/main/skills_index.json';
const RAW_ROOT_URL =
  'https://raw.githubusercontent.com/sickn33/antigravity-awesome-skills/main';
const ATTRIBUTION =
  'Source: sickn33/antigravity-awesome-skills. Code MIT; original content CC BY 4.0 unless noted upstream.';

export async function searchSkills(
  request: SkillCatalogSearchRequest,
): Promise<SkillCatalogSearchResponse> {
  if (isTauriRuntime()) {
    return invoke<SkillCatalogSearchResponse>('lyacodex_search_skills', { request });
  }

  const response = await fetch(INDEX_URL);
  if (!response.ok) {
    throw new Error(`Skill index request failed with ${response.status}`);
  }

  const entries = await response.json() as SkillCatalogSearchResponse['entries'];
  const query = (request.query || '').toLowerCase();
  const category = (request.category || '').toLowerCase();
  const risk = (request.risk || '').toLowerCase();
  const limit = Math.min(Math.max(request.limit || 50, 1), 200);

  const filtered = entries
    .filter((entry) => {
      const matchesQuery =
        !query ||
        entry.id.toLowerCase().includes(query) ||
        entry.name.toLowerCase().includes(query) ||
        entry.description.toLowerCase().includes(query);
      const matchesCategory = !category || (entry.category || '').toLowerCase().includes(category);
      const matchesRisk = !risk || (entry.risk || '').toLowerCase().includes(risk);

      return matchesQuery && matchesCategory && matchesRisk;
    })
    .sort((left, right) => left.id.localeCompare(right.id))
    .slice(0, limit);

  return {
    source_url: INDEX_URL,
    attribution: ATTRIBUTION,
    entries: filtered,
    total_loaded: entries.length,
  };
}

export async function fetchSkillContent(path: string): Promise<SkillContentResponse> {
  if (isTauriRuntime()) {
    return invoke<SkillContentResponse>('lyacodex_fetch_skill_content', {
      request: { path },
    });
  }

  const normalizedPath = normalizeSkillPath(path);
  const sourceUrl = `${RAW_ROOT_URL}/${normalizedPath}/SKILL.md`;
  const response = await fetch(sourceUrl);

  if (!response.ok) {
    throw new Error(`Skill content request failed with ${response.status}`);
  }

  return {
    path: normalizedPath,
    source_url: sourceUrl,
    content: await response.text(),
  };
}

function normalizeSkillPath(path: string) {
  const normalized = path.trim().replace(/\\/g, '/');

  if (
    !normalized ||
    normalized.includes('..') ||
    normalized.startsWith('/') ||
    !normalized.startsWith('skills/')
  ) {
    throw new Error('Skill path must stay inside the remote skills directory.');
  }

  return normalized;
}
