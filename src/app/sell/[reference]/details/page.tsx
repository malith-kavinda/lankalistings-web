"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { categoryAttributes } from "@/lib/api/drafts";
import { queryKeys } from "@/lib/api/queryKeys";
import type { DraftDetails } from "@/lib/api/types";
import { SaveIndicator } from "@/components/wizard/SaveIndicator";
import { Stepper } from "@/components/wizard/Stepper";
import { useAutosave, useDraft } from "@/lib/hooks/useDraft";

/** Rupees in the input, integer cents on the wire (D-21). Never a float, never a formatted string. */
function toCents(rupees: string): number | null {
  const trimmed = rupees.replace(/[^\d.]/g, "");
  if (!trimmed) {
    return null;
  }
  return Math.round(Number(trimmed) * 100);
}

function fromCents(cents: number | null | undefined): string {
  return cents === null || cents === undefined ? "" : String(cents / 100);
}

/**
 * Stage 2 — the fields every advertisement has.
 *
 * <p>Title, description and price are columns rather than schema answers, so they are saved through
 * the details route. The category's own questions arrive from the schema and are asked on the next
 * screen, which is where the decision service gets involved.
 */
export default function DetailsPage() {
  const { reference } = useParams<{ reference: string }>();
  const router = useRouter();
  const { draft, isLoading, saveState, saveDetails, reachStage, reload } = useDraft(reference);

  const [form, setForm] = useState<DraftDetails>({});
  const [hydrated, setHydrated] = useState(false);

  // Filled once from the server, then left alone. Re-syncing on every draft change would overwrite
  // what the seller is typing each time an autosave came back — the field would jump back to the
  // saved value mid-sentence.
  useEffect(() => {
    if (draft && !hydrated) {
      setForm({
        title: draft.title ?? "",
        description: draft.description ?? "",
        price_lkr_cents: draft.price_lkr_cents,
        negotiable: draft.negotiable,
        condition: draft.condition,
        city_id: draft.city_id,
      });
      setHydrated(true);
    }
  }, [draft, hydrated]);

  useAutosave(form, (values) => saveDetails(values), hydrated && Boolean(draft));

  const schema = useQuery({
    queryKey: queryKeys.categoryAttributes(draft?.category ?? ""),
    queryFn: ({ signal }) => categoryAttributes(draft!.category, signal),
    enabled: Boolean(draft?.category),
  });

  if (isLoading || !draft) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-sm text-slate-500">Loading your draft…</p>
      </main>
    );
  }

  const update = (patch: Partial<DraftDetails>) => setForm((current) => ({ ...current, ...patch }));

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Stepper current="details" reached={draft.resolved_stage} />

      <div className="flex items-baseline justify-between gap-4">
        <h1 className="text-2xl font-semibold text-slate-900">Tell us the basics</h1>
        <span className="text-xs text-slate-400">{draft.reference}</span>
      </div>
      <p className="mt-2 text-sm text-slate-600">
        Saved as you type. You can leave and come back &mdash; this draft will be waiting.
      </p>

      <div className="mt-6 space-y-5">
        <label className="block">
          <span className="text-sm font-medium text-slate-900">Title</span>
          <input
            type="text"
            maxLength={70}
            value={form.title ?? ""}
            onChange={(event) => update({ title: event.target.value })}
            placeholder="Toyota Aqua 2016"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
          <span className="mt-1 block text-xs text-slate-500">
            {(form.title ?? "").length}/70
          </span>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-900">Description</span>
          <textarea
            rows={6}
            maxLength={4000}
            value={form.description ?? ""}
            onChange={(event) => update({ description: event.target.value })}
            placeholder="Describe the condition, history and anything a buyer would ask about."
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </label>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-slate-900">Price (Rs.)</span>
            <input
              type="text"
              inputMode="decimal"
              value={fromCents(form.price_lkr_cents)}
              onChange={(event) => update({ price_lkr_cents: toCents(event.target.value) })}
              placeholder="8750000"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </label>

          <label className="mt-7 flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.negotiable ?? false}
              onChange={(event) => update({ negotiable: event.target.checked })}
              className="h-4 w-4 rounded border-slate-300"
            />
            <span className="text-sm text-slate-700">I&rsquo;m open to offers</span>
          </label>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between gap-4">
        <SaveIndicator state={saveState} onReload={reload} />

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.push("/sell")}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-900"
          >
            Save as draft
          </button>
          <button
            type="button"
            disabled={!schema.data}
            onClick={async () => {
              // Flush before navigating: the debounce window is exactly where a seller's last
              // keystrokes would otherwise be lost.
              await saveDetails(form);
              await reachStage("photos");
              router.push(`/sell/${reference}/photos`);
            }}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            Continue
          </button>
        </div>
      </div>
    </main>
  );
}
