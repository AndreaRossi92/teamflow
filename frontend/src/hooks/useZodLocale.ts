// hooks/useZodLocale.ts
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import * as z from "zod";

export function useZodLocale() {
  const { t, i18n } = useTranslation("errors");

  useEffect(() => {
    z.config({
      customError(issue) {
        console.log(issue);
        switch (issue.code) {
          case "invalid_format":
            if (issue.format === "email") {
              console.log("Hello", t("invalidEmail"));
              return { message: t("invalidEmail") };
            }
            break;
          case "too_small":
            if (issue.origin === "string") {
              return {
                message: t("minLength", {
                  minimum: issue.minimum,
                }),
              };
            }
            break;
        }
      },
    });
  }, [i18n.language, t]);
}
