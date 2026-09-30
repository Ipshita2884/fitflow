import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Calendar, CheckCircle2, XCircle, Clock } from "lucide-react";

export default async function ClientAnalyticsPage({ params }: { params: { clientId: string } }) {
  // Fetch actual attendance records
  const attendances = await prisma.attendance.findMany({
    where: { 
      sessionBooking: {
        clientId: params.clientId
      }
    },
    include: {
      sessionBooking: {
        include: { session: true }
      }
    },
    orderBy: { date: 'desc' }
  });

  const total = attendances.length;
  const present = attendances.filter(a => a.status === 'PRESENT').length;
  const absent = attendances.filter(a => a.status === 'ABSENT').length;
  const late = attendances.filter(a => a.status === 'LATE').length;
  
  const attendanceRate = total > 0 ? Math.round((present / total) * 100) : 0;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-surface tracking-tight">Attendance & Analytics</h2>
          <p className="text-slate-400 text-sm">Monitor consistency and session history.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card glass className="p-4 border-slate-500/20 text-center">
          <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">Total</p>
          <p className="text-3xl font-bold text-surface">{total}</p>
        </Card>
        <Card glass className="p-4 border-slate-500/20 text-center">
          <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">Attendance Rate</p>
          <p className="text-3xl font-bold text-accent">{attendanceRate}%</p>
        </Card>
        <Card glass className="p-4 border-slate-500/20 text-center">
          <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">Missed</p>
          <p className="text-3xl font-bold text-warning">{absent}</p>
        </Card>
        <Card glass className="p-4 border-slate-500/20 text-center">
          <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">Late</p>
          <p className="text-3xl font-bold text-slate-300">{late}</p>
        </Card>
      </div>

      <Card glass className="p-6 border-slate-500/20">
        <h3 className="text-lg font-bold text-surface mb-6 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-accent" /> Recent Session History
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-500/20 bg-ink-950/50">
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Session</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-500/10">
              {attendances.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500 text-sm">
                    No session history available.
                  </td>
                </tr>
              ) : (
                attendances.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-500/5 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-surface">
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300">
                      {record.sessionBooking.session.name}
                    </td>
                    <td className="px-6 py-4">
                      {record.status === 'PRESENT' && <span className="inline-flex items-center gap-1.5 bg-positive/10 text-positive px-2.5 py-1 rounded-full text-xs font-bold"><CheckCircle2 className="w-3.5 h-3.5" /> Present</span>}
                      {record.status === 'ABSENT' && <span className="inline-flex items-center gap-1.5 bg-warning/10 text-warning px-2.5 py-1 rounded-full text-xs font-bold"><XCircle className="w-3.5 h-3.5" /> Absent</span>}
                      {record.status === 'LATE' && <span className="inline-flex items-center gap-1.5 bg-slate-500/20 text-slate-300 px-2.5 py-1 rounded-full text-xs font-bold"><Clock className="w-3.5 h-3.5" /> Late</span>}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400 italic">
                      {record.remarks || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
