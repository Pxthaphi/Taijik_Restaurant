import React, { useEffect, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc"; // ใช้สำหรับจัดการเวลาในรูปแบบ UTC
import timezonePlugin from "dayjs/plugin/timezone"; // ใช้สำหรับแปลงโซนเวลา
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import {
  MobileTimePicker,
  MobileTimePickerProps,
} from "@mui/x-date-pickers/MobileTimePicker";
import { UseDateFieldProps } from "@mui/x-date-pickers/DateField";
import {
  BaseSingleInputFieldProps,
  DateValidationError,
  FieldSection,
} from "@mui/x-date-pickers/models";
import { supabase } from "@/lib/supabase";

// ตั้งค่า Dayjs ให้รองรับ UTC และ Timezone
dayjs.extend(utc);
dayjs.extend(timezonePlugin);

const THAI_TIMEZONE = "Asia/Bangkok"; // Thailand's timezone (UTC+7)

interface ButtonFieldProps
  extends UseDateFieldProps<Dayjs, false>,
    BaseSingleInputFieldProps<
      Dayjs | null,
      Dayjs,
      FieldSection,
      false,
      DateValidationError
    > {
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

function ButtonField(props: ButtonFieldProps) {
  const {
    setOpen,
    label,
    id,
    disabled,
    inputProps: { "aria-label": ariaLabel } = {},
  } = props;

  const buttonStyles = {
    borderRadius: "14px",
    padding: "8px 16px",
    cursor: "pointer",
    backgroundColor: disabled ? "#d3d3d3" : "#48BD4C",
    color: disabled ? "#000" : "#fff",
    fontFamily: "DB_v4",
    fontSize: "14px",
  };

  return (
    <div
      id={id}
      style={buttonStyles}
      aria-label={ariaLabel}
      onClick={() => setOpen?.((prev) => !prev)}
    >
      {label ? `เวลา ${label} น.` : "เลือกเวลา"}
    </div>
  );
}

function ButtonTimePicker(
  props: Omit<MobileTimePickerProps<Dayjs>, "open" | "onOpen" | "onClose">
) {
  const [open, setOpen] = React.useState(false);

  return (
    <MobileTimePicker
      slots={{ ...props.slots, field: ButtonField }}
      slotProps={{
        ...props.slotProps,
        field: { setOpen } as any,
        actionBar: { actions: [] },
      }}
      {...props}
      open={open}
      ampm={false}
      closeOnSelect
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
    />
  );
}

interface PickerWithButtonFieldProps {
  onChange: (newValue: Dayjs | null) => void;
}

export default function PickerWithButtonField(
  props: PickerWithButtonFieldProps
) {
  const [value, setValue] = React.useState<Dayjs | null>(
    dayjs().tz(THAI_TIMEZONE)
  ); // Initialize with current time in 'Asia/Bangkok'
  const [currentTime, setCurrentTime] = React.useState<Dayjs>(
    dayjs().tz(THAI_TIMEZONE)
  ); // State to hold the current time
  const [openTime, setOpenTime] = useState<Dayjs | null>(null);
  const [closeTime, setCloseTime] = useState<Dayjs | null>(null);
  const [timeID, setTimeID] = useState<number | undefined>();

  const fetchRestaurantTimes = async () => {
    try {
      const { data, error } = await supabase
        .from("time")
        .select("ResTime_On, ResTime_Off")
        .single();

      if (error) {
        console.error("Error fetching restaurant times:", error);
        return;
      }

      if (data) {
        const currentTime = dayjs.utc(); // เวลาปัจจุบันใน UTC

        // เวลาเปิดและปิดร้านที่ได้จากฐานข้อมูล
        const timeOpenFromDB = data.ResTime_On.replace("+00", ""); // ลบ +00 ออก
        const timeCloseFromDB = data.ResTime_Off.replace("+00", ""); // ลบ +00 ออก

        // สร้างเวลาเปิดและปิดใหม่โดยใช้ชั่วโมงและนาทีเท่านั้น
        const timeOpen = dayjs
          .utc(`${currentTime.format("YYYY-MM-DD")}T${timeOpenFromDB}Z`)
          .set("year", 2000)
          .set("month", 0)
          .set("date", 1)
          .tz(THAI_TIMEZONE); // Convert to Asia/Bangkok timezone

        let timeClose = dayjs
          .utc(`${currentTime.format("YYYY-MM-DD")}T${timeCloseFromDB}Z`)
          .set("year", 2000)
          .set("month", 0)
          .set("date", 1)
          .tz(THAI_TIMEZONE); // Convert to Asia/Bangkok timezone

        // กรณีที่เวลาปิดข้ามวัน
        if (timeClose.isBefore(timeOpen)) {
          // ถ้าเวลาปิดน้อยกว่าเวลาเปิด แปลว่าข้ามวัน
          timeClose = timeClose.add(1, "day"); // ขยับเวลาปิดไปวันถัดไป
        }

        setOpenTime(timeOpen); // เก็บค่าเวลาเปิดในสถานะ
        setCloseTime(timeClose); // เก็บค่าเวลาปิดในสถานะ

        console.log("Current Time (UTC):", currentTime.format("HH:mm")); // แสดงเวลาปัจจุบันในรูปแบบ HH:mm
        console.log("Time Open (Asia/Bangkok):", timeOpen.format("HH:mm")); // แสดงเวลาเปิดร้าน
        console.log("Time Close (Asia/Bangkok):", timeClose.format("HH:mm")); // แสดงเวลาปิดร้าน
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };

  useEffect(() => {
    fetchRestaurantTimes(); // Fetch times when the modal is opened
  }, []);

  // Minimum selectable time: Either the opening time or the current time, whichever is later
  const MinTime = openTime ? openTime : undefined;
  const MaxTime = closeTime ? closeTime : undefined;

  const handleChange = (newValue: Dayjs | null) => {
    if (!newValue) return; // Ensure newValue is not null

    // Convert the selected value to the 'Asia/Bangkok' timezone for comparison
    const newValueInTimezone = newValue.tz(THAI_TIMEZONE);

    // Log the times for debugging
    console.log("Selected Time:", newValueInTimezone?.format("HH:mm"));
    console.log("MinTime:", MinTime?.format("HH:mm"));
    console.log("MaxTime:", MaxTime?.format("HH:mm"));

    // Handle cross-midnight case
    if (MaxTime && MaxTime.isBefore(MinTime)) {
      // If the max time is technically after midnight, shift it forward by one day
      MaxTime.add(1, "day");
    }

    // Compare only time portion (ignoring date)
    const minTimeInTimezone = MinTime?.format("HH:mm");
    const maxTimeInTimezone = MaxTime?.format("HH:mm");
    const selectedTime = newValueInTimezone?.format("HH:mm");

    // Check if the selected time is within the allowed range (HH:mm)
    if (
      (minTimeInTimezone && selectedTime && selectedTime < minTimeInTimezone) ||
      (maxTimeInTimezone && selectedTime && selectedTime > maxTimeInTimezone)
    ) {
      console.error("Selected time is out of range.");
      return;
    }

    // Update the value state
    setValue(newValueInTimezone);
    props.onChange(newValueInTimezone);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <ButtonTimePicker
        label={value?.format("HH:mm") ?? null}
        value={value}
        defaultValue={currentTime}
        // If MinTime or MaxTime are null, pass undefined instead
        minTime={MinTime || undefined}
        maxTime={MaxTime || undefined}
        onChange={handleChange}
      />
    </LocalizationProvider>
  );
}
