import { RequestStatus } from '@/services/mockData';
import { cn } from '@/lib/utils';

const statusConfig: Record<RequestStatus, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-status-pending-bg text-status-pending-foreground border-status-pending/30' },
  approved: { label: 'Approved', className: 'bg-status-approved-bg text-status-approved-foreground border-status-approved/30' },
  rejected: { label: 'Rejected', className: 'bg-status-rejected-bg text-status-rejected-foreground border-status-rejected/30' },
  released: { label: 'Released', className: 'bg-status-released-bg text-status-released-foreground border-status-released/30' },
};

export const StatusBadge = ({ status }: { status: RequestStatus }) => {
  const config = statusConfig[status];
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold', config.className)}>
      {config.label}
    </span>
  );
};
