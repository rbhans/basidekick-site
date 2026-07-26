import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { CourseProgressAction } from "@/components/course-progress-action";
import { RecentViewTracker } from "@/components/personalization";
import { ProgressProvider } from "@/lib/progress";
import { INTRO_TO_BAS, type CourseLesson } from "@/lib/course-data";

export function CourseLearningShell({
  lesson,
  completedLessons,
  userId,
  children,
}: {
  lesson: CourseLesson;
  completedLessons: string[];
  userId: string | null;
  children: React.ReactNode;
}) {
  const currentIndex = INTRO_TO_BAS.lessons.findIndex((item) => item.slug === lesson.slug);
  const previous = currentIndex > 0 ? INTRO_TO_BAS.lessons[currentIndex - 1] : null;
  const next = currentIndex < INTRO_TO_BAS.lessons.length - 1 ? INTRO_TO_BAS.lessons[currentIndex + 1] : null;
  const completed = new Set(completedLessons);

  return (
    <ProgressProvider>
      <div className="course-learning">
        <RecentViewTracker kind="course" entityId={`intro-to-bas/${lesson.slug}`} title={`${lesson.title} — Intro to BAS`} href={`/courses/intro-to-bas/${lesson.slug}`} />
        <div className="course-learning-topline">
          <Link href="/courses/intro-to-bas"><ArrowLeft size={13} /> Intro to BAS</Link>
          <span>{completed.size} / {INTRO_TO_BAS.lessons.length} complete</span>
        </div>
        <div className="course-learning-grid">
          <aside className="course-lesson-rail">
            <span className="eyebrow">ONE COURSE / TEN LESSONS</span>
            <ol>{INTRO_TO_BAS.lessons.map((item) => {
              const active = item.slug === lesson.slug;
              const done = completed.has(item.slug);
              return <li key={item.slug}>
                <Link className={active ? "active" : ""} aria-current={active ? "page" : undefined} href={`/courses/intro-to-bas/${item.slug}`}>
                  <span>{done ? <CheckCircle size={14} weight="fill" /> : String(item.order).padStart(2, "0")}</span>
                  <strong>{item.title}</strong>
                </Link>
              </li>;
            })}</ol>
          </aside>
          <article className="course-lesson-article">
            <header>
              <span className="eyebrow">LESSON {String(lesson.order).padStart(2, "0")} · {lesson.estimatedMinutes} MIN</span>
              <h1>{lesson.title}</h1>
              <p>{lesson.description}</p>
            </header>
            <div className="prose">{children}</div>
            <footer className="course-lesson-footer">
              <CourseProgressAction
                userId={userId}
                lessonSlug={lesson.slug}
                initiallyComplete={completed.has(lesson.slug)}
              />
              <nav aria-label="Lesson navigation">
                {previous
                  ? <Link href={`/courses/intro-to-bas/${previous.slug}`}><ArrowLeft size={14} /><span><small>Previous</small><strong>{previous.title}</strong></span></Link>
                  : <span />}
                {next && <Link href={`/courses/intro-to-bas/${next.slug}`}><span><small>Next</small><strong>{next.title}</strong></span><ArrowRight size={14} /></Link>}
              </nav>
            </footer>
          </article>
        </div>
      </div>
    </ProgressProvider>
  );
}
