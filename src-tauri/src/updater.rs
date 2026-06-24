use serde::Deserialize;
use serde::Serialize;
use std::sync::Mutex;
use std::time::{Duration, Instant};
use tauri::AppHandle;
use tauri_plugin_updater::UpdaterExt;
use url::Url;

const GITHUB_RELEASES_API: &str =
    "https://api.github.com/repos/davidthegnomad/gnomad-webcanvas/releases?per_page=20";
const GH_PAGES_ENDPOINT: &str =
    "https://davidthegnomad.github.io/gnomad-webcanvas/updater/latest.json";
const LEGACY_LATEST_ENDPOINT: &str =
    "https://github.com/davidthegnomad/gnomad-webcanvas/releases/latest/download/latest.json";
const HTTP_TIMEOUT: Duration = Duration::from_secs(30);
const BETA_CACHE_TTL: Duration = Duration::from_secs(300);

#[derive(Debug, Deserialize)]
struct GhRelease {
    tag_name: String,
    prerelease: bool,
    draft: bool,
    published_at: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateCheckResult {
    pub available: bool,
    pub current_version: String,
    pub version: Option<String>,
    pub notes: Option<String>,
    pub date: Option<String>,
    pub channel: String,
    pub warning: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct InstallUpdateResult {
    pub installed: bool,
    pub restart_required: bool,
    pub version: Option<String>,
}

struct EndpointResolution {
    endpoints: Vec<Url>,
    warning: Option<String>,
}

struct BetaUrlCache {
    url: Option<Url>,
    fetched_at: Option<Instant>,
}

static BETA_CACHE: Mutex<BetaUrlCache> = Mutex::new(BetaUrlCache {
    url: None,
    fetched_at: None,
});

fn is_valid_release_tag(tag: &str) -> bool {
    tag.starts_with('v')
        && tag.len() > 1
        && tag[1..]
            .chars()
            .all(|c| c.is_ascii_alphanumeric() || c == '.' || c == '_' || c == '-')
}

fn fetch_github_releases() -> Result<Vec<GhRelease>, String> {
    let response = ureq::get(GITHUB_RELEASES_API)
        .config(
            ureq::config::Config::builder()
                .timeout_global(Some(HTTP_TIMEOUT))
                .build(),
        )
        .header("User-Agent", "gnomad-webcanvas-updater")
        .call()
        .map_err(|e| format!("Could not reach GitHub releases API: {e}"))?;

    if response.status() == 403 {
        return Err("GitHub API rate limit exceeded. Try again later.".to_string());
    }

    response
        .into_json()
        .map_err(|e| format!("Invalid GitHub releases response: {e}"))
}

async fn latest_beta_manifest_url() -> Result<Url, String> {
    if let Ok(cache) = BETA_CACHE.lock() {
        if let (Some(url), Some(fetched_at)) = (&cache.url, cache.fetched_at) {
            if fetched_at.elapsed() < BETA_CACHE_TTL {
                return Ok(url.clone());
            }
        }
    }

    let releases = fetch_github_releases()?;

    let tag = releases
        .into_iter()
        .filter(|r| r.prerelease && !r.draft)
        .filter_map(|r| r.published_at.map(|date| (date, r.tag_name)))
        .max_by(|a, b| a.0.cmp(&b.0))
        .map(|(_, tag)| tag)
        .ok_or_else(|| "No published beta release found on GitHub.".to_string())?;

    if !is_valid_release_tag(&tag) {
        return Err("Invalid release tag from GitHub.".to_string());
    }

    let base = Url::parse("https://github.com/davidthegnomad/gnomad-webcanvas/releases/download/")
        .map_err(|e| format!("Invalid updater base URL: {e}"))?;
    let url = base
        .join(&format!("{tag}/latest.json"))
        .map_err(|e| format!("Invalid updater endpoint: {e}"))?;

    if let Ok(mut cache) = BETA_CACHE.lock() {
        cache.url = Some(url.clone());
        cache.fetched_at = Some(Instant::now());
    }

    Ok(url)
}

async fn updater_endpoints(channel: &str) -> Result<EndpointResolution, String> {
    let mut endpoints = Vec::new();
    let mut warning = None;

    if let Ok(url) = Url::parse(GH_PAGES_ENDPOINT) {
        endpoints.push(url);
    }

    if channel.eq_ignore_ascii_case("beta") {
        match latest_beta_manifest_url().await {
            Ok(url) => endpoints.push(url),
            Err(err) => {
                log::warn!("Beta manifest URL lookup failed: {err}");
                warning = Some(format!(
                    "Beta release feed unavailable ({err}). Using fallback update endpoints."
                ));
            }
        }
    }

    if let Ok(url) = Url::parse(LEGACY_LATEST_ENDPOINT) {
        endpoints.push(url);
    }

    if endpoints.is_empty() {
        return Err("No updater endpoints configured.".to_string());
    }

    for endpoint in &endpoints {
        log::info!("Updater will try endpoint: {endpoint}");
    }

    Ok(EndpointResolution {
        endpoints,
        warning,
    })
}

#[tauri::command]
pub async fn check_for_updates(
    app: AppHandle,
    channel: Option<String>,
) -> Result<UpdateCheckResult, String> {
    let channel = channel.unwrap_or_else(|| "beta".into());
    let current_version = app.package_info().version.to_string();
    let resolution = updater_endpoints(&channel).await?;

    let update = app
        .updater_builder()
        .endpoints(resolution.endpoints)
        .map_err(|e| format!("Updater misconfigured: {e}"))?
        .build()
        .map_err(|e| format!("Updater build failed: {e}"))?
        .check()
        .await
        .map_err(|e| format!("Update check failed: {e}"))?;

    match update {
        Some(info) => Ok(UpdateCheckResult {
            available: true,
            current_version,
            version: Some(info.version.clone()),
            notes: info.body.clone(),
            date: info.date.map(|d| d.to_string()),
            channel,
            warning: resolution.warning,
        }),
        None => Ok(UpdateCheckResult {
            available: false,
            current_version,
            version: None,
            notes: None,
            date: None,
            channel,
            warning: resolution.warning,
        }),
    }
}

#[tauri::command]
pub async fn install_update(
    app: AppHandle,
    channel: Option<String>,
) -> Result<InstallUpdateResult, String> {
    let channel = channel.unwrap_or_else(|| "beta".into());
    let resolution = updater_endpoints(&channel).await?;
    let update = app
        .updater_builder()
        .endpoints(resolution.endpoints)
        .map_err(|e| format!("Updater misconfigured: {e}"))?
        .build()
        .map_err(|e| format!("Updater build failed: {e}"))?
        .check()
        .await
        .map_err(|e| format!("Update check failed: {e}"))?
        .ok_or_else(|| "No update available.".to_string())?;

    let version = update.version.clone();

    // download_and_install verifies minisign signature against plugins.updater.pubkey in tauri.conf.json.
    update
        .download_and_install(
            |chunk, total| {
                let _ = (chunk, total);
            },
            || {},
        )
        .await
        .map_err(|e| format!("Update install failed: {e}"))?;

    Ok(InstallUpdateResult {
        installed: true,
        restart_required: true,
        version: Some(version),
    })
}

#[tauri::command]
pub fn restart_app(app: AppHandle) {
    app.restart();
}
