use serde::Deserialize;
use serde::Serialize;
use tauri::AppHandle;
use tauri_plugin_updater::UpdaterExt;
use url::Url;

const GITHUB_RELEASES_API: &str =
    "https://api.github.com/repos/davidthegnomad/gnomad-webcanvas/releases?per_page=20";
const GH_PAGES_ENDPOINT: &str =
    "https://davidthegnomad.github.io/gnomad-webcanvas/updater/latest.json";
const LEGACY_LATEST_ENDPOINT: &str =
    "https://github.com/davidthegnomad/gnomad-webcanvas/releases/latest/download/latest.json";

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

struct EndpointResolution {
    endpoints: Vec<Url>,
    warning: Option<String>,
}

async fn latest_beta_manifest_url() -> Result<Url, String> {
    let client = reqwest::Client::builder()
        .user_agent("gnomad-webcanvas-updater")
        .build()
        .map_err(|e| format!("HTTP client error: {e}"))?;

    let releases: Vec<GhRelease> = client
        .get(GITHUB_RELEASES_API)
        .send()
        .await
        .map_err(|e| format!("Could not reach GitHub releases API: {e}"))?
        .json()
        .await
        .map_err(|e| format!("Invalid GitHub releases response: {e}"))?;

    let tag = releases
        .into_iter()
        .filter(|r| r.prerelease && !r.draft)
        .filter_map(|r| r.published_at.map(|date| (date, r.tag_name)))
        .max_by(|a, b| a.0.cmp(&b.0))
        .map(|(_, tag)| tag)
        .ok_or_else(|| "No published beta release found on GitHub.".to_string())?;

    let raw = format!(
        "https://github.com/davidthegnomad/gnomad-webcanvas/releases/download/{tag}/latest.json"
    );
    Url::parse(&raw).map_err(|e| format!("Invalid updater endpoint: {e}"))
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

    // beta.4 builds shipped with this URL; keep as last fallback.
    if let Ok(url) = Url::parse(LEGACY_LATEST_ENDPOINT) {
        endpoints.push(url);
    }

    if endpoints.is_empty() {
        return Err("No updater endpoints configured.".to_string());
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
pub async fn install_update(app: AppHandle, channel: Option<String>) -> Result<(), String> {
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

    update
        .download_and_install(
            |chunk, total| {
                let _ = (chunk, total);
            },
            || {},
        )
        .await
        .map_err(|e| format!("Update install failed: {e}"))?;

    app.restart();
    #[allow(unreachable_code)]
    Ok(())
}
