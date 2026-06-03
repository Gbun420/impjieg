import test from "node:test";
import assert from "node:assert/strict";
import { sanitizeJobDescription } from "./job-description";

test("sanitizeJobDescription removes dangerous payloads and keeps safe text", () => {
  const cases = [
    {
      input: '<script>alert(1)</script>',
      expected: "",
    },
    {
      input: '<img src=x onerror=alert(1)>',
      expected: "",
    },
    {
      input: '<a href="javascript:alert(1)">click</a>',
      expected: "click",
    },
    {
      input: '<iframe src="https://evil.com"></iframe>',
      expected: "",
    },
    {
      input: "&lt;script&gt;alert(1)&lt;/script&gt;",
      expected: "",
    },
    {
      input: '<svg onload=alert(1)>safe text</svg>',
      expected: "",
    },
    {
      input: "<style>body{display:none}</style>",
      expected: "",
    },
  ];

  for (const testCase of cases) {
    const output = sanitizeJobDescription(testCase.input);
    assert.equal(output, testCase.expected);
    assert.equal(output.includes("<"), false);
    assert.equal(output.includes(">"), false);
    assert.equal(output.includes("javascript:"), false);
    assert.equal(output.includes("onload"), false);
    assert.equal(output.includes("onerror"), false);
  }
});

test("sanitizeJobDescription normalizes text and line breaks", () => {
  const input = "<p>Line 1</p><br><p>Line &amp; 2</p>";

  assert.equal(sanitizeJobDescription(input), "Line 1\nLine & 2");
});
