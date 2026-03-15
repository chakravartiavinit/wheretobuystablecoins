import { NextResponse } from "next/server";

const BETA_PASSWORD = process.env.BETA_ACCESS_PASSWORD;

export async function POST(request) {
  const expected =
    typeof BETA_PASSWORD === "string" && BETA_PASSWORD.length > 0
      ? BETA_PASSWORD
      : "beta";

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request" },
      { status: 400 }
    );
  }

  const password = typeof body?.password === "string" ? body.password.trim() : "";
  const valid = password.length > 0 && password === expected;

  if (!valid) {
    return NextResponse.json(
      { success: false, error: "Invalid password" },
      { status: 401 }
    );
  }

  return NextResponse.json({ success: true });
}
