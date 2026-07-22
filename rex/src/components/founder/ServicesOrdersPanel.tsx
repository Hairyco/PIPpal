import { Link } from 'react-router-dom';
import { ExternalLink, Zap } from 'lucide-react';
import { getDirectService, formatSolPrice } from '../../data/directServices';
import { listServiceOrders, type ServiceOrder } from '../../utils/serviceOrders';
import { SiteChangeRequestCard } from './MarketingBundlesPanel';

function statusLabel(status: ServiceOrder['status']): string {
  switch (status) {
    case 'awaiting_payment':
      return 'Awaiting payment';
    case 'paid':
      return 'Paid — queued';
    case 'in_progress':
      return 'In progress';
    case 'delivered':
      return 'Delivered';
    default:
      return status;
  }
}

export function ServicesOrdersPanel() {
  const orders = listServiceOrders();
  const hasPaid = orders.some((o) => o.status === 'paid' || o.status === 'in_progress' || o.status === 'delivered');

  return (
    <div className="space-y-4">
      <div className="dex-card">
        <div className="relative z-[1] space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold text-white">Direct services</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                SOL checkout orders — separate from marketing-wallet supplier spends.
              </p>
            </div>
            <Link
              to="/services"
              className="inline-flex items-center gap-1.5 rounded-lg border border-sky-500/30 bg-sky-500/10 px-3 py-2 text-xs font-medium text-sky-200"
            >
              <Zap className="h-3.5 w-3.5" />
              Browse services
            </Link>
          </div>

          {orders.length === 0 ? (
            <p className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-4 text-xs text-muted-foreground">
              No service orders yet. Get the launch pack (site, logo, banner, channel callout) for a
              fixed SOL fee.
            </p>
          ) : (
            <ul className="space-y-3">
              {orders.map((order) => {
                const service = getDirectService(order.serviceId);
                return (
                  <li
                    key={order.id}
                    className="rounded-xl border border-white/10 bg-white/[0.02] p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-white">
                          {service?.title ?? order.serviceId} · {order.projectName}
                        </p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          {statusLabel(order.status)}
                          {order.paymentRef ? ` · ${order.paymentRef}` : ''}
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-sky-300">
                        {formatSolPrice(order.priceSol)}
                      </span>
                    </div>
                    {order.status === 'awaiting_payment' ? (
                      <Link
                        to={`/services?order=${order.id}`}
                        className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-sky-300"
                      >
                        Complete payment <ExternalLink className="h-3 w-3" />
                      </Link>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      <SiteChangeRequestCard unlocked={hasPaid} />
    </div>
  );
}
