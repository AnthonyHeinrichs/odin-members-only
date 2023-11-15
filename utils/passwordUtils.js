const bcrypt = require("bcryptjs");

const hashPassword = async (password) => {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    return hashedPassword;
  } catch (error) {
    throw error;
  }
};

const checkPasswordValidity = async (password, userPassword) => {
  try {
    const match = bcrypt.compare(password, user.password)
    return match;
  } catch (error) {
    throw error;
  }
}

module.exports = { hashPassword, checkPasswordValidity };
