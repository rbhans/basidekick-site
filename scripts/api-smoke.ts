import assert from "node:assert/strict";
import { NextRequest } from "next/server";

import { GET as getMeta } from "../app/api/meta/route";
import { GET as getSearch } from "../app/api/search/route";
import { GET as getPoint } from "../app/api/points/[id]/route";
import { GET as getEquipment } from "../app/api/equipment/[id]/route";
import { GET as getTemplate } from "../app/api/templates/[equipmentTypeId]/route";
import { POST as postNormalize } from "../app/api/normalize/route";
import { POST as postValidate } from "../app/api/validate/route";

async function readJson(response: Response) {
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

async function main() {
  const metaRes = await getMeta(new NextRequest("http://localhost/api/meta"));
  assert.equal(metaRes.status, 200, "meta should return 200");
  const metaBody = await readJson(metaRes);
  assert.ok(metaBody.totalPoints > 0, "meta should include point count");

  const searchRes = await getSearch(new NextRequest("http://localhost/api/search?q=zone%20temp"));
  assert.equal(searchRes.status, 200, "search should return 200");

  const normalizeRes = await postNormalize(
    new NextRequest("http://localhost/api/normalize", {
      method: "POST",
      body: JSON.stringify({ name: "zone temp" }),
      headers: { "content-type": "application/json" },
    }),
  );
  assert.equal(normalizeRes.status, 200, "normalize should return 200");
  const normalizeBody = await readJson(normalizeRes);
  assert.ok("matchedConceptId" in normalizeBody, "normalize response must include matchedConceptId");

  const validateRes = await postValidate(
    new NextRequest("http://localhost/api/validate", {
      method: "POST",
      body: JSON.stringify({
        equipmentTypeId: "ahu",
        points: [
          "supply fan command",
          "supply fan status",
          "supply air temperature",
          "return air temperature",
          "outside air damper output",
          "cooling valve output",
          "heating valve output",
        ],
      }),
      headers: { "content-type": "application/json" },
    }),
  );
  assert.equal(validateRes.status, 200, "validate should return 200");

  const pointRes = await getPoint(new NextRequest("http://localhost/api/points/zone-temperature"), {
    params: Promise.resolve({ id: "zone-temperature" }),
  });
  assert.equal(pointRes.status, 200, "point endpoint should return 200");

  const equipmentRes = await getEquipment(
    new NextRequest("http://localhost/api/equipment/air-handling-unit"),
    { params: Promise.resolve({ id: "air-handling-unit" }) },
  );
  assert.equal(equipmentRes.status, 200, "equipment endpoint should return 200");

  const templateRes = await getTemplate(
    new NextRequest("http://localhost/api/templates/ahu"),
    { params: Promise.resolve({ equipmentTypeId: "ahu" }) },
  );
  assert.equal(templateRes.status, 200, "template endpoint should return 200");

  console.log("API smoke tests passed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
