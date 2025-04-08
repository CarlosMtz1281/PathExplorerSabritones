import prisma from "../db/prisma";

async function updateSession(sessionId: string) {
  try {
    const updatedSession = await prisma.session.update({
      where: {
        session_id: sessionId,
      },
      data: {
        expires_at: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    console.log("Session updated:", updatedSession);
    return updatedSession;
  } catch (error) {
    console.error("Error updating session:", error);
    throw error;
  }
}

async function getUserIdFromSession(sessionId: string) {
  console.log("Fetching user ID from session:", sessionId);
  const session = await prisma.session.findFirst({
    where: {
      session_id: sessionId,
    },
    select: {
      user_id: true,
    },
  });
  console.log("Session data:", session);
  return session?.user_id;
}

export { updateSession, getUserIdFromSession };