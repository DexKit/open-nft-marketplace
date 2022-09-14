import { memo, useMemo } from 'react';
import { getAppConfig } from '../services/app';

const appConfig = getAppConfig();

function AppFeePercentageSpan() {
  const { fees } = appConfig;

  const feeTotal = useMemo(() => {
    if (fees) {
      return fees?.map((f) => f.amount_percentage).reduce((p, c) => p + c, 0);
    }

    return 0;
  }, [fees]);

  return <span>{feeTotal}%</span>;
}

export default memo(AppFeePercentageSpan);
