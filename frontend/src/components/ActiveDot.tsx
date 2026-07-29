import { useTranslation } from "react-i18next";
import Dot from "./Dot";

type ActiveDotProps = {
  active: boolean;
};

export default function ActiveDot({ active }: ActiveDotProps) {
  const { t } = useTranslation("common");
  return (
    <Dot
      title={t(active ? "active" : "inactive")}
      color={active ? "success.main" : "error.main"}
    />
  );
}
