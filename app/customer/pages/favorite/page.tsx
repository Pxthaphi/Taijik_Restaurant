'use client'
import * as React from 'react';
import { Dayjs } from 'dayjs';
import dayjs from "dayjs";
import Button from '@mui/material/Button';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { MobileTimePicker, MobileTimePickerProps } from '@mui/x-date-pickers/MobileTimePicker';
import { UseDateFieldProps } from '@mui/x-date-pickers/DateField';
import {
  BaseSingleInputFieldProps,
  DateValidationError,
  FieldSection,
} from '@mui/x-date-pickers/models';


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
    InputProps: { ref } = {},
    inputProps: { 'aria-label': ariaLabel } = {},
  } = props;

  return (
    <Button
      variant="outlined"
      id={id}
      disabled={disabled}
      ref={ref}
      aria-label={ariaLabel}
      onClick={() => setOpen?.((prev) => !prev)}
    >
      {label ? `Current time: ${label}` : 'Pick a time'}
    </Button>
  );
}

function ButtonTimePicker(
  props: Omit<MobileTimePickerProps<Dayjs>, 'open' | 'onOpen' | 'onClose'>,
) {
  const [open, setOpen] = React.useState(false);

  return (
    <MobileTimePicker
      slots={{ ...props.slots, field: ButtonField }}
      slotProps={{ ...props.slotProps, field: { setOpen } as any ,actionBar: { actions: [] },}}
      {...props}
      open={open}
      ampm={false}
      closeOnSelect={true}
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
    />
  );
}

export default function PickerWithButtonField() {
  const [value, setValue] = React.useState<Dayjs | null>(null);
  const MinTime = dayjs().set("hour", 9).startOf("hour");
  const MaxTime = dayjs().set("hour", 22).startOf("hour");

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <ButtonTimePicker
        label={value == null ? null : value.format("HH:mm")}
        value={value}
        defaultValue={MinTime}
        minTime={MinTime}
        maxTime={MaxTime}
        onChange={(newValue) => setValue(newValue)}
      />
    </LocalizationProvider>
  );
}
