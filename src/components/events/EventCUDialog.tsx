import { trpc } from "@/server/trpc/client";
import { skipToken } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useSnackbar } from "notistack";
import { useState } from "react";
import { EasyCUDialog, useEasyCUDialogState } from "../common/EasyCUDialog";
import { useTranslations } from "next-intl";

export const useEventCUDialogState = () =>
  useEasyCUDialogState("event-cu-dialog-state");

export default function EventCUDialog() {
  const [state, { close }] = useEventCUDialogState();

  const utils = trpc.useUtils();

  const t = useTranslations();

  const [searchAttendees, setSearchAttendees] = useState("");
  const [searchProjects, setSearchProjects] = useState("");

  const { data: possibleAttendees = [] } =
    trpc.eventsRouter.getPossibleAttendees.useQuery(
      state.open ? { search: searchAttendees } : skipToken
    );

  const { data: possibleProjects = [] } =
    trpc.eventsRouter.getPossibleProjects.useQuery(
      state.open ? { search: searchAttendees } : skipToken
    );

  const { data: initialEvent = null } =
    trpc.eventsRouter.getEventDetails.useQuery(
      state.open && state.mode === "UPDATE" && state.id !== undefined
        ? { id: state.id }
        : skipToken
    );

  const { enqueueSnackbar } = useSnackbar();

  const { mutate: createMutation, isPending: isCreateMutationPending } =
    trpc.eventsRouter.create.useMutation({
      onSuccess: () => {
        utils.eventsRouter.invalidate();
        enqueueSnackbar({
          variant: "success",
          message: t("generic.crud-notifications.create-success", {
            entity: t("entities.event"),
          }),
        });
        close();
      },
      onError: () => {
        enqueueSnackbar({
          variant: "error",
          message: t("generic.crud-notifications.create-failed", {
            entity: t("entities.event"),
          }),
        });
      },
    });
  const { mutate: updateMutation, isPending: isUpdateMutationPending } =
    trpc.eventsRouter.update.useMutation({
      onSuccess: () => {
        utils.eventsRouter.invalidate();
        enqueueSnackbar({
          variant: "success",
          message: t("generic.crud-notifications.update-success", {
            entity: t("entities.event"),
          }),
        });
        close();
      },
      onError: () => {
        enqueueSnackbar({
          variant: "error",
          message: t("generic.crud-notifications.update-failed", {
            entity: t("entities.event"),
          }),
        });
      },
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
        console.log(values);
        createMutation({
          attendees: values.attendees.map((attendee) => attendee.value),
          endTime: values.endTime,
          startTime: values.startTime,
          project: values.project?.value,
          title: values.title,
        });
      }}
      onUpdate={(values) => {
        if (!state.id) throw new Error("No id supplied!");
        updateMutation({
          attendees: values.attendees.map((attendee) => attendee.value),
          endTime: values.endTime,
          startTime: values.startTime,
          title: values.title,
          project: values.project?.value ?? null,
          id: state.id,
        });
      }}
      state={state}
      close={close}
      isLoading={isUpdateMutationPending || isCreateMutationPending}
      fetchedData={initialEvent}
      model={[
        {
          type: "text",
          name: "title",
          props: {
            label: t("events.title"),
          },
        },
        {
          type: "search",
          name: "project",
          props: {
            search: searchProjects,
            onSearchChange: setSearchProjects,
            multiple: false,
            options: possibleProjects,
            label: t("events.project"),
          },
        },
        {
          type: "search",
          name: "attendees",
          props: {
            search: searchAttendees,
            onSearchChange: setSearchAttendees,
            multiple: true,
            options: possibleAttendees,
            label: t("events.attendees"),
          },
        },
        {
          type: "dateTime",
          name: "startTime",
          props: {
            label: t("events.start-time"),
          },
        },
        {
          type: "dateTime",
          name: "endTime",
          props: {
            label: t("events.end-time"),
          },
        },
      ]}
    />
  );
}
