import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"
import { generateToken } from "@/lib/token"

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    // Enhanced authorization with specific error messages
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required. Please log in again." },
        { status: 401 }
      )
    }

    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Insufficient permissions. Admin access required." },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, email } = body

    // Enhanced validation
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Student name is required and must be a non-empty string" },
        { status: 400 }
      )
    }

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required and must be a string" },
        { status: 400 }
      )
    }

    const trimmedEmail = email.toLowerCase().trim()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    
    if (!emailRegex.test(trimmedEmail)) {
      return NextResponse.json(
        { error: "Please provide a valid email address" },
        { status: 400 }
      )
    }

    // Verify database connection and user existence
    let dbUser
    try {
      dbUser = await prisma.user.findUnique({
        where: { id: user.id }
      })
    } catch (dbError) {
      console.error("[STUDENT_INVITATION] Database connection error:", dbError)
      return NextResponse.json(
        { error: "Database connection unavailable. Please try again." },
        { status: 503 }
      )
    }

    if (!dbUser) {
      return NextResponse.json(
        { error: "Your user account was not found. Please log in again." },
        { status: 404 }
      )
    }

    // Check for existing users with this email
    const existingUser = await prisma.user.findUnique({
      where: { email: trimmedEmail }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 409 }
      )
    }

    // Check for existing invitations
    const existingInvitation = await prisma.invitation.findFirst({
      where: {
        email: trimmedEmail,
        role: "STUDENT",
        accepted: false,
        expiresAt: {
          gt: new Date()
        }
      }
    })

    if (existingInvitation) {
      return NextResponse.json(
        { error: "An active student invitation already exists for this email" },
        { status: 409 }
      )
    }

    const token = generateToken()
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    const trimmedName = name.trim()

    const invitation = await prisma.invitation.create({
      data: {
        email: trimmedEmail,
        name: trimmedName,
        token,
        role: "STUDENT",
        createdBy: dbUser.id, // Use the verified database user ID
        expiresAt,
        accepted: false
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        expiresAt: true
      }
    })

    return NextResponse.json({
      success: true,
      message: "Student invitation created successfully",
      data: {
        invitation,
        // Include token only in development
        ...(process.env.NODE_ENV === 'development' && { token })
      }
    }, { status: 201 })

  } catch (error: any) {
    console.error("[STUDENT_INVITATION] Error creating student invitation:", error)

    // Handle specific database connection errors
    if (error.code === "P1001" || error.code === "P1002" || error.code === "P1003") {
      return NextResponse.json(
        { error: "Database connection unavailable. Please try again later." },
        { status: 503 }
      )
    }

    // Handle unique constraint violations
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "An invitation with this email already exists" },
        { status: 409 }
      )
    }

    // Handle foreign key constraints
    if (error.code === "P2003") {
      return NextResponse.json(
        { error: "Invalid user reference. Please try logging in again." },
        { status: 400 }
      )
    }

    // Handle validation errors
    if (error.name === 'PrismaClientValidationError') {
      return NextResponse.json(
        { error: "Invalid data provided. Please check your input." },
        { status: 400 }
      )
    }

    // Generic error response
    return NextResponse.json(
      { error: "Failed to create student invitation. Please try again." },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Insufficient permissions. Admin access required." },
        { status: 403 }
      )
    }

    // Verify database connection first
    try {
      await prisma.$queryRaw`SELECT 1`
    } catch (dbError) {
      console.error("[STUDENT_INVITATION] Database connection error:", dbError)
      return NextResponse.json(
        { error: "Database connection unavailable. Please try again." },
        { status: 503 }
      )
    }

    const { searchParams } = new URL(request.url)
    const includeExpired = searchParams.get('includeExpired') === 'true'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = { 
      role: "STUDENT",
      createdBy: user.id // Only show invitations created by this admin
    }

    if (!includeExpired) {
      where.expiresAt = {
        gt: new Date()
      }
    }

    const [invitations, totalCount] = await Promise.all([
      prisma.invitation.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          accepted: true,
          createdAt: true,
          expiresAt: true,
          acceptedAt: true
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit
      }),
      prisma.invitation.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: {
        invitations,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasNext: page * limit < totalCount,
          hasPrev: page > 1
        }
      }
    })

  } catch (error: any) {
    console.error("[STUDENT_INVITATION] Error fetching student invitations:", error)

    // Handle database connection errors
    if (error.code === "P1001" || error.code === "P1002" || error.code === "P1003") {
      return NextResponse.json(
        { error: "Database connection unavailable. Please try again later." },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { error: "Failed to fetch student invitations. Please try again." },
      { status: 500 }
    )
  }
}

// Optional: Add health check endpoint
export async function HEAD() {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`
    return new NextResponse(null, { status: 200 })
  } catch (error) {
    return new NextResponse(null, { status: 503 })
  }
}
