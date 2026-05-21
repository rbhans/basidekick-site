import type { MDXComponents } from "mdx/types";
import { Callout } from "@/components/learn/content/callout";
import { Aside } from "@/components/learn/content/aside";
import { KeyTerm } from "@/components/learn/content/key-term";
import { LessonSection } from "@/components/learn/content/lesson-section";
import { Figure } from "@/components/learn/content/figure";
import { Comparison } from "@/components/learn/content/comparison";
import { RevealCard } from "@/components/learn/exploratory/reveal-card";
import { ScrubControl } from "@/components/learn/exploratory/scrub-control";
import { StepThrough } from "@/components/learn/exploratory/step-through";
import { AnnotatedDiagram } from "@/components/learn/exploratory/annotated-diagram";
import { Toggle } from "@/components/learn/exploratory/toggle";
import { Tabs } from "@/components/learn/exploratory/tabs";
import { MultipleChoice } from "@/components/learn/assessment/multiple-choice";
import { FillInBlank } from "@/components/learn/assessment/fill-in-blank";
import { DragToMatch } from "@/components/learn/assessment/drag-to-match";
import { DragToOrder } from "@/components/learn/assessment/drag-to-order";
import { Hotspot } from "@/components/learn/assessment/hotspot";
import { LabeledDiagram } from "@/components/learn/assessment/labeled-diagram";

const components: MDXComponents = {
  Callout,
  Aside,
  KeyTerm,
  LessonSection,
  Figure,
  Comparison,
  RevealCard,
  ScrubControl,
  StepThrough,
  AnnotatedDiagram,
  Toggle,
  Tabs,
  MultipleChoice,
  FillInBlank,
  DragToMatch,
  DragToOrder,
  Hotspot,
  LabeledDiagram,
};

export function useMDXComponents(): MDXComponents {
  return components;
}
