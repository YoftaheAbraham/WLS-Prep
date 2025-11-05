import { prisma } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { verifyInvitationToken, markInvitationAsAccepted } from "@/lib/token"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, invitationToken, role } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    if (!invitationToken) {
      return NextResponse.json({ error: "Invitation token required" }, { status: 400 })
    }

    // Verify the invitation token first
    const tokenCheck = await verifyInvitationToken(invitationToken, role === "ADMIN" ? "ADMIN" : "STUDENT")
    if (!tokenCheck.valid) {
      return NextResponse.json({ error: tokenCheck.error }, { status: 400 })
    }

    const invitation = tokenCheck.invitation!
    const normalizedEmail = email.toLowerCase().trim()

    // BLOCK: Check if the provided email matches the invitation email
    if (invitation.email !== normalizedEmail) {
      return NextResponse.json(
        { 
          error: "Email does not match the invitation. Please use the email address that was originally invited."
        }, 
        { status: 400 }
      )
    }

    // Check if email already exists (but only if it's a different user)
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (existingUser && existingUser.isVerified) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 })
    }

    const hashedPassword = await hash(password, 10)

    let user: any

    if (existingUser) {
      // Update existing unverified user - but only if it matches our invitation
      user = await prisma.user.update({
        where: { email: normalizedEmail },
        data: {
          name: invitation.name, // Use the name from invitation, not from request
          password: hashedPassword,
          role: invitation.role, // Use role from invitation, not from request
          isVerified: true,
          invitationToken: invitation.token,
        },
      })
    } else {
      // Create new user with invitation data
      user = await prisma.user.create({
        data: {
          name: invitation.name,
          email: normalizedEmail,
          password: hashedPassword,
          role: invitation.role,
          isVerified: true,
          invitationToken: invitation.token,
        },
      })
    }

    // Mark invitation as accepted
    await markInvitationAsAccepted(invitation.id)

    // Set user session in cookies
    const cookieStore = await cookies()
    cookieStore.set(
      "user",
      JSON.stringify({
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      }),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60,
      },
    )

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
    })
  } catch (error) {
    console.error(" Signup error:", error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}