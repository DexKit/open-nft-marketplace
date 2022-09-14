import { AppConfig } from '../types/config';

import appConfigJson from '../../config/app.json';

export function getAppConfig(): AppConfig {
  return appConfigJson as AppConfig;
}
