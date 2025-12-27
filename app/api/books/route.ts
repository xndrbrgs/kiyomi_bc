
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    const books = await prisma.book.findMany({
        orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(books);
}

export async function POST(req: Request) {
    try {
        const { titleCapital, description, imageUrl } = await req.json();

        if (!titleCapital || !description) {
            return NextResponse.json(
                { error: "Title and description are required." },
                { status: 400 }
            );
        }

        const book = await prisma.book.create({
            data: { title: titleCapital, description, imageUrl },
        });

        return NextResponse.json(book, { status: 201 });
    } catch (e) {
        return NextResponse.json(
            { error: "Failed to create book." },
            { status: 500 }
        );
    }
}
