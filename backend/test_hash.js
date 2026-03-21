const bcrypt = require('bcryptjs');

const hash = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewdBIwhA4FbV8UHm';
const password = 'password123';

bcrypt.compare(password, hash).then(res => {
  console.log('Match:', res);
});
