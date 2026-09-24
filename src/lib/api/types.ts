/**
 * The wire contract, written down once.
 *
 * Stages and statuses are unions rather than `string`. The difference shows up when someone adds a
 * branch for a state that no longer exists, or forgets one that does: a union makes the compiler
 * say so, and `string` lets it ship.
 */

export type ApiEnvelope<T> = {
  data: T | null;
  error: ApiErrorBody | null;
};

export type ApiErrorBody = {
  code: string;
  message: string;
  details: ApiErrorDetail[];
  /** The only handle for tracing a failed request through the server's logs. Always surface it. */
  correlation_id: string;
};

export type ApiErrorDetail = {
  field: string | null;
  code: string;
  message: string;
};

/** The six stages of the guided flow, in order. */
export type WizardStage =
  | "category"
  | "details"
  | "questions"
  | "photos"
  | "description"
  | "submit";

export type AdStatus = "draft" | "pending" | "active" | "rejected" | "expired" | "sold";

export type InputType =
  | "select"
  | "multi_select"
  | "radio"
  | "checkbox"
  | "text"
  | "textarea"
  | "number"
  | "money"
  | "year"
  | "date"
  | "boolean";

export type Validation = {
  minimum: number | null;
  /** May be the token `current_year_plus_1`, which the server resolves per request. */
  maximum: string | null;
  min_length: number | null;
  max_length: number | null;
  pattern: string | null;
  allowed_values: string[];
};

export type SchemaFieldDto = {
  key: string;
  label: string;
  help_text: string | null;
  input_type: InputType;
  /** Name of a reference dataset; fetch its options rather than expecting them inline. */
  data_source: string | null;
  /** The field whose answer scopes this one's options — a model is scoped by its make. */
  data_source_parent: string | null;
  options: string[] | null;
  required: boolean;
  required_condition: string | null;
  visibility_condition: string | null;
  validation: Validation | null;
  step: number;
  display_order: number;
  filter_mapping: string | null;
  triggers_remoderation: boolean;
};

export type CategoryAttributes = {
  category: string;
  schema_version: number;
  fields: SchemaFieldDto[];
};

export type FieldOption = { value: string; label: string };

export type FieldOptions = {
  field_key: string;
  parent: string | null;
  options: FieldOption[];
};

export type Draft = {
  reference: string;
  status: AdStatus;
  category: string;
  schema_version: number;
  /** Send back as `If-Match` on the next write, or accept last-write-wins. */
  version: number;
  resolved_stage: WizardStage;
  /** The advertisement's own fields, returned so a resumed form is not blank. */
  title: string | null;
  description: string | null;
  price_lkr_cents: number | null;
  negotiable: boolean;
  condition: "brand_new" | "used" | "reconditioned" | null;
  city_id: number | null;
  answers: Record<string, unknown>;
  skipped_field_keys: string[];
  missing_required: string[];
  questions_asked: number;
  question_budget: number;
  last_decision_source: "decision_service" | "fallback" | null;
  updated_at: string;
};

export type AnswerSaveResult = {
  draft: Draft;
  rejected: { field: string; code: string; message: string }[];
  /** Answers this change made irrelevant. Shown, not silently dropped (spec §5.4). */
  no_longer_applicable: string[];
};

export type SubmitResult = {
  draft: Draft;
  missing_required: string[];
};

export type DraftDetails = {
  title?: string | null;
  description?: string | null;
  /** Integer minor units (D-21). Never a formatted string, never a float. */
  price_lkr_cents?: number | null;
  negotiable?: boolean | null;
  condition?: "brand_new" | "used" | "reconditioned" | null;
  city_id?: number | null;
};
