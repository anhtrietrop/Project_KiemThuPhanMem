const prisma = require("../utills/db");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { asyncHandler, AppError } = require("../utills/errorHandler");

// Helper function to exclude password from user object
function excludePassword(user) {
  if (!user) return user;
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

// Helper function to generate JWT token
function generateToken(userId, email) {
  return jwt.sign(
    { userId, email },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
}

const getAllUsers = asyncHandler(async (request, response) => {
  const users = await prisma.user.findMany({});
  // Exclude password from all users
  const usersWithoutPasswords = users.map(user => excludePassword(user));
  return response.json(usersWithoutPasswords);
});

const createUser = asyncHandler(async (request, response) => {
  const { email, password, role, status, name, phone } = request.body;

  // Basic validation
  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new AppError("Invalid email format", 400);
  }

  // Password validation
  if (password.length < 8) {
    throw new AppError("Password must be at least 8 characters long", 400);
  }

  const hashedPassword = await bcrypt.hash(password, 14);

  const user = await prisma.user.create({
    data: {
      id: crypto.randomUUID(),
      email,
      password: hashedPassword,
      role: role || "user",
      status: status || "ACTIVE",
      name: name || null,
      phone: phone || null,
    },
  });
  // Exclude password from response
  return response.status(201).json(excludePassword(user));
});

const updateUser = asyncHandler(async (request, response) => {
  const { id } = request.params;
  const { email, password, role, status, name, phone } = request.body;

  if (!id) {
    throw new AppError("User ID is required", 400);
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      id: id,
    },
  });

  if (!existingUser) {
    throw new AppError("User not found", 404);
  }

  // Prepare update data
  const updateData = {};
  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new AppError("Invalid email format", 400);
    }
    updateData.email = email;
  }
  if (password) {
    if (password.length < 8) {
      throw new AppError("Password must be at least 8 characters long", 400);
    }
    updateData.password = await bcrypt.hash(password, 14);
  }
  if (role) updateData.role = role;
  if (status) updateData.status = status;
  if (name !== undefined) updateData.name = name === '' ? null : name;
  if (phone !== undefined) updateData.phone = phone === '' ? null : phone;

  const updatedUser = await prisma.user.update({
    where: {
      id: existingUser.id,
    },
    data: updateData,
  });

  // Exclude password from response
  return response.status(200).json(excludePassword(updatedUser));
});

const deleteUser = asyncHandler(async (request, response) => {
  const { id } = request.params;

  if (!id) {
    throw new AppError("User ID is required", 400);
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      id: id,
    },
  });

  if (!existingUser) {
    throw new AppError("User not found", 404);
  }

  const deletedUser = await prisma.user.update({
    where: { id },
    data: { deletedAt: new Date(), status: 'DELETED' }
  });
  return response.status(200).json(excludePassword(deletedUser));
});

const getUser = asyncHandler(async (request, response) => {
  const { id } = request.params;

  if (!id) {
    throw new AppError("User ID is required", 400);
  }

  const user = await prisma.user.findUnique({
    where: {
      id: id,
    },
  });
  
  if (!user) {
    throw new AppError("User not found", 404);
  }
  
  // Exclude password from response
  return response.status(200).json(excludePassword(user));
});

const getUserByEmail = asyncHandler(async (request, response) => {
  const { email } = request.params;

  if (!email) {
    throw new AppError("Email is required", 400);
  }

  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });
  
  if (!user) {
    throw new AppError("User not found", 404);
  }
  
  // Exclude password from response
  return response.status(200).json(excludePassword(user));
});

// Login function
const loginUser = asyncHandler(async (request, response) => {
  const { email, password } = request.body;

  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  // Compare password
  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    throw new AppError("Invalid credentials", 401);
  }

  // Generate token
  const token = generateToken(user.id, user.email);

  return response.status(200).json({
    token,
    user: excludePassword(user),
  });
});

// Get current user profile
const getUserProfile = asyncHandler(async (request, response) => {
  // request.user is set by authentication middleware
  const userId = request.user?.userId || request.user?.id;

  if (!userId) {
    throw new AppError("User not authenticated", 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return response.status(200).json(excludePassword(user));
});

// Update current user profile
const updateUserProfile = asyncHandler(async (request, response) => {
  const userId = request.user?.userId || request.user?.id;

  if (!userId) {
    throw new AppError("User not authenticated", 401);
  }

  const { name, phone, email, role } = request.body;

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  // Don't allow email updates - remove email from update data
  const updateData = {};
  if (name !== undefined) updateData.name = name === '' ? null : name;
  if (phone !== undefined) updateData.phone = phone === '' ? null : phone;
  if (role !== undefined) updateData.role = role;

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });

  return response.status(200).json(excludePassword(updatedUser));
});

module.exports = {
  createUser,
  updateUser,
  deleteUser,
  getUser,
  getAllUsers,
  getUserByEmail,
  loginUser,
  getUserProfile,
  updateUserProfile,
};
