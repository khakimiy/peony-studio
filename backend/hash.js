const bcrypt = require('bcryptjs');
const parol = '90opklnmA'; // shu yerga o'z parolingizni yozing
bcrypt.hash(parol, 10).then(hash => console.log(hash));