"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useAuth } from "@/hooks/use-auth";
import { createClient } from "@/lib/supabase/client";
import {
  equipmentFormSchema,
  PROTOCOLS,
  type EquipmentFormValues,
} from "@/lib/schemas/equipment";
import { useAtlasAll } from "./use-atlas-data";
import { ROUTES } from "@/lib/routes";

const SELECT_BRAND_PLACEHOLDER = "";
const SELECT_TYPE_PLACEHOLDER = "";

const defaultValues: EquipmentFormValues = {
  brandId: "",
  brandName: "",
  brandLogoUrl: "",
  typeId: "",
  typeName: "",
  modelName: "",
  modelNumbers: "",
  protocols: [],
  status: "current",
  description: "",
  manufacturerUrl: "",
  imageUrl: "",
};

const fieldLabelClass =
  "font-mono text-[10px] uppercase tracking-[1.3px] text-muted-foreground block mb-2";
const inputClass =
  "w-full border border-border bg-card focus:border-foreground transition-colors outline-none px-3 py-2.5 text-[14px] text-foreground placeholder:text-muted-foreground/60 placeholder:italic font-sans";
const selectClass =
  "w-full border border-border bg-card focus:border-foreground transition-colors outline-none px-3 py-2.5 text-[14px] text-foreground font-sans appearance-none cursor-pointer";

export function EquipmentAddForm() {
  const { user } = useAuth();
  const { data } = useAtlasAll();

  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const brandOptions = useMemo(() => data?.brands || [], [data]);
  const typeOptions = useMemo(() => data?.types || [], [data]);

  const form = useForm<EquipmentFormValues>({
    resolver: zodResolver(equipmentFormSchema),
    defaultValues,
  });

  const brandId = form.watch("brandId");
  const typeId = form.watch("typeId");
  const protocols = form.watch("protocols");

  const isNewBrand = brandId === "new";
  const isNewType = typeId === "new";

  const uploadFile = async (file: File, folder: string) => {
    const supabase = createClient();
    if (!supabase || !user) throw new Error("Missing auth");

    const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `${user.id}/${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("equipment-images")
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = supabase.storage.from("equipment-images").getPublicUrl(fileName);

    return publicUrl;
  };

  const handleBrandLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;
    try {
      const url = await uploadFile(file, "brand-logos");
      form.setValue("brandLogoUrl", url, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setSubmitError(null);
    } catch (error) {
      console.error(error);
      setSubmitError("Failed to upload logo.");
    }
  };

  const handleModelImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;
    try {
      const url = await uploadFile(file, "model-images");
      form.setValue("imageUrl", url, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setSubmitError(null);
    } catch (error) {
      console.error(error);
      setSubmitError("Failed to upload image.");
    }
  };

  const onSubmit = async (values: EquipmentFormValues) => {
    setSubmitError(null);
    setSuccess(false);

    if (!user) {
      setSubmitError("You must be signed in to submit equipment.");
      return;
    }

    try {
      const supabase = createClient();
      if (!supabase) throw new Error("Supabase not available");

      const selectedBrand = brandOptions.find((brand) => brand.id === values.brandId);
      const selectedType = typeOptions.find((type) => type.id === values.typeId);

      const payload = {
        user_id: user.id,
        type: "new_entry",
        brand_id: values.brandId === "new" ? null : values.brandId || null,
        brand_name:
          values.brandId === "new"
            ? values.brandName.trim()
            : selectedBrand?.name || values.brandId,
        brand_logo_url: values.brandId === "new" ? values.brandLogoUrl.trim() || null : null,
        type_id: values.typeId === "new" ? null : values.typeId || null,
        type_name:
          values.typeId === "new"
            ? values.typeName.trim()
            : selectedType?.name || values.typeId,
        model_name: values.modelName.trim(),
        model_numbers: values.modelNumbers
          ? values.modelNumbers.split(",").map((n) => n.trim()).filter(Boolean)
          : [],
        protocols: values.protocols,
        model_status: values.status,
        description: values.description.trim() || null,
        manufacturer_url: values.manufacturerUrl.trim() || null,
        image_url: values.imageUrl.trim() || null,
        review_status: "pending",
      };

      const { error: insertError } = await supabase
        .from("equipment_submissions")
        .insert(payload);

      if (insertError) {
        console.error(insertError);
        setSubmitError("Failed to submit. Please try again.");
        return;
      }

      setSuccess(true);
      form.reset(defaultValues);
    } catch (error) {
      console.error(error);
      setSubmitError("Failed to submit. Please try again.");
    }
  };

  if (!user) {
    return (
      <section className="container mx-auto max-w-[720px] px-4 sm:px-6 lg:px-16 py-10">
        <Link
          href={ROUTES.ATLAS_EQUIPMENT}
          className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[1.2px] text-muted-foreground hover:text-accent transition-colors mb-6"
        >
          <span className="text-accent">←</span>
          Back to equipment
        </Link>
        <div className="pb-5 border-b border-foreground mb-8">
          <div className="font-mono text-[10px] uppercase tracking-[1.3px] text-muted-foreground mb-2">
            Submit · Equipment
          </div>
          <h1 className="font-heading font-semibold text-[32px] md:text-[38px] leading-[1.05] text-foreground">
            Add equipment
          </h1>
        </div>
        <div className="border border-border bg-card p-8 text-center">
          <p className="font-heading italic text-[16px] text-muted-foreground mb-4">
            Sign in to submit new equipment for review.
          </p>
          <Link
            href="/signin"
            className="inline-block px-5 py-2.5 border border-foreground bg-primary text-primary-foreground font-mono text-[10px] uppercase tracking-[1.2px] hover:bg-primary/90 transition-colors"
          >
            Sign in
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="container mx-auto max-w-[720px] px-4 sm:px-6 lg:px-16 py-10">
      {/* Back link */}
      <Link
        href={ROUTES.ATLAS_EQUIPMENT}
        className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[1.2px] text-muted-foreground hover:text-accent transition-colors mb-6"
      >
        <span className="text-accent">←</span>
        Back to equipment
      </Link>

      {/* Header */}
      <div className="pb-5 border-b border-foreground mb-8">
        <div className="font-mono text-[10px] uppercase tracking-[1.3px] text-muted-foreground mb-2">
          Submit · Equipment
        </div>
        <h1 className="font-heading font-semibold text-[32px] md:text-[38px] leading-[1.05] text-foreground">
          Add equipment
        </h1>
        <p className="font-heading italic text-[15px] text-muted-foreground mt-2">
          Submissions go through a quick review before they show up in the catalog.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
          {success && (
            <div className="border border-accent bg-accent/10 text-foreground p-4 font-mono text-[11px] uppercase tracking-[1.2px]">
              ✓ Thanks — your submission is under review.
            </div>
          )}

          {submitError && (
            <div className="border border-destructive bg-destructive/10 text-destructive p-4 font-mono text-[11px] uppercase tracking-[1.2px]">
              {submitError}
            </div>
          )}

          {/* 01 / Brand */}
          <div>
            <div className="flex items-baseline gap-3.5 pb-3.5 border-b border-foreground mb-5">
              <span className="font-mono text-[11px] text-accent tracking-[1px]">01 /</span>
              <h2 className="font-heading font-semibold text-[20px] leading-none text-foreground">
                Brand
              </h2>
            </div>

            <FormField
              control={form.control}
              name="brandId"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <label className={fieldLabelClass}>Brand *</label>
                  <FormControl>
                    <div className="relative">
                      <select
                        {...field}
                        value={field.value || SELECT_BRAND_PLACEHOLDER}
                        onChange={(event) => {
                          const value = event.target.value;
                          const nextBrandId = value === SELECT_BRAND_PLACEHOLDER ? "" : value;
                          field.onChange(nextBrandId);
                          if (nextBrandId !== "new") {
                            form.setValue("brandName", "");
                            form.setValue("brandLogoUrl", "");
                          }
                        }}
                        className={selectClass}
                      >
                        <option value={SELECT_BRAND_PLACEHOLDER}>Select brand…</option>
                        {brandOptions.map((brand) => (
                          <option key={brand.id} value={brand.id}>
                            {brand.name}
                          </option>
                        ))}
                        <option value="new">+ Add new brand</option>
                      </select>
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[11px] text-muted-foreground">
                        ▾
                      </span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isNewBrand && (
              <div className="mt-5 space-y-5">
                <FormField
                  control={form.control}
                  name="brandName"
                  render={({ field }) => (
                    <FormItem>
                      <label className={fieldLabelClass}>Brand name *</label>
                      <FormControl>
                        <input {...field} className={inputClass} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div>
                  <label className={fieldLabelClass}>Brand logo (optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBrandLogoUpload}
                    className="font-mono text-[11px] text-muted-foreground"
                  />
                  {form.watch("brandLogoUrl") && (
                    <p className="font-mono text-[10px] uppercase tracking-[1.1px] text-accent mt-2">
                      ✓ Logo uploaded
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 02 / Type */}
          <div>
            <div className="flex items-baseline gap-3.5 pb-3.5 border-b border-foreground mb-5">
              <span className="font-mono text-[11px] text-accent tracking-[1px]">02 /</span>
              <h2 className="font-heading font-semibold text-[20px] leading-none text-foreground">
                Type
              </h2>
            </div>

            <FormField
              control={form.control}
              name="typeId"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <label className={fieldLabelClass}>Type *</label>
                  <FormControl>
                    <div className="relative">
                      <select
                        {...field}
                        value={field.value || SELECT_TYPE_PLACEHOLDER}
                        onChange={(event) => {
                          const value = event.target.value;
                          const nextTypeId = value === SELECT_TYPE_PLACEHOLDER ? "" : value;
                          field.onChange(nextTypeId);
                          if (nextTypeId !== "new") {
                            form.setValue("typeName", "");
                          }
                        }}
                        className={selectClass}
                      >
                        <option value={SELECT_TYPE_PLACEHOLDER}>Select type…</option>
                        {typeOptions.map((type) => (
                          <option key={type.id} value={type.id}>
                            {type.name}
                          </option>
                        ))}
                        <option value="new">+ Add new type</option>
                      </select>
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[11px] text-muted-foreground">
                        ▾
                      </span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isNewType && (
              <FormField
                control={form.control}
                name="typeName"
                render={({ field }) => (
                  <FormItem className="mt-5">
                    <label className={fieldLabelClass}>Type name *</label>
                    <FormControl>
                      <input {...field} className={inputClass} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>

          {/* 03 / Model details */}
          <div>
            <div className="flex items-baseline gap-3.5 pb-3.5 border-b border-foreground mb-5">
              <span className="font-mono text-[11px] text-accent tracking-[1px]">03 /</span>
              <h2 className="font-heading font-semibold text-[20px] leading-none text-foreground">
                Model details
              </h2>
            </div>

            <div className="space-y-5">
              <FormField
                control={form.control}
                name="modelName"
                render={({ field }) => (
                  <FormItem>
                    <label className={fieldLabelClass}>Model name *</label>
                    <FormControl>
                      <input {...field} className={inputClass} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="modelNumbers"
                render={({ field }) => (
                  <FormItem>
                    <label className={fieldLabelClass}>Model number(s)</label>
                    <FormControl>
                      <input {...field} placeholder="Comma-separated" className={inputClass} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="protocols"
                render={() => (
                  <FormItem>
                    <label className={fieldLabelClass}>Protocols</label>
                    <FormControl>
                      <div className="flex flex-wrap gap-2">
                        {PROTOCOLS.map((protocol) => {
                          const active = protocols.includes(protocol);
                          return (
                            <button
                              key={protocol}
                              type="button"
                              onClick={() => {
                                const nextValue = active
                                  ? protocols.filter((item) => item !== protocol)
                                  : [...protocols, protocol];
                                form.setValue("protocols", nextValue, {
                                  shouldDirty: true,
                                  shouldTouch: true,
                                  shouldValidate: true,
                                });
                              }}
                              className={`px-3 py-1.5 border rounded-sm font-mono text-[10px] uppercase tracking-[1.2px] transition-colors ${
                                active
                                  ? "bg-primary text-primary-foreground border-primary"
                                  : "bg-transparent text-muted-foreground border-border hover:border-foreground hover:text-foreground"
                              }`}
                            >
                              {protocol}
                            </button>
                          );
                        })}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <label className={fieldLabelClass}>Status</label>
                    <FormControl>
                      <div className="flex gap-2">
                        {(["current", "discontinued"] as const).map((status) => {
                          const active = field.value === status;
                          return (
                            <button
                              key={status}
                              type="button"
                              onClick={() => field.onChange(status)}
                              className={`px-3 py-1.5 border rounded-sm font-mono text-[10px] uppercase tracking-[1.2px] transition-colors ${
                                active
                                  ? "bg-primary text-primary-foreground border-primary"
                                  : "bg-transparent text-muted-foreground border-border hover:border-foreground hover:text-foreground"
                              }`}
                            >
                              {status}
                            </button>
                          );
                        })}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <label className={fieldLabelClass}>Description</label>
                    <FormControl>
                      <textarea
                        {...field}
                        rows={4}
                        className={`${inputClass} resize-y`}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="manufacturerUrl"
                render={({ field }) => (
                  <FormItem>
                    <label className={fieldLabelClass}>Manufacturer URL</label>
                    <FormControl>
                      <input {...field} className={inputClass} placeholder="https://…" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* 04 / Image */}
          <div>
            <div className="flex items-baseline gap-3.5 pb-3.5 border-b border-foreground mb-5">
              <span className="font-mono text-[11px] text-accent tracking-[1px]">04 /</span>
              <h2 className="font-heading font-semibold text-[20px] leading-none text-foreground">
                Image
              </h2>
            </div>

            <label className={fieldLabelClass}>Photo (optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleModelImageUpload}
              className="font-mono text-[11px] text-muted-foreground"
            />
            {form.watch("imageUrl") && (
              <p className="font-mono text-[10px] uppercase tracking-[1.1px] text-accent mt-2">
                ✓ Image uploaded
              </p>
            )}
          </div>

          <div className="pt-4 border-t border-foreground">
            <button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="px-6 py-3 border border-foreground bg-primary text-primary-foreground font-mono text-[11px] uppercase tracking-[1.2px] hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {form.formState.isSubmitting ? "Submitting…" : "Submit for review →"}
            </button>
          </div>
        </form>
      </Form>
    </section>
  );
}
