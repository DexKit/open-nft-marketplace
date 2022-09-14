import { styled } from '@mui/material/styles';
import Ethereum from './icons/Ethereum';
import Export from './icons/Export';
import RotateRight from './icons/RotateRight';
import Setting from './icons/Setting';
import Share from './icons/Share';
import Tag from './icons/Tag';

interface Props {
  icon: string;
  color?: 'primary';
  size: 'small' | 'medium' | 'large';
}

const sizes = {
  small: { width: 14, heigth: 14 },
  medium: { width: 18, heigth: 18 },
  large: { width: 34, heigth: 34 },
};

export const Icon = ({ icon, ...otherProps }: Props) => {
  switch (icon) {
    case 'ethereum':
      return <Ethereum {...otherProps} />;
    case 'settings':
      return <Setting {...otherProps} />;
    case 'share':
      return <Share {...otherProps} />;
    case 'tag':
      return <Tag {...otherProps} />;
    case 'rotate-right':
      return <RotateRight {...otherProps} />;
    case 'export':
      return <Export {...otherProps} />;
  }

  return null;
};

export default styled(Icon, {
  shouldForwardProp: (prop) =>
    prop !== 'color' && prop !== 'variant' && prop !== 'sx',
})<Props>(({ theme, color }) => ({
  stroke:
    color === 'primary'
      ? theme.palette.primary.main
      : theme.palette.text.primary,
}));
