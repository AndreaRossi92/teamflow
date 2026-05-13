import { Box, Stack, Typography } from "@mui/material";
import type { ComponentProps, ReactNode } from "react";
import BackButton from "./BackButton";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  hideBackButton?: boolean;
  BackButtonProps?: ComponentProps<typeof BackButton>;
};
export default function PageHeader({
  title,
  subtitle,
  actions,
  hideBackButton,
  BackButtonProps,
}: PageHeaderProps) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: 3,
      }}
    >
      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
        {!hideBackButton && <BackButton {...BackButtonProps} />}
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 500 }}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        </Box>
      </Stack>
      {actions}
    </Box>
  );
}
