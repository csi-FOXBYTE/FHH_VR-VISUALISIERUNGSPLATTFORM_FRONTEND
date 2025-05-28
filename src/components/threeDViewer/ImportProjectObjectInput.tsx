import { useViewerStore } from "./ViewerProvider";

export default function ImportProjectObjectInput({
  onFinished,
}: {
  onFinished?: () => void;
}) {
  const setProjectObjects = useViewerStore((state) => state.projectObjects.set);
  const projectObjects = useViewerStore((state) => state.projectObjects.value);

  return (
    <input
      type="file"
      style={{ display: "none" }}
      onChange={async (event) => {
        const file = event.target.files?.[0];

        if (!file) return;

        const buffer = await file.arrayBuffer();

        setProjectObjects([
          ...projectObjects,
          {
            fileContent: Buffer.from(buffer),
            id: crypto.randomUUID(),
            metaData: {},
            scale: { x: 1, y: 1, z: 1 },
            rotation: { x: 1, y: 0, z: 0, w: 0 },
            translation: { x: 0, y: 0, z: 0 },
            name: file.name,
            visible: true,
            type: "PROJECT_OBJECT",
          },
        ]);

        onFinished?.();
      }}
    />
  );
}
