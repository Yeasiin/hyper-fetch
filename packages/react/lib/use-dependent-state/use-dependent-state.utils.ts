import {
  CacheValueType,
  NullableType,
  FetchCommandInstance,
  ClientResponseType,
  ExtractResponse,
  ExtractError,
} from "@better-typed/hyper-fetch";

import { initialState } from "./use-dependent-state.constants";

export const getTimestamp = (timestamp?: NullableType<number | Date>) => {
  return timestamp ? new Date(timestamp) : null;
};

export const getInitialDependentStateData = (
  command: FetchCommandInstance,
  initialData: NullableType<CacheValueType>,
  initialLoading?: boolean,
) => ({
  ...initialState,
  data: initialData?.response?.[0] || initialState.data,
  error: initialData?.response?.[1] || initialState.error,
  status: initialData?.response?.[2] || initialState.status,
  retries: initialData?.retries || initialState.retries,
  timestamp: getTimestamp(initialData?.timestamp || initialState.timestamp),
  isOnline: command.builder.appManager.isOnline,
  isFocused: command.builder.appManager.isFocused,
  loading: initialLoading ?? initialState.loading,
});

export const transformDataToCacheValue = <T>(
  response: ClientResponseType<ExtractResponse<T>, ExtractError<T>> | null,
): NullableType<CacheValueType> => {
  if (!response) return null;
  return {
    response,
    retries: 0,
    timestamp: +new Date(),
    isRefreshed: false,
  };
};
