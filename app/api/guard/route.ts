import { NextResponse } from "next/server";
import { getSql } from "@/lib/db/client";
import { runGuard } from "@/lib/guard/guard";

export async function POST(request: Request) {
  let message: string;
  let hardened: boolean;
  try {
    const body = await request.json();
    message = typeof body.message === "string" ? body.message.trim() : "";
    hardened = Boolean(body.hardened);
  } catch {
    return NextResponse.json({ error: "Cuerpo JSON inválido" }, { status: 400 });
  }

  if (!message) {
    return NextResponse.json({ error: "Escribe un mensaje a analizar" }, { status: 400 });
  }

  const result = runGuard(message, hardened);
  const verdict = result.inputVerdict.verdict;
  const firedRuleIds = result.inputVerdict.firedRules.map((r) => r.id);
  const blocked = verdict === "blocked";

  try {
    const db = getSql();
    await db`INSERT INTO doorman.attempts (payload, verdict, blocked, rules) VALUES (${message}, ${verdict}, ${blocked}, ${firedRuleIds.join(",")})`;

    return NextResponse.json({
      verdict,
      firedRules: firedRuleIds,
      executed: result.executed,
      blockedBy: result.blockedBy,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error guardando el intento" },
      { status: 500 },
    );
  }
}
