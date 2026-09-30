import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { DeleteUserButton } from "@/components/admin/DeleteUserButton";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    include: {
      trainerProfile: true,
      clientProfile: true,
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-bold text-surface mb-2 tracking-tight">User Management</h1>
        <p className="text-slate-500">View and manage all registered accounts on the platform.</p>
      </div>

      <Card glass className="border-slate-500/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-500/20 bg-ink-950/50">
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-500/10">
              {users.map((user) => {
                const profile = user.role === "TRAINER" ? user.trainerProfile : user.clientProfile;
                const name = profile?.fullName || "No Profile Set";
                
                return (
                  <tr key={user.id} className="hover:bg-slate-500/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-500/20 border border-slate-500/30 flex items-center justify-center text-xs font-bold text-surface">
                          {name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-surface">{name}</div>
                          <div className="text-xs text-slate-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        user.role === "ADMIN" ? "bg-warning/10 text-warning border-warning/20" :
                        user.role === "TRAINER" ? "bg-accent/10 text-accent border-accent/20" :
                        "bg-positive/10 text-positive border-positive/20"
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {user.role !== "ADMIN" && (
                        <DeleteUserButton userId={user.id} email={user.email} />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
