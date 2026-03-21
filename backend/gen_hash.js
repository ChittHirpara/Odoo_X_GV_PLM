const bcrypt = require('bcryptjs');

const password = 'password123';
bcrypt.hash(password, 12).then(hash => {
  console.log('New Hash:', hash);
});
