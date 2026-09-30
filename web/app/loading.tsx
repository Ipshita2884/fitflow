import { Card } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 w-full animate-pulse">
      <div className="flex justify-between items-end">
        <div className="space-y-3 w-1/3">
          <div className="h-8 bg-ink-700/50 rounded-md w-3/4"></div>
          <div className="h-4 bg-ink-700/50 rounded-md w-1/2"></div>
        </div>
        <div className="h-10 w-40 bg-ink-700/50 rounded-md"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} glass className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-lg bg-ink-700/50"></div>
              <div className="w-12 h-4 bg-ink-700/50 rounded-full"></div>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-ink-700/50 rounded-md w-1/2"></div>
              <div className="h-8 bg-ink-700/50 rounded-md w-1/4"></div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card glass className="p-6 min-h-[400px]">
            <div className="h-6 bg-ink-700/50 rounded-md w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="p-4 rounded-xl border border-slate-500/10 bg-ink-700/10 flex gap-4">
                  <div className="w-24 h-24 bg-ink-700/30 rounded-lg shrink-0"></div>
                  <div className="flex-1 space-y-3 py-2">
                    <div className="h-5 bg-ink-700/50 rounded-md w-1/3"></div>
                    <div className="h-3 bg-ink-700/50 rounded-md w-1/4"></div>
                    <div className="flex gap-2 mt-4">
                      <div className="h-6 w-16 bg-ink-700/50 rounded-md"></div>
                      <div className="h-6 w-16 bg-ink-700/50 rounded-md"></div>
                      <div className="h-6 w-16 bg-ink-700/50 rounded-md"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card glass className="p-6 min-h-[400px]">
            <div className="h-6 bg-ink-700/50 rounded-md w-1/3 mb-6"></div>
            <div className="space-y-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-ink-700/50 shrink-0 mt-1" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-ink-700/50 rounded-md w-3/4"></div>
                    <div className="h-3 bg-ink-700/50 rounded-md w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
