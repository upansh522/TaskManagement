import jwt from "jsonwebtoken";

const generateToken = (user) => {
  // Include essential user data in JWT
  const payload = {
    id: user._id,
    email: user.email,
    role: user.role,
    name: user.name,
    isVerified: user.isVerified
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

export default generateToken;


