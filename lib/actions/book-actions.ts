
"use server";

import prisma from "@/lib/prisma";

export async function deleteBookAction(id: string) {
    await prisma.book.delete({ where: { id } });
}
