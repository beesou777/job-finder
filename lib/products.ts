import { authFetch } from './auth-context';

export type ProductOrder = {
  id: string;
  productCode: string;
  amountNpr: number;
  status: 'pending' | 'complete' | 'failed';
  createdAt: string;
  deliveryStatus?: string;
  providerReference?: string | null;
};

function isOrder(value: unknown): value is ProductOrder {
  if (!value || typeof value !== 'object') return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === 'string' &&
    typeof item.productCode === 'string' &&
    typeof item.amountNpr === 'number' &&
    typeof item.createdAt === 'string' &&
    ['pending', 'complete', 'failed'].includes(String(item.status))
  );
}

export async function loadProductOrders(): Promise<ProductOrder[]> {
  const response = await authFetch('/api/me/products/orders', { cache: 'no-store' });
  const body: unknown = await response.json();
  if (
    !response.ok ||
    !body ||
    typeof body !== 'object' ||
    !('orders' in body) ||
    !Array.isArray((body as { orders?: unknown }).orders) ||
    !(body as { orders: unknown[] }).orders.every(isOrder)
  ) {
    throw new Error('Could not load your purchases. Please refresh; you do not need to pay again.');
  }
  return (body as { orders: ProductOrder[] }).orders;
}

export async function verifyProductOrder(id: string): Promise<void> {
  const response = await authFetch(`/api/me/products/orders/${encodeURIComponent(id)}/verify`, {
    cache: 'no-store',
  });
  if (!response.ok) {
    throw new Error('Payment could not be confirmed yet. Try checking again shortly; please do not pay again.');
  }
}

export type Product = {
  code: 'professional_cv' | 'application_pack' | 'job_hunt_pack';
  name: string;
  amountNpr: number;
  deliverables: string[];
};

export async function loadProductCatalog(): Promise<{
  catalogVersion: string;
  currency: string;
  chargingEnabled: boolean;
  products: Product[];
}> {
  const response = await authFetch('/api/me/products', { cache: 'no-store' });
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok || !body || typeof body !== 'object' || !Array.isArray((body as { products?: unknown }).products)) {
    throw new Error('Product catalog is unavailable.');
  }
  return body as {
    catalogVersion: string;
    currency: string;
    chargingEnabled: boolean;
    products: Product[];
  };
}

export async function requestProductQuote(productCode: Product['code']) {
  const response = await authFetch('/api/me/products/quotes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productCode }),
  });
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) throw new Error('Could not create a quote.');
  return body;
}

export async function startProductCheckout(
  quoteId: string
): Promise<{ formUrl: string; fields: Record<string, string> }> {
  const response = await authFetch(`/api/me/products/quotes/${encodeURIComponent(quoteId)}/checkout`, {
    method: 'POST',
  });
  const body: unknown = await response.json().catch(() => null);
  if (
    !response.ok ||
    !body ||
    typeof body !== 'object' ||
    typeof (body as { formUrl?: unknown }).formUrl !== 'string' ||
    typeof (body as { fields?: unknown }).fields !== 'object'
  ) {
    throw new Error('Could not start eSewa checkout.');
  }
  const value = body as { formUrl: string; fields: Record<string, unknown> };
  return {
    formUrl: value.formUrl,
    fields: Object.fromEntries(
      Object.entries(value.fields).filter(([, item]) => typeof item === 'string')
    ) as Record<string, string>,
  };
}

