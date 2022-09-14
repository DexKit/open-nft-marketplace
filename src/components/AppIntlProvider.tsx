import { useAtomValue } from 'jotai';
import { IntlProvider } from 'react-intl';
import { getAppConfig } from '../services/app';
import { localeAtom } from '../state/atoms';
import { loadLocaleData } from '../utils/intl';

interface Props {
  children?: React.ReactNode | React.ReactNode[];
}

const appConfig = getAppConfig();

function AppIntlProvider({ children }: Props) {
  const locale = useAtomValue(localeAtom);

  return (
    <IntlProvider
      locale={locale}
      defaultLocale={appConfig.locale}
      messages={loadLocaleData(locale)}
    >
      {children}
    </IntlProvider>
  );
}

export default AppIntlProvider;
