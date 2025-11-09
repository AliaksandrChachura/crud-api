import { User, Message } from './types';
import { readUsersFromFile } from '../utils/utils';

let usersData: User[] = [];
if (process.env.MULTI === 'true') {
  usersData = (await import('./usersData.json')).default as User[];
} else {
  usersData = (await import('./usersData.json')) as User[];
}

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
  if (!message) return;

  if (message.type === 'updatedDB') {
    updateUsersData(message.data);
  }
};

export { initializeUsersData, getUsersData, updateUsersData, handleMessage };
