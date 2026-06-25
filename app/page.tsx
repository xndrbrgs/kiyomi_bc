"use client";

import { useEffect, useState } from "react";
import AddBookForm from "@/components/Home/AddBook";
import DeleteButton from "@/components/Buttons/DeleteButton";
import { Link } from "next-view-transitions";

type Book = {
  id: string; // UUID string
  title: string;
  description: string;
  bookReviewer: string;
  imageUrl?: string | null;
  createdAt: string;
};

export default function HomePage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBooks = async () => {
    setLoading(true);
    const res = await fetch("/api/books", { cache: "no-store" });
    const data = await res.json();
    setBooks(data);
    setLoading(false);
  };

  useEffect(() => {
    loadBooks();
  }, []);

  return (
    <main className="relative mx-auto max-w-3xl px-6">
      <AddBookForm onAdded={loadBooks} />

      <div className="py-4">
        <h2 className="text-2xl font-semibold mt-8 mb-3">Recent Books</h2>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : books.length === 0 ? (
          <p>No books yet—add your first!</p>
        ) : (
          <ul className="space-y-3 py-">
            {books.map((b) => (
              <li
                key={b.id}
                className="border rounded p-4 flex gap-4 items-center"
              >
                <div className="shadow-xl">
                  <img
                    src={
                      b.imageUrl || "https://placehold.co/80x120?text=No+Cover"
                    }
                    alt={`${b.title} cover`}
                    className="w-20 h-28 object-cover rounded"
                  />
                </div>
                <div className="flex-1">
                  <Link
                    href={`/books/${b.id}`}
                    className="text-lg font-semibold hover:underline"
                  >
                    {b.title}
                  </Link>
                  <p className="text-gray-600 line-clamp-1 md:line-clamp-3 text-sm md:text-md">
                    {b.description}
                  </p>
                  <div className="pt-2">
                    <p className="text-xs text-gray-500">
                      Review By:{" "}
                      <span className="text-black font-bold">
                        {b.bookReviewer}
                      </span>
                    </p>
                    <p className="text-xs text-gray-500">
                      Added: {new Date(b.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <DeleteButton id={b.id} title={b.title} onDeleted={loadBooks} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
