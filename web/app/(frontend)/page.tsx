import Hero from "@/components/Hero";
import ResourceSection from "@/components/ResourceSection";
import { getResourceSections } from "@/lib/content";

// The collection's afterChange hook repaints this page the moment something
// is published. This is only a safety net in case a hook is ever missed.
export const revalidate = 60;

export default async function Home() {
  const sections = await getResourceSections();

  return (
    <main>
      <Hero />
      {sections.map((section) => (
        <ResourceSection key={section.id} section={section} />
      ))}
    </main>
  );
}
