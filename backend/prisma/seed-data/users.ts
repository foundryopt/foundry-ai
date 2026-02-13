import bcrypt from 'bcryptjs';
import type { PrismaClient } from '@prisma/client';

const SEED_USERS = [
  { name: 'Jordan M.', role: 'PM', entity: 'SHB Inc.', email: 'jordan@shbinc.com' },
  { name: 'Mike S.', role: 'Super', entity: 'SHB Inc.', email: 'mike@shbinc.com' },
  { name: 'Sam W.', role: 'Principal', entity: 'SHB Group', email: 'sam@shbgroup.com' },
  { name: 'Rachel K.', role: "Owner's Rep", entity: 'SHB Group', email: 'rachel@shbgroup.com' },
  { name: 'Alex P.', role: 'Procurement', entity: 'Builiq Inc.', email: 'alex@builiq.com' },
  { name: 'Taylor R.', role: 'Ops', entity: 'Builiq Inc.', email: 'taylor@builiq.com' },
] as const;

/**
 * Creates all seed users and returns a map of name -> id.
 * Password for every user: "foundry123"
 */
export async function seedUsers(prisma: PrismaClient): Promise<Map<string, string>> {
  const passwordHash = bcrypt.hashSync('foundry123', 10);
  const nameToId = new Map<string, string>();

  for (const u of SEED_USERS) {
    const user = await prisma.appUser.upsert({
      where: { email: u.email },
      update: { name: u.name, role: u.role, entity: u.entity, passwordHash },
      create: { name: u.name, role: u.role, entity: u.entity, email: u.email, passwordHash },
    });
    nameToId.set(user.name, user.id);
  }

  return nameToId;
}

export { SEED_USERS };
