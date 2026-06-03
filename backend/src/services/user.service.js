const prisma = require("../config/prisma");
const bcrypt = require("bcrypt");

exports.createUser = async (data) => {
  const hash = await bcrypt.hash(data.password, 10);

  return prisma.user.create({
    data: {
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      password_hash: hash,
    },
  });
};

exports.getUsers = async () => {
  return prisma.user.findMany({ orderBy: { created_at: "desc" } });
};

exports.getUserById = async (id) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) { const e = new Error("User not found"); e.status = 404; throw e; }
  return user;
};

exports.updateProfile = async (id, data) => {
  const fields = {};
  if (data.first_name !== undefined)      fields.first_name      = data.first_name;
  if (data.last_name !== undefined)       fields.last_name       = data.last_name;
  if (data.phone_number !== undefined)    fields.phone_number    = data.phone_number;
  if (data.bio !== undefined)             fields.bio             = data.bio;
  if (data.profile_picture !== undefined) fields.profile_picture = data.profile_picture;
  if (data.password)                      fields.password_hash   = await bcrypt.hash(data.password, 10);
  return prisma.user.update({ where: { id }, data: fields });
};

exports.updateRole = async (id, role) => {
  if (!["guest", "host", "admin"].includes(role)) {
    const e = new Error("Rôle invalide : guest | host | admin"); e.status = 400; throw e;
  }
  return prisma.user.update({ where: { id }, data: { role } });
};

exports.deleteUser = async (id) => {
  return prisma.user.delete({ where: { id } });
};