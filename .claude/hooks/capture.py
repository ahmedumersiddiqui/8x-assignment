#!/usr/bin/env python3
"""Append the prompt and the final response of every turn to .agent-logs/.

Wired in .claude/settings.json to UserPromptSubmit (arg: prompt) and Stop (arg: response).
Nothing in between is captured: no thinking, no tool calls, no tool results.
"""
import json, os, re, sys, glob
from datetime import datetime, timezone

AUTHOR = "ahmedumersiddiqui"  # github handle
PROJECT = "8x-assignment"
LOGDIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), ".agent-logs")


def now():
    return datetime.now(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z")


def logfile(sid):
    hit = glob.glob(os.path.join(LOGDIR, "*_%s.md" % sid))
    if hit:
        return hit[0]
    stamp = datetime.now(timezone.utc).strftime("%Y-%m-%d_%H-%M-%S")
    return os.path.join(LOGDIR, "%s_%s.md" % (stamp, sid))


def split(path, sid):
    """Return (meta dict, body str) for the session file, creating it in memory if new."""
    if not os.path.exists(path):
        return {"session_id": sid, "date": now()[:10], "author": AUTHOR, "model": "pending",
                "tool": "claude-code", "project": PROJECT, "total_exchanges": "0",
                "first_prompt_time": "", "last_prompt_time": ""}, ""
    raw = open(path, encoding="utf-8").read()
    _, fm, body = raw.split("---\n", 2)
    meta = dict(re.match(r"([^:]+): ?(.*)", l).groups() for l in fm.strip().splitlines())
    return meta, body


def write(path, meta, body):
    fm = "".join("%s: %s\n" % (k, v) for k, v in meta.items())
    head = ("\n# Session Log - %s\n\nSession: `%s` | Project: `%s` | Author: `%s`\n\n---\n"
            % (meta["date"], meta["session_id"][:8], meta["project"], meta["author"]))
    open(path, "w", encoding="utf-8").write("---\n" + fm + "---\n" + (body or head))


def final_response(transcript):
    """Text blocks of the last assistant run, after the last tool call. Plus the model."""
    rows = []
    for line in open(transcript, encoding="utf-8"):
        try:
            d = json.loads(line)
        except ValueError:
            continue
        if not d.get("isSidechain"):
            rows.append(d)
    # everything after the most recent human prompt
    start = max((i for i, d in enumerate(rows)
                 if d.get("type") == "user" and d.get("promptSource")), default=0)
    text, model, uuid = [], "unknown", ""
    for d in rows[start:]:
        if d.get("type") != "assistant":
            continue
        msg = d.get("message") or {}
        model = msg.get("model") or model
        for c in msg.get("content") or []:
            if c.get("type") == "tool_use":
                text = []          # anything before a tool call is not the final answer
            elif c.get("type") == "text" and c.get("text", "").strip():
                text.append(c["text"].strip())
                uuid = d.get("uuid", "")
    return "\n\n".join(text), model, uuid


def main():
    kind = sys.argv[1]
    ev = json.loads(sys.stdin.buffer.read().decode("utf-8", "replace"))
    sid = ev.get("session_id") or "unknown"
    os.makedirs(LOGDIR, exist_ok=True)
    path = logfile(sid)
    meta, body = split(path, sid)
    ts = now()

    if kind == "prompt":
        n = int(meta["total_exchanges"]) + 1
        meta["total_exchanges"] = str(n)
        meta["first_prompt_time"] = meta["first_prompt_time"] or ts
        meta["last_prompt_time"] = ts
        # The IDE extension injects an <ide_opened_file> banner into the prompt field.
        # That is editor telemetry, not something the human typed. Nothing else is touched.
        prompt = re.sub(r"<ide_opened_file>.*?</ide_opened_file>\n?", "",
                        ev.get("prompt", ""), flags=re.S).strip()
        entry = "\n[LOG_ENTRY type=PROMPT num=%d session=%s]\ntimestamp: %s\nmodel: %s\n\n%s\n\n" % (
            n, sid[:8], ts, meta["model"], prompt)
    else:
        tp = ev.get("transcript_path", "")
        if not os.path.exists(tp):
            return
        text, model, uuid = final_response(tp)
        if not text or meta.get("last_response_uuid") == uuid:
            return  # nothing said, or Stop fired twice for the same turn
        meta["last_response_uuid"] = uuid
        if meta["model"] == "pending":
            body = body.replace("model: pending", "model: " + model)
        meta["model"] = model
        entry = "\n[LOG_ENTRY type=RESPONSE num=%s session=%s]\ntimestamp: %s\nmodel: %s\n\n%s\n\n" % (
            meta["total_exchanges"], sid[:8], ts, model, text)

    write(path, meta, body + entry)


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        sys.stderr.write("capture.py: %s\n" % e)  # never block the turn
