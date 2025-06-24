"use client";

import EventCUDialog from "@/components/events/EventCUDialog";
import { useEventSubscriber } from "@/hooks";
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
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import PopupState, { bindMenu, bindTrigger } from "material-ui-popup-state";
import { useFormatter, useNow, useTranslations } from "next-intl";
import { useSnackbar } from "notistack";
import {
  parseAsBoolean,
  parseAsString,
  parseAsStringLiteral,
  useQueryState,
} from "nuqs";
import "react-big-calendar/lib/sass/styles.scss";

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
    children: `${name.split(" ")[0][0]}${name.split(" ")[1][0]}`,
  };
}

export default function CollaborationPage() {
  useEventSubscriber();

  const t = useTranslations();

  const formatter = useFormatter();

  const now = useNow({
    updateInterval: 1000 * 10,
  });

  const [mode, setMode] = useQueryState(
    "mode",
    parseAsStringLiteral(["CREATE", "UPDATE"]).withDefault("CREATE")
  );
  const [id, setId] = useQueryState("id", parseAsString);
  const [open, setOpen] = useQueryState(
    "open",
    parseAsBoolean.withDefault(false)
  );

  const { enqueueSnackbar } = useSnackbar();

  const { data: events = [] } = trpc.eventsRouter.list.useQuery(undefined, {});

  const {
    mutate: cancelEventMutation,
    isPending: isCancelEventMutationPending,
  } = trpc.eventsRouter.cancel.useMutation({
    onSuccess() {
      enqueueSnackbar({
        variant: "success",
        message: "Event successfully canceled.",
      });
    },
    onError() {
      enqueueSnackbar({
        variant: "error",
        message: "Event cancellation failed.",
      });
    },
  });

  return (
    <Grid container flexDirection="column" height="100%">
      <EventCUDialog
        id={id ?? undefined}
        mode={mode}
        open={open}
        close={() => setOpen(false)}
      />
      <Grid container position="relative">
        <Typography marginBottom={4} variant="h4">
          {t("collaboration.collaboration")}
        </Typography>
        <ButtonGroup
          variant="contained"
          sx={{ position: "absolute", right: 0 }}
        >
          <Button
            onClick={() => {
              setOpen(true);
              setMode("CREATE");
            }}
            startIcon={<Add />}
          >
            Create Event
          </Button>
        </ButtonGroup>
      </Grid>
      <Paper sx={{ flex: 1 }} elevation={2}>
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
                          Meeting absagen
                        </MenuItem>
                        <MenuItem
                          onClick={() => {
                            setOpen(true);
                            setMode("UPDATE");
                            setId(event.id);
                            popupState.close();
                          }}
                        >
                          Meeting ändern
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
                      <IconButton {...bindTrigger(popupState)}>
                        <MoreVert />
                      </IconButton>
                    </>
                  )}
                </PopupState>
              }
              divider
              key={event.id}
            >
              <ListItemText primary={event.status} />
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
                <AvatarGroup
                  renderSurplus={(surplus) => (
                    <>
                      +
                      {formatter.number(surplus, {
                        compactDisplay: "short",
                        maximumSignificantDigits: 1,
                      })}
                    </>
                  )}
                  total={event.attendees.length}
                >
                  {[{ user: event.creator }, ...event.attendees].map(
                    (attendee) => (
                      <Avatar
                        key={attendee.user.id}
                        {...stringAvatar(attendee.user.name ?? "-")}
                      />
                    )
                  )}
                </AvatarGroup>
              </ListItemAvatar>
              <ListItemText
                sx={{
                  display: { xs: "none", s: "none", md: "none", lg: "block" },
                }}
                primary={event.role}
              />
              <ListItemText>
                <TextField
                  sx={{
                    display: { xs: "none", s: "none", md: "none", lg: "block" },
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
              </ListItemText>
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
      </Paper>
    </Grid>
  );
}
