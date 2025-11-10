import process from 'node:process';
import { User } from '../db/types';

const sendDbChangedMessage = (updatedDB: User[]) => {
  if (typeof process.send === 'function') {
    process.send?.({ type: 'dbChanged', data: updatedDB });
  }
};

export { sendDbChangedMessage };
