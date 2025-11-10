import AsyncStorage from "@react-native-async-storage/async-storage";

export const getUsers = async () => {
  const users = await AsyncStorage.getItem("users");
  return users ? JSON.parse(users) : [];
};

export const addUser = async (user: any) => {
  const users = await getUsers();
  users.push(user);
  await AsyncStorage.setItem("users", JSON.stringify(users));
};
