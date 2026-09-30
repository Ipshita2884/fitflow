"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Lock, Plus, Save } from "lucide-react";

// In a real implementation this would be a server action
export function PrivateNotesEditor({ 
  clientId, 
  trainerProfileId, 
  initialNotes 
}: { 
  clientId: string; 
  trainerProfileId: string;
  initialNotes: any[];
}) {
  const [notes, setNotes] = useState(initialNotes);
  const [newNote, setNewNote] = useState("");
  const [category, setCategory] = useState("GENERAL");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    
    setIsSaving(true);
    
    // Simulate server action delay
    await new Promise(r => setTimeout(r, 600));
    
    const note = {
      id: Math.random().toString(),
      content: newNote,
      category,
      createdAt: new Date().toISOString()
    };
    
    setNotes([note, ...notes]);
    setNewNote("");
    setIsSaving(false);
    alert("Private note securely saved");
  };

  return (
    <div className="space-y-6">
      <Card glass className="p-6 border-warning/20 bg-warning/5">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="flex gap-4 items-center">
            <Lock className="w-5 h-5 text-warning" />
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-ink-900 border border-slate-500/30 rounded-md px-3 py-1.5 text-sm text-surface focus:outline-none focus:border-warning"
            >
              <option value="GENERAL">General Observation</option>
              <option value="SESSION">Session Note</option>
              <option value="FOLLOW_UP">Follow Up Required</option>
            </select>
          </div>
          
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Write a private note about this client's progress, attitude, or things to focus on next session..."
            className="w-full h-32 bg-ink-950/50 border border-slate-500/30 rounded-xl p-4 text-surface focus:outline-none focus:border-warning resize-none text-sm placeholder:text-slate-600"
          />
          
          <div className="flex justify-end">
            <button 
              type="submit"
              disabled={isSaving || !newNote.trim()}
              className="flex items-center gap-2 bg-warning text-ink-950 px-4 py-2 rounded-lg font-bold hover:bg-warning/90 transition-colors text-sm disabled:opacity-50"
            >
              {isSaving ? <span className="animate-spin text-lg">⏳</span> : <Save className="w-4 h-4" />}
              Save Secure Note
            </button>
          </div>
        </form>
      </Card>

      <div className="space-y-4">
        {notes.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-500/30 rounded-xl bg-ink-950/30">
            <Lock className="w-8 h-8 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No private notes found for this client.</p>
          </div>
        ) : (
          notes.map((note) => (
            <Card key={note.id} glass className="p-5 border-slate-500/20">
              <div className="flex justify-between items-start mb-3">
                <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wider ${
                  note.category === 'GENERAL' ? 'bg-slate-500/20 text-slate-300' :
                  note.category === 'SESSION' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {note.category.replace('_', ' ')}
                </span>
                <span className="text-xs text-slate-500">
                  {new Date(note.createdAt).toLocaleString(undefined, {
                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </span>
              </div>
              <p className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">
                {note.content}
              </p>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
