import { useAtomValue } from 'jotai';
import moment from 'moment';
import { memo } from 'react';
import { localeAtom } from '../state/atoms';

interface Props {
  from: moment.Moment;
}

function MomentFromNow({ from }: Props) {
  const locale = useAtomValue(localeAtom);
  const datetime = moment(from);

  datetime.locale(locale);

  return <span>{datetime.fromNow()}</span>;
}

export default memo(MomentFromNow);
