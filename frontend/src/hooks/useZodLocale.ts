// hooks/useZodLocale.ts
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import * as z from "zod";

export function useZodLocale() {
  const { t, i18n } = useTranslation("errors");

  useEffect(() => {
    z.config({
      customError(issue) {
        switch (issue.code) {
          case "invalid_format":
            if (issue.format === "email") {
              return { message: t("invalidEmail") };
            }
            break;
          case "too_small":
            if (issue.origin === "string") {
              return {
                message: t("minLength", {
                  count: issue.minimum,
                }),
              };
            }
            break;
          case "invalid_type":
            return {
              message: t("invalidType"),
            };
          case "invalid_value":
            return {
              message: t("invalidValue"),
            };
        }
      },
    });
  }, [i18n.language, t]);
}
