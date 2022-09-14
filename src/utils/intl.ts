import enUs from '../../compiled-lang/en-US.json';
import ptBR from '../../compiled-lang/pt-BR.json';
import esES from '../../compiled-lang/es-ES.json';

const isProduction = process.env.NODE_ENV === 'production';

const COMPILED_LANGS: { [key: string]: any } = {
  'en-US': isProduction ? enUs : enUs,
  'pt-BR': isProduction ? ptBR : ptBR,
  'es-ES': isProduction ? esES : esES,
};

export function loadLocaleData(locale: string) {
  return COMPILED_LANGS[locale];
}
