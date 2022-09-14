import { Box } from '@mui/material';

interface Props {
  children?: React.ReactNode | React.ReactNode[];
}

export default function SidebarFiltersContent({ children }: Props) {
  return <Box sx={{ p: 2 }}>{children}</Box>;
}
