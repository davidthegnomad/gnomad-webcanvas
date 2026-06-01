# Privacy — LiveView Notepad

**Version:** 0.1.0 (alpha)  
**Last updated:** June 2026

---

## Summary

LiveView Notepad is **local-first**. Your code stays on your device unless you explicitly export, save to disk, or share a URL. There is no Gnomad-operated backend collecting editor content in v0.1.

---

## What we collect

| Data | Collected by app? | Sent to Gnomad? |
|------|-------------------|-----------------|
| HTML/CSS/JS source | Stored locally | No |
| Project metadata | localStorage (web) | No |
| Open file paths | Desktop memory only | No |
| Usage analytics | Not implemented | No |
| Crash reports | Not implemented | No |

---

## Where data lives

### Web mode

- **localStorage** in your browser — project index and code
- **URL hash** when sharing — encoded in the link you copy
- Clearing browser data removes saved projects

### Desktop mode

- **Files you save** — wherever you choose via Save dialog
- **localStorage** may still persist project index inside the WebView
- No automatic cloud sync

---

## Third-party services

| Service | When used | Data shared |
|---------|-----------|-------------|
| **CDN providers** | User enables libraries (Tailwind, GSAP, etc.) | Browser fetches scripts from cdnjs, jsdelivr, etc. |
| **Google Fonts** | User selects font pairing | Browser fetches font files |
| **Monaco CDN** | Editor loading | Fetches editor assets |
| **GitHub** | Downloading releases | Standard GitHub download logs |

We do not control third-party CDN logging. Disable libraries if offline or privacy-sensitive.

---

## Share links

Share encodes your full project into the URL hash (`#...`):

- Hash is **not sent to servers** on navigation (fragment stays client-side)
- Anyone with the link can decode the project
- Do not share URLs containing secrets or private data

---

## Your choices

| Action | Effect |
|--------|--------|
| Use web mode in private browsing | No persistence between sessions |
| Export ZIP | You control where the file goes |
| Desktop Save | You control file location |
| Clear site data | Removes localStorage projects |

---

## Children

LiveView Notepad is a developer tool, not directed at children under 13.

---

## Changes

Material privacy changes will be noted in [CHANGELOG.md](../CHANGELOG.md).

---

## Contact

Privacy questions: [Gnomad Studio](https://gnomadstudio.org)

---

Built with ❤️ by [Gnomad Studio](https://gnomadstudio.org) 🦙
