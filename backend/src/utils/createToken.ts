import jwt from "jsonwebtoken";

export const createToken = () => {
  const token = jwt.sign(
    { purpose: `${process.env.PAYLOAD}` },
    `${process.env.SECRET_KEY}`,
    {
      expiresIn: 24 * 60 * 60 * 1000,
    },
  );
  return token;
};
