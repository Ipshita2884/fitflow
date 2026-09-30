import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { MeasurementChart } from "@/components/trainer/client-profile/MeasurementChart";
import { Plus } from "lucide-react";

export default async function ClientMeasurementsPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params;
  const measurements = await prisma.bodyMeasurement.findMany({
    where: { clientId },
    orderBy: { recordedAt: 'desc' }
  });

  return (
    <div className="space-y-6 pb-12">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-surface tracking-tight">Body Measurements</h2>
          <p className="text-slate-400 text-sm">Track physical changes over time.</p>
        </div>
        <button className="flex items-center gap-2 bg-accent text-ink-950 px-4 py-2 rounded-lg font-bold hover:bg-accent/90 transition-colors text-sm">
          <Plus className="w-4 h-4" /> Add Record
        </button>
      </div>

      <MeasurementChart data={measurements} />

      <Card glass className="border-slate-500/20 overflow-hidden mt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-500/20 bg-ink-950/50">
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Weight (kg)</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Body Fat %</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Chest / Waist / Hips (cm)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-500/10">
              {measurements.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500 text-sm">
                    No measurements recorded yet.
                  </td>
                </tr>
              ) : (
                measurements.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-500/5 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-surface">
                      {new Date(m.recordedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300">
                      {m.weightKg ? <span className="font-bold text-accent">{m.weightKg}</span> : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300">
                      {m.bodyFatPercentage ? `${m.bodyFatPercentage}%` : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300">
                      {m.chestCm || '-'} / {m.waistCm || '-'} / {m.hipsCm || '-'}
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
