import enUs from '../../compiled-lang/en-US.json';
import ptBR from '../../compiled-lang/pt-BR.json';
import esES from '../../compiled-lang/es-ES.json';
import csCZ from '../../compiled-lang/cs-CZ.json';

const isProduction = process.env.NODE_ENV === 'production';

const COMPILED_LANGS: { [key: string]: any } = {
  'en-US': isProduction ? enUs : enUs,
  'pt-BR': isProduction ? ptBR : ptBR,
  'es-ES': isProduction ? esES : esES,
  'cs-CZ': isProduction ? csCZ : csCZ,
};

export function loadLocaleData(locale: string) {
  return COMPILED_LANGS[locale];
}
