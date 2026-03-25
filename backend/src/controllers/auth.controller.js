const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
    const token = jwt.sign(
      { email: process.env.ADMIN_EMAIL },
      process.env.JWT_SECRET,
      { expiresIn: '72h' }
    );
    return res.json({ success: true, token });
  }

  return res.status(401).json({ error: 'Invalid credentials' });
};

exports.verify = async (req, res) => {
  res.json({ success: true, user: req.user });
};
