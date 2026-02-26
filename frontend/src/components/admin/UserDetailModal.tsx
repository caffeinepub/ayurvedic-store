import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Mail, Calendar, ShoppingCart, Hash } from 'lucide-react';
import type { UserSummary } from '../../backend';

interface UserDetailModalProps {
  user: UserSummary;
  onClose: () => void;
}

export default function UserDetailModal({ user, onClose }: UserDetailModalProps) {
  const formatDate = (ts: bigint) => {
    const d = new Date(Number(ts) / 1_000_000);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md bg-admin-card border-admin-border">
        <DialogHeader>
          <DialogTitle className="text-admin-fg">User Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Avatar + Name */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-admin-accent/20 flex items-center justify-center flex-shrink-0">
              <span className="text-admin-accent text-2xl font-bold">
                {user.profile?.name?.charAt(0)?.toUpperCase() ?? '?'}
              </span>
            </div>
            <div>
              <h3 className="text-admin-fg font-semibold text-lg">
                {user.profile?.name ?? <span className="text-admin-muted italic">No name set</span>}
              </h3>
              {user.profile?.email && (
                <p className="text-admin-muted text-sm">{user.profile.email}</p>
              )}
            </div>
          </div>

          <Separator className="bg-admin-border" />

          {/* Details */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Hash className="w-4 h-4 text-admin-muted mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-admin-muted text-xs font-medium uppercase tracking-wide">Principal ID</p>
                <p className="text-admin-fg text-sm font-mono break-all mt-0.5">
                  {user.principal.toString()}
                </p>
              </div>
            </div>

            {user.profile?.email && (
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-admin-muted flex-shrink-0" />
                <div>
                  <p className="text-admin-muted text-xs font-medium uppercase tracking-wide">Email</p>
                  <p className="text-admin-fg text-sm mt-0.5">{user.profile.email}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-admin-muted flex-shrink-0" />
              <div>
                <p className="text-admin-muted text-xs font-medium uppercase tracking-wide">Registered</p>
                <p className="text-admin-fg text-sm mt-0.5">{formatDate(user.registeredAt)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ShoppingCart className="w-4 h-4 text-admin-muted flex-shrink-0" />
              <div>
                <p className="text-admin-muted text-xs font-medium uppercase tracking-wide">Total Orders</p>
                <div className="mt-0.5">
                  <Badge variant="secondary" className="bg-admin-bg text-admin-fg border-0">
                    {user.orderCount.toString()} orders placed
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
