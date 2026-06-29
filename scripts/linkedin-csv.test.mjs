// Run: pnpm test:linkedin-csv  (node --test, TS stripped natively on Node >=22.18)
import test from "node:test";
import assert from "node:assert/strict";
import {
  parseCsv,
  parseLinkedInDate,
  parseLinkedInCsv,
} from "../lib/linkedin-csv.ts";

test("parseLinkedInDate handles LinkedIn formats", () => {
  assert.equal(parseLinkedInDate("Mar 2022"), "2022-03-01");
  assert.equal(parseLinkedInDate("September 2019"), "2019-09-01");
  assert.equal(parseLinkedInDate("Sept. 2019"), "2019-09-01");
  assert.equal(parseLinkedInDate("2016"), "2016-01-01");
  assert.equal(parseLinkedInDate("2019-05-21"), "2019-05-01");
  assert.equal(parseLinkedInDate("5/2019"), "2019-05-01");
  assert.equal(parseLinkedInDate(""), null);
  assert.equal(parseLinkedInDate("Present"), null);
});

test("parseCsv handles quotes, embedded commas/newlines, escaped quotes", () => {
  const input = '"a","b,c","line1\nline2","he said ""hi"""\n';
  assert.deepEqual(parseCsv(input), [["a", "b,c", "line1\nline2", 'he said "hi"']]);
});

test("parseLinkedInCsv parses Positions.csv (reordered cols, current job, multiline)", () => {
  const csv =
    '"Company Name","Title","Description","Started On","Finished On","Location"\n' +
    '"Sonoran Building Systems","Senior Controls Engineer","Lead integrator on N4.\nStandardized naming, mentored techs.","Mar 2022","","Phoenix, AZ"\n' +
    '"Desert Automation Group","Controls Engineer","Metasys service.","Jun 2019","Mar 2022","Tempe, AZ"\n';
  const res = parseLinkedInCsv(csv);
  assert.equal(res.kind, "positions");
  assert.equal(res.entries.length, 2);
  assert.equal(res.skipped, 0);

  const first = res.entries[0];
  assert.equal(first.kind, "work");
  assert.equal(first.title, "Senior Controls Engineer");
  assert.equal(first.organization, "Sonoran Building Systems");
  assert.equal(first.location, "Phoenix, AZ");
  assert.equal(first.start_date, "2022-03-01");
  assert.equal(first.end_date, null);
  assert.equal(first.is_current, true);
  assert.ok(first.description.includes("Standardized naming"));

  const second = res.entries[1];
  assert.equal(second.start_date, "2019-06-01");
  assert.equal(second.end_date, "2022-03-01");
  assert.equal(second.is_current, false);
});

test("parseLinkedInCsv parses Education.csv (year-only)", () => {
  const csv =
    '"School Name","Start Date","End Date","Notes","Degree Name","Activities"\n' +
    '"Arizona State University","2012","2016","","B.S. Mechanical Engineering","Solar car team"\n';
  const res = parseLinkedInCsv(csv);
  assert.equal(res.kind, "education");
  assert.deepEqual(res.entries[0], {
    kind: "education",
    title: "B.S. Mechanical Engineering",
    organization: "Arizona State University",
    organization_url: null,
    location: null,
    start_date: "2012-01-01",
    end_date: "2016-01-01",
    is_current: false,
    description: "Solar car team",
    tags: [],
  });
});

test("parseLinkedInCsv skips rows missing required fields", () => {
  const csv =
    '"Company Name","Title","Started On","Finished On"\n' +
    '"","No Company Title","Jan 2020",""\n' +
    '"Acme","Tech","","2021"\n';
  const res = parseLinkedInCsv(csv);
  assert.equal(res.entries.length, 0);
  assert.equal(res.skipped, 2);
});

test("parseLinkedInCsv returns unknown for non-LinkedIn CSV", () => {
  assert.equal(parseLinkedInCsv("foo,bar\n1,2\n").kind, "unknown");
});
