import process from 'node:process';
import { User } from '../db/types';

const sendUpdatedDB = (updatedDB: User[]) => {
  process.send?.({ type: 'updatedDB', data: updatedDB });
};

export { sendUpdatedDB };