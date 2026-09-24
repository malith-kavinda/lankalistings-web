"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ApiError } from "@/lib/api/client";
import { createDraft } from "@/lib/api/drafts";
import { Stepper } from "@/components/wizard/Stepper";

/**
 * Stage 1 — choose a category.
 *
 * <p>The nine top-level categories are locked by the platform data model, and only Vehicles is
 * subdivided. They are listed here rather than fetched because the list is fixed, the page is the
 * first thing a seller sees, and a spinner in front of a static list is a worse first impression
 * than a request saved.
 */
const CATEGORIES: { slug: string; label: string; hint: string }[] = [
  { slug: "vehicles/cars", label: "Cars", hint: "Saloons, hatchbacks, SUVs, vans" },
  { slug: "vehicles/motorcycles", label: "Motorcycles", hint: "Bikes, scooters, electric" },
  { slug: "vehicles/three_wheelers", label: "Three Wheelers", hint: "Tuk-tuks and permits" },
  { slug: "vehicles/vans_buses_lorries", label: "Vans, Buses & Lorries", hint: "Commercial vehicles" },
  { slug: "property", label: "Property", hint: "Houses, apartments, commercial" },
  { slug: "land", label: "Land", hint: "Residential, agricultural, commercial" },
  { slug: "jobs", label: "Jobs", hint: "Vacancies and opportunities" },
  { slug: "electronics", label: "Electronics", hint: "Phones, laptops, cameras" },
  { slug: "services", label: "Services", hint: "Repairs, tuition, trades" },
  { slug: "home_garden", label: "Home & Garden", hint: "Furniture, appliances, plants" },
  { slug: "fashion", label: "Fashion", hint: "Clothing, footwear, watches" },
  { slug: "other", label: "Other", hint: "Anything that does not fit above" },
];

export default function ChooseCategoryPage() {
  const router = useRouter();
  const [chosen, setChosen] = useState<string | null>(null);

  // One key for the life of this page, so a double-tap or a retry after a timeout returns the
  // draft that was already created rather than making a second one.
  const idempotencyKey = useMemo(() => crypto.randomUUID(), []);

  const start = useMutation({
    mutationFn: (category: string) => createDraft(category, idempotencyKey),
    onSuccess: (draft) => router.push(`/sell/${draft.reference}/details`),
  });

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Stepper current="category" reached="category" />

      <h1 className="text-2xl font-semibold text-slate-900">What are you selling?</h1>
      <p className="mt-2 text-sm text-slate-600">
        Pick the closest match. The questions on the next screens depend on it, and you can change
        it while the advertisement is still a draft.
      </p>

      {start.error instanceof ApiError && (
        <p role="alert" className="mt-4 text-sm text-red-700">
          {start.error.message}
          {start.error.correlationId && (
            <span className="ml-1 text-slate-500">Reference: {start.error.correlationId}</span>
          )}
        </p>
      )}

      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {CATEGORIES.map((category) => (
          <li key={category.slug}>
            <button
              type="button"
              disabled={start.isPending}
              onClick={() => {
                setChosen(category.slug);
                start.mutate(category.slug);
              }}
              className={[
                "w-full rounded-lg border p-4 text-left transition",
                "hover:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900",
                "disabled:cursor-not-allowed disabled:opacity-60",
                chosen === category.slug ? "border-slate-900 bg-slate-50" : "border-slate-200",
              ].join(" ")}
            >
              <span className="block font-medium text-slate-900">{category.label}</span>
              <span className="mt-1 block text-sm text-slate-500">{category.hint}</span>
              {chosen === category.slug && start.isPending && (
                <span className="mt-2 block text-xs text-slate-500">Starting\u2026</span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
