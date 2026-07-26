declare module "*.mdx" {
  import type { MDXContent } from "mdx/types";

  export const frontmatter: {
    title?: string;
    description?: string;
    order?: number;
    estimatedMinutes?: number;
  };

  const content: MDXContent;
  export default content;
}
