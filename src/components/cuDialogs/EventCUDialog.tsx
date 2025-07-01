import { trpc } from "@/server/trpc/client";
import { skipToken } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useSnackbar } from "notistack";
import { useState } from "react";
import { EasyCUDialog } from "../common/EasyCUDialog";

export default function EventCUDialog({
  open,
  close,
  mode,
  id,
}: {
  open: boolean;
  close: () => void;
  mode: "CREATE" | "UPDATE";
  id?: string;
}) {
  const [searchAttendees, setSearchAttendees] = useState("");
  const [searchProjects, setSearchProjects] = useState("");

  const { data: possibleAttendees = [] } =
    trpc.eventsRouter.getPossibleAttendees.useQuery(
      open ? { search: searchAttendees } : skipToken
    );

  const { data: possibleProjects = [] } =
    trpc.eventsRouter.getPossibleProjects.useQuery(
      open ? { search: searchAttendees } : skipToken
    );

  const { data: initialEvent = null } =
    trpc.eventsRouter.getEventDetails.useQuery(
      open && mode === "UPDATE" && id !== undefined ? { id } : skipToken
    );

  const { enqueueSnackbar } = useSnackbar();

  const { mutate: createMutation, isPending: isCreateMutationPending } =
    trpc.eventsRouter.create.useMutation({
      onSuccess: () =>
        enqueueSnackbar({
          variant: "success",
          message: "Successfully created event!",
        }),
      onError: (err) => {
        enqueueSnackbar({
          variant: "error",
          message: "Failed to create event!",
        });
        console.error(err);
      },
    });
  const { mutate: updateMutation, isPending: isUpdateMutationPending } =
    trpc.eventsRouter.update.useMutation({
      onSuccess: () =>
        enqueueSnackbar({
          variant: "success",
          message: "Successfully updated event!",
        }),
      onError: () =>
        enqueueSnackbar({
          variant: "error",
          message: "Failed to update event!",
        }),
    });

  return (
    <EasyCUDialog
      defaultData={{
        attendees: [] as typeof possibleAttendees,
        title: "",
        endTime: dayjs().add(30, "minute").toDate(),
        project: null as (typeof possibleProjects)[number] | null,
        startTime: new Date(),
      }}
      onCreate={(values) => {
        createMutation({
          attendees: values.attendees.map((attendee) => attendee.value),
          endTime: values.endTime,
          startTime: values.startTime,
          project: values.project?.value,
          title: values.title,
        });
      }}
      onUpdate={(values) => {
        if (!id) throw new Error("No id supplied!");
        updateMutation({
          attendees: values.attendees.map((attendee) => attendee.value),
          endTime: values.endTime,
          startTime: values.startTime,
          title: values.title,
          project: values.project?.value ?? null,
          id,
        });
      }}
      close={close}
      entity="Project"
      isLoading={isUpdateMutationPending || isCreateMutationPending}
      open={open}
      mode="CREATE"
      fetchedData={initialEvent}
      model={[
        {
          type: "text",
          name: "title",
          props: {
            label: "Title",
          },
        },
        {
          type: "search",
          name: "project",
          props: {
            search: searchProjects,
            onSearchChange: setSearchProjects,
            options: possibleProjects,
            label: "Project",
          },
        },
        {
          type: "search",
          name: "attendees",
          props: {
            search: searchAttendees,
            onSearchChange: setSearchAttendees,
            options: possibleAttendees,
            label: "Attendees",
          },
        },
        {
          type: "dateTime",
          name: "startTime",
          props: {
            label: "Start Time",
          },
        },
        {
          type: "dateTime",
          name: "endTime",
          props: {
            label: "End Time",
          },
        },
      ]}
    />
  );
}
