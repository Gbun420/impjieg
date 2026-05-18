#!/usr/bin/env python3
"""
codex_generate.py - Sends audit reports + prompts to OpenAI API and writes generated code to stdout.

Usage:
  python scripts/codex_generate.py \
    --system "./prompts/system.txt" \
    --user "./prompts/fix_lighthouse.txt" \
    --reports "./reports"
"""

import argparse
import json
import os
import sys
from pathlib import Path

try:
    from openai import OpenAI
except ImportError:
    print("Error: openai package not installed. Run: pip install openai", file=sys.stderr)
    sys.exit(1)


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


def main():
    parser = argparse.ArgumentParser(description="Generate code fixes via OpenAI")
    parser.add_argument("--system", required=True, help="Path to system prompt file")
    parser.add_argument("--user", required=True, help="Path to user prompt file")
    parser.add_argument("--reports", required=True, help="Path to reports directory")
    args = parser.parse_args()

    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        print("Error: OPENAI_API_KEY environment variable not set", file=sys.stderr)
        sys.exit(1)

    with open(args.system) as f:
        system_prompt = f.read().strip()
    with open(args.user) as f:
        user_prompt = f.read().strip()

    reports = load_reports(args.reports)

    # Build the user message with reports context
    report_context = "\n\n".join(
        f"--- Report: {r['filename']} ---\n{json.dumps(r['content'], indent=2)[:4000]}"
        for r in reports
    )

    full_user_message = f"{user_prompt}\n\n{report_context}"

    client = OpenAI(api_key=api_key)
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": full_user_message},
        ],
        temperature=0.1,
        max_tokens=4096,
    )

    print(response.choices[0].message.content)


if __name__ == "__main__":
    main()
