import { Share, Visibility } from '@mui/icons-material';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

import {
  Box,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

import { useWeb3React } from '@web3-react/core';
import moment from 'moment';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import CloseCircle from '../../../../components/icons/CloseCircle';
import { TraderOrderStatus } from '../../../../constants/enum';
import { useCurrency } from '../../../../hooks/currency';
import { usePositionPaginator } from '../../../../hooks/misc';
import { useAsset, useOrderBook } from '../../../../hooks/nft';
import { SwapApiOrder } from '../../../../types/nft';
import {
  getNetworkSlugFromChainId,
  isAddressEqual,
} from '../../../../utils/blockchain';

import OffersTableRow from './OffersTableRow';

interface Props {
  address: string;
  id: string;
  onAcceptOffer: (order?: SwapApiOrder) => void;
  onCancelOffer: (order?: SwapApiOrder) => void;
  onShare?: (nonce: string) => void;
}

export function OffersTable({
  onAcceptOffer,
  onCancelOffer,
  onShare,
  address,
  id,
}: Props) {
  const { account } = useWeb3React();

  const router = useRouter();
  const currency = useCurrency();

  const { data: asset } = useAsset(address, id);

  const [openMenu, setOpenMenu] = useState(false);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedOrder, setSelectedOrder] = useState<SwapApiOrder>();

  const paginator = usePositionPaginator();

  const { data: orders } = useOrderBook({
    chainId: asset?.chainId,
    sellOrBuyNft: 'buy',
    nftToken: address,
    nftTokenId: id,
    offset: paginator.position.offset,
    limit: paginator.position.limit,
    status: TraderOrderStatus.Open,
  });

  const handleMenu = (el: HTMLElement | null, order?: SwapApiOrder) => {
    setOpenMenu(true);
    setSelectedOrder(order);
    setAnchorEl(el);
  };

  const handleCloseMenu = () => {
    setOpenMenu(false);
    setSelectedOrder(undefined);
    setAnchorEl(null);
  };

  const handleShare = () => {
    if (selectedOrder) {
      onShare!(selectedOrder.nonce);
      handleCloseMenu();
    }
  };

  const handleViewOrder = () => {
    router.push(
      `/order/${getNetworkSlugFromChainId(asset?.chainId)}/${
        selectedOrder?.nonce
      }`
    );
  };

  const renderRows = () => {
    const tempOrders = orders?.orders?.filter(
      ({ order }: { order: SwapApiOrder }) =>
        moment.unix(parseInt(order.expiry)).isAfter(moment())
    );

    if (tempOrders?.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={4}>
            <Stack spacing={2} justifyContent="center" alignItems="center">
              <CloseCircle color="error" />
              <Box>
                <Typography align="center" variant="h5">
                  <FormattedMessage
                    id="no.listings.yet"
                    defaultMessage="No offers"
                  />
                </Typography>
                <Typography
                  align="center"
                  variant="body1"
                  color="textSecondary"
                >
                  <FormattedMessage
                    id="make.an.offer.for.this.nft"
                    defaultMessage="Make an offer for this NFT"
                  />
                </Typography>
              </Box>
            </Stack>
          </TableCell>
        </TableRow>
      );
    }

    return tempOrders?.map(({ order, chainId }: any, index: number) => (
      <OffersTableRow
        key={index}
        order={order}
        chainId={chainId}
        account={account}
        isAssetOwner={isAddressEqual(asset?.owner, account)}
        onAcceptOffer={onAcceptOffer}
        onCancelOffer={onCancelOffer}
        onMenu={handleMenu}
      />
    ));
  };

  return (
    <>
      <Menu
        MenuListProps={{ disablePadding: true }}
        open={openMenu}
        anchorEl={anchorEl}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={handleShare}>
          <ListItemIcon>
            <Share />
          </ListItemIcon>
          <ListItemText
            primary={
              <FormattedMessage
                id="share"
                defaultMessage="Share"
                description="Menu share option in offers table"
              />
            }
          />
        </MenuItem>
        <MenuItem onClick={handleViewOrder}>
          <ListItemIcon>
            <Visibility />
          </ListItemIcon>
          <ListItemText
            primary={
              <FormattedMessage
                id="view.order"
                defaultMessage="View Order"
                description="View Order"
              />
            }
          />
        </MenuItem>
      </Menu>
      <Stack spacing={1}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell component="th">
                  <FormattedMessage
                    id="price"
                    defaultMessage="Price"
                    description="Price"
                  />
                </TableCell>
                <TableCell component="th">
                  <FormattedMessage
                    id="fiat.price"
                    defaultMessage="{currency} Price"
                    description="Fiat price"
                    values={{ currency: currency.toUpperCase() }}
                  />
                </TableCell>
                <TableCell component="th">
                  <FormattedMessage
                    id="expiration"
                    defaultMessage="Expiration"
                    description="Expiration"
                  />
                </TableCell>
                <TableCell component="th" colSpan={3}>
                  <FormattedMessage
                    id="from"
                    defaultMessage="From"
                    description="From"
                  />
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>{renderRows()}</TableBody>
          </Table>
        </TableContainer>
        <Stack direction="row" justifyContent="flex-end">
          <IconButton
            disabled={paginator.position.offset === 0}
            onClick={paginator.handlePrevious}
          >
            <NavigateBeforeIcon />
          </IconButton>
          <IconButton
            disabled={
              orders !== undefined &&
              orders?.orders?.length < paginator.pageSize
            }
            onClick={paginator.handleNext}
          >
            <NavigateNextIcon />
          </IconButton>
        </Stack>
      </Stack>
    </>
  );
}

export default OffersTable;
