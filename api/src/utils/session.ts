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
  try {
    const session = await prisma.session.findFirst({
      where: {
        session_id: sessionId,
      },
      select: {
        user_id: true,
        expires_at: true,
      },
    });

    if (!session) {
      return null;
    }

    if (session.expires_at < new Date()) {
      return "timeout";
    }

    return session.user_id;
  } catch (error) {
    return null;
  }
}

export { updateSession, getUserIdFromSession };