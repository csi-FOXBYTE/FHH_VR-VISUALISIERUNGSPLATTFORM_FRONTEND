import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@mui/material";
import { Key } from "react";

export function Draggable<D extends Record<string, unknown>, C extends Column<D>>({
  column,
  record,
  id,
}: {
  column: C;
  record: D;
  id: Key;
}) {
  const { setNodeRef, listeners, attributes, transform } = useDraggable({
    id: String(id),
  });
  

  return (
    <div ref={setNodeRef}>
      <Card
        {...listeners}
        {...attributes}
        style={{
          background: "white",
          color: "black",
          transform: CSS.Translate.toString(transform),
        }}
      >
        <CardContent>{column.render(record)}</CardContent>
      </Card>
    </div>
  );
}
