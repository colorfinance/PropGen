import { z } from "zod";

const skipValidation = process.env.SKIP_ENV_VALIDATION === "true";

const serverSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  ANTHROPIC_API_KEY: z.string().min(1),
  OPENAI_API_KEY: z.string().min(1),
  REPLICATE_API_TOKEN: z.string().min(1),
  TELEGRAM_BOT_TOKEN: z.string().min(1),
  X_API_CLIENT_ID: z.string().min(1),
  X_API_CLIENT_SECRET: z.string().min(1),
  INSTAGRAM_APP_ID: z.string().min(1),
  INSTAGRAM_APP_SECRET: z.string().min(1),
  CRON_SECRET: z.string().min(16),
  ADMIN_PASSWORD: z.string().min(8),
});

const publicSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
});

const fullSchema = serverSchema.merge(publicSchema);

type Env = z.infer<typeof fullSchema>;

function loadEnv(): Env {
  if (skipValidation) {
    return process.env as unknown as Env;
  }

  const parsed = fullSchema.safeParse(process.env);
  if (!parsed.success) {
    const flat = parsed.error.flatten().fieldErrors;
    const missing = Object.entries(flat)
      .map(([key, errs]) => `  - ${key}: ${(errs ?? []).join(", ")}`)
      .join("\n");
    throw new Error(
      `Invalid environment variables. Set them in .env.local or your deployment env:\n${missing}\n\n` +
        `If you intentionally want to bypass validation (e.g. CI build without secrets), set SKIP_ENV_VALIDATION=true.`,
    );
  }

  return parsed.data;
}

export const env: Env = loadEnv();
