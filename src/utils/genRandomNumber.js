export const genRandomNumber = () => {
  let token = "";
  for (let i = 0; i < 6; i++) {
    let digit = Math.random() * 10;
    token += Math.floor(digit);
  }
  return token;
};

export const genRandomPassword = (length) => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    password += characters.charAt(randomIndex);
  }
  return password;
};
