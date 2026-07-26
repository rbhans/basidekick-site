import { describe, expect, it } from "vitest";
import { NAV_ITEMS, activeNav, breadcrumbs } from "@/lib/navigation";
import { searchWorkspace } from "@/lib/workspace-search";

describe("workspace navigation", () => {
  it("keeps Library under Tools and PointStack Resources out of the sidebar", () => {
    const tools = NAV_ITEMS.find((item) => item.id === "tools");
    expect(tools?.children?.map((item) => item.label)).toEqual(["Overview", "Calculators", "References", "Library"]);
    const pointstack = NAV_ITEMS.find((item) => item.id === "pointstack");
    expect(pointstack?.children?.some((item) => item.label === "Resources")).toBe(false);
  });

  it("resolves nested pages to their parent section", () => {
    expect(activeNav("/library/bask-stream")?.id).toBe("tools");
    expect(activeNav("/pointstack/projects/example")?.id).toBe("pointstack");
  });

  it("creates compact breadcrumbs for detail routes", () => {
    expect(breadcrumbs("/library/bask-stream").map((item) => item.label)).toEqual(["Tools", "Library", "Bask Stream"]);
  });

  it("searches across navigation and workspace content", () => {
    expect(searchWorkspace("notifications")[0]?.href).toBe("/pointstack/notifications");
    expect(searchWorkspace("air changes")[0]?.kind).toBe("Calculator");
    expect(searchWorkspace("bacnet object types")[0]?.href).toBe("/references#bacnet-object-types");
    expect(searchWorkspace("BASk Stream")[0]?.href).toBe("/library/bask-stream");
    expect(searchWorkspace("certificate rotation")[0]?.kind).toBe("PointStack");
  });
});
