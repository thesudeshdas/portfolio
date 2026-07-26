import V2Experience from '@/components/V2Experience/V2Experience';
import { getAllProjects } from '@/lib/projects';

export default async function V2Page() {
  const projects = await getAllProjects();

  return <V2Experience projects={projects} />;
}
