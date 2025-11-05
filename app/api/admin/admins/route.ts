import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"
import { generateToken, generateTempPassword } from "@/lib/token"

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    // Enhanced authorization check
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

    const body = await request.json()
    const { name, email } = body

    // Enhanced validation with specific error messages
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Admin name is required and must be a non-empty string" },
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

    // Check if user already exists
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
        role: "ADMIN",
        accepted: false,
        expiresAt: {
          gt: new Date()
        }
      }
    })

    if (existingInvitation) {
      return NextResponse.json(
        { error: "An active admin invitation already exists for this email" },
        { status: 409 }
      )
    }

    const token = generateToken()
    const tempPassword = generateTempPassword()
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    const trimmedName = name.trim()

    // Verify the creating user exists in database
    const creatingUser = await prisma.user.findUnique({
      where: { id: user.id }
    })

    if (!creatingUser) {
      return NextResponse.json(
        { error: "Creating user not found in database" },
        { status: 404 }
      )
    }

    const invitation = await prisma.invitation.create({
      data: {
        email: trimmedEmail,
        name: trimmedName,
        token,
        role: "ADMIN",
        createdBy: user.id, // This should now be valid
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

    // In a real application, you would send an email here
    console.log(`Admin invitation created for ${trimmedEmail}`)
    console.log(`Temporary password: ${tempPassword}`) // Remove this in production

    return NextResponse.json({
      success: true,
      message: "Admin invitation created successfully",
      data: {
        invitation,
        // Only include sensitive data in development
        ...(process.env.NODE_ENV === 'development' && {
          token,
          tempPassword
        })
      }
    }, { status: 201 })

  } catch (error: unknown) {
    console.error("[ADMIN_INVITATION] Error creating admin invitation:", error)

    if (error instanceof Error) {
      // Handle specific Prisma errors
      if ('code' in error && error.code === "P2002") {
        return NextResponse.json(
          { error: "An invitation with this email already exists" },
          { status: 409 }
        )
      }

      if ('code' in error && error.code === "P2003") {
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
    }

    // Generic error response
    return NextResponse.json(
      { error: "Internal server error. Please try again later." },
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

    const { searchParams } = new URL(request.url)
    const includeExpired = searchParams.get('includeExpired') === 'true'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      role: "ADMIN"
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
    console.error("[ADMIN_INVITATION] Error fetching admin invitations:", error)

    return NextResponse.json(
      { error: "Failed to fetch invitations. Please try again later." },
      { status: 500 }
    )
  }
}

// Optional: Add DELETE endpoint for revoking invitations
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const invitationId = searchParams.get('id')

    if (!invitationId) {
      return NextResponse.json(
        { error: "Invitation ID is required" },
        { status: 400 }
      )
    }

    const invitation = await prisma.invitation.findUnique({
      where: { id: invitationId }
    })

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitation not found" },
        { status: 404 }
      )
    }

    if (invitation.accepted) {
      return NextResponse.json(
        { error: "Cannot delete an accepted invitation" },
        { status: 400 }
      )
    }

    await prisma.invitation.delete({
      where: { id: invitationId }
    })

    return NextResponse.json({
      success: true,
      message: "Invitation revoked successfully"
    })

  } catch (error: any) {
    console.error("[ADMIN_INVITATION] Error deleting invitation:", error)

    return NextResponse.json(
      { error: "Failed to revoke invitation" },
      { status: 500 }
    )
  }
}