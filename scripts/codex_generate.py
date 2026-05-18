#!/usr/bin/env python3
"""
codex_generate.py - Sends audit reports + prompts to LLM API and writes generated code to stdout.

Supports: OpenAI (gpt-4o), Groq (llama-3.1-70b), Google Gemini (gemini-2.0-flash)

Usage:
  python scripts/codex_generate.py \
    --system "./prompts/system.txt" \
    --user "./prompts/fix_lighthouse.txt" \
    --reports "./reports"

Environment variables (set one):
  OPENAI_API_KEY  - Uses OpenAI gpt-4o
  GROQ_API_KEY    - Uses Groq llama-3.1-70b-versatile (free)
  GEMINI_API_KEY  - Uses Google gemini-2.0-flash (free)
"""

import argparse
import json
import os
import sys
from pathlib import Path


def load_reports(reports_dir: str) -> list[dict]:
    """Load all JSON reports from the reports directory."""
    reports = []
    for f in Path(reports_dir).glob("*.json"):
        with open(f) as fp:
            try:
                data = json.load(fp)
                reports.append({"filename": f.name, "content": data})
            except json.JSONDecodeError:
                reports.append({"filename": f.name, "content": "[binary/non-JSON file]"})
    return reports


def run_openai(system_prompt: str, user_message: str) -> str:
    from openai import OpenAI
    client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message},
        ],
        temperature=0.1,
        max_tokens=4096,
    )
    return response.choices[0].message.content


def run_groq(system_prompt: str, user_message: str) -> str:
    from groq import Groq
    client = Groq(api_key=os.environ["GROQ_API_KEY"])
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message},
        ],
        temperature=0.1,
        max_tokens=4096,
    )
    return response.choices[0].message.content


def run_gemini(system_prompt: str, user_message: str) -> str:
    import google.generativeai as genai
    genai.configure(api_key=os.environ["GEMINI_API_KEY"])
    model = genai.GenerativeModel("gemini-2.0-flash")
    response = model.generate_content(
        f"{system_prompt}\n\n---\n\n{user_message}"
    )
    return response.text


def main():
    parser = argparse.ArgumentParser(description="Generate code fixes via LLM API")
    parser.add_argument("--system", required=True, help="Path to system prompt file")
    parser.add_argument("--user", required=True, help="Path to user prompt file")
    parser.add_argument("--reports", required=True, help="Path to reports directory")
    args = parser.parse_args()

    with open(args.system) as f:
        system_prompt = f.read().strip()
    with open(args.user) as f:
        user_prompt = f.read().strip()

    reports = load_reports(args.reports)

    report_context = "\n\n".join(
        f"--- Report: {r['filename']} ---\n{json.dumps(r['content'], indent=2)[:4000]}"
        for r in reports
    )

    full_user_message = f"{user_prompt}\n\n{report_context}"

    # Auto-detect provider based on available API key
    if os.environ.get("GROQ_API_KEY"):
        print("[codex] Using Groq (llama-3.1-70b) — free tier", file=sys.stderr)
        result = run_groq(system_prompt, full_user_message)
    elif os.environ.get("GEMINI_API_KEY"):
        print("[codex] Using Google Gemini (gemini-2.0-flash) — free tier", file=sys.stderr)
        result = run_gemini(system_prompt, full_user_message)
    elif os.environ.get("OPENAI_API_KEY"):
        print("[codex] Using OpenAI (gpt-4o)", file=sys.stderr)
        result = run_openai(system_prompt, full_user_message)
    else:
        print("Error: No API key found. Set GROQ_API_KEY, GEMINI_API_KEY, or OPENAI_API_KEY", file=sys.stderr)
        sys.exit(1)

    print(result)


if __name__ == "__main__":
    main()
