import { AccountView } from "@/components/views/account-view";
import { getAllCourses, type Course } from "@/lib/courses";

export interface CourseSummary {
  slug: string;
  title: string;
  description: string;
  lessonSlugs: string[];
}

function toSummary(course: Course): CourseSummary {
  return {
    slug: course.slug,
    title: course.title,
    description: course.description,
    lessonSlugs: course.lessons.map((l) => l.slug),
  };
}

export default function AccountPage() {
  const courses = getAllCourses().map(toSummary);
  return <AccountView courses={courses} />;
}
