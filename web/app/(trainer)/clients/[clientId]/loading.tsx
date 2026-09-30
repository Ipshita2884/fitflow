import { Card } from "@/components/ui/card";

export default function ClientProfileLoading() {
  return (
    <div className="space-y-6 pb-12 animate-pulse">
      <div className="h-[200px] bg-ink-900 rounded-2xl border border-slate-500/20" />
      
      <div className="flex gap-4 mb-6 overflow-x-hidden">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-10 w-28 bg-ink-900 rounded-lg shrink-0" />
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} glass className="p-5 h-[120px] bg-ink-900/50 border-slate-500/20" />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card glass className="lg:col-span-2 p-6 h-[400px] bg-ink-900/50 border-slate-500/20" />
        <Card glass className="p-6 h-[400px] bg-ink-900/50 border-slate-500/20" />
      </div>
    </div>
  );
}
