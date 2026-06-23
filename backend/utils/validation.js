const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isValidEmail = (email) => {
  return typeof email === 'string' && emailRegex.test(email.trim());
};

module.exports = {
  isValidEmail,
};
