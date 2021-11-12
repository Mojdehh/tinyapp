
// Email lookup helper function
const getUserByEmail = function(email, userDB) {
  for (let key in userDB) {
    if (userDB[key].email === email) return userDB[key];
  }
};


// create a random alphanumeric string
const generateRandomString = function(len) {
  let str = Math.random().toString(36).substr(2, len);
  return str;
};


// Function to store user's URLs
const urlsForUser = function(id, urlBD) {
  const results = {};
  const keys = Object.keys(urlBD);
  for (let shortURL of keys) {
    const url = urlBD[shortURL];
    if (url.userID === id) {
      results[shortURL] = url;
    }
  }
  return results;
};



module.exports = { getUserByEmail, generateRandomString, urlsForUser };