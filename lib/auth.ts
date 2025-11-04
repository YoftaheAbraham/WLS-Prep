import { cookies } from "next/headers"

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const userCookie = cookieStore.get("user")

  if (!userCookie?.value) {
    return null
  }

  try {
    return JSON.parse(userCookie.value)
  } catch {
    return null
  }
}

export async function isAdmin() {
  const user = await getCurrentUser()
  return user?.role === "ADMIN"
}

export async function isStudent() {
  const user = await getCurrentUser()
  return user?.role === "STUDENT"
}
