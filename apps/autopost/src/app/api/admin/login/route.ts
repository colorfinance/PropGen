import { NextResponse, type NextRequest } from "next/server";

import { env } from "@/lib/env";
import {
  ADMIN_COOKIE_MAX_AGE_SECONDS,
  ADMIN_COOKIE_NAME,
  issueAdminToken,
} from "@/lib/admin-auth";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

interface LoginBody {
  password?: unknown;
  next?: unknown;
}

export async function POST(request: NextRequest) {
  let body: LoginBody;
  try {
    body = (await request.json()) as LoginBody;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const password = typeof body.password === "string" ? body.password : "";
  const next =
    typeof body.next === "string" && body.next.startsWith("/")
      ? body.next
      : "/admin";

  if (password !== env.ADMIN_PASSWORD) {
    logger.warn("admin_login_failed", { ip: request.headers.get("x-forwarded-for") });
    return NextResponse.json(
      { ok: false, error: "Incorrect password" },
      { status: 401 },
    );
  }

  const token = await issueAdminToken(env.ADMIN_PASSWORD);
  const response = NextResponse.json({ ok: true, redirect: next });
  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_COOKIE_MAX_AGE_SECONDS,
  });
  logger.info("admin_login_succeeded");
  return response;
}
