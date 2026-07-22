import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import enCommon from "./locales/en/common.json";
import itCommon from "./locales/it/common.json";
import enAuth from "./locales/en/auth.json";
import itAuth from "./locales/it/auth.json";
import enErrors from "./locales/en/errors.json";
import itErrors from "./locales/it/errors.json";
import itUser from "./locales/it/user.json";
import enUser from "./locales/en/user.json";
import itProject from "./locales/it/project.json";
import enProject from "./locales/en/project.json";
import itTicket from "./locales/it/ticket.json";
import enTicket from "./locales/en/ticket.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        auth: enAuth,
        common: enCommon,
        errors: enErrors,
        user: enUser,
        project: enProject,
        ticket: enTicket,
      },
      it: {
        auth: itAuth,
        common: itCommon,
        errors: itErrors,
        user: itUser,
        project: itProject,
        ticket: itTicket,
      },
    },
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
