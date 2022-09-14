import moment from 'moment';
import { memo } from 'react';

export function DatetimeFromNowSpan({
  value,
}: {
  value: number;
  format?: string;
}) {
  return <span>{moment(new Date(value)).fromNow()}</span>;
}

export default memo(DatetimeFromNowSpan);
