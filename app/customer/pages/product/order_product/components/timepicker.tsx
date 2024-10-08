import React, { useEffect, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { MobileTimePicker, MobileTimePickerProps } from "@mui/x-date-pickers/MobileTimePicker";
import { UseDateFieldProps } from "@mui/x-date-pickers/DateField";
import { BaseSingleInputFieldProps, DateValidationError, FieldSection } from "@mui/x-date-pickers/models";
import { supabase } from "@/lib/supabase";

interface ButtonFieldProps
  extends UseDateFieldProps<Dayjs, false>,
    BaseSingleInputFieldProps<Dayjs | null, Dayjs, FieldSection, false, DateValidationError> {
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

export default function PickerWithButtonField(props: PickerWithButtonFieldProps) {
  const [value, setValue] = React.useState<Dayjs | null>(dayjs()); // Initialize with current time
  const [currentTime, setCurrentTime] = React.useState<Dayjs>(dayjs()); // State to hold the current time
  const [openTime, setOpenTime] = useState<Dayjs | null>(null);
  const [closeTime, setCloseTime] = useState<Dayjs | null>(null);
  const [timeID, setTimeID] = useState<number | undefined>();

  // Fetch existing times when the modal is opened
  const fetchTimes = async () => {
    const { data, error } = await supabase.from("time").select("*").single(); // Fetch a single row

    if (error) {
      console.error("Error fetching times:", error);
      return;
    }

    if (data) {
      setTimeID(data.ResTime_ID);
      setOpenTime(dayjs(data.ResTime_On)); // Convert to Dayjs
      setCloseTime(dayjs(data.ResTime_Off)); // Convert to Dayjs
    }
  };

  useEffect(() => {
    fetchTimes(); // Fetch times when the modal is opened
  }, []);

  // Minimum selectable time logic
  const MinTime = openTime && currentTime.isBefore(openTime) ? openTime : currentTime.startOf("minute");

  // Maximum selectable time should be the closing time fetched from the database
  const MaxTime = closeTime ?? undefined; // Ensure it's either Dayjs or undefined

  React.useEffect(() => {
    const updateTime = () => setCurrentTime(dayjs()); // Update current time every minute
    const intervalId = setInterval(updateTime, 60000); // Update every minute

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, []);

  React.useEffect(() => {
    setValue(currentTime); // Update value when currentTime changes
  }, [currentTime]);

  const handleChange = (newValue: Dayjs | null) => {
    setValue(newValue);
    props.onChange(newValue);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <ButtonTimePicker
        label={value?.format("HH:mm") ?? null}
        value={value}
        defaultValue={currentTime}
        minTime={MinTime}
        maxTime={MaxTime}
        onChange={handleChange}
      />
    </LocalizationProvider>
  );
}
