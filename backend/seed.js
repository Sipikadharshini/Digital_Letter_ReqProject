const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const PreRegisteredStudent = require('./models/PreRegisteredStudent');

dotenv.config();

async function main() {
  await connectDB();

  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await User.findOneAndUpdate(
    { email: 'admin@docflow.edu' },
    {
      $setOnInsert: {
        email: 'admin@docflow.edu',
        name: 'System Admin',
        password: hashedPassword,
        role: 'ADMIN',
      },
    },
    { returnDocument: 'after', upsert: true }
  );

  console.log('Admin user created/verified:', admin);

  await PreRegisteredStudent.findOneAndUpdate(
    { rollNumber: '1001' },
    { $setOnInsert: { rollNumber: '1001' } },
    { returnDocument: 'after', upsert: true }
  );
  console.log('Pre-registered student 1001 added');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await mongoose.disconnect();
  });
