import { useState } from 'react';
import { useGetAllUsers } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Search, User } from 'lucide-react';
import UserDetailModal from '../../components/admin/UserDetailModal';
import type { UserSummary } from '../../backend';

export default function AdminUsers() {
  const { data: users = [], isLoading } = useGetAllUsers();
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserSummary | null>(null);

  const filtered = users.filter((u) => {
    const name = u.profile?.name?.toLowerCase() ?? '';
    const principal = u.principal.toString().toLowerCase();
    const q = search.toLowerCase();
    return name.includes(q) || principal.includes(q);
  });

  const formatDate = (ts: bigint) => {
    const d = new Date(Number(ts) / 1_000_000);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-admin-fg">Users</h1>
          <p className="text-admin-muted text-sm mt-1">Manage registered customers</p>
        </div>
        <div className="flex items-center gap-2 bg-admin-card border border-admin-border rounded-xl px-3 py-2">
          <Users className="w-4 h-4 text-admin-accent" />
          <span className="text-admin-fg font-semibold">{users.length}</span>
          <span className="text-admin-muted text-sm">total</span>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-admin-muted" />
        <Input
          placeholder="Search by name or principal..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-admin-card border-admin-border text-admin-fg"
        />
      </div>

      {/* Table */}
      <Card className="bg-admin-card border-admin-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-admin-fg text-base">Registered Users</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <User className="w-12 h-12 text-admin-muted mx-auto mb-3 opacity-40" />
              <p className="text-admin-muted">
                {search ? 'No users match your search' : 'No registered users yet'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-admin-border">
                    <th className="text-left py-3 px-3 text-admin-muted font-medium">Name</th>
                    <th className="text-left py-3 px-3 text-admin-muted font-medium">Email</th>
                    <th className="text-left py-3 px-3 text-admin-muted font-medium">Principal</th>
                    <th className="text-left py-3 px-3 text-admin-muted font-medium">Registered</th>
                    <th className="text-left py-3 px-3 text-admin-muted font-medium">Orders</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((user) => (
                    <tr
                      key={user.principal.toString()}
                      className="border-b border-admin-border/50 hover:bg-admin-hover/30 cursor-pointer transition-colors"
                      onClick={() => setSelectedUser(user)}
                    >
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-admin-accent/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-admin-accent text-xs font-bold">
                              {user.profile?.name?.charAt(0)?.toUpperCase() ?? '?'}
                            </span>
                          </div>
                          <span className="text-admin-fg font-medium">
                            {user.profile?.name ?? <span className="text-admin-muted italic">No name</span>}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-admin-muted">
                        {user.profile?.email ?? '—'}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-mono text-xs text-admin-muted bg-admin-bg px-2 py-1 rounded">
                          {user.principal.toString().slice(0, 16)}...
                        </span>
                      </td>
                      <td className="py-3 px-3 text-admin-muted">
                        {formatDate(user.registeredAt)}
                      </td>
                      <td className="py-3 px-3">
                        <Badge variant="secondary" className="bg-admin-bg text-admin-fg border-0">
                          {user.orderCount.toString()} orders
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Detail Modal */}
      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
}
