import { ArrowBack } from "@mui/icons-material";
import { IconButton, type IconButtonProps } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

type BackButtonProps = Omit<IconButtonProps, "onClick"> & {
  path?: string;
  replace?: boolean;
};
export default function BackButton({
  path,
  replace,
  ...props
}: BackButtonProps) {
  const { t } = useTranslation("common");
  const navigate = useNavigate();

  return (
    <IconButton
      title={t("back")}
      onClick={() => (path ? navigate(path, { replace }) : navigate(-1))}
      {...props}
    >
      <ArrowBack />
    </IconButton>
  );
}
