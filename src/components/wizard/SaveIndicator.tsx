import type { SaveState } from "@/lib/hooks/useDraft";

/**
 * What the autosave is doing.
 *
 * <p>A seller who cannot see that their work is saved will either re-type it or abandon the form.
 * A conflict says what to do rather than only that something went wrong, and an error shows the
 * correlation id — it is the only handle support has for finding the request afterwards.
 */
export function SaveIndicator({ state, onReload }: { state: SaveState; onReload: () => void }) {
  if (state.status === "idle") {
    return null;
  }

  if (state.status === "conflict") {
    return (
      <p role="status" className="text-sm text-amber-700">
        This advertisement was changed somewhere else.{" "}
        <button type="button" onClick={onReload} className="font-semibold underline">
          Reload it
        </button>{" "}
        to carry on — your last change was not saved.
      </p>
    );
  }

  if (state.status === "error") {
    return (
      <p role="alert" className="text-sm text-red-700">
        {state.message}
        {state.correlationId && (
          <span className="ml-1 text-slate-500">Reference: {state.correlationId}</span>
        )}
      </p>
    );
  }

  return (
    <p role="status" aria-live="polite" className="text-sm text-slate-500">
      {state.status === "saving" ? "Saving\u2026" : "Saved"}
    </p>
  );
}
