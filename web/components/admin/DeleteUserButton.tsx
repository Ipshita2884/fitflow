"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { deleteUserAction } from "@/app/(admin)/actions/users";

export function DeleteUserButton({ userId, email }: { userId: string, email: string }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to permanently delete ${email}? This action cannot be undone.`)) {
      setIsDeleting(true);
      try {
        await deleteUserAction(userId);
      } catch (e: any) {
        alert(e.message);
      }
      setIsDeleting(false);
    }
  };

  return (
    <button 
      onClick={handleDelete} 
      disabled={isDeleting}
      className="p-2 rounded-md text-slate-500 hover:text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-50"
      title="Delete User"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
