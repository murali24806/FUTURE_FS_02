const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/leads', require('./routes/leads'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'CRM Backend Running', time: new Date().toISOString() });
});

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected Successfully');
    
    // Seed admin user on first run
    await seedAdmin();
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    console.log('\n⚠️  To fix: Update MONGODB_URI in backend/.env with your MongoDB Atlas connection string');
    process.exit(1);
  }
};

// Seed initial admin user
const seedAdmin = async () => {
  const User = require('./models/User');
  const bcrypt = require('bcryptjs');
  
  const existingAdmin = await User.findOne({ role: 'admin' });
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@123', 10);
    await User.create({
      name: 'Super Admin',
      email: process.env.ADMIN_EMAIL || 'admin@crm.com',
      password: hashedPassword,
      role: 'admin'
    });
    console.log(`✅ Admin seeded: ${process.env.ADMIN_EMAIL || 'admin@crm.com'} / ${process.env.ADMIN_PASSWORD || 'Admin@123'}`);
  }
};

connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 CRM Server running on port ${PORT}`);
  console.log(`📊 Admin Panel: http://localhost:3000`);
  console.log(`🔗 API Base: http://localhost:${PORT}/api`);
});
