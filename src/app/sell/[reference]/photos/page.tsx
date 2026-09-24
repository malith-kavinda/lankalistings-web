"use client";

import { useParams, useRouter } from "next/navigation";
import { Stepper } from "@/components/wizard/Stepper";
import { useDraft } from "@/lib/hooks/useDraft";

/**
 * Stage 4 — photos.
 *
 * <p>Not implemented, and deliberately not faked. The plan expected photo upload to go to
 * media-service, but media-service has no endpoint for it: it can <em>serve</em> an asset
 * (`GET /media/assets/{id}/{purpose}`), and its POST routes belong to the OCR ingestion pipeline,
 * which takes a photograph of a printed advertisement and extracts a listing from it. That is a
 * different feature from a seller attaching photographs to their own listing.
 *
 * <p>A local-only picker would look like progress and store nothing, so the stage says what it is
 * instead. Nothing blocks the rest of the flow: photos are not a submission requirement in the
 * schema, and the draft can be completed and submitted without passing through here.
 */
export default function PhotosPage() {
  const { reference } = useParams<{ reference: string }>();
  const router = useRouter();
  const { draft, isLoading, reachStage } = useDraft(reference);

  if (isLoading || !draft) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-sm text-slate-500">Loading your draft&hellip;</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Stepper current="photos" reached={draft.resolved_stage} />

      <h1 className="text-2xl font-semibold text-slate-900">Photos</h1>

      <div className="mt-6 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6">
        <p className="text-sm text-slate-700">
          Photo upload is not available yet. The storage service does not have an endpoint for
          seller photographs, so anything picked here could not be saved.
        </p>
        <p className="mt-2 text-sm text-slate-600">
          You can finish and submit this advertisement now, and add photographs once the upload is
          available.
        </p>
      </div>

      <div className="mt-8 flex justify-between gap-3">
        <button
          type="button"
          onClick={() => router.push(`/sell/${reference}/details`)}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-900"
        >
          Back
        </button>
        <button
          type="button"
          onClick={async () => {
            await reachStage("submit");
            router.push(`/sell/${reference}/submit`);
          }}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Continue
        </button>
      </div>
    </main>
  );
}
