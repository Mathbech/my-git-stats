import { test } from "node:test";
import assert from "node:assert/strict";
import {
  escapeXml,
  formatNumber,
  sanitizeHex,
  parseBool,
} from "../src/utils.js";

test("escapeXml échappe les caractères spéciaux", () => {
  assert.equal(
    escapeXml(`<a href="x">& '`),
    "&lt;a href=&quot;x&quot;&gt;&amp; &apos;",
  );
  assert.equal(escapeXml(), "");
  assert.equal(escapeXml(42), "42");
});

test("formatNumber abrège les grands nombres", () => {
  assert.equal(formatNumber(0), "0");
  assert.equal(formatNumber(999), "999");
  assert.equal(formatNumber(1000), "1k");
  assert.equal(formatNumber(6626), "6.6k");
  assert.equal(formatNumber(1_500_000), "1.5M");
  assert.equal(formatNumber(null), "0");
  assert.equal(formatNumber(undefined), "0");
});

test("sanitizeHex valide et normalise les couleurs", () => {
  assert.equal(sanitizeHex("fff", "000"), "#fff");
  assert.equal(sanitizeHex("#2f80ed", "000"), "#2f80ed");
  assert.equal(sanitizeHex("nope", "abcabc"), "abcabc");
  assert.equal(sanitizeHex("", "fallback"), "fallback");
});

test("parseBool interprète les valeurs de query string", () => {
  assert.equal(parseBool("true"), true);
  assert.equal(parseBool("1"), true);
  assert.equal(parseBool(""), true);
  assert.equal(parseBool("false"), false);
  assert.equal(parseBool(undefined), false);
  assert.equal(parseBool(undefined, true), true);
});
