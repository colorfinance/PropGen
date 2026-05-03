import { NextResponse, type NextRequest } from "next/server";

import { env } from "@/lib/env";
import { logger } from "@/lib/logger";
import { err, ok, type Result } from "@/lib/result";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CronJob =
  | "ingest"
  | "generate"
  | "publish"
  | "metrics"
  | "voice-update";

const REGISTERED_JOBS: ReadonlySet<CronJob> = new Set([
  "ingest",
  "generate",
  "publish",
  "metrics",
  "voice-update",
]);

interface JobOutcome {
  message: string;
  details?: Record<string, unknown>;
}

type JobHandler = () => Promise<Result<JobOutcome, Error>>;

const HANDLERS: Record<CronJob, JobHandler> = {
  ingest: async () => ok({ message: "ingest: not implemented yet" }),
  generate: async () => ok({ message: "generate: not implemented yet" }),
  publish: async () => ok({ message: "publish: not implemented yet" }),
  metrics: async () => ok({ message: "metrics: not implemented yet" }),
  "voice-update": async () =>
    ok({ message: "voice-update: not implemented yet" }),
};

function isCronJob(value: string): value is CronJob {
  return REGISTERED_JOBS.has(value as CronJob);
}

function unauthorized(): NextResponse {
  return NextResponse.json(
    { ok: false, error: "Unauthorized" },
    { status: 401 },
  );
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ job: string }> },
) {
  const auth = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${env.CRON_SECRET}`;
  if (auth !== expected) return unauthorized();

  const { job } = await context.params;
  if (!isCronJob(job)) {
    return NextResponse.json(
      { ok: false, job, error: `Unknown job: ${job}` },
      { status: 404 },
    );
  }

  const startedAt = Date.now();
  const handler = HANDLERS[job];

  try {
    const outcome = await handler();
    const durationMs = Date.now() - startedAt;
    if (outcome.ok) {
      logger.info("cron_job_succeeded", { job, durationMs });
      return NextResponse.json({
        ok: true,
        job,
        duration_ms: durationMs,
        result: outcome.data,
      });
    }
    logger.error("cron_job_failed", { job, durationMs, error: outcome.error.message });
    return NextResponse.json(
      {
        ok: false,
        job,
        duration_ms: durationMs,
        error: outcome.error.message,
      },
      { status: 500 },
    );
  } catch (caught) {
    const durationMs = Date.now() - startedAt;
    const wrapped = caught instanceof Error ? caught : new Error(String(caught));
    logger.error("cron_job_threw", { job, durationMs, error: wrapped.message });
    const failed = err(wrapped);
    return NextResponse.json(
      {
        ok: false,
        job,
        duration_ms: durationMs,
        error: failed.error.message,
      },
      { status: 500 },
    );
  }
}

// Vercel cron uses GET, but POST is allowed too for manual triggering.
export const POST = GET;
