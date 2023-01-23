import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Divider,
  Grid,
  Stack,
  Typography,
} from '@mui/material';

import { FormattedMessage } from 'react-intl';
import {
  getBlockExplorerUrl,
  getChainName,
  truncateAddress,
} from '../../../utils/blockchain';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Link from '../../../components/Link';
import { useAsset, useAssetMetadata } from '../../../hooks/nft';
import AssetAttributePaper from './AssetAttributePaper';
import { truncateErc1155TokenId } from '../../../utils/nfts';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Props {
  description?: string;
  address: string;
  id: string;
}

export function AssetDetails({ description, address, id }: Props) {
  const { data: asset } = useAsset(address, id);
  const { data: metadata } = useAssetMetadata(asset);

  return (
    <Stack spacing={1}>
      <Box>
        <Accordion disableGutters>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon color="primary" />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Typography sx={{ fontWeight: 600 }}>
              <FormattedMessage
                id="description"
                defaultMessage="Description"
                description="Description Accordion"
              />
            </Typography>
          </AccordionSummary>

          <Divider />
          <AccordionDetails sx={{ p: (theme) => theme.spacing(2) }}>
            {description && (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {description}
              </ReactMarkdown>
            )}
          </AccordionDetails>
        </Accordion>
      </Box>
      {metadata !== undefined &&
        metadata?.attributes !== undefined &&
        metadata?.attributes?.length > 0 && (
          <Box>
            <Accordion disableGutters>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon color="primary" />}
                aria-controls="panel1a-content"
                id="panel1a-header"
              >
                <Typography sx={{ fontWeight: 600 }}>
                  <FormattedMessage
                    id="attributes"
                    defaultMessage="Attributes"
                    description="Attributes accordion"
                  />
                </Typography>
              </AccordionSummary>
              <Divider />
              <AccordionDetails sx={{ p: (theme) => theme.spacing(2) }}>
                <Grid container spacing={2}>
                  {metadata?.attributes?.map((attr, index: number) => (
                    <Grid item xs={4} key={index}>
                      <AssetAttributePaper
                        traitType={attr.trait_type}
                        value={attr.value}
                      />
                    </Grid>
                  ))}
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Box>
        )}

      <Box>
        <Accordion disableGutters>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon color="primary" />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Typography sx={{ fontWeight: 600 }}>
              <FormattedMessage
                id="accordion.details"
                defaultMessage="Details"
                description="Details in the nft accordion"
              />
            </Typography>
          </AccordionSummary>
          <Divider />
          <AccordionDetails sx={{ p: (theme) => theme.spacing(2) }}>
            <Stack spacing={2}>
              <Stack direction="row" justifyContent="space-between">
                <Typography color="textSecondary">
                  <FormattedMessage
                    id="contract.address"
                    defaultMessage="Contract Address"
                    description="Accordion contract address"
                  />
                </Typography>
                <Typography color="textSecondary">
                  <Link
                    href={`${getBlockExplorerUrl(
                      asset?.chainId
                    )}/address/${address}`}
                    target="_blank"
                  >
                    {truncateAddress(address)}
                  </Link>
                </Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography color="textSecondary">
                  <FormattedMessage
                    id="token.id"
                    defaultMessage="Token ID"
                    description="Token id caption"
                  />
                </Typography>
                <Typography color="textSecondary">
                  {truncateErc1155TokenId(id)}
                </Typography>
              </Stack>

              <Stack direction="row" justifyContent="space-between">
                <Typography color="textSecondary">
                  <FormattedMessage
                    id="Network"
                    defaultMessage="Network"
                    description="Network caption"
                  />
                </Typography>
                <Typography color="textSecondary">
                  {getChainName(asset?.chainId)}
                </Typography>
              </Stack>
            </Stack>
          </AccordionDetails>
        </Accordion>
      </Box>
    </Stack>
  );
}
