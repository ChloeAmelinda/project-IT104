export interface User {
  id: number|string;
  username: string;
  password: string|number;
  fullName?: string;
  email?: string;
  gender?: string;
  status?: string|boolean;
}
