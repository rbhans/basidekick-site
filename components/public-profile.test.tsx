import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PublicProfile } from "@/components/public-profile";
import type { PointStackCompanyMember, PointStackPost, PointStackProfile, WorkExperience } from "@/lib/types";

const sparseProfile: PointStackProfile = {
  id: "profile-1",
  username: "sparse",
  display_name: "Sparse Person",
  avatar_url: null,
  post_count: 0,
  skills: [],
  headline: null,
  location: null,
  availability_status: "not-looking",
  reputation_score: 0,
  is_verified: false,
};

describe("PublicProfile", () => {
  it("omits every empty optional section", () => {
    const html = renderToStaticMarkup(<PublicProfile profile={sparseProfile} experience={[]} posts={[]} followers={0} following={0} />);
    expect(html).toContain("Sparse Person");
    expect(html).not.toContain(">About<");
    expect(html).not.toContain(">Experience &amp; education<");
    expect(html).not.toContain(">Skills<");
    expect(html).not.toContain(">Professional details<");
    expect(html).not.toContain(">Recent activity<");
    expect(html).not.toContain("profile-content-grid");
    expect(html).not.toContain("profile-stat-strip");
  });

  it("renders populated professional sections and activity", () => {
    const profile: PointStackProfile = {
      ...sparseProfile,
      bio: "Controls engineer focused on practical commissioning.",
      company: "Example Controls",
      location: "Phoenix, AZ",
      skills: ["BACnet", "Niagara"],
      github_url: "https://github.com/example",
      created_at: "2024-01-01T00:00:00Z",
    };
    const experience: WorkExperience[] = [{
      id: "experience-1",
      user_id: profile.id,
      kind: "work",
      title: "Controls Engineer",
      organization: "Example Controls",
      organization_url: null,
      location: "Phoenix, AZ",
      start_date: "2023-01-01",
      end_date: null,
      is_current: true,
      description: "Commissioning and integration.",
      tags: ["Niagara"],
      created_at: "2023-01-01T00:00:00Z",
      updated_at: "2023-01-01T00:00:00Z",
    }];
    const posts: PointStackPost[] = [{
      id: "post-1",
      author_id: profile.id,
      post_type: "discussion",
      title: "Commissioning field notes",
      content: "A concise record of lessons from the field.",
      slug: "commissioning-field-notes",
      is_published: true,
      is_pinned: false,
      view_count: 10,
      upvote_count: 3,
      comment_count: 2,
      tags: ["Commissioning"],
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
    }];
    const html = renderToStaticMarkup(<PublicProfile profile={profile} experience={experience} posts={posts} followers={2} following={1} />);
    expect(html).toContain(">About<");
    expect(html).toContain("Experience &amp; education");
    expect(html).toContain(">Skills<");
    expect(html).toContain("Professional details");
    expect(html).toContain("Recent activity");
    expect(html).toContain("Public activity");
  });

  it("uses a saved profile cover image instead of the fallback cover", () => {
    const html = renderToStaticMarkup(<PublicProfile
      profile={{ ...sparseProfile, cover_image_url: "https://example.com/cover.png" }}
      experience={[]}
      posts={[]}
      followers={0}
      following={0}
    />);
    expect(html).toContain('class="profile-cover profile-cover-image"');
    expect(html).toContain('src="https://example.com/cover.png"');
    expect(html).not.toContain("POINTSTACK / PRACTITIONER");
  });

  it("renders company memberships with their professional titles", () => {
    const companies: PointStackCompanyMember[] = [{
      id: "membership-1",
      company_id: "company-1",
      user_id: sparseProfile.id,
      role: "owner",
      title: "Owner",
      joined_at: "2024-01-01T00:00:00Z",
      company: {
        name: "BASidekick",
        slug: "basidekick",
        logo_url: null,
        is_verified: true,
      },
    }];
    const html = renderToStaticMarkup(<PublicProfile
      profile={sparseProfile}
      experience={[]}
      posts={[]}
      companies={companies}
      followers={0}
      following={0}
    />);
    expect(html).toContain(">Companies<");
    expect(html).toContain("BASidekick");
    expect(html).toContain(">Owner<");
    expect(html).toContain('href="/pointstack/companies/basidekick"');
  });
});
