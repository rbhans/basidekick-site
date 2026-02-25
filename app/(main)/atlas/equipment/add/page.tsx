import { EquipmentAddForm } from "@/components/atlas/equipment-add-form";
import { SiteBadge } from "@/components/site-badge";
import { PageHero } from "@/components/page-hero";

export default function EquipmentAddPage() {
  return (
    <div className="min-h-full">
            <PageHero>
          <SiteBadge label="EQUIPMENT" />
          <h1 className="mt-6 text-3xl md:text-4xl font-heading font-bold tracking-tight">Add Equipment</h1>
          <p className="mt-3 text-muted-foreground max-w-xl">
            Help build BAS Atlas by submitting new equipment. All submissions are reviewed before going live.
          </p>
      </PageHero>

      <section className="py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <EquipmentAddForm />
        </div>
      </section>
    </div>
  );
}
