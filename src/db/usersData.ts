import { User } from './types';
import { readUsersFromFile } from '../utils/utils';
import { Message } from  './types';

let initialUsers: User[] = await import('./usersData.json');

let usersData: User[] = [];

const initializeUsersData = async (): Promise<void> => {
  usersData = await readUsersFromFile();
};

const getUsersData = (): User[] => {
  return usersData;
};

const updateUsersData = (data: User[]): void => {
  usersData = data;
};


const handleMessage = (message: Message) => {
  if (message && message.type === 'updatedDB') {
    initialUsers = [...message.data];
  }
};

export { initializeUsersData, getUsersData, updateUsersData, handleMessage };
