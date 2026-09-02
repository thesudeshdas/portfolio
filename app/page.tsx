import V2BodyClass from '@/components/V2BodyClass/V2BodyClass';
import V2Experience from '@/components/V2Experience/V2Experience';
import { getAllProjects } from '@/lib/projects';
import { getAllV2Writings } from '@/lib/v2-writings';

export default async function HomePage() {
  const [projects, writings] = await Promise.all([
    getAllProjects(),
    getAllV2Writings()
  ]);

  return (
    <>
      <V2BodyClass />

      <V2Experience
        projects={projects}
        writings={writings}
      />
    </>
  );
}
