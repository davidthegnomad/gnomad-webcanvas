import { useEffect, useRef } from 'react';
import { useEditorStore } from '../store/editorStore';
import { CDN_REGISTRY } from '../utils/cdnRegistry';
import { decodeProjectFromHash } from '../utils/shareUrl';
import { migrateLegacyStorage, loadProjectsIndex, loadProjectData } from '../utils/projectManager';

export function useProjectHydration(): void {
  const initializeStore = useEditorStore((s) => s.initializeStore);
  const setCurrentProject = useEditorStore((s) => s.setCurrentProject);
  const updateProjectsMeta = useEditorStore((s) => s.updateProjectsMeta);
  const hydrated = useRef(false);

  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;

    const hash = window.location.hash;
    if (hash && hash.length > 1) {
      const decoded = decodeProjectFromHash(hash);
      if (decoded) {
        const libs = decoded.libs
          ? CDN_REGISTRY.filter((l) => decoded.libs!.includes(l.id))
          : [];
        initializeStore({
          htmlCode: decoded.html,
          cssCode: decoded.css,
          jsCode: decoded.js,
          activeLibraries: libs,
          fontPairingId: decoded.fp ?? null,
          customHeadingFont: decoded.hf ?? null,
          customBodyFont: decoded.bf ?? null,
        });
        return;
      }
    }

    const migration = migrateLegacyStorage();
    if (migration) {
      updateProjectsMeta(migration.projects);
      setCurrentProject(migration.defaultId);
      if (migration.data) {
        initializeStore({
          htmlCode: migration.data.htmlCode,
          cssCode: migration.data.cssCode,
          jsCode: migration.data.jsCode,
          activeLibraries: migration.data.activeLibraries as ReturnType<
            typeof useEditorStore.getState
          >['activeLibraries'],
        });
      }
      return;
    }

    const projectsIndex = loadProjectsIndex();
    if (projectsIndex.length > 0) {
      updateProjectsMeta(projectsIndex);
      const firstId = projectsIndex[0].id;
      setCurrentProject(firstId);
      const data = loadProjectData(firstId);
      if (data) {
        initializeStore({
          htmlCode: data.htmlCode,
          cssCode: data.cssCode,
          jsCode: data.jsCode,
          activeLibraries: data.activeLibraries as ReturnType<
            typeof useEditorStore.getState
          >['activeLibraries'],
          fontPairingId: data.fontPairingId ?? null,
          customHeadingFont: data.customHeadingFont ?? null,
          customBodyFont: data.customBodyFont ?? null,
        });
      }
    }
  }, [initializeStore, setCurrentProject, updateProjectsMeta]);
}
