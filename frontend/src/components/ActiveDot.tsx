import { Box, Tooltip, type BoxProps } from "@mui/material";
import { useTranslation } from "react-i18next";

type ActiveDotProps = BoxProps & {
  active: boolean;
};

export default function ActiveDot({ active, sx, ...props }: ActiveDotProps) {
  const { t } = useTranslation();
  return (
    <Tooltip title={t(active ? "active" : "inactive")}>
      <Box
        sx={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          bgcolor: active ? "success.main" : "error.main",
          ...sx,
        }}
        {...props}
      />
    </Tooltip>
  );
}
