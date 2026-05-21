import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, basename } from "node:path";
import matter from "gray-matter";

export interface LessonFrontmatter {
  title: string;
  description?: string;
  order: number;
  estimatedMinutes?: number;
}

export interface CourseMeta {
  slug: string;
  title: string;
  description: string;
  tagline?: string;
}

export interface Lesson extends LessonFrontmatter {
  slug: string;
  courseSlug: string;
}

export interface Course extends CourseMeta {
  lessons: Lesson[];
}

export interface CourseProgress {
  lessonsCompleted: string[];
  lastLessonSlug: string | null;
  startedAt: number;
  lastActiveAt: number;
}

export interface Progress {
  userId: string | null;
  courses: Record<string, CourseProgress>;
  interactions: Record<string, unknown>;
}

const COURSES_ROOT = join(process.cwd(), "content", "courses");

function readCourseMeta(courseSlug: string): CourseMeta {
  const path = join(COURSES_ROOT, courseSlug, "course.json");
  const raw = readFileSync(path, "utf8");
  const parsed = JSON.parse(raw) as Omit<CourseMeta, "slug">;
  return { slug: courseSlug, ...parsed };
}

function readLessons(courseSlug: string): Lesson[] {
  const dir = join(COURSES_ROOT, courseSlug, "lessons");
  if (!existsSync(dir)) return [];
  const files = readdirSync(dir).filter((f) => f.endsWith(".mdx"));
  const lessons: Lesson[] = files.map((file) => {
    const slug = basename(file, ".mdx");
    const raw = readFileSync(join(dir, file), "utf8");
    const { data } = matter(raw);
    const fm = data as Partial<LessonFrontmatter>;
    return {
      slug,
      courseSlug,
      title: fm.title ?? slug,
      description: fm.description,
      order: typeof fm.order === "number" ? fm.order : 9999,
      estimatedMinutes: fm.estimatedMinutes,
    };
  });
  return lessons.sort((a, b) => a.order - b.order);
}

export function getAllCourseSlugs(): string[] {
  if (!existsSync(COURSES_ROOT)) return [];
  return readdirSync(COURSES_ROOT, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
}

export function getAllCourses(): Course[] {
  return getAllCourseSlugs().map(getCourse);
}

export function getCourse(courseSlug: string): Course {
  const meta = readCourseMeta(courseSlug);
  const lessons = readLessons(courseSlug);
  return { ...meta, lessons };
}

export function getLesson(
  courseSlug: string,
  lessonSlug: string,
): Lesson | undefined {
  const course = getCourse(courseSlug);
  return course.lessons.find((l) => l.slug === lessonSlug);
}

export function getAdjacentLessons(
  course: Course,
  lessonSlug: string,
): { prev: Lesson | null; next: Lesson | null } {
  const idx = course.lessons.findIndex((l) => l.slug === lessonSlug);
  if (idx === -1) return { prev: null, next: null };
  return {
    prev: idx > 0 ? course.lessons[idx - 1] : null,
    next: idx < course.lessons.length - 1 ? course.lessons[idx + 1] : null,
  };
}
