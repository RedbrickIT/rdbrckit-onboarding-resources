import Hero from "@/components/Hero";
import ResourceSection from "@/components/ResourceSection";
import { getResourceSections } from "@/lib/strapi";

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
