"use client";

import PageContainer from "@/components/common/PageContainer";
import EventCUDialog, {
  useEventCUDialogState,
} from "@/components/events/EventCUDialog";
import { useEventSubscriber } from "@/hooks";
import usePermissions from "@/permissions/usePermissions";
import { getApis } from "@/server/gatewayApi/client";
import { Link } from "@/server/i18n/routing";
import { trpc } from "@/server/trpc/client";
import {
  Add,
  ArrowRightOutlined,
  CopyAll,
  MoreVert,
} from "@mui/icons-material";
import {
  Avatar,
  AvatarGroup,
  Box,
  Button,
  ButtonGroup,
  Grid,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Menu,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import PopupState, { bindMenu, bindTrigger } from "material-ui-popup-state";
import { useFormatter, useNow, useTranslations } from "next-intl";
import { useSnackbar } from "notistack";

function stringToColor(string: string) {
  let hash = 0;
  let i;

  /* eslint-disable no-bitwise */
  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = "#";

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  /* eslint-enable no-bitwise */

  return color;
}

function stringAvatar(name: string) {
  return {
    sx: {
      bgcolor: stringToColor(name),
    },
    children: `${name.split(" ")?.[0]?.[0]}${name.split(" ")?.[1]?.[0]}`,
  };
}

export default function CollaborationPage() {
  useEventSubscriber();

  const t = useTranslations();

  const formatter = useFormatter();

  const now = useNow({
    updateInterval: 1000 * 10,
  });

  const [, { openCreate, openUpdate }] = useEventCUDialogState();

  const { enqueueSnackbar } = useSnackbar();

  const { data: events = [] } = trpc.eventsRouter.list.useQuery(undefined, {});

  const utils = trpc.useUtils();

  const {
    mutate: cancelEventMutation,
    isPending: isCancelEventMutationPending,
  } = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const apis = await getApis();

      await apis.eventsApi.eventsIdDelete({ id });
    },
    onSuccess() {
      utils.eventsRouter.list.invalidate();
      enqueueSnackbar({
        variant: "success",
        message: t("generic.crud-notifications.update-success", {
          entity: t("entities.event"),
        }),
      });
    },
    onError() {
      enqueueSnackbar({
        variant: "error",
        message: t("generic.crud-notifications.update-failed", {
          entity: t("entities.event"),
        }),
      });
    },
  });

  const permissions = usePermissions();

  return (
    <PageContainer>
      <EventCUDialog />
      <Grid container position="relative">
        <Typography marginBottom={4} variant="h4">
          {t("collaboration.collaboration")}
        </Typography>
        <ButtonGroup
          variant="contained"
          sx={{ position: "absolute", right: 0 }}
          disabled={!permissions.includes("EVENT_OWNER")}
        >
          <Button onClick={openCreate} startIcon={<Add />}>
            {t("events.create-event")}
          </Button>
        </ButtonGroup>
      </Grid>
      <Box sx={{ flex: 1, overflowY: "auto" }}>
        {events.length === 0 ? (
          <Grid
            width="100%"
            height="100%"
            container
            justifyContent="center"
            alignContent="center"
          >
            <Typography variant="h4">{t("events.no-events")}</Typography>
          </Grid>
        ) : (
          <List disablePadding>
            {events.map((event) => (
              <ListItem
                secondaryAction={
                  <PopupState variant="popover" popupId="eventsMenu">
                    {(popupState) => (
                      <>
                        <Menu {...bindMenu(popupState)}>
                          <MenuItem
                            disabled={isCancelEventMutationPending}
                            onClick={() => {
                              cancelEventMutation(
                                { id: event.id },
                                {
                                  onSuccess: () => popupState.close(),
                                  onError: () => popupState.close(),
                                }
                              );
                            }}
                          >
                            {t("events.cancel-event")}
                          </MenuItem>
                          <MenuItem
                            onClick={() => {
                              openUpdate(event.id);
                              popupState.close();
                            }}
                          >
                            {t("events.update-event")}
                          </MenuItem>
                          <MenuItem
                            LinkComponent={Link}
                            disabled={event.projectId === null}
                            href={`/project-management/${event.projectId}`}
                            sx={{
                              display: {
                                xs: "block",
                                s: "block",
                                md: "block",
                                lg: "none",
                                xl: "none",
                              },
                            }}
                          >
                            {t("collaboration.to-project")}
                          </MenuItem>
                        </Menu>
                        <IconButton
                          disabled={
                            event.status === "CANCELED" ||
                            event.status === "END"
                          }
                          {...bindTrigger(popupState)}
                        >
                          <MoreVert />
                        </IconButton>
                      </>
                    )}
                  </PopupState>
                }
                divider
                key={event.id}
              >
                <ListItemText
                  primary={t(`enums.event-status.${event.status}`)}
                />
                <ListItemText
                  primary={event.title}
                  secondary={formatter.dateTimeRange(
                    event.startTime,
                    event.endTime,
                    {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                />
                <ListItemText>
                  {formatter.relativeTime(event.startTime, {
                    style: "long",
                    now,
                  })}
                </ListItemText>
                <ListItemAvatar
                  sx={{
                    display: { xs: "none", s: "none", md: "none", lg: "block" },
                  }}
                >
                  <AvatarGroup max={1}>
                    {[
                      { user: event.owner },
                      ...event.attendees,
                    ].map((attendee) => {
                      return (
                        <Avatar
                          key={attendee.user?.id ?? ""}
                          {...stringAvatar(attendee.user?.name ?? "-")}
                        />
                      );
                    })}
                  </AvatarGroup>
                </ListItemAvatar>
                <ListItemText
                  sx={{
                    display: { xs: "none", s: "none", md: "none", lg: "block" },
                  }}
                  primary={t(`enums.event-attendee-roles.${event.role}`)}
                />
                {/* <ListItemText>
                  <TextField
                    sx={{
                      display: {
                        xs: "none",
                        s: "none",
                        md: "none",
                        lg: "block",
                      },
                    }}
                    label={t("collaboration.code")}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              disabled={!event.joinCode}
                              onClick={() => {
                                if (!event.joinCode) return;

                                window.navigator.clipboard.writeText(
                                  event.joinCode
                                );
                                enqueueSnackbar({
                                  variant: "success",
                                  message: t(
                                    "collaboration.copied-to-clipboard-success"
                                  ),
                                });
                              }}
                            >
                              <CopyAll />
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                    value={event.joinCode ?? "-"}
                    disabled
                  />
                </ListItemText> */}
                <ListItemText
                  sx={{
                    display: { xs: "none", s: "none", md: "none", lg: "block" },
                  }}
                >
                  <Button
                    variant="contained"
                    endIcon={<ArrowRightOutlined />}
                    LinkComponent={Link}
                    disabled={event.projectId === null}
                    href={`/project-management/${event.projectId}`}
                  >
                    {t("collaboration.to-project")}
                  </Button>
                </ListItemText>
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </PageContainer>
  );
}
