import type { ITranslator, Locale } from "../../types/platform";
import { telemetry } from "../observability/observability-platform";

/**
 * Technical Translator Platform Service.
 * Implements the ITranslator contract to coordinate multi-language support (English & Indonesian).
 * Uses a modular catalog design to support loading external dictionaries in the future.
 */
export class Translator implements ITranslator {
  private currentLocale: Locale = "en";

  // Pre-loaded high-contrast technical brand copy catalogs
  private catalogs: Record<Locale, Record<string, string>> = {
    en: {
      "nav.home": "Home",
      "nav.projects": "Systems",
      "nav.blog": "Notebook",
      "nav.timeline": "Timeline",
      "nav.assistant": "Assistant",
      "chat.placeholder": "Query Virtual Cole...",
      "chat.welcome": "System online. I am Virtual Cole, grounded inside Cole.dev context database. Ask me about systems architecture, technical ADRs, codebases, or professional experience.",
      "error.general": "System encountered an anomaly. File report generated.",
    },
    id: {
      "nav.home": "Beranda",
      "nav.projects": "Sistem",
      "nav.blog": "Catatan",
      "nav.timeline": "Kronologi",
      "nav.assistant": "Asisten",
      "chat.placeholder": "Tanya Virtual Cole...",
      "chat.welcome": "Sistem aktif. Saya Virtual Cole, terintegrasi dengan database konteks Cole.dev. Tanyakan saya tentang arsitektur sistem, dokumen teknis ADR, atau pengalaman profesional.",
      "error.general": "Sistem mendeteksi anomali. Laporan kegagalan telah disimpan.",
    },
  };

  getLocale(): Locale {
    return this.currentLocale;
  }

  setLocale(locale: Locale): void {
    this.currentLocale = locale;
    telemetry.info(`System locale shifted to: ${locale.toUpperCase()}`);
  }

  translate(key: string, variables?: Record<string, string>): string {
    const catalog = this.catalogs[this.currentLocale];
    let translation = catalog[key] || key;

    // Inject variable parameters (e.g. {name} -> 'Cole')
    if (variables) {
      Object.entries(variables).forEach(([k, v]) => {
        translation = translation.replace(new RegExp(`{${k}}`, "g"), v);
      });
    }

    return translation;
  }
}

export const translator = new Translator();
export default translator;
