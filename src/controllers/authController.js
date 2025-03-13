// https://grok.com/chat/adf03442-1184-416b-add0-045af15d375e
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Joi = require('joi');

// Dùng thư viện như Joi để lọc dữ liệu từ client
const registerSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
  role: Joi.forbidden(), // Cấm gửi role
});

exports.register = async (req, res) => {
  const { error } = registerSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { username, password } = req.body;

  // Kiểm tra nếu thiếu thông tin
  if (!username || !password) {
    return res
      .status(400)
      .json({ status: 400, message: 'Username and password are required' });
  }

  try {
    // Kiểm tra xem username đã tồn tại chưa
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res
        .status(400)
        .json({ status: 400, message: 'Username already exists' });
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 8);

    // Tạo user mới
    const user = new User({
      username,
      password: hashedPassword,
    });

    await user.save();

    const userResponse = {
      _id: user._id,
      username: user.username,
      role: user.role,
    };

    res.status(201).json({
      status: 201,
      message: 'User registered successfully',
      userResponse,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res
      .status(500)
      .json({ status: 500, message: 'Server error during registration' });
  }
};

exports.registerAdmin = async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 8);
  const user = await User.create({
    username,
    password: hashedPassword,
    role: 'admin',
  });
  res.status(201).json({ message: 'Admin registered', user });
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  const ACCESS_TOKEN_SECRET =
    process.env.ACCESS_TOKEN_SECRET || 'access-secret-key';
  const REFRESH_TOKEN_SECRET =
    process.env.REFRESH_TOKEN_SECRET || 'refresh-secret-key';

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const accessToken = jwt.sign(
    { id: user._id, username, role: user.role },
    ACCESS_TOKEN_SECRET,
    { expiresIn: '1m' },
  );
  const refreshToken = jwt.sign(
    { id: user._id, username, role: user.role },
    REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' },
  );

  user.refreshToken = refreshToken;
  await user.save();

  res.json({ accessToken, refreshToken });
};

exports.refresh = async (req, res) => {
  const { refreshToken } = req.body;
  const user = await User.findOne({ refreshToken });

  if (!user) return res.status(403).json({ message: 'Invalid refresh token' });

  jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Invalid refresh token' });
    const accessToken = jwt.sign(
      { id: decoded.id, username: decoded.username },
      ACCESS_TOKEN_SECRET,
      { expiresIn: '15m' },
    );
    res.json({ accessToken });
  });
};

exports.logout = async (req, res) => {
  const { refreshToken } = req.body;
  const user = await User.findOne({ refreshToken });

  if (user) {
    user.refreshToken = null;
    await user.save();
  }
  res.json({ message: 'Logged out successfully' });
};
