//! Native menu bar — platform-specific implementations.

#[cfg(target_os = "macos")]
mod macos;
#[cfg(target_os = "linux")]
mod linux;
#[cfg(all(not(target_os = "macos"), not(target_os = "linux")))]
mod other;

#[cfg(target_os = "macos")]
pub use macos::build_menu;
#[cfg(target_os = "linux")]
pub use linux::build_menu;
#[cfg(all(not(target_os = "macos"), not(target_os = "linux")))]
pub use other::build_menu;
