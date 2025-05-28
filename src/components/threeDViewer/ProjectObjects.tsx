import ProjectObject from "./ProjectObject";
import { useViewerStore } from "./ViewerProvider";

export default function ProjectObjects() {
  const projectObjects = useViewerStore((state) => state.projectObjects.value);

  return projectObjects.map((projectObject) => (
    <ProjectObject key={projectObject.id} projectObject={projectObject} />
  ));
}
