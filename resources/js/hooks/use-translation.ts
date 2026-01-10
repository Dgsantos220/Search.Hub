import { usePage } from "@inertiajs/react";
import { translations } from "@/lib/i18n";

export function useTranslation(overrideLang?: string) {
    const { auth } = usePage().props as any;
    const lang = overrideLang || auth?.language || 'pt-BR';

    function t(path: string) {
        const keys = path.split('.');
        let current = translations[lang] || translations['pt-BR'];

        for (const key of keys) {
            if (current === undefined || current[key] === undefined) {
                // Fallback to pt-BR if key missing in current lang
                let fallback = translations['pt-BR'];
                for (const k of keys) {
                    if (fallback) fallback = fallback[k];
                }
                return fallback || path; // Return path if even fallback fails
            }
            current = current[key];
        }
        return current;
    }

    return { t, lang };
}
