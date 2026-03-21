export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface UpdateUserRequest {
  name: string;
  email: string;
}
