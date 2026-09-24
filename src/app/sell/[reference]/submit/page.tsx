"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ApiError } from "@/lib/api/client";
import { categoryAttributes, submitDraft } from "@/lib/api/drafts";
import { queryKeys } from "@/lib/api/queryKeys";
import type { SubmitResult } from "@/lib/api/types";
import { Stepper } from "@/components/wizard/Stepper";
import { useDraft } from "@/lib/hooks/useDraft";

/** Wire keys are not labels. Falls back to the key so an unmapped field is still identifiable. */
function labelFor(key: string, labels: Map<string, string>): string {
  const core: Record<string, string> = {
    title: "Title",
    description: "Description",
    price_lkr_cents: "Price",
  };
  return core[key] ?? labels.get(key) ?? key;
}

/**
 * Stage 6 — review and submit.
 *
 * <p>The outstanding list comes from the server rather than being derived here. A requirement can
 * depend on another answer, so a client that worked it out independently would sooner or later
 * disagree with the service about whether the draft can be submitted — and the seller would meet a
 * refusal the page had just told them would not happen.
 */
export default function SubmitPage() {
  const { reference } = useParams<{ reference: string }>();
  const router = useRouter();
  const { draft, isLoading, reload } = useDraft(reference);
  const [result, setResult] = useState<SubmitResult | null>(null);

  const schema = useQuery({
    queryKey: queryKeys.categoryAttributes(draft?.category ?? ""),
    queryFn: ({ signal }) => categoryAttributes(draft!.category, signal),
    enabled: Boolean(draft?.category),
  });

  const submit = useMutation({
    mutationFn: () => submitDraft(reference, draft!.version),
    onSuccess: (outcome) => {
      setResult(outcome);
      if (outcome.missing_required.length === 0) {
        void reload();
      }
    },
  });

  if (isLoading || !draft) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-sm text-slate-500">Loading your draft&hellip;</p>
      </main>
    );
  }

  const labels = new Map((schema.data?.fields ?? []).map((field) => [field.key, field.label]));
  const outstanding = result?.missing_required ?? draft.missing_required;
  const submitted = draft.status !== "draft";

  if (submitted) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <Stepper current="submit" reached="submit" />
        <h1 className="text-2xl font-semibold text-slate-900">Sent for review</h1>
        <p className="mt-3 text-sm text-slate-600">
          Your advertisement <strong>{draft.reference}</strong> is with our moderators. You will be
          notified once it is published. Quote the reference if you need to ask about it.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Stepper current="submit" reached={draft.resolved_stage} />

      <h1 className="text-2xl font-semibold text-slate-900">Ready to publish?</h1>

      <dl className="mt-6 divide-y divide-slate-200 rounded-lg border border-slate-200">
        <div className="flex justify-between gap-4 px-4 py-3">
          <dt className="text-sm text-slate-500">Title</dt>
          <dd className="text-sm font-medium text-slate-900">{draft.title ?? "—"}</dd>
        </div>
        <div className="flex justify-between gap-4 px-4 py-3">
          <dt className="text-sm text-slate-500">Price</dt>
          <dd className="text-sm font-medium text-slate-900">
            {draft.price_lkr_cents === null
              ? "—"
              : `Rs. ${(draft.price_lkr_cents / 100).toLocaleString("en-LK")}`}
            {draft.negotiable && (
              <span className="ml-2 text-xs font-normal text-slate-500">Open to offers</span>
            )}
          </dd>
        </div>
        <div className="flex justify-between gap-4 px-4 py-3">
          <dt className="text-sm text-slate-500">Category</dt>
          <dd className="text-sm font-medium text-slate-900">{draft.category}</dd>
        </div>
        <div className="flex justify-between gap-4 px-4 py-3">
          <dt className="text-sm text-slate-500">Details answered</dt>
          <dd className="text-sm font-medium text-slate-900">
            {Object.keys(draft.answers).length}
          </dd>
        </div>
      </dl>

      {outstanding.length > 0 && (
        <div role="alert" className="mt-6 rounded-lg border border-amber-300 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-900">
            {outstanding.length === 1
              ? "One thing is still needed:"
              : `${outstanding.length} things are still needed:`}
          </p>
          <ul className="mt-2 list-inside list-disc text-sm text-amber-800">
            {outstanding.map((key) => (
              <li key={key}>{labelFor(key, labels)}</li>
            ))}
          </ul>
        </div>
      )}

      {submit.error instanceof ApiError && (
        <p role="alert" className="mt-4 text-sm text-red-700">
          {submit.error.isVersionConflict
            ? "This advertisement changed somewhere else. Reload before submitting."
            : submit.error.message}
          {submit.error.correlationId && (
            <span className="ml-1 text-slate-500">Reference: {submit.error.correlationId}</span>
          )}
        </p>
      )}

      <div className="mt-8 flex justify-between gap-3">
        <button
          type="button"
          onClick={() => router.push(`/sell/${reference}/details`)}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-900"
        >
          Back to details
        </button>
        <button
          type="button"
          disabled={submit.isPending}
          onClick={() => submit.mutate()}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
        >
          {submit.isPending ? "Submitting…" : "Submit for review"}
        </button>
      </div>
    </main>
  );
}
