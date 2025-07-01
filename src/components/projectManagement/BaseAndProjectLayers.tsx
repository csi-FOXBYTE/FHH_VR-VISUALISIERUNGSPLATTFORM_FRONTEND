"use client";

import { useForm } from "react-hook-form";
import useDataGridServerSideHelper from "../dataGridServerSide/useDataGridServerSideOptions";
import { AppFormFactory } from "../formFactory/AppFormFactory";

export default function BaseAndProjectLayers() {
  const { props } = useDataGridServerSideHelper(
    "project-management-base-and-project-layers"
  );

  const form = useForm({
    defaultValues: {
      left: "",
      right: "",
    },
  });

  return (
    <AppFormFactory
      form={form}
      model={[
        {
          name: "left",
          props: {
            label: "Left",
          },
          type: "text",
          onDepenciesChanged: () => {

          },
          dependencies: [],
        },
        {
          name: "right",
          props: {
            label: "Right",
          },
          type: "text",
          dependencies: [],
        },
      ]}
      structure={[
        {
          type: "split",
          children: [
            {
              type: "node",
              targetKey: "left",
            },
            {
              type: "node",
              targetKey: "right",
            },
          ],
        },
      ]}
    />
  );
}
