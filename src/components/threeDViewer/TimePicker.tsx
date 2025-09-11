import { DateTimePicker } from "@mui/x-date-pickers";
import { JulianDate } from "cesium";
import dayjs, { Dayjs } from "dayjs";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useCesium } from "resium";

export default function TimePicker() {
  const { viewer } = useCesium();

  const t = useTranslations();

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
      label={t("editor.time")}
      onChange={(date) => {
        if (!date) return;

        setDateTime(date);
      }}
      formatDensity="dense"
    />
  );
}
