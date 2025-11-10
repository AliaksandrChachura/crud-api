interface User {
  id: string;
  username: string;
  age: number;
  hobbies: string[];
}

interface DbChangedMessage {
  type: 'dbChanged';
  data: User[];
}

interface UpdatedDBMessage {
  type: 'updatedDB';
  data: User[];
}

type Message = DbChangedMessage | UpdatedDBMessage;

export type UserWithoutId = Omit<User, 'id'>;

export { User, DbChangedMessage, UpdatedDBMessage, Message };
