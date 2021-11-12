
// Email lookup helper function
const getUserByEmail = function(email, userDB) {
  for (let key in userDB) {
    if (userDB[key].email === email) return userDB[key];
  }
};


module.exports = { getUserByEmail };