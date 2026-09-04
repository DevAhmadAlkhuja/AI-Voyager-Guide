function isValidEmail(email) {
  if (typeof email !== "string") return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function assertPassword(password) {
  if (typeof password !== "string" || password.length < 8) {
    const err = new Error("Password must be at least 8 characters");
    err.statusCode = 400;
    throw err;
  }
}

function assertName(name) {
  if (typeof name !== "string" || name.trim().length < 2) {
    const err = new Error("Name is required");
    err.statusCode = 400;
    throw err;
  }
}

function assertEmail(email) {
  if (!isValidEmail(email)) {
    const err = new Error("Invalid email");
    err.statusCode = 400;
    throw err;
  }
}

module.exports = { isValidEmail, assertPassword, assertName, assertEmail };
