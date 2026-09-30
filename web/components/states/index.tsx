export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-500">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-ink-950" />
      {label}
    </div>
  );
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 py-12 text-center">
      <p className="text-sm font-semibold text-ink-950">{title}</p>
      {description && <p className="max-w-xs text-xs text-slate-500">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-warning/30 bg-warning-bg py-10 text-center">
      <p className="text-sm font-semibold text-ink-950">Something went wrong</p>
      <p className="max-w-xs text-xs text-slate-500">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-2 rounded-md bg-ink-950 px-3 py-1.5 text-xs font-semibold text-white">
          Try again
        </button>
      )}
    </div>
  );
}

export function SessionCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-3 h-4 w-2/3 rounded bg-slate-100" />
      <div className="mb-2 h-3 w-1/2 rounded bg-slate-100" />
      <div className="h-3 w-1/3 rounded bg-slate-100" />
    </div>
  );
}
