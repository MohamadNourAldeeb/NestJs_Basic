import { UuidService } from '../services/uuid.service';

let UuidServiceFunction = new UuidService();

let permissions_db = [
  // { mode: 'language', description: 'create language' },
  // { mode: 'language', description: 'update language' },
  // { mode: 'language', description: 'change state language' },
  // { mode: 'language', description: 'delete language' },
  // { mode: 'language', description: 'getAll language' },
  // { mode: 'user', description: 'create user' },
  // { mode: 'user', description: 'update user' },
  // { mode: 'user', description: 'delete user' },
  // { mode: 'user', description: 'getAll user' },
];

let permissions = {
  language: {
    create: { value: 27, name: 'create language' },
    update: { value: 28, name: 'update language ' },
    change_state: { value: 29, name: 'change state language' },
    delete: { value: 30, name: 'delete language' },
    getAll: { value: 31, name: 'getAll language' },
  },
  user: {
    create: { value: 32, name: 'create user' },
    update: { value: 33, name: 'update user ' },
    delete: { value: 34, name: 'delete user' },
    getAll: { value: 35, name: 'getAll user' },
  },
};

let admin_permissions = [1, 2, 3];
let user_permissions = [1, 2];
export { permissions, permissions_db, admin_permissions, user_permissions };
