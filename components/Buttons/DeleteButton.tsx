"use client";

import { useTransition } from "react";
import { deleteBookAction } from "@/lib/actions/book-actions";

export default function DeleteButton({
  id,
  title,
  onDeleted,
}: {
  id: string;
  title?: string;
  onDeleted?: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    const confirmed = confirm(`Delete "${title ?? "this book"}"?`);
    if (!confirmed) return;

    startTransition(async () => {
      try {
        await deleteBookAction(id);
        // Inform parent to refresh list
        onDeleted?.();
      } catch (error) {
        console.error("Failed to delete the book:", error);
        alert("Failed to delete the book.");
      }
    });
  };

  return (
    <button
      onClick={handleDelete}
      className="ml-auto inline-flex items-center justify-center text-sm bg-red-500 text-white w-8 h-8 rounded-full hover:bg-red-700 disabled:opacity-60 shadow-md hover:cursor-pointer duration-300 transition-transform"
      disabled={isPending}
      aria-label={`Delete ${title ?? "book"}`}
    >
      {isPending ? "..." : "X"}
    </button>
  );
}
