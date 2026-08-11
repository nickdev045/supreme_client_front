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
  companyName?: string;
  roleId: number;
  roleName?: string;
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
  stock_status: StoreStockStatus;
  price: number;
};

export type StoreCatalogListMeta = {
  page: number;
  limit: number;
  total: number;
  search: string | null;
  orderBy: "name" | "unit_price" | "created_at";
  sort: "asc" | "desc";
};

export type StoreCatalogListResponse = {
  data: StoreCatalogCard[];
  meta: StoreCatalogListMeta;
};
