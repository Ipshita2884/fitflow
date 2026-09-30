'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  SessionFormValues, sessionFormSchema, sessionCategories, sessionCategoryLabels,
  exercisePhases, phaseLabels,
} from '@/lib/validators/session.schema';
import { sessionsApi, ApiClientError } from '@/lib/api/sessions';

const phaseAccent: Record<string, string> = {
  WARM_UP: 'border-l-slate-400',
  MAIN: 'border-l-accent',
  STRENGTH_CARDIO: 'border-l-ink-700',
  COOLDOWN: 'border-l-positive',
};

export function SessionBuilder({ onCreated }: { onCreated?: (sessionId: string) => void }) {
  const [submitState, setSubmitState] = useState<'idle' | 'submitting' | 'error'>('idle');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register, control, handleSubmit, watch, formState: { errors },
  } = useForm<SessionFormValues>({
    resolver: zodResolver(sessionFormSchema),
    defaultValues: {
      mode: 'IN_PERSON',
      difficulty: 'ALL_LEVELS',
      exercises: [],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'exercises' });
  const mode = watch('mode');

  function addMove(phase: (typeof exercisePhases)[number]) {
    append({
      id: crypto.randomUUID(),
      phase,
      name: '',
      order: fields.filter((f) => f.phase === phase).length,
    });
  }

  async function onSubmit(values: SessionFormValues) {
    setSubmitState('submitting');
    setSubmitError(null);
    try {
      const { data } = await sessionsApi.create({
        ...values,
        exercises: values.exercises.map(({ id: _id, ...rest }) => rest),
      });
      setSubmitState('idle');
      onCreated?.(data.id);
    } catch (err) {
      setSubmitState('error');
      setSubmitError(err instanceof ApiClientError ? err.message : 'Could not create the session. Please try again.');
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Session meta */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 font-display text-base font-semibold text-ink-950">Session Details</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Session Name" error={errors.name?.message}>
            <input {...register('name')} placeholder="e.g. Zumba Fat Burn" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-ink-950 focus:outline-none" />
          </Field>
          <Field label="Category" error={errors.category?.message}>
            <select {...register('category')} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-ink-950 focus:outline-none">
              {sessionCategories.map((c) => <option key={c} value={c}>{sessionCategoryLabels[c]}</option>)}
            </select>
          </Field>
          <Field label="Difficulty">
            <select {...register('difficulty')} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-ink-950 focus:outline-none">
              <option value="ALL_LEVELS">All Levels</option>
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>
          </Field>
          <Field label="Duration (min)" error={errors.durationMin?.message}>
            <input type="number" {...register('durationMin')} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-ink-950 focus:outline-none" />
          </Field>
          <Field label="Max Participants" error={errors.maxParticipants?.message}>
            <input type="number" {...register('maxParticipants')} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-ink-950 focus:outline-none" />
          </Field>
          <Field label="Estimated Calories">
            <input type="number" {...register('estimatedCalories')} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-ink-950 focus:outline-none" />
          </Field>
          <Field label="Date & Time" error={errors.scheduledDate?.message}>
            <input type="datetime-local" {...register('scheduledDate')} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-ink-950 focus:outline-none" />
          </Field>
          <Field label="Mode">
            <select {...register('mode')} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-ink-950 focus:outline-none">
              <option value="IN_PERSON">In Person</option>
              <option value="ONLINE">Online</option>
            </select>
          </Field>
          {mode === 'IN_PERSON' && (
            <Field label="Location" error={errors.location?.message}>
              <input {...register('location')} placeholder="Studio A" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-ink-950 focus:outline-none" />
            </Field>
          )}
        </div>
        <Field label="Description" className="mt-4">
          <textarea {...register('description')} rows={2} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-ink-950 focus:outline-none resize-none" placeholder="What should clients expect?" />
        </Field>
      </div>

      {/* Session Builder — Warm-up → Main → Strength/Cardio → Cooldown */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-1 flex items-center justify-between">
          <h3 className="font-display text-base font-semibold text-ink-950">Session Structure</h3>
          {errors.exercises && <span className="text-xs font-medium text-warning">{errors.exercises.message}</span>}
        </div>
        <p className="mb-5 text-xs text-slate-500">Build the flow move by move, phase by phase.</p>

        <div className="flex flex-col gap-5">
          {exercisePhases.map((phase) => {
            const phaseMoves = fields
              .map((f, idx) => ({ ...f, idx }))
              .filter((f) => f.phase === phase);

            return (
              <div key={phase} className={`rounded-xl border-l-4 bg-slate-50/60 p-4 ${phaseAccent[phase]}`}>
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-ink-950">{phaseLabels[phase]}</h4>
                  <button type="button" onClick={() => addMove(phase)} className="text-xs font-semibold text-ink-950 underline underline-offset-2 hover:text-accent-hover">
                    + Add Move
                  </button>
                </div>

                {phaseMoves.length === 0 ? (
                  <p className="text-xs text-slate-400">No moves added yet.</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {phaseMoves.map((move) => (
                      <div key={move.id} className="flex items-center gap-2 rounded-lg bg-white p-2.5 shadow-sm">
                        <input
                          {...register(`exercises.${move.idx}.name` as const)}
                          placeholder="Move name (e.g. Reggaeton step)"
                          className="flex-1 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs focus:border-ink-950 focus:outline-none"
                        />
                        <input
                          type="number"
                          {...register(`exercises.${move.idx}.durationSec` as const)}
                          placeholder="sec"
                          className="w-16 rounded-md border border-slate-200 px-2 py-1.5 text-xs focus:border-ink-950 focus:outline-none"
                        />
                        <button type="button" onClick={() => remove(move.idx)} className="text-slate-400 hover:text-warning" aria-label="Remove move">
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {submitState === 'error' && submitError && (
        <div className="rounded-lg bg-warning-bg px-4 py-3 text-sm text-ink-950">{submitError}</div>
      )}

      <div className="flex justify-end gap-3">
        <button type="submit" disabled={submitState === 'submitting'} className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink disabled:opacity-60">
          {submitState === 'submitting' ? 'Creating…' : 'Create Session'}
        </button>
      </div>

    </form>
  );
}

function Field({ label, error, className, children }: { label: string; error?: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-xs font-medium text-slate-500">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-warning">{error}</p>}
    </div>
  );
}
