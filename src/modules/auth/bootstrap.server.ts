import type { createAuth } from './auth.server'
import { createAccountInput } from './domain/account'

export async function bootstrapFirstAdmin(instance: ReturnType<typeof createAuth>, input: unknown) {
  const data = createAccountInput.parse(input)
  const findAdmins = async () => {
    const users = await instance.db.selectFrom('user').select('role').execute()
    return users.some((user) => user.role?.split(',').includes('admin'))
  }
  if (await findAdmins()) throw new Error('An administrator already exists')

  // A durable unique claim serializes concurrent bootstraps. Never clear it automatically:
  // an interrupted account creation requires inspection rather than a potentially unsafe retry.
  await instance.db.insertInto('auth_bootstrap_guard').values({ id: 1 }).execute()
  if (await findAdmins()) throw new Error('An administrator already exists')

  await instance.auth.api.createUser({
    body: {
      name: data.name,
      email: data.email,
      password: data.password,
      role: 'admin',
      data: { username: data.username },
    },
  })
}
