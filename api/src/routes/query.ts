import prisma from "../db/prisma";

const getUserById = async (userId) => {
  try {
    const user = await prisma.users.findUnique({
      where: {
        user_id: userId, // Match the `user_id` field in the `Users` model
      },
    });
    return user;
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    throw error;
  }
};

const fetchUser = async () => {
  const userId = 1; // Replace with the actual user ID
  try {
    const user = await getUserById(userId);
    console.log("Fetched User:", user);
  } catch (error) {
    console.error("Error:", error);
  }
};

fetchUser();
