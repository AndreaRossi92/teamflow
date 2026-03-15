import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import enCommon from "./locales/en/common.json";
import enGenerateTicket from "./locales/en/generateTicket.json";
import itCommon from "./locales/it/common.json";
import itGenerateTicket from "./locales/it/generateTicket.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: enCommon,
        generateTicket: enGenerateTicket,
      },
      it: {
        common: itCommon,
        generateTicket: itGenerateTicket,
      },
    },
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
