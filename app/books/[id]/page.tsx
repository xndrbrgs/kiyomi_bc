import prisma from "@/lib/prisma";
import { Link } from "next-view-transitions";
import { notFound } from "next/navigation";

// Simple UUID v4 regex (relaxed, lowercase/uppercase)
const uuidRegex =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;

type Props = { params: { id: string } };

export default async function BookDetailPage({ params }: Props) {
  const { id } = await params;

  // Optional: validate uuid
  if (!uuidRegex.test(id)) {
    notFound();
  }

  const book = await prisma.book.findUnique({
    where: { id },
  });

  if (!book) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      <div className="text-sm pb-6">
        <Link
          href="/"
          className="hover:underline hover:font-bold transition transform duration-150"
        >
          <span>← Return back to main menu</span>
        </Link>
      </div>
      <h1 className="text-3xl font-bold mb-2">{book.title}</h1>
      <p className="text-sm text-gray-600 mb-6">
        Listed on {new Date(book.createdAt).toLocaleString()}
      </p>

      <div className="flex md:flex-row flex-col gap-6 md:items-start items-center">
        <img
          src={book.imageUrl || "https://placehold.co/200x300?text=No+Cover"}
          alt={`${book.title} cover`}
          className="w-48 h-72 object-cover rounded"
        />
        <div className="mb-12 md:mb-0">
          <h2 className="text-xl font-semibold mb-2">Description</h2>
          <p className="text-gray-800">{book.description}</p>
        </div>
      </div>
    </main>
  );
}
``;
