import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Box, Divider, IconButton, Stack, Typography } from '@mui/material';
import React from 'react';
import Funnel from './icons/Filter';
import SidebarFiltersContent from './SidebarFiltersContent';

interface Props {
  title: React.ReactNode | React.ReactNode[];
  children?: React.ReactNode | React.ReactNode[];
  onClose?: () => void;
}

export default function SidebarFilters({ onClose, title, children }: Props) {
  return (
    <Box
      sx={{
        backgroundColor: (theme) => theme.palette.background.paper,
        height: '100%',
      }}
    >
      <SidebarFiltersContent>
        <Stack
          direction="row"
          alignItems="center"
          alignContent="center"
          justifyContent="space-between"
        >
          <Stack direction="row" alignItems="center" alignContent="center">
            <Funnel color="primary" />
            <Typography sx={{ fontWeight: 600 }} variant="subtitle1">
              {title}
            </Typography>
          </Stack>
          {onClose && (
            <IconButton onClick={onClose}>
              <ArrowBackIcon />
            </IconButton>
          )}
        </Stack>
      </SidebarFiltersContent>
      <Divider />
      {children}
    </Box>
  );
}
