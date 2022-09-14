import { IconButton, IconButtonProps, Tooltip } from '@mui/material';
import { MouseEvent, useState } from 'react';

interface Props {
  iconButtonProps: IconButtonProps;
  tooltip?: string;
  activeTooltip?: string;
  children?: React.ReactNode | React.ReactNode[];
}

export function CopyIconButton(props: Props) {
  const { tooltip, activeTooltip, iconButtonProps, children } = props;
  const { onClick } = iconButtonProps;

  const [currentTooltip, setCurrentTooltip] = useState<string>(tooltip || '');

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    onClick!(e);
    setCurrentTooltip(activeTooltip || '');
    setTimeout(() => {
      setCurrentTooltip(tooltip || '');
    }, 500);
  };

  return (
    <Tooltip title={currentTooltip}>
      <IconButton
        {...(iconButtonProps as IconButtonProps)}
        onClick={handleClick}
      >
        {children}
      </IconButton>
    </Tooltip>
  );
}
