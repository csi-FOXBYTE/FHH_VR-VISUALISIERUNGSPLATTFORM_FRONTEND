import { DateTimePicker } from "@mui/x-date-pickers";
import { JulianDate } from "cesium";
import { useEffect, useState } from "react";
import { useCesium } from "resium";
import dayjs, { Dayjs } from "dayjs";

export default function TimePicker() {
  const { viewer } = useCesium();

  const [dateTime, setDateTime] = useState<Dayjs | undefined>(undefined);

  useEffect(() => {
    if (!viewer || dateTime !== undefined) return;

    const date = dayjs(JulianDate.toDate(viewer.clock.currentTime));

    setDateTime(dayjs(date));
  }, [viewer]);

  useEffect(() => {
    if (dateTime === undefined || !viewer) return;

    viewer.clock.currentTime = JulianDate.fromDate(dateTime.toDate());
  }, [dateTime]);

  return (
    <DateTimePicker
      sx={{
        position: "absolute",
        top: 8,
        left: "50%",
        transform: "translateX(-50%)",
        background: "white",
      }}
      label="Time"
      value={dateTime ?? dayjs()}
      onChange={(date) => {
        if (!date) return;

        setDateTime(date);
      }}
      formatDensity="dense"
    />
  );
}
