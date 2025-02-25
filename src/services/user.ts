export const getUsers = async () => {
  return await User.find();
};
