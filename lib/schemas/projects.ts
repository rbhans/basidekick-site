import { z } from "zod";
import type { PSKKanbanStatus } from "@/lib/types";

const PROJECT_STATUSES = [
  "backlog",
  "in-progress",
  "review",
  "completed",
] as const satisfies readonly PSKKanbanStatus[];

const hexColor = /^#[0-9A-Fa-f]{6}$/;

const contactSchema = z.object({
  name: z.string(),
  email: z.string(),
  phone: z.string(),
});

export const projectFormSchema = z
  .object({
    name: z.string().trim().min(1, "Project name is required"),
    description: z.string(),
    client_id: z.string(),
    status: z.enum(PROJECT_STATUSES),
    is_internal: z.boolean(),
    is_shared: z.boolean(),
    due_date: z.string(),
    budget: z.string(),
    hourly_rate: z.string(),
    proton_drive_link: z.string(),
    notes: z.string(),
    color: z.string(),
  })
  .superRefine((value, ctx) => {
    if (!value.is_internal && !value.client_id.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "Client is required unless this is an internal project.",
        path: ["client_id"],
      });
    }

    const budget = value.budget.trim() ? Number(value.budget) : undefined;
    if (budget !== undefined && (Number.isNaN(budget) || budget < 0)) {
      ctx.addIssue({
        code: "custom",
        message: "Budget must be a valid non-negative number.",
        path: ["budget"],
      });
    }

    const hourlyRate = value.hourly_rate.trim() ? Number(value.hourly_rate) : undefined;
    if (hourlyRate !== undefined && (Number.isNaN(hourlyRate) || hourlyRate < 0)) {
      ctx.addIssue({
        code: "custom",
        message: "Hourly rate must be a valid non-negative number.",
        path: ["hourly_rate"],
      });
    }

    if (value.color.trim() && !hexColor.test(value.color.trim())) {
      ctx.addIssue({
        code: "custom",
        message: "Project color must be a 6-digit hex value.",
        path: ["color"],
      });
    }
  });

export type ProjectFormValues = z.infer<typeof projectFormSchema>;

export const clientFormSchema = z
  .object({
    name: z.string().trim().min(1, "Client name is required"),
    notes: z.string(),
    logo: z.string(),
    contacts: z.array(contactSchema).min(1, "At least one contact is required"),
    colorPalette: z.array(
      z.string().regex(hexColor, "Colors must be 6-digit hex values")
    ),
  })
  .superRefine((value, ctx) => {
    if (!value.contacts.some((contact) => contact.name.trim().length > 0)) {
      ctx.addIssue({
        code: "custom",
        message: "Please provide at least one contact with a name.",
        path: ["contacts"],
      });
    }
  });

export type ClientFormValues = z.infer<typeof clientFormSchema>;
