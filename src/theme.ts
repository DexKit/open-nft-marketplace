import { Theme } from '@mui/material/styles';

import defaultTheme from './themes/index';
import kittygotchiTheme from './themes/kittygotchi';

const themes: { [key: string]: Theme } = {
  'default-theme': defaultTheme,
  'kittygotchi': kittygotchiTheme
};

export function getTheme(name: string) {
  return themes[name];
}
