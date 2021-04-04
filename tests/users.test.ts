import { UserModel } from '../src/types';
import { gCall } from './utils/gcall';
import { closeDb, setupDb } from './utils/setup-db';

describe('Users', () => {
  beforeAll(async () => {
    await setupDb();
  });

  afterAll(async () => {
    await closeDb();
  });

  it('Should create a user', async () => {
    const res = await gCall({
      source: `
        mutation AddUser($data: AddUserInput!) {
          addUser(data: $data) {
            _id
          }
        }
      `,
      variableValues: {
        data: {
          name: 'Wilco',
          email: 'wbtubog@gmail.com',
          age: 26,
          password: 'password',
          confirmPassword: 'password',
        },
      },
    });
    const users = await UserModel.find();
    console.log({ res: res.errors, users });

    expect(res.errors).toBeUndefined();
  });
});
