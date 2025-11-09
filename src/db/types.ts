interface User {
  id: string;
  username: string;
  age: number;
  hobbies: string[];
}

interface Message {
  type: string;
  data: User[];
}


export type UserWithoutId = Omit<User, 'id'>;
export { User, Message };
