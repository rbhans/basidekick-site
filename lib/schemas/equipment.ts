import { z } from "zod";
import { contentSchema } from "@/lib/schemas/shared";

export const PROTOCOLS = ["BACnet", "Modbus", "LON", "N2", "Other"] as const;
const MODEL_STATUSES = ["current", "discontinued"] as const;

const optionalUrlString = z.string().trim().superRefine((value, ctx) => {
  if (!value) return;
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      ctx.addIssue({
        code: "custom",
        message: "URL must use http or https",
      });
    }
  } catch {
    ctx.addIssue({
      code: "custom",
      message: "Please enter a valid URL",
    });
  }
});

const optionalContentString = z.string().superRefine((value, ctx) => {
  if (!value.trim()) return;
  const parsed = contentSchema.safeParse(value);
  if (!parsed.success) {
    ctx.addIssue({
      code: "custom",
      message: parsed.error.issues[0]?.message ?? "Invalid content",
    });
  }
});

export const equipmentFormSchema = z
  .object({
    brandId: z.string(),
    brandName: z.string(),
    brandLogoUrl: optionalUrlString,
    typeId: z.string(),
    typeName: z.string(),
    modelName: z.string().trim().min(1, "Model name is required."),
    modelNumbers: z.string(),
    protocols: z.array(z.enum(PROTOCOLS)),
    status: z.enum(MODEL_STATUSES),
    description: optionalContentString,
    manufacturerUrl: optionalUrlString,
    imageUrl: optionalUrlString,
  })
  .superRefine((value, ctx) => {
    if (!value.brandId.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "Brand is required.",
        path: ["brandId"],
      });
    }

    if (value.brandId === "new" && !value.brandName.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "Brand name is required.",
        path: ["brandName"],
      });
    }

    if (!value.typeId.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "Type is required.",
        path: ["typeId"],
      });
    }

    if (value.typeId === "new" && !value.typeName.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "Type name is required.",
        path: ["typeName"],
      });
    }
  });

export type EquipmentFormValues = z.infer<typeof equipmentFormSchema>;
