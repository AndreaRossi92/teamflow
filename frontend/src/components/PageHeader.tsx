import { Box, Typography } from "@mui/material";
import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
};
export default function PageHeader({
  title,
  subtitle,
  actions,
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
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 500 }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      </Box>
      {actions}
    </Box>
  );
}
