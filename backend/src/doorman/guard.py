"""Layered defense — mirrors lib/guard/guard.ts."""

from __future__ import annotations

import re

RULES = [
    {
        "id": "direct-injection",
        "name": "Inyección directa",
        "family": "injection",
        "pattern": re.compile(
            r"(ignore|ignora|ignorad)\s+(all\s+)?(previous|previas|las)?\s*instructions?"
            r"|instrucciones\s+(anteriores|previas|originales)"
            r"|you are (now|an?)"
            r"|(system|prompt)\s*:",
            re.IGNORECASE,
        ),
    },
    {
        "id": "jailbreak",
        "name": "Jailbreak conocido",
        "family": "jailbreak",
        "pattern": re.compile(r"\bDAN\b|do anything now|modo\s+desarrollador|jailbreak", re.IGNORECASE),
    },
    {
        "id": "tool-abuse",
        "name": "Abuso de herramientas",
        "family": "tool-abuse",
        "pattern": re.compile(
            r"(aprobad?o|aprueba|rechazad?o|rechaza|escala)\s+sin\s+"
            r"|set\s+score"
            r"|puntuaci[oó]n\s*(de\s*)?100"
            r"|escrib(e|ir)\s+(en\s+)?el\s+ATS"
            r"|env[ií]a\s+(un\s+)?(correo|email)"
            r"|borr(a|ar)\s+(todos\s+)?los\s+rechazos",
            re.IGNORECASE,
        ),
    },
    {
        "id": "encoding",
        "name": "Payload codificado / texto oculto",
        "family": "encoding",
        "pattern": re.compile(r"[\u200b-\u200d\ufeff\u2060]|base64|unicode", re.IGNORECASE),
    },
]

IRREVERSIBLE = ("email_candidate", "write_ats")


def classify_document(text: str) -> dict:
    fired = [r for r in RULES if r["pattern"].search(text)]
    if fired:
        return {
            "verdict": "blocked",
            "firedRules": [{"id": r["id"], "name": r["name"], "family": r["family"]} for r in fired],
            "risk": min(3, len(fired)),
        }
    return {"verdict": "safe", "firedRules": [], "risk": 0}


def extract_irreversible_requests(text: str) -> list[str]:
    actions: list[str] = []
    if re.search(r"(env[ií]a|enviar|send)", text, re.IGNORECASE) and re.search(
        r"(correo|email)", text, re.IGNORECASE
    ):
        actions.append("email_candidate")
    if re.search(r"(escrib|write|marcar|mark|aprueb|aprobad|approved)", text, re.IGNORECASE) and re.search(
        r"(ATS|ats|aprueb|aprobad|approved)", text, re.IGNORECASE
    ):
        actions.append("write_ats")
    return list(dict.fromkeys(actions))


def run_guard(document: str, hardened: bool | dict) -> dict:
    """`hardened` is True/False (both layers on/off) or {"rules": bool, "allowlist": bool}."""
    layers = {"rules": hardened, "allowlist": hardened} if isinstance(hardened, bool) else hardened
    input_verdict = classify_document(document) if layers["rules"] else {"verdict": "safe", "firedRules": [], "risk": 0}
    requested = extract_irreversible_requests(document)
    executed: list[str] = []
    blocked_by: list[str] = []
    rejected = layers["rules"] and input_verdict["verdict"] == "blocked"
    if rejected:
        blocked_by.extend(f"input:{r['id']}" for r in input_verdict["firedRules"])
    for action in requested:
        if layers["allowlist"]:
            blocked_by.append(f"tool:{action}")
        elif not rejected:
            executed.append(action)
    return {"inputVerdict": input_verdict, "requested": requested, "executed": executed, "blockedBy": blocked_by}


def run_corpus(attacks: list[dict], benign: list[dict], layers: dict) -> list[dict]:
    """Per document, attacks first: outcome (clean, stopped, escaped), the layer that stopped it and the actions that ran."""
    docs = [(a["payload"], True) for a in attacks] + [(b["text"], False) for b in benign]
    out: list[dict] = []
    for text, hostile in docs:
        r = run_guard(text, layers)
        rejected = layers["rules"] and r["inputVerdict"]["verdict"] == "blocked"
        stopped_by = "rules" if rejected else "allowlist" if any(b.startswith("tool:") for b in r["blockedBy"]) else None
        outcome = "escaped" if r["executed"] else "stopped" if hostile else "clean"
        out.append({"outcome": outcome, "stoppedBy": stopped_by, "executed": r["executed"]})
    return out
