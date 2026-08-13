export type ApiTenant = {
  companyId: string;
  name: string;
  photoUrl: string | null;
};

export type ApiLoginData = {
  accessToken: string;
  expiresIn: number;
  permissions: string[];
};

export type ApiPermission = {
  code: string;
  description?: string;
  name?: string;
};

/** /me may return codes as strings or enriched objects depending on API version. */
export type ApiPermissionEntry = string | ApiPermission;

export type ApiMeData = {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  photoUrl: string | null;
  companyId: string;
  roleId: number;
  permissions: ApiPermissionEntry[];
};

export type ApiEnvelope<T> = { data: T };

export type ApiErrorBody = {
  error?: string;
  message?: string;
  statusCode?: number;
};

/** Storefront catalog card from GET /api/v1/customer/catalog */
export type StoreStockStatus = "in_stock" | "out_of_stock";

export type StoreCatalogCard = {
  id: string;
  name: string;
  image: string | null;
  unit: string;
  stock: number;
  stock_status: StoreStockStatus;
  price: number;
};

export type StoreCatalogOrderBy = "name" | "sale_price" | "created_at";

export type StoreCatalogListMeta = {
  page: number;
  limit: number;
  total: number;
  search: string | null;
  orderBy: StoreCatalogOrderBy;
  sort: "asc" | "desc";
};

export type StoreCatalogListResponse = {
  data: StoreCatalogCard[];
  meta: StoreCatalogListMeta;
};

export type ApiInboxItem = {
  pk_multi_tenant_notification: number;
  fk_multi_tenant: string;
  fk_notification: number;
  read_at: string | null;
  notification: {
    pk_notification: number;
    title: string;
    description: string | null;
    starts_at?: string | null;
    ends_at?: string | null;
    created_at: string | null;
  };
};
