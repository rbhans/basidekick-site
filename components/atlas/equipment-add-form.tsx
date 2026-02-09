"use client";

import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
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

const SELECT_BRAND_PLACEHOLDER = "__select_brand__";
const SELECT_TYPE_PLACEHOLDER = "__select_type__";

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
      <div className="border border-border bg-card shadow-sm p-6">
        <p className="text-sm text-muted-foreground">Sign in to submit new equipment.</p>
        <Button asChild className="mt-4">
          <a href="/signin">Sign In</a>
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {success && (
          <div className="border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 p-3 text-sm">
            Thanks! Your submission is under review.
          </div>
        )}

        {submitError && (
          <div className="border border-destructive/30 bg-destructive/10 text-destructive p-3 text-sm">
            {submitError}
          </div>
        )}

        <FormField
          control={form.control}
          name="brandId"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>Brand *</FormLabel>
              <FormControl>
                <Select
                  value={field.value || undefined}
                  onValueChange={(value) => {
                    const nextBrandId = value === SELECT_BRAND_PLACEHOLDER ? "" : value;
                    field.onChange(nextBrandId);
                    if (nextBrandId !== "new") {
                      form.setValue("brandName", "");
                      form.setValue("brandLogoUrl", "");
                    }
                  }}
                >
                  <SelectTrigger className="w-full h-10 px-3 text-sm">
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={SELECT_BRAND_PLACEHOLDER}>Select brand</SelectItem>
                    {brandOptions.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </SelectItem>
                    ))}
                    <SelectItem value="new">Add new brand</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {isNewBrand && (
          <div className="space-y-3">
            <FormField
              control={form.control}
              name="brandName"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Brand Name *</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-2">
              <Label>Brand Logo (optional)</Label>
              <input type="file" accept="image/*" onChange={handleBrandLogoUpload} />
              {form.watch("brandLogoUrl") && (
                <p className="text-xs text-muted-foreground">Logo uploaded</p>
              )}
            </div>
          </div>
        )}

        <FormField
          control={form.control}
          name="typeId"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>Type *</FormLabel>
              <FormControl>
                <Select
                  value={field.value || undefined}
                  onValueChange={(value) => {
                    const nextTypeId = value === SELECT_TYPE_PLACEHOLDER ? "" : value;
                    field.onChange(nextTypeId);
                    if (nextTypeId !== "new") {
                      form.setValue("typeName", "");
                    }
                  }}
                >
                  <SelectTrigger className="w-full h-10 px-3 text-sm">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={SELECT_TYPE_PLACEHOLDER}>Select type</SelectItem>
                    {typeOptions.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                    <SelectItem value="new">Add new type</SelectItem>
                  </SelectContent>
                </Select>
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
              <FormItem className="space-y-2">
                <FormLabel>Type Name *</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="modelName"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>Model Name *</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="modelNumbers"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>Model Number(s)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Comma-separated" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="protocols"
          render={() => (
            <FormItem className="space-y-2">
              <FormLabel>Protocols</FormLabel>
              <FormControl>
                <div className="flex flex-wrap gap-3">
                  {PROTOCOLS.map((protocol) => (
                    <label key={protocol} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={protocols.includes(protocol)}
                        onChange={(event) => {
                          const nextValue = event.target.checked
                            ? [...protocols, protocol]
                            : protocols.filter((item) => item !== protocol);
                          form.setValue("protocols", nextValue, {
                            shouldDirty: true,
                            shouldTouch: true,
                            shouldValidate: true,
                          });
                        }}
                      />
                      {protocol}
                    </label>
                  ))}
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
            <FormItem className="space-y-2">
              <FormLabel>Status</FormLabel>
              <FormControl>
                <div className="flex gap-4 text-sm">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="equipment-status"
                      value="current"
                      checked={field.value === "current"}
                      onChange={() => field.onChange("current")}
                    />
                    Current
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="equipment-status"
                      value="discontinued"
                      checked={field.value === "discontinued"}
                      onChange={() => field.onChange("discontinued")}
                    />
                    Discontinued
                  </label>
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
            <FormItem className="space-y-2">
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} rows={4} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="manufacturerUrl"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>Manufacturer URL</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <Label>Image (optional)</Label>
          <input type="file" accept="image/*" onChange={handleModelImageUpload} />
          {form.watch("imageUrl") && <p className="text-xs text-muted-foreground">Image uploaded</p>}
        </div>

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Submitting..." : "Submit for Review"}
        </Button>
      </form>
    </Form>
  );
}
