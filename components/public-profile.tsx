/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ArrowSquareOut,
  Briefcase,
  Buildings,
  CalendarBlank,
  CheckCircle,
  GithubLogo,
  GraduationCap,
  LinkedinLogo,
  MapPin,
  UserCircle,
} from "@phosphor-icons/react/dist/ssr";
import type { PointStackCompanyMember, PointStackPost, PointStackProfile, WorkExperience } from "@/lib/types";

type ProfileLinks = {
  label: string;
  href: string;
  icon: typeof ArrowSquareOut;
};

function safeHttpUrl(value: string | null | undefined) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

function formatMonth(value: string) {
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  return new Intl.DateTimeFormat("en", { month: "short", year: "numeric" }).format(date);
}

function formatExperienceRange(entry: WorkExperience) {
  const end = entry.is_current ? "Present" : entry.end_date ? formatMonth(entry.end_date) : null;
  return [formatMonth(entry.start_date), end].filter(Boolean).join(" — ");
}

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "PS";
}

function excerpt(value: string) {
  const plain = value.replace(/[#*_`>\[\]]/g, "").replace(/\s+/g, " ").trim();
  return plain.length > 210 ? `${plain.slice(0, 207)}…` : plain;
}

export function PublicProfile({
  profile,
  experience,
  posts,
  companies = [],
  followers,
  following,
}: {
  profile: PointStackProfile;
  experience: WorkExperience[];
  posts: PointStackPost[];
  companies?: PointStackCompanyMember[];
  followers: number;
  following: number;
}) {
  const name = profile.display_name?.trim() || profile.username || "PointStack member";
  const avatar = safeHttpUrl(profile.avatar_url);
  const coverImage = safeHttpUrl(profile.cover_image_url);
  const website = safeHttpUrl(profile.website_url);
  const linkedin = safeHttpUrl(profile.linkedin_url);
  const github = safeHttpUrl(profile.github_url);
  const links: ProfileLinks[] = [
    ...(website ? [{ label: "Website", href: website, icon: ArrowSquareOut }] : []),
    ...(linkedin ? [{ label: "LinkedIn", href: linkedin, icon: LinkedinLogo }] : []),
    ...(github ? [{ label: "GitHub", href: github, icon: GithubLogo }] : []),
  ];
  const projects = posts.filter((post) => post.post_type === "project");
  const activity = posts.filter((post) => post.post_type !== "project");
  const hasStats = posts.length > 0 || followers > 0 || following > 0 || profile.reputation_score > 0;
  const hasProfessionalDetails = Boolean(profile.company || profile.location || profile.availability_status !== "not-looking");
  const joined = profile.created_at ? new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(new Date(profile.created_at)) : null;
  const hasMainContent = Boolean(profile.bio || experience.length || projects.length || activity.length);
  const hasSideContent = Boolean(profile.skills.length || companies.length || hasProfessionalDetails || joined || links.length);

  return (
    <article className="public-profile">
      <Link className="profile-back" href="/pointstack/people"><ArrowLeft size={14} /> Back to people</Link>

      <header className="profile-hero-card">
        {coverImage
          ? <div className="profile-cover profile-cover-image" aria-hidden="true"><img src={coverImage} alt="" /></div>
          : <div className="profile-cover" aria-hidden="true">
              <span>POINTSTACK / PRACTITIONER</span>
              <i /><i /><i />
            </div>}
        <div className="profile-identity">
          <div className="profile-avatar">
            {avatar ? <img src={avatar} alt={`${name} profile photo`} /> : <span>{initials(name)}</span>}
          </div>
          <div className="profile-primary">
            <div className="profile-name-line">
              <h1>{name}</h1>
              {profile.is_verified && <span title="Verified PointStack member"><CheckCircle size={19} weight="fill" /> Verified</span>}
            </div>
            {profile.headline && <p className="profile-headline">{profile.headline}</p>}
            {(profile.company || profile.location) && <div className="profile-meta">
              {profile.company && <span><Buildings size={15} />{profile.company}</span>}
              {profile.location && <span><MapPin size={15} />{profile.location}</span>}
            </div>}
            {links.length > 0 && <nav className="profile-links" aria-label={`${name} links`}>
              {links.map(({ label, href, icon: Icon }, index) => <a className={index === 0 ? "button primary" : "button quiet"} href={href} target="_blank" rel="noreferrer" key={label}><Icon size={15} />{label}</a>)}
            </nav>}
          </div>
        </div>

        {hasStats && <dl className="profile-stat-strip">
          {posts.length > 0 && <div><dt>Public activity</dt><dd>{posts.length}</dd></div>}
          {profile.reputation_score > 0 && <div><dt>Reputation</dt><dd>{profile.reputation_score}</dd></div>}
          {followers > 0 && <div><dt>Followers</dt><dd>{followers}</dd></div>}
          {following > 0 && <div><dt>Following</dt><dd>{following}</dd></div>}
        </dl>}
      </header>

      {(hasMainContent || hasSideContent) && <div className={`profile-content-grid ${!hasMainContent || !hasSideContent ? "profile-content-grid-single" : ""}`}>
        {hasMainContent && <div className="profile-main-column">
          {profile.bio && <section className="profile-section">
            <header><span>01</span><h2>About</h2></header>
            <p className="profile-about">{profile.bio}</p>
          </section>}

          {experience.length > 0 && <section className="profile-section">
            <header><span>{profile.bio ? "02" : "01"}</span><h2>Experience & education</h2></header>
            <div className="profile-timeline">{experience.map((entry) => {
              const ExperienceIcon = entry.kind === "education" ? GraduationCap : Briefcase;
              return <article key={entry.id}>
                <div className="timeline-mark"><ExperienceIcon size={18} /></div>
                <div>
                  <span className="timeline-kind">{entry.kind}</span>
                  <h3>{entry.title}</h3>
                  <p className="timeline-org">{entry.organization}</p>
                  <p className="timeline-meta">{formatExperienceRange(entry)}{entry.location ? ` · ${entry.location}` : ""}</p>
                  {entry.description && <p className="timeline-description">{entry.description}</p>}
                  {entry.tags.length > 0 && <div className="profile-tag-list">{entry.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>}
                  {safeHttpUrl(entry.organization_url) && <a className="profile-inline-link" href={safeHttpUrl(entry.organization_url)!} target="_blank" rel="noreferrer">Organization <ArrowSquareOut size={13} /></a>}
                </div>
              </article>;
            })}</div>
          </section>}

          {projects.length > 0 && <section className="profile-section">
            <header><span>WORK</span><h2>Featured projects</h2></header>
            <div className="profile-project-grid">{projects.map((project) => <Link href={`/pointstack/projects/${project.slug}`} key={project.id}>
              <span>{project.post_type}</span>
              <h3>{project.title}</h3>
              <p>{excerpt(project.content)}</p>
              {project.tags.length > 0 && <div className="profile-tag-list">{project.tags.slice(0, 4).map((tag) => <span key={tag}>{tag}</span>)}</div>}
              <em>View project <ArrowRight size={14} /></em>
            </Link>)}</div>
          </section>}

          {activity.length > 0 && <section className="profile-section" id="activity">
            <header><span>LOG</span><h2>Recent activity</h2></header>
            <div className="profile-activity-list">{activity.map((post) => <Link href={`/pointstack/posts/${post.slug}`} key={post.id}>
              <div className="activity-kind"><span>{post.post_type}</span><small>{new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(post.created_at))}</small></div>
              <div><h3>{post.title}</h3><p>{excerpt(post.content)}</p>{post.tags.length > 0 && <div className="profile-tag-list">{post.tags.slice(0, 4).map((tag) => <span key={tag}>{tag}</span>)}</div>}</div>
              <div className="activity-counts"><span>{post.upvote_count} votes</span><span>{post.comment_count} replies</span><ArrowRight size={14} /></div>
            </Link>)}</div>
          </section>}
        </div>}

        {hasSideContent && <aside className="profile-side-column">
          {profile.skills.length > 0 && <section className="profile-side-card">
            <header><h2>Skills</h2><span>{profile.skills.length}</span></header>
            <div className="profile-skill-list">{profile.skills.map((skill) => <span key={skill}>{skill}</span>)}</div>
          </section>}

          {companies.length > 0 && <section className="profile-side-card">
            <header><h2>Companies</h2><span>{companies.length}</span></header>
            <div className="profile-company-list">{companies.map((membership) => {
              const company = membership.company;
              if (!company) return null;
              const logo = safeHttpUrl(company.logo_url);
              const role = membership.title || (membership.role === "owner" ? "Owner" : membership.role === "admin" ? "Admin" : "Member");
              return <Link href={`/pointstack/companies/${company.slug}`} key={membership.id}>
                <span className="profile-company-mark">{logo ? <img src={logo} alt="" /> : <Buildings size={17} />}</span>
                <span><strong>{company.name}</strong><small>{role}</small></span>
                <ArrowRight size={13} />
              </Link>;
            })}</div>
          </section>}

          {hasProfessionalDetails && <section className="profile-side-card">
            <header><h2>Professional details</h2></header>
            <dl className="profile-details">
              {profile.company && <div><dt><Buildings size={15} />Company</dt><dd>{profile.company}</dd></div>}
              {profile.location && <div><dt><MapPin size={15} />Location</dt><dd>{profile.location}</dd></div>}
              {profile.availability_status !== "not-looking" && <div><dt><UserCircle size={15} />Availability</dt><dd>{profile.availability_status === "available" ? "Available for work" : "Limited availability"}</dd></div>}
            </dl>
          </section>}

          {(joined || links.length > 0) && <section className="profile-side-card">
            <header><h2>PointStack</h2></header>
            <dl className="profile-details">
              {joined && <div><dt><CalendarBlank size={15} />Member since</dt><dd>{joined}</dd></div>}
            </dl>
            {links.length > 0 && <div className="profile-contact-links">{links.map(({ label, href, icon: Icon }) => <a href={href} target="_blank" rel="noreferrer" key={label}><Icon size={15} />{label}<ArrowSquareOut size={12} /></a>)}</div>}
          </section>}
        </aside>}
      </div>}
    </article>
  );
}
