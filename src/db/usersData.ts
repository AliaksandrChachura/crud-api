import { User } from './types';
import { readUsersFromFile } from '../utils/utils';

let usersData: User[] = [];

export const initializeUsersData = async (): Promise<void> => {
  usersData = await readUsersFromFile();
};

export const getUsersData = (): User[] => {
  return usersData;
};

export const updateUsersData = (data: User[]): void => {
  usersData = data;
};
