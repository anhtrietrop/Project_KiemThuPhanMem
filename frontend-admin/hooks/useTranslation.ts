import { translations, TranslationKey } from '@/lib/translations';

export const useTranslation = () => {
    const t = (key: TranslationKey): string => {
        return translations[key];
    };

    return { t };
};
