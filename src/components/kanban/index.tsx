import { useMemo, useRef } from "react";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { Droppable } from "./Droppable";
import { Draggable } from "./Draggable";

export default function Kanban<
  D extends Record<string, any>,
  C extends Column<D>
>({
  data,
  columns,
  groupField,
  stateField,
  onChange,
  idField,
}: {
  data: D[];
  groupField: keyof D;
  stateField: keyof D;
  columns: C[];
  onChange: (data: D[]) => void;
  idField: keyof D;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  const grouped = useMemo(() => {
    const stateMap = new Map<
      string,
      { column: C; groupData: Map<string, D[]> }
    >();

    for (const column of columns) {
      stateMap.set(column.key, { column, groupData: new Map() });
    }

    for (const record of data) {
      const groupData =
        stateMap.get(record[stateField])!.groupData.get(record[groupField]) ??
        [];

      groupData.push(record);

      stateMap
        .get(record[stateField])!
        .groupData.set(record[groupField], groupData);
    }

    return stateMap;
  }, [columns, data, stateField, groupField]);

  const handleDragEnd = (event: DragEndEvent) => {
    onChange(
      data.map((record) => {
        if (
          String(record[idField]) === event.active.id &&
          event.over !== null
        ) {
          return {
            ...record,
            [stateField]: event.over.id as any,
          };
        }

        return record;
      })
    );

    console.log(
      data.map((record) => {
        if (record[idField] === event.active.id && event.over !== null) {
          return {
            ...record,
            [stateField]: event.over.id as any,
          };
        }

        return record;
      })
    );
  };

  return (
    <div style={{ overflow: "hidden" }}>
      <div style={{ display: "flex", gap: 16 }}>
        {columns.map((column) => (
          <div key={column.key} style={{ flex: "1" }}>
            {column.title}
          </div>
        ))}
      </div>
      <div ref={containerRef} style={{ display: "flex", gap: 16 }}>
        <DndContext onDragEnd={handleDragEnd}>
          {Array.from(grouped.entries()).map(
            ([state, { column, groupData }]) => (
              <div key={state} style={{ flex: 1, display: "flex", border: "1px solid red", flexDirection: "column", padding: 8, gap: 4 }}>
                {Array.from(groupData.entries()).map(([group, data]) => (
                  <Droppable key={state} state={state} group={group}>
                    {data.map((record) => (
                      <Draggable
                        key={record[idField]}
                        id={record[idField]}
                        column={column}
                        record={record}
                      />
                    ))}
                  </Droppable>
                ))}
              </div>
            )
          )}
        </DndContext>
      </div>
    </div>
  );
}
