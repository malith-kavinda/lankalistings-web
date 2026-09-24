/**
 * One place that talks to the platform.
 *
 * Its job is mostly one thing: turn a failed response into an error the UI can actually show. Every
 * failure arrives as `{ data: null, error: { code, message, details, correlation_id } }`. A client
 * that keeps only the message throws away the two most useful parts — the per-field details, which
 * are what let a form highlight the input that was wrong, and the correlation id, which is the only
 * handle anyone has for finding the request in the server's logs.
 */

import type { ApiEnvelope, ApiErrorBody, ApiErrorDetail } from "./types";

/**
 * Everything goes through the gateway, which owns CORS and coarse role gating. Talking to
 * listing-service directly would work in development and then need every route re-pointed.
 */
export const apiBaseUrl: string =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export class ApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details: ApiErrorDetail[];
  readonly correlationId: string | null;

  constructor(
    message: string,
    options: {
      code: string;
      status: number;
      details?: ApiErrorDetail[];
      correlationId?: string | null;
    },
  ) {
    super(message);
    this.name = "ApiError";
    this.code = options.code;
    this.status = options.status;
    this.details = options.details ?? [];
    this.correlationId = options.correlationId ?? null;
  }

  /** The message for a given field, so a form can render the server's own words beside the input. */
  detailFor(field: string): string | undefined {
    return this.details.find((detail) => detail.field === field)?.message;
  }

  /** Someone else changed this draft. The caller must re-read rather than retry. */
  get isVersionConflict(): boolean {
    return this.code === "VERSION_CONFLICT";
  }

  /** Signed out, or the session expired. The wizard sends the seller to sign in and comes back. */
  get isUnauthenticated(): boolean {
    return this.status === 401;
  }

  /** Worth retrying as-is; a 4xx is not. */
  get isTransient(): boolean {
    return this.status === 0 || this.status >= 500;
  }
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  signal?: AbortSignal;
  /** The draft version last read, sent as `If-Match` so a stale write conflicts rather than wins. */
  ifMatch?: number;
  /** Makes a repeated create return the first result instead of a second draft. */
  idempotencyKey?: string;
  query?: Record<string, string | number | boolean | undefined | null>;
};

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, signal, query, ifMatch, idempotencyKey } = options;

  const url = new URL(`${apiBaseUrl}${path}`);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }

  const headers: Record<string, string> = {};
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (ifMatch !== undefined) {
    headers["If-Match"] = String(ifMatch);
  }
  if (idempotencyKey) {
    headers["Idempotency-Key"] = idempotencyKey;
  }

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      method,
      headers,
      signal,
      // The access token is an HttpOnly cookie, so it is never readable from script — which is the
      // point — and never attached unless credentials are included. Omitting this makes every
      // authenticated request quietly anonymous.
      credentials: "include",
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (cause) {
    // An aborted request is the caller changing their mind, not a failure to report.
    if (cause instanceof DOMException && cause.name === "AbortError") {
      throw cause;
    }
    throw new ApiError(`Cannot reach the server at ${apiBaseUrl}. Is it running?`, {
      code: "NETWORK_UNAVAILABLE",
      status: 0,
    });
  }

  const envelope = await readEnvelope<T>(response);

  if (!response.ok || envelope?.error) {
    const error: ApiErrorBody | null = envelope?.error ?? null;
    throw new ApiError(error?.message ?? `Request failed with status ${response.status}.`, {
      code: error?.code ?? "UNEXPECTED_ERROR",
      status: response.status,
      details: error?.details ?? [],
      correlationId: error?.correlation_id ?? null,
    });
  }

  if (envelope?.data === null || envelope?.data === undefined) {
    throw new ApiError("The server returned an empty response.", {
      code: "EMPTY_RESPONSE",
      status: response.status,
    });
  }

  return envelope.data;
}

async function readEnvelope<T>(response: Response): Promise<ApiEnvelope<T> | null> {
  const text = await response.text();
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text) as ApiEnvelope<T>;
  } catch {
    // A proxy or a crash can answer with HTML. Saying so beats a JSON parse error in the console.
    return {
      data: null,
      error: {
        code: "MALFORMED_RESPONSE",
        message: "The server sent something that was not JSON.",
        details: [],
        correlation_id: response.headers.get("X-Correlation-Id") ?? "",
      },
    };
  }
}
