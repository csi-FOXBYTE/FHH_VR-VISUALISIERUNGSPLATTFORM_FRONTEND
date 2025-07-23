import { DateTimePicker } from "@mui/x-date-pickers";
import { JulianDate } from "cesium";
import { useEffect, useState } from "react";
import { useCesium } from "resium";
import dayjs, { Dayjs } from "dayjs";
import { Grid } from "@mui/material";

export default function TimePicker() {
  const { viewer } = useCesium();

  const [dateTime, setDateTime] = useState<Dayjs | undefined>(undefined);

  useEffect(() => {
    if (!viewer || dateTime !== undefined) return;

    const date = dayjs(JulianDate.toDate(viewer.clock.currentTime));

    setDateTime(dayjs(date));
  }, [dateTime, viewer]);

  useEffect(() => {
    if (dateTime === undefined || !viewer) return;

    viewer.clock.currentTime = JulianDate.fromDate(dateTime.toDate());
  }, [dateTime, viewer]);

  return (
    <DateTimePicker
      value={dateTime ?? dayjs()}
      label="Time"
      onChange={(date) => {
        if (!date) return;

        setDateTime(date);
      }}
      formatDensity="dense"
    />
  );
}
