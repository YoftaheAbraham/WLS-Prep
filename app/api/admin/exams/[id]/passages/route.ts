import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const user = await getCurrentUser()
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { content } = body

    if (!content || typeof content !== "string" || !content.trim()) {
      return NextResponse.json({ error: "Passage content is required" }, { status: 400 })
    }

    const passage = await prisma.passage.create({
      data: {
        examId: id,
        content: content.trim(),
      },
    })

    return NextResponse.json({ passage })
  } catch (error) {
    console.error(" Error creating passage:", error)
    return NextResponse.json({ error: "Failed to create passage" }, { status: 500 })
  }
}
