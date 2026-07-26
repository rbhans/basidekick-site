import type { MDXComponents } from "mdx/types";
import { courseMdxComponents } from "@/components/course-mdx-components";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...courseMdxComponents,
    ...components,
  };
}
