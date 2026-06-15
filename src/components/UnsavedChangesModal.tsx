interface UnsavedChangesModalProps {
  fileName: string;
  onSave: () => void;
  onDiscard: () => void;
  onCancel: () => void;
}

export default function UnsavedChangesModal({
  fileName,
  onSave,
  onDiscard,
  onCancel,
}: UnsavedChangesModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        className="w-full max-w-md mx-4 ui-bg-panel border ui-border rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border ui-border">
          <h2 className="text-sm font-semibold ui-text">Save changes?</h2>
          <p className="text-xs ui-text-muted mt-1.5 leading-relaxed">
            {fileName} has unsaved changes. Save before closing?
          </p>
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-4">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 text-xs rounded-md ui-bg-elevated ui-text-muted hover:ui-text hover:bg-[var(--ui-border)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onDiscard}
            className="px-3 py-1.5 text-xs rounded-md ui-bg-elevated ui-text-muted hover:text-red-400 hover:bg-[var(--ui-border)] transition-colors"
          >
            Don&apos;t Save
          </button>
          <button
            onClick={onSave}
            className="px-3 py-1.5 text-xs rounded-md bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
