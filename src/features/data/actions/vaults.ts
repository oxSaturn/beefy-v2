import { createAsyncThunk } from '@reduxjs/toolkit';
import { BeefyState } from '../../../redux-types';
import { getBeefyApi, getConfigApi } from '../apis/instances';
import { ChainEntity } from '../entities/chain';
import { FeaturedVaultConfig, VaultConfig } from '../apis/config-types';
import { BeefyVaultZapSupportResponse } from '../apis/beefy';
import { featureFlag_zapSupportOverrides } from '../utils/feature-flags';

// given the list of vaults is pulled from some api at some point
// we use the api to create an action
// this action should return just enough data for the state to work with

export interface FulfilledAllVaultsPayload {
  byChainId: {
    [chainId: ChainEntity['id']]: VaultConfig[];
  };
  state: BeefyState;
}
export const fetchAllVaults = createAsyncThunk<
  FulfilledAllVaultsPayload,
  {},
  { state: BeefyState }
>('vaults/fetchAllVaults', async (_, { getState }) => {
  const api = getConfigApi();
  const vaults = await api.fetchAllVaults();
  return { byChainId: vaults, state: getState() };
});

export interface FulfilledFeaturedVaultsPayload {
  byVaultId: FeaturedVaultConfig;
}
export const fetchFeaturedVaults = createAsyncThunk<FulfilledFeaturedVaultsPayload>(
  'vaults/fetchFeaturedVaults',
  async () => {
    const api = getConfigApi();
    const featuredVaults = await api.fetchFeaturedVaults();
    return { byVaultId: featuredVaults };
  }
);

export type FulfilledFetchVaultsZapSupportPayload = {
  byVaultId: BeefyVaultZapSupportResponse;
};

export const fetchVaultsZapSupport = createAsyncThunk<
  FulfilledFetchVaultsZapSupportPayload,
  void,
  { state: BeefyState }
>('vaults/fetchVaultsZapSupport', async (_, { getState }) => {
  const api = getBeefyApi();
  const vaultsZapSupport = await api.getVaultZapSupport();
  const overrides = featureFlag_zapSupportOverrides();

  for (const kind of ['beefy', 'oneInch'] as const) {
    const value = overrides[kind];
    let ids = [];
    if (value === 'all') {
      ids = getState().entities.vaults.allIds;
    } else if (Array.isArray(value) && value.length > 0) {
      ids = value;
    }
    for (const id of ids) {
      vaultsZapSupport[id] = [...(vaultsZapSupport[id] || []), kind];
    }
  }

  return { byVaultId: vaultsZapSupport };
});
