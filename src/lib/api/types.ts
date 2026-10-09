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
  companyPhotoUrl?: string | null;
  roleId: number;
  permissions: ApiPermissionEntry[];
};

export type ApiEnvelope<T> = { data: T };

export type ApiErrorBody = {
  error?: string;
  message?: string;
  statusCode?: number;
  data?: unknown;
};

export type StoreCartPriceChange = {
  product_id: string;
  name: string;
  previous_unit_price: number;
  current_unit_price: number;
};

/** Storefront catalog card from GET /api/v1/customer/catalog */
export type StoreStockStatus = "in_stock" | "out_of_stock";

export type StoreCatalogClassification = {
  id: string;
  name: string;
  image: string | null;
};

export type StoreCatalogCard = {
  id: string;
  name: string;
  image: string | null;
  unit: string;
  stock: number;
  stock_status: StoreStockStatus;
  price: number;
  list_price?: number;
  discount_percent?: number;
  category: StoreCatalogClassification | null;
  subcategory: StoreCatalogClassification | null;
};

export type StoreCatalogDepartment = StoreCatalogClassification & {
  subcategories: StoreCatalogClassification[];
};

export type StoreCatalogDetail = StoreCatalogCard & {
  description: string;
  images: string[];
};

export type StoreCatalogOrderBy = "name" | "sale_price" | "created_at";

export type StoreCatalogListMeta = {
  page: number;
  limit: number;
  total: number;
  search: string | null;
  orderBy: StoreCatalogOrderBy;
  sort: "asc" | "desc";
  fk_product_category?: string | null;
  fk_product_subcategory?: string | null;
};

export type StoreCatalogListResponse = {
  data: StoreCatalogCard[];
  meta: StoreCatalogListMeta;
};

export type StoreCartProduct = {
  pk_cart_product: number;
  fk_product: string;
  fk_user_cart: number;
  quantity: string;
  unit_price: string | number;
  selected: boolean;
  product: {
    pk_product: string;
    name: string;
    photo_url: string | null;
    stock: string | number;
    sale_price: string | number;
    meassure?: { name: string } | null;
    category?: { pk_product_category: string; name: string; photo_url?: string | null } | null;
    subcategory?: { pk_product_subcategory: string; name: string; photo_url?: string | null } | null;
  };
};

export type StoreCart = {
  pk_user_cart: number;
  fk_company: string;
  fk_user: string;
  cart_products: StoreCartProduct[];
};

export type StoreOrderLine = {
  id: number;
  product_id: string;
  name: string;
  image: string | null;
  quantity: number;
  unit_price: number;
  sub_total: number;
};

export type StoreOrderPayment = {
  id: number;
  amount: number;
  method: string | null;
  status: string | null;
};

export type StoreOrder = {
  id: string;
  state: string;
  origin: string;
  created_at: string | null;
  delivery_address?: string | null;
  requires_delivery?: boolean;
  delivery: { id: number; state: string | null; delivery_date: string | null } | null;
  lines: StoreOrderLine[];
  total: number;
  payment: StoreOrderPayment | null;
  cancellable?: boolean;
};

export type StoreOrderListMeta = {
  page: number;
  limit: number;
  total: number;
  state: string | null;
  sort: "asc" | "desc";
};

export type StoreOrderListResponse = {
  data: StoreOrder[];
  meta: StoreOrderListMeta;
};

export type StoreFavouriteProduct = {
  pk_product: string;
  name: string;
  photo_url: string | null;
  stock: string | number;
  sale_price: string | number;
  price?: string | number;
  list_price?: string | number;
  discount_percent?: string | number;
  is_active?: boolean;
  deleted_at?: string | null;
  description?: string;
  meassure?: { name: string } | null;
  category?: { pk_product_category: string; name: string; photo_url?: string | null } | null;
  subcategory?: { pk_product_subcategory: string; name: string; photo_url?: string | null } | null;
};

export type StoreFavourite = {
  pk_user_favourite: number;
  fk_user: string;
  fk_product: string;
  product: StoreFavouriteProduct;
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
  password_reset?: {
    ref: string;
    expires_at: string;
  } | null;
};
