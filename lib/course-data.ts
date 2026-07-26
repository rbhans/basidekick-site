export type CourseLesson = {
  slug: string;
  title: string;
  description: string;
  order: number;
  estimatedMinutes: number;
};

export type Course = {
  slug: string;
  title: string;
  description: string;
  tagline: string;
  lessons: CourseLesson[];
};

export const INTRO_TO_BAS: Course = {
  slug: "intro-to-bas",
  title: "Intro to BAS",
  description: "What a BAS is, why it exists, who works on it, and what the field looks like from the inside.",
  tagline: "Start here. The shape of the field before we dig in.",
  lessons: [
    {
      slug: "01-what-is-bas",
      title: "What is a Building Automation System?",
      description: "What a BAS is, why it exists, and why most larger commercial buildings end up with one.",
      order: 1,
      estimatedMinutes: 8,
    },
    {
      slug: "02-what-a-bas-does",
      title: "What a BAS Actually Does",
      description: "The five jobs every BAS is doing at any moment, and how they blend in real buildings.",
      order: 2,
      estimatedMinutes: 10,
    },
    {
      slug: "03-where-you-find-them",
      title: "Where You Find Them",
      description: "The building types and scales where BAS work happens, and what each one changes about the job.",
      order: 3,
      estimatedMinutes: 9,
    },
    {
      slug: "04-watching-a-building-wake-up",
      title: "Watching a Building Wake Up",
      description: "A day in the life of an air handler, told through the schedules and sequences a BAS uses to keep a building comfortable.",
      order: 4,
      estimatedMinutes: 12,
    },
    {
      slug: "05-the-major-players",
      title: "The Major Players",
      description: "Owner, designer, integrator, mech contractor, cx agent, operator. Who does what and where the friction lives.",
      order: 5,
      estimatedMinutes: 11,
    },
    {
      slug: "06-career-paths",
      title: "Career Paths in BAS",
      description: "The common entry routes, the roles people grow into, and the skills that move you between them.",
      order: 6,
      estimatedMinutes: 11,
    },
    {
      slug: "07-the-mechanical-systems",
      title: "The Mechanical Systems a BAS Controls",
      description: "Air-side, water-side, and refrigerant-side equipment—what each family does and where the BAS plugs in.",
      order: 7,
      estimatedMinutes: 13,
    },
    {
      slug: "08-protocols-on-the-wire",
      title: "Protocols on the Wire",
      description: "BACnet, Modbus, LonWorks, and MQTT—what each protocol does and where a BAS engineer touches it.",
      order: 8,
      estimatedMinutes: 12,
    },
    {
      slug: "09-the-project-lifecycle",
      title: "The Project Lifecycle",
      description: "Seven phases from owner conversation to running building, and the documents that anchor each one.",
      order: 9,
      estimatedMinutes: 14,
    },
    {
      slug: "10-whats-next",
      title: "What Comes Next",
      description: "What you have covered, what comes next, and habits that compound for anyone making BAS a career.",
      order: 10,
      estimatedMinutes: 8,
    },
  ],
};

export function getCourseLesson(slug: string) {
  return INTRO_TO_BAS.lessons.find((lesson) => lesson.slug === slug);
}

export function getAdjacentCourseLessons(slug: string) {
  const index = INTRO_TO_BAS.lessons.findIndex((lesson) => lesson.slug === slug);
  if (index < 0) return { previous: null, next: null };
  return {
    previous: index > 0 ? INTRO_TO_BAS.lessons[index - 1] : null,
    next: index < INTRO_TO_BAS.lessons.length - 1 ? INTRO_TO_BAS.lessons[index + 1] : null,
  };
}

export const INTRO_TO_BAS_MINUTES = INTRO_TO_BAS.lessons.reduce(
  (sum, lesson) => sum + lesson.estimatedMinutes,
  0,
);
