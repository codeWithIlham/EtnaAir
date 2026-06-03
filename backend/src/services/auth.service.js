const prisma = require("../config/prisma");
const { hashPassword, comparePassword } = require("../../utils/hash");
const { generateToken } = require("../../utils/jwt");

exports.register = async (data) => {
  if (!data.email) {
    const err = new Error("Email is required");
    err.status = 400;
    throw err;
  }
  if (!data.password || data.password.length < 6) {
    const err = new Error("Password must be at least 6 characters");
    err.status = 400;
    throw err;
  }

  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    const err = new Error("Email already in use");
    err.status = 409;
    throw err;
  }

  const hash = await hashPassword(data.password);
  const user = await prisma.user.create({
    data: {
      first_name: data.first_name,
      last_name:  data.last_name,
      email:      data.email,
      password_hash: hash,
    },
  });

  const token = generateToken({ id: user.id, email: user.email, role: user.role });

  return {
    token,
    user: {
      id:         user.id,
      first_name: user.first_name,
      last_name:  user.last_name,
      email:      user.email,
      role:       user.role,
    },
  };
};

exports.login = async (email, password) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("User not found");

  const ok = await comparePassword(password, user.password_hash);
  if (!ok) throw new Error("Invalid password");

  const token = generateToken({ id: user.id, email: user.email, role: user.role });

  return {
    token,
    user: {
      id:         user.id,
      first_name: user.first_name,
      last_name:  user.last_name,
      email:      user.email,
      role:       user.role,
    },
  };
};
