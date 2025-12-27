"use client";

import { capitalizeWords } from "@/utils/string-utils";
import { useState } from "react";

type Props = {
  onAdded?: () => void; // callback to refresh the list after adding a book
};

export default function AddBookForm({ onAdded }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const imageUrl = title
        ? `/api/cover?title=${encodeURIComponent(title)}&size=M`
        : undefined;

      const titleRaw = title.trim();
      const titleCapital = capitalizeWords(titleRaw);
      console.log("Capitalized Title:", titleCapital);

      const res = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titleCapital,
          description,
          imageUrl,
        }),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Failed to add book");
      }

      // Clear form and notify parent to refresh the list
      setTitle("");
      setDescription("");
      onAdded?.();
    } catch (err) {
      console.error(err);
      alert("Could not add the book. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mt-8 mb-3">
        Add Your Lastest Books
      </h2>
      <form
        onSubmit={handleAdd}
        className="space-y-4 border p-4 rounded bg-white shadow-sm"
      >
        <div className="flex flex-col space-y-2">
          <label className="block font-medium">Book Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border rounded p-2"
            placeholder="e.g., The Great Gatsby"
            required
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label className="block font-medium">Share Your Thoughts!</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border rounded p-2"
            placeholder="What’s this book about and what did you like from it?"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-black text-white px-4 py-2 rounded disabled:opacity-60"
        >
          {loading ? "Adding..." : "Add Book"}
        </button>
      </form>
    </div>
  );
}
