import type { MDXComponents } from "mdx/types";
import { Aside } from "@/components/learn/content/aside";
import { Callout } from "@/components/learn/content/callout";
import { Comparison } from "@/components/learn/content/comparison";
import { Figure } from "@/components/learn/content/figure";
import { KeyTerm } from "@/components/learn/content/key-term";
import { LessonSection } from "@/components/learn/content/lesson-section";
import { AnnotatedDiagram } from "@/components/learn/exploratory/annotated-diagram";
import { RevealCard } from "@/components/learn/exploratory/reveal-card";
import { ScrubControl } from "@/components/learn/exploratory/scrub-control";
import { StepThrough } from "@/components/learn/exploratory/step-through";
import { Tabs } from "@/components/learn/exploratory/tabs";
import { Toggle } from "@/components/learn/exploratory/toggle";
import { DragToMatch } from "@/components/learn/assessment/drag-to-match";
import { DragToOrder } from "@/components/learn/assessment/drag-to-order";
import { FillInBlank } from "@/components/learn/assessment/fill-in-blank";
import { Hotspot } from "@/components/learn/assessment/hotspot";
import { LabeledDiagram } from "@/components/learn/assessment/labeled-diagram";
import { MultipleChoice } from "@/components/learn/assessment/multiple-choice";
import { ProjectPhasesDiagram } from "@/components/learn/illustrations/intro-to-bas/project-phases";

export const courseMdxComponents: MDXComponents = {
  Aside,
  Callout,
  Comparison,
  Figure,
  KeyTerm,
  LessonSection,
  AnnotatedDiagram,
  RevealCard,
  ScrubControl,
  StepThrough,
  Tabs,
  Toggle,
  DragToMatch,
  DragToOrder,
  FillInBlank,
  Hotspot,
  LabeledDiagram,
  MultipleChoice,
  ProjectPhasesDiagram,
};
