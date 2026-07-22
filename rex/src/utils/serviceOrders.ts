import type { DirectServiceId } from '../data/directServices';

export type ServiceOrderStatus = 'draft' | 'awaiting_payment' | 'paid' | 'in_progress' | 'delivered';

export type ServiceOrder = {
  id: string;
  serviceId: DirectServiceId;
  priceSol: number;
  status: ServiceOrderStatus;
  /** Contact + project details from the order form */
  projectName: string;
  ticker?: string;
  websiteUrl?: string;
  telegram?: string;
  xHandle?: string;
  email: string;
  notes?: string;
  /** Optional uploaded logo data URL */
  logoDataUrl?: string | null;
  bannerDataUrl?: string | null;
  createdAt: string;
  paidAt?: string;
  /** Demo payment reference */
  paymentRef?: string;
};

const STORAGE_KEY = 'rex-service-orders';

function readAll(): ServiceOrder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ServiceOrder[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(orders: ServiceOrder[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  } catch {
    // ignore quota
  }
}

export function listServiceOrders(): ServiceOrder[] {
  return readAll().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getServiceOrder(id: string): ServiceOrder | null {
  return readAll().find((o) => o.id === id) ?? null;
}

export function saveServiceOrder(order: ServiceOrder): void {
  const all = readAll().filter((o) => o.id !== order.id);
  all.push(order);
  writeAll(all);
}

export function createServiceOrderDraft(
  partial: Omit<ServiceOrder, 'id' | 'status' | 'createdAt'>,
): ServiceOrder {
  const order: ServiceOrder = {
    ...partial,
    id: `svc_${Date.now().toString(36)}`,
    status: 'awaiting_payment',
    createdAt: new Date().toISOString(),
  };
  saveServiceOrder(order);
  return order;
}

export function markServiceOrderPaid(id: string): ServiceOrder | null {
  const order = getServiceOrder(id);
  if (!order) return null;
  const paid: ServiceOrder = {
    ...order,
    status: 'paid',
    paidAt: new Date().toISOString(),
    paymentRef: `pay_${Math.random().toString(36).slice(2, 10)}`,
  };
  saveServiceOrder(paid);
  return paid;
}

export function hasPaidServiceOrders(): boolean {
  return readAll().some((o) => o.status === 'paid' || o.status === 'in_progress' || o.status === 'delivered');
}

export function hasAnyServiceOrders(): boolean {
  return readAll().length > 0;
}
