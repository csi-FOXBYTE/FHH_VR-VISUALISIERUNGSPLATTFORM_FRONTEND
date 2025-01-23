import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { trpc } from "@/server/trpc/client";
import Tooltip from "@mui/material/Tooltip";

interface ParticipantSelectionProps {
  projectId: string;
  value: string;
  onChange: (event: React.ChangeEvent<unknown>, value: string) => void;
  label: string;
}

//TODO: unabhänhig von Participants machen
export default function ParticipantSelection({
  projectId,
  value,
  onChange,
  label,
}: ParticipantSelectionProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: project, isLoading } =
    trpc.projectRouter.searchParticipants.useQuery(
      { projectId, name: searchTerm },
      {
        enabled: searchTerm.length > 0,
        staleTime: 60 * 1000,
      }
    );
  const options =
    project?.participants.map((participant) => ({
      id: participant.id,
      label: participant.name,
      email: participant.email,
    })) || [];

  return (
    <Autocomplete
      id="participant-selection"
      options={options}
      loading={isLoading}
      value={options.find((option) => option.id === value) || null}
      onInputChange={(event, newInputValue) => {
        setSearchTerm(newInputValue);
      }}
      onChange={(event, newValue) => {
        onChange(event, newValue?.id || "");
      }}
      renderInput={(params) => (
        <TextField {...params} label={label} variant="outlined" />
      )}
      renderOption={(props, option) => (
        <Tooltip title={option.email} arrow>
          <li {...props}>{option.label}</li>
        </Tooltip>
      )}
    />
  );
}
