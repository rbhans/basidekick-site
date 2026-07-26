import type { MDXContent } from "mdx/types";

export type CourseLessonModule = {
  default: MDXContent;
  frontmatter?: {
    title?: string;
    description?: string;
    order?: number;
    estimatedMinutes?: number;
  };
};

const lessonLoaders: Record<string, () => Promise<CourseLessonModule>> = {
  "01-what-is-bas": () => import("@/content/courses/intro-to-bas/lessons/01-what-is-bas.mdx"),
  "02-what-a-bas-does": () => import("@/content/courses/intro-to-bas/lessons/02-what-a-bas-does.mdx"),
  "03-where-you-find-them": () => import("@/content/courses/intro-to-bas/lessons/03-where-you-find-them.mdx"),
  "04-watching-a-building-wake-up": () => import("@/content/courses/intro-to-bas/lessons/04-watching-a-building-wake-up.mdx"),
  "05-the-major-players": () => import("@/content/courses/intro-to-bas/lessons/05-the-major-players.mdx"),
  "06-career-paths": () => import("@/content/courses/intro-to-bas/lessons/06-career-paths.mdx"),
  "07-the-mechanical-systems": () => import("@/content/courses/intro-to-bas/lessons/07-the-mechanical-systems.mdx"),
  "08-protocols-on-the-wire": () => import("@/content/courses/intro-to-bas/lessons/08-protocols-on-the-wire.mdx"),
  "09-the-project-lifecycle": () => import("@/content/courses/intro-to-bas/lessons/09-the-project-lifecycle.mdx"),
  "10-whats-next": () => import("@/content/courses/intro-to-bas/lessons/10-whats-next.mdx"),
};

export function loadCourseLesson(slug: string) {
  return lessonLoaders[slug]?.();
}
