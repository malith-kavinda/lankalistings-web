import type { WizardStage } from "@/lib/api/types";

/** The canonical six stages, in the order the seller meets them. */
export const STAGES: { id: WizardStage; label: string }[] = [
  { id: "category", label: "Category" },
  { id: "details", label: "Details" },
  { id: "questions", label: "Questions" },
  { id: "photos", label: "Photos" },
  { id: "description", label: "Description" },
  { id: "submit", label: "Submit" },
];

/**
 * Where the seller is, and how much is left.
 *
 * <p>Reached stages are shown as complete rather than merely visited, because the flow records the
 * furthest stage reached: stepping back to fix a typo should not make four stages look undone.
 */
export function Stepper({ current, reached }: { current: WizardStage; reached: WizardStage }) {
  const currentIndex = STAGES.findIndex((stage) => stage.id === current);
  const reachedIndex = STAGES.findIndex((stage) => stage.id === reached);

  return (
    <nav aria-label="Progress" className="mb-8">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-3">
        {STAGES.map((stage, index) => {
          const done = index < reachedIndex;
          const active = index === currentIndex;
          return (
            <li key={stage.id} className="flex items-center gap-2">
              <span
                aria-current={active ? "step" : undefined}
                className={[
                  "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold",
                  active
                    ? "bg-slate-900 text-white"
                    : done
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-200 text-slate-600",
                ].join(" ")}
              >
                {done ? "\u2713" : index + 1}
              </span>
              <span
                className={[
                  "text-sm",
                  active ? "font-semibold text-slate-900" : "text-slate-500",
                ].join(" ")}
              >
                {stage.label}
              </span>
              {index < STAGES.length - 1 && (
                <span aria-hidden className="mx-1 hidden h-px w-6 bg-slate-300 sm:block" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
