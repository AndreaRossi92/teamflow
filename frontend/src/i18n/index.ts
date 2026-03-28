import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import enCommon from "./locales/en/common.json";
import enGenerateTicket from "./locales/en/generateTicket.json";
import itCommon from "./locales/it/common.json";
import itGenerateTicket from "./locales/it/generateTicket.json";
import enAuth from "./locales/en/auth.json";
import itAuth from "./locales/it/auth.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        auth: enAuth,
        common: enCommon,
        generateTicket: enGenerateTicket,
      },
      it: {
        auth: itAuth,
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
