import { EquipmentAddForm } from "@/components/atlas/equipment-add-form";
import { SiteBadge } from "@/components/site-badge";

export default function EquipmentAddPage() {
  return (
    <div className="min-h-full">
      <section className="relative py-16 md:py-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-[-200px] left-[-100px] w-[600px] h-[600px] rounded-full opacity-[0.04]"
            style={{ background: "radial-gradient(circle, #C4F82A 0%, transparent 70%)" }}
          />
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-20 relative z-10">
          <SiteBadge label="EQUIPMENT" />
          <h1 className="mt-6 text-3xl md:text-4xl font-heading font-bold tracking-tight">Add Equipment</h1>
          <p className="mt-3 text-muted-foreground max-w-xl">
            Help build BAS Atlas by submitting new equipment. All submissions are reviewed before going live.
          </p>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <EquipmentAddForm />
        </div>
      </section>
    </div>
  );
}
