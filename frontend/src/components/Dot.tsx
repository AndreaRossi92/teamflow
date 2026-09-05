import { Box, Tooltip } from "@mui/material";

type Dot = {
  title?: string;
  color: string;
};

export default function Dot({ title, color }: Dot) {
  return (
    <Tooltip title={title}>
      <Box
        sx={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          bgcolor: color,
          flexShrink: 0,
        }}
      />
    </Tooltip>
  );
}
