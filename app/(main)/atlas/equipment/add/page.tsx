import { EquipmentAddForm } from "@/components/atlas/equipment-add-form";
import { SectionLabel } from "@/components/section-label";
import { CircuitBackground } from "@/components/circuit-background";

export default function EquipmentAddPage() {
  return (
    <div className="min-h-full">
      <section className="relative py-12 overflow-hidden">
        <CircuitBackground opacity={0.15} colorGradient />
        <div className="container mx-auto px-4 relative z-10">
          <SectionLabel variant="resources">equipment</SectionLabel>
          <h1 className="mt-6 text-3xl md:text-4xl font-semibold tracking-tight">Add Equipment</h1>
          <p className="mt-2 text-muted-foreground max-w-xl">
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
