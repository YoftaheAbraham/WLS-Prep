import crypto from "crypto"
import { prisma } from "./db"

export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex")
}

export function generateTempPassword(): string {
  // Generate a 12-character temporary password with mixed case and numbers
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%"
  let password = ""
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

export async function verifyInvitationToken(token: string, role: "ADMIN" | "STUDENT") {
  const invitation = await prisma.invitation.findUnique({
    where: { token },
  })

  if (!invitation) {
    return { valid: false, error: "Invalid invitation token" }
  }

  if (invitation.accepted) {
    return { valid: false, error: "Invitation already used" }
  }

  if (invitation.role !== role) {
    return { valid: false, error: `Invitation is for ${invitation.role}, not ${role}` }
  }

  if (new Date() > invitation.expiresAt) {
    return { valid: false, error: "Invitation expired" }
  }

  return { valid: true, invitation }
}

export async function markInvitationAsAccepted(invitationId: string) {
  return await prisma.invitation.update({
    where: { id: invitationId },
    data: { accepted: true, acceptedAt: new Date() },
  })
}
