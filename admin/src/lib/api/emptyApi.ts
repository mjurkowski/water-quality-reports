import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Initialize an empty API service that we'll inject endpoints into later
export const emptySplitApi = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  endpoints: () => ({}),
  tagTypes: ['Reports', 'Stats'],
});
