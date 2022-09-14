import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import moment from 'moment';
import { useState } from 'react';
import { MIN_ORDER_DATE_TIME } from '../../../constants';

export const GET_OPTIONS = (): moment.Duration[] => {
  return [
    MIN_ORDER_DATE_TIME,
    moment.duration(1, 'day'),
    moment.duration(3, 'days'),
    moment.duration(1, 'week'),
    moment.duration(1, 'month'),
    moment.duration(3, 'months'),
    moment.duration(6, 'months'),
  ];
};

interface Props {
  label?: React.ReactNode | React.ReactNode[];
  options?: moment.Duration[];
  onChange: (date: moment.Duration | null) => void;
}

export function DurationSelect({
  label,
  options = GET_OPTIONS(),
  onChange,
}: Props) {
  const [value, setValue] = useState(0);

  const handleChange = (e: SelectChangeEvent<number>) => {
    if (typeof e.target.value == 'number') {
      onChange(options[e.target.value]);
      setValue(e.target.value);
    }
  };

  return (
    <FormControl fullWidth>
      <InputLabel>{label}</InputLabel>
      <Select label={label} value={value} onChange={handleChange} fullWidth>
        {options.map((opt, index: number) => (
          <MenuItem key={index} value={index}>
            {opt.humanize()}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export default DurationSelect;
