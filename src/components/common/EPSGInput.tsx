import { Autocomplete, TextField } from "@mui/material";
import proj4List from "proj4-list";

const epsgValues = Object.values(proj4List)
  .map(([epsg, proj4]) => ({
    value: proj4,
    label: epsg,
  }))
  .sort((a, b) => a.label.localeCompare(b.label));

export default function EPSGInput({
  value,
  onChange,
}: {
  value: { value: string; label: string };
  onChange: (value: { value: string; label: string }) => void;
}) {
  return (
    <Autocomplete
      disablePortal
      renderInput={(params) => <TextField {...params} label="EPSG" />}
      value={value}
      disableClearable
      size="small"
      onChange={(_, newValue) => onChange(newValue)}
      options={epsgValues}
    />
  );
}
