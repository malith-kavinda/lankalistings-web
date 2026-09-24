"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError } from "../api/client";
import * as api from "../api/drafts";
import { queryKeys } from "../api/queryKeys";
import type { Draft, DraftDetails, WizardStage } from "../api/types";

/** How long after the last keystroke an autosave fires. */
const AUTOSAVE_DELAY_MS = 1200;

export type SaveState =
  | { status: "idle" }
  | { status: "saving" }
  | { status: "saved"; at: number }
  /** A conflict is not a failure to retry; the draft changed elsewhere and must be re-read. */
  | { status: "conflict" }
  | { status: "error"; message: string; correlationId: string | null };

/**
 * A draft, its save state, and the two ways of writing to it.
 *
 * <p>The version is taken from whatever the server last returned rather than from a local counter.
 * Every write answers with the new version, so the client's idea of "current" is always the
 * server's, and a conflict means what it says instead of meaning the two drifted.
 */
export function useDraft(reference: string) {
  const queryClient = useQueryClient();
  const [saveState, setSaveState] = useState<SaveState>({ status: "idle" });

  const query = useQuery({
    queryKey: queryKeys.draft(reference),
    queryFn: ({ signal }) => api.getDraft(reference, signal),
    enabled: Boolean(reference),
  });

  const draft = query.data;

  const onWritten = useCallback(
    (next: Draft) => {
      queryClient.setQueryData(queryKeys.draft(reference), next);
      setSaveState({ status: "saved", at: Date.now() });
    },
    [queryClient, reference],
  );

  const onFailed = useCallback(
    (error: unknown) => {
      if (error instanceof ApiError && error.isVersionConflict) {
        // Re-read rather than retry. Retrying would overwrite whatever the other tab just saved,
        // which is the exact outcome the version precondition exists to prevent.
        setSaveState({ status: "conflict" });
        void queryClient.invalidateQueries({ queryKey: queryKeys.draft(reference) });
        return;
      }
      setSaveState({
        status: "error",
        message: error instanceof Error ? error.message : "Could not save.",
        correlationId: error instanceof ApiError ? error.correlationId : null,
      });
    },
    [queryClient, reference],
  );

  const answers = useMutation({
    mutationFn: (values: Record<string, unknown>) => {
      if (!draft) {
        throw new ApiError("The draft has not loaded yet.", { code: "NOT_READY", status: 0 });
      }
      return api.saveAnswers(reference, values, draft.version);
    },
    onMutate: () => setSaveState({ status: "saving" }),
    onSuccess: (result) => onWritten(result.draft),
    onError: onFailed,
  });

  const details = useMutation({
    mutationFn: (values: DraftDetails) => {
      if (!draft) {
        throw new ApiError("The draft has not loaded yet.", { code: "NOT_READY", status: 0 });
      }
      return api.saveDetails(reference, values, draft.version);
    },
    onMutate: () => setSaveState({ status: "saving" }),
    onSuccess: onWritten,
    onError: onFailed,
  });

  const stage = useMutation({
    mutationFn: (next: WizardStage) => api.reachStage(reference, next),
    onSuccess: onWritten,
    onError: onFailed,
  });

  return {
    draft,
    isLoading: query.isLoading,
    error: query.error,
    saveState,
    /** The rejections from the last answer save, so a form can show them per field. */
    rejected: answers.data?.rejected ?? [],
    noLongerApplicable: answers.data?.no_longer_applicable ?? [],
    saveAnswers: answers.mutateAsync,
    saveDetails: details.mutateAsync,
    reachStage: stage.mutateAsync,
    reload: () => queryClient.invalidateQueries({ queryKey: queryKeys.draft(reference) }),
  };
}

/**
 * Saves after the seller stops typing, and once more on the way out.
 *
 * <p>Debounced rather than per-keystroke, because a save per character is a write per character.
 * The flush on unmount is the part that matters: without it, the half-second between the last
 * keystroke and clicking "Next" is exactly the window in which a seller's work disappears.
 */
export function useAutosave<T>(value: T, save: (value: T) => Promise<unknown>, enabled = true) {
  const latest = useRef(value);
  const pending = useRef(false);
  const saveRef = useRef(save);

  latest.current = value;
  saveRef.current = save;

  useEffect(() => {
    if (!enabled) {
      return;
    }
    pending.current = true;
    const timer = setTimeout(() => {
      pending.current = false;
      void saveRef.current(latest.current);
    }, AUTOSAVE_DELAY_MS);

    return () => clearTimeout(timer);
  }, [value, enabled]);

  useEffect(
    () => () => {
      // Unmount: a pending debounce would otherwise be dropped along with the timer.
      if (pending.current) {
        void saveRef.current(latest.current);
      }
    },
    [],
  );
}
