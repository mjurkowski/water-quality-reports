import { emptySplitApi as api } from './emptyApi';
export const addTagTypes = [
  'Admin Auth',
  'Admin - Reports',
  'Geocode',
  'Health',
  'Reports',
  'Stats',
] as const;
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      postAdminAuthLogin: build.mutation<PostAdminAuthLoginApiResponse, PostAdminAuthLoginApiArg>({
        query: (queryArg) => ({ url: `/admin/auth/login`, method: 'POST', body: queryArg.body }),
        invalidatesTags: ['Admin Auth'],
      }),
      getAdminAuthMe: build.query<GetAdminAuthMeApiResponse, GetAdminAuthMeApiArg>({
        query: () => ({ url: `/admin/auth/me` }),
        providesTags: ['Admin Auth'],
      }),
      postAdminAuthChangePassword: build.mutation<
        PostAdminAuthChangePasswordApiResponse,
        PostAdminAuthChangePasswordApiArg
      >({
        query: (queryArg) => ({
          url: `/admin/auth/change-password`,
          method: 'POST',
          body: queryArg.body,
        }),
        invalidatesTags: ['Admin Auth'],
      }),
      getAdminReports: build.query<GetAdminReportsApiResponse, GetAdminReportsApiArg>({
        query: (queryArg) => ({
          url: `/admin/reports`,
          params: {
            limit: queryArg.limit,
            offset: queryArg.offset,
            types: queryArg.types,
            city: queryArg.city,
            status: queryArg.status,
          },
        }),
        providesTags: ['Admin - Reports'],
      }),
      getAdminReportsByUuid: build.query<
        GetAdminReportsByUuidApiResponse,
        GetAdminReportsByUuidApiArg
      >({
        query: (queryArg) => ({ url: `/admin/reports/${queryArg.uuid}` }),
        providesTags: ['Admin - Reports'],
      }),
      deleteAdminReportsByUuid: build.mutation<
        DeleteAdminReportsByUuidApiResponse,
        DeleteAdminReportsByUuidApiArg
      >({
        query: (queryArg) => ({ url: `/admin/reports/${queryArg.uuid}`, method: 'DELETE' }),
        invalidatesTags: ['Admin - Reports'],
      }),
      patchAdminReportsByUuidStatus: build.mutation<
        PatchAdminReportsByUuidStatusApiResponse,
        PatchAdminReportsByUuidStatusApiArg
      >({
        query: (queryArg) => ({
          url: `/admin/reports/${queryArg.uuid}/status`,
          method: 'PATCH',
          body: queryArg.body,
        }),
        invalidatesTags: ['Admin - Reports'],
      }),
      getGeocode: build.query<GetGeocodeApiResponse, GetGeocodeApiArg>({
        query: (queryArg) => ({
          url: `/geocode`,
          params: {
            q: queryArg.q,
          },
        }),
        providesTags: ['Geocode'],
      }),
      getHealth: build.query<GetHealthApiResponse, GetHealthApiArg>({
        query: () => ({ url: `/health` }),
        providesTags: ['Health'],
      }),
      getReports: build.query<GetReportsApiResponse, GetReportsApiArg>({
        query: (queryArg) => ({
          url: `/reports`,
          params: {
            limit: queryArg.limit,
            offset: queryArg.offset,
            types: queryArg.types,
            city: queryArg.city,
            north: queryArg.north,
            south: queryArg.south,
            east: queryArg.east,
            west: queryArg.west,
          },
        }),
        providesTags: ['Reports'],
      }),
      postReports: build.mutation<PostReportsApiResponse, PostReportsApiArg>({
        query: (queryArg) => ({
          url: `/reports`,
          method: 'POST',
          body: queryArg.createReportRequest,
        }),
        invalidatesTags: ['Reports'],
      }),
      getReportsByUuid: build.query<GetReportsByUuidApiResponse, GetReportsByUuidApiArg>({
        query: (queryArg) => ({ url: `/reports/${queryArg.uuid}` }),
        providesTags: ['Reports'],
      }),
      deleteReportsByUuid: build.mutation<
        DeleteReportsByUuidApiResponse,
        DeleteReportsByUuidApiArg
      >({
        query: (queryArg) => ({
          url: `/reports/${queryArg.uuid}`,
          method: 'DELETE',
          params: {
            token: queryArg.token,
          },
        }),
        invalidatesTags: ['Reports'],
      }),
      getStats: build.query<GetStatsApiResponse, GetStatsApiArg>({
        query: (queryArg) => ({
          url: `/stats`,
          params: {
            period: queryArg.period,
          },
        }),
        providesTags: ['Stats'],
      }),
    }),
    overrideExisting: false,
  });
export { injectedRtkApi as api };
export type PostAdminAuthLoginApiResponse = /** status 200 Login successful */ {
  /** JWT token */
  token?: string;
  admin?: {
    id?: number;
    email?: string;
    name?: string;
    role?: string;
  };
};
export type PostAdminAuthLoginApiArg = {
  body: {
    email: string;
    password: string;
  };
};
export type GetAdminAuthMeApiResponse = /** status 200 Admin user information */ {
  id?: number;
  email?: string;
  name?: string;
  role?: string;
  isActive?: boolean;
  lastLoginAt?: string;
  createdAt?: string;
  updatedAt?: string;
};
export type GetAdminAuthMeApiArg = void;
export type PostAdminAuthChangePasswordApiResponse = unknown;
export type PostAdminAuthChangePasswordApiArg = {
  body: {
    oldPassword: string;
    newPassword: string;
  };
};
export type GetAdminReportsApiResponse = /** status 200 List of reports */ ReportsListResponse;
export type GetAdminReportsApiArg = {
  /** Number of reports to return */
  limit?: number;
  /** Number of reports to skip */
  offset?: number;
  /** Comma-separated list of report types */
  types?: string;
  /** Filter by city */
  city?: string;
  /** Filter by status */
  status?: 'active' | 'deleted' | 'spam';
};
export type GetAdminReportsByUuidApiResponse = /** status 200 Report details */ Report;
export type GetAdminReportsByUuidApiArg = {
  /** Report UUID */
  uuid: string;
};
export type DeleteAdminReportsByUuidApiResponse = /** status 200 Report permanently deleted */ {
  message?: string;
};
export type DeleteAdminReportsByUuidApiArg = {
  /** Report UUID */
  uuid: string;
};
export type PatchAdminReportsByUuidStatusApiResponse =
  /** status 200 Status updated successfully */ Report;
export type PatchAdminReportsByUuidStatusApiArg = {
  /** Report UUID */
  uuid: string;
  body: {
    status: 'active' | 'deleted' | 'spam';
  };
};
export type GetGeocodeApiResponse = /** status 200 Geocoding results */ GeocodeResponse;
export type GetGeocodeApiArg = {
  /** Search query (address, city, etc.) */
  q: string;
};
export type GetHealthApiResponse = /** status 200 Service is healthy */ HealthResponse;
export type GetHealthApiArg = void;
export type GetReportsApiResponse = /** status 200 List of reports */ ReportsListResponse;
export type GetReportsApiArg = {
  /** Number of reports to return */
  limit?: number;
  /** Number of reports to skip */
  offset?: number;
  /** Comma-separated list of report types */
  types?: string;
  /** Filter by city */
  city?: string;
  /** North boundary for map filtering */
  north?: number;
  /** South boundary for map filtering */
  south?: number;
  /** East boundary for map filtering */
  east?: number;
  /** West boundary for map filtering */
  west?: number;
};
export type PostReportsApiResponse =
  /** status 201 Report created successfully */ CreateReportResponse;
export type PostReportsApiArg = {
  createReportRequest: CreateReportRequest;
};
export type GetReportsByUuidApiResponse = /** status 200 Report details */ Report;
export type GetReportsByUuidApiArg = {
  /** Report UUID */
  uuid: string;
};
export type DeleteReportsByUuidApiResponse = /** status 200 Report deleted successfully */ {
  message?: string;
};
export type DeleteReportsByUuidApiArg = {
  /** Report UUID */
  uuid: string;
  /** Delete token received when creating the report */
  token: string;
};
export type GetStatsApiResponse = /** status 200 Statistics data */ Stats;
export type GetStatsApiArg = {
  /** Time period for statistics */
  period?: 'week' | 'month' | 'year' | 'all';
};
export type Report = {
  id?: number;
  uuid?: string;
  types?: ('brown_water' | 'bad_smell' | 'sediment' | 'pressure' | 'no_water' | 'other')[];
  description?: string | null;
  latitude?: number;
  longitude?: number;
  address?: string | null;
  city?: string | null;
  voivodeship?: string | null;
  reportedAt?: string;
  createdAt?: string;
  status?: 'active' | 'deleted' | 'spam';
  photos?: {
    id?: number;
    url?: string;
    mimeType?: string;
    size?: number;
  }[];
};
export type ReportsListResponse = {
  reports?: Report[];
  total?: number;
};
export type GeocodeResult = {
  lat?: number;
  lon?: number;
  display_name?: string;
};
export type GeocodeResponse = {
  results?: GeocodeResult[];
};
export type Error = {
  error?: string;
  message?: string;
  details?: object[];
};
export type HealthResponse = {
  status?: 'healthy' | 'unhealthy';
  timestamp?: string;
  database?: 'connected' | 'disconnected';
};
export type CreateReportResponse = {
  uuid?: string;
  deleteToken?: string;
  message?: string;
};
export type CreateReportRequest = {
  types: ('brown_water' | 'bad_smell' | 'sediment' | 'pressure' | 'no_water' | 'other')[];
  description?: string;
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  voivodeship?: string;
  reportedAt: string;
  contactEmail?: string;
  photos?: string[];
};
export type Stats = {
  period?: 'week' | 'month' | 'year' | 'all';
  total?: number;
  recentCount?: number;
  byType?: {
    [key: string]: number;
  };
  byCity?: {
    city?: string;
    count?: number;
  }[];
  byVoivodeship?: {
    voivodeship?: string;
    count?: number;
  }[];
};
export const {
  usePostAdminAuthLoginMutation,
  useGetAdminAuthMeQuery,
  usePostAdminAuthChangePasswordMutation,
  useGetAdminReportsQuery,
  useGetAdminReportsByUuidQuery,
  useDeleteAdminReportsByUuidMutation,
  usePatchAdminReportsByUuidStatusMutation,
  useGetGeocodeQuery,
  useGetHealthQuery,
  useGetReportsQuery,
  usePostReportsMutation,
  useGetReportsByUuidQuery,
  useDeleteReportsByUuidMutation,
  useGetStatsQuery,
} = injectedRtkApi;
