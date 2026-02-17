const crypto = require('crypto');
const botToken = process.argv[2];
const userId = process.argv[3];
const username = process.argv[4] || `user_${userId}`;

const data = {
    id: userId,
    first_name: 'User',
    username: username,
    auth_date: Math.floor(Date.now() / 1000).toString()
};

const checkString = Object.keys(data)
    .sort()
    .map((k) => `${k}=${data[k]}`)
    .join('\n');

const secretKey = crypto.createHash('sha256').update(botToken).digest();
const hash = crypto.createHmac('sha256', secretKey).update(checkString).digest('hex');

console.log(JSON.stringify({ ...data, hash }));
