import * as React from "react";
import { Dayjs } from "dayjs";
import dayjs from "dayjs";
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
      closeOnSelect={true}
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
    />
  );
}

interface PickerWithButtonFieldProps {
  onChange: (newValue: Dayjs | null) => void;
}

export default function PickerWithButtonField(props: PickerWithButtonFieldProps) {
  const [value, setValue] = React.useState<Dayjs | null>(null);
  const MinTime = dayjs().set("hour", 9).startOf("hour");
  const MaxTime = dayjs().set("hour", 22).startOf("hour");

  const handleChange = (newValue: Dayjs | null) => {
    setValue(newValue);
    props.onChange(newValue); // Send selected time back to parent component
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <ButtonTimePicker
        label={value == null ? null : value.format("HH:mm")}
        value={value}
        defaultValue={MinTime}
        minTime={MinTime}
        maxTime={MaxTime}
        onChange={handleChange} // Call handleChange when a new time is selected
      />
    </LocalizationProvider>
  );
}
