use crate::contracts::{
    SkillCatalogEntry, SkillCatalogSearchRequest, SkillCatalogSearchResponse, SkillContentRequest,
    SkillContentResponse,
};
use crate::error::{BackendError, BackendResult};
use serde::Deserialize;
use std::time::Duration;

const INDEX_URL: &str =
    "https://raw.githubusercontent.com/sickn33/antigravity-awesome-skills/main/skills_index.json";
const RAW_ROOT_URL: &str =
    "https://raw.githubusercontent.com/sickn33/antigravity-awesome-skills/main";
const ATTRIBUTION: &str =
    "Source: sickn33/antigravity-awesome-skills. Code MIT; original content CC BY 4.0 unless noted upstream.";

#[derive(Debug, Clone, Deserialize)]
struct RemoteSkillEntry {
    id: String,
    name: String,
    path: String,
    category: Option<String>,
    description: Option<String>,
    risk: Option<String>,
    source: Option<String>,
    date_added: Option<String>,
}

pub async fn search_skills(
    request: SkillCatalogSearchRequest,
) -> BackendResult<SkillCatalogSearchResponse> {
    let entries = fetch_skill_index().await?;
    let query = request.query.unwrap_or_default().to_lowercase();
    let category = request.category.unwrap_or_default().to_lowercase();
    let risk = request.risk.unwrap_or_default().to_lowercase();
    let limit = request.limit.unwrap_or(50).clamp(1, 200);
    let total_loaded = entries.len();

    let mut matches: Vec<SkillCatalogEntry> = entries
        .into_iter()
        .filter(|entry| {
            let description = entry.description.as_deref().unwrap_or("");
            let matches_query = query.is_empty()
                || entry.id.to_lowercase().contains(&query)
                || entry.name.to_lowercase().contains(&query)
                || description.to_lowercase().contains(&query);
            let matches_category = category.is_empty()
                || entry
                    .category
                    .as_deref()
                    .unwrap_or("")
                    .to_lowercase()
                    .contains(&category);
            let matches_risk = risk.is_empty()
                || entry
                    .risk
                    .as_deref()
                    .unwrap_or("")
                    .to_lowercase()
                    .contains(&risk);

            matches_query && matches_category && matches_risk
        })
        .map(|entry| SkillCatalogEntry {
            id: entry.id,
            name: entry.name,
            path: entry.path,
            category: entry.category,
            description: entry.description.unwrap_or_default(),
            risk: entry.risk,
            source: entry.source,
            date_added: entry.date_added,
        })
        .collect();

    matches.sort_by(|left, right| left.id.cmp(&right.id));
    matches.truncate(limit);

    Ok(SkillCatalogSearchResponse {
        source_url: INDEX_URL.into(),
        attribution: ATTRIBUTION.into(),
        entries: matches,
        total_loaded,
    })
}

pub async fn fetch_skill_content(
    request: SkillContentRequest,
) -> BackendResult<SkillContentResponse> {
    let normalized_path = normalize_skill_path(&request.path)?;
    let source_url = format!("{RAW_ROOT_URL}/{normalized_path}/SKILL.md");
    let content = http_client()
        .get(&source_url)
        .send()
        .await
        .map_err(|err| BackendError::Network(err.to_string()))?
        .error_for_status()
        .map_err(|err| BackendError::Network(err.to_string()))?
        .text()
        .await
        .map_err(|err| BackendError::Network(err.to_string()))?;

    Ok(SkillContentResponse {
        path: normalized_path,
        source_url,
        content,
    })
}

async fn fetch_skill_index() -> BackendResult<Vec<RemoteSkillEntry>> {
    http_client()
        .get(INDEX_URL)
        .send()
        .await
        .map_err(|err| BackendError::Network(err.to_string()))?
        .error_for_status()
        .map_err(|err| BackendError::Network(err.to_string()))?
        .json::<Vec<RemoteSkillEntry>>()
        .await
        .map_err(|err| BackendError::Network(err.to_string()))
}

fn normalize_skill_path(path: &str) -> BackendResult<String> {
    let normalized = path.trim().replace('\\', "/");

    if normalized.is_empty()
        || normalized.contains("..")
        || normalized.starts_with('/')
        || !normalized.starts_with("skills/")
    {
        return Err(BackendError::InvalidRequest(
            "Skill path must stay inside the remote skills directory.".into(),
        ));
    }

    Ok(normalized)
}

fn http_client() -> reqwest::Client {
    reqwest::Client::builder()
        .timeout(Duration::from_secs(12))
        .user_agent("LyaCodex-II Skill Catalog")
        .build()
        .expect("valid reqwest client")
}

#[cfg(test)]
mod tests {
    use super::normalize_skill_path;

    #[test]
    fn accepts_skill_path() {
        assert_eq!(
            normalize_skill_path("skills/brainstorming").unwrap(),
            "skills/brainstorming"
        );
    }

    #[test]
    fn rejects_escaped_path() {
        assert!(normalize_skill_path("../secrets").is_err());
        assert!(normalize_skill_path("docs/users").is_err());
    }
}
