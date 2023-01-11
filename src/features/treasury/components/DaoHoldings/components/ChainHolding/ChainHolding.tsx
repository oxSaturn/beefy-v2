import { memo } from 'react';
import { styles } from './styles';
import { useAppSelector } from '../../../../../../store';
import { selectChainById } from '../../../../../data/selectors/chains';
import { makeStyles } from '@material-ui/core';
import { formatBigUsd } from '../../../../../../helpers/format';
import { ChainEntity } from '../../../../../data/entities/chain';
import { selectTreasuryBalanceByChainId } from '../../../../../data/selectors/treasury';

import { Assets } from '../Assets';

const useStyles = makeStyles(styles);

interface ChainHoldingProps {
  chainId: ChainEntity['id'];
}

export const ChainHolding = memo<ChainHoldingProps>(function ({ chainId }) {
  const totalUsd = useAppSelector(state => selectTreasuryBalanceByChainId(state, chainId));

  const classes = useStyles();
  const chain = useAppSelector(state => selectChainById(state, chainId));
  return (
    <div className={classes.container}>
      <div className={classes.title}>
        <div className={classes.nameContainer}>
          <img
            src={require(`../../../../../../images/networks/${chainId}.svg`).default}
            alt={chainId}
          />
          <div className={classes.chainName}>{chain.name}</div>
        </div>
        <div className={classes.usdValue}>{formatBigUsd(totalUsd)}</div>
      </div>
      <Assets chainId={chainId} />
    </div>
  );
});
