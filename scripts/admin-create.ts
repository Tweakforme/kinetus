/**
 * Creates the site's admin account, or resets its password.
 *
 *   npm run admin:create -- --email you@example.com --password "a long passphrase"
 *   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD="a long passphrase" npm run admin:create
 *
 * The site has one admin. Run it again with the same email to reset the password. If the
 * admin exists under a different email, add --replace to move the account to the new
 * email and password. A reset or replace signs out every open session.
 *
 * Nothing is hard-coded and the password is never printed. Passing it as an argument can
 * leave it in shell history; the environment-variable form avoids that.
 */

import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const BCRYPT_COST = 12;
const MIN_PASSWORD_LENGTH = 12;
/** bcrypt ignores everything after 72 bytes, so longer passwords are refused. */
const MAX_PASSWORD_BYTES = 72;

function argument(name: string): string | undefined {
  const flag = `--${name}`;
  const index = process.argv.indexOf(flag);
  if (index !== -1) {
    return process.argv[index + 1];
  }
  const inline = process.argv.find((arg) => arg.startsWith(`${flag}=`));
  return inline?.slice(flag.length + 1);
}

function fail(message: string): never {
  console.error(`admin:create: ${message}`);
  process.exit(1);
}

async function main() {
  const email = (argument("email") ?? process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
  const password = argument("password") ?? process.env.ADMIN_PASSWORD ?? "";
  const replace = process.argv.includes("--replace");

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fail("give the admin's email with --email or ADMIN_EMAIL.");
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    fail(
      `give a password of at least ${MIN_PASSWORD_LENGTH} characters with --password or ADMIN_PASSWORD.`,
    );
  }
  if (new TextEncoder().encode(password).length > MAX_PASSWORD_BYTES) {
    fail(`the password is longer than ${MAX_PASSWORD_BYTES} bytes; use a shorter one.`);
  }

  const prisma = new PrismaClient();
  try {
    const passwordHash = await hash(password, BCRYPT_COST);
    const sameEmail = await prisma.adminUser.findUnique({ where: { email } });

    if (sameEmail) {
      const [, signedOut] = await prisma.$transaction([
        prisma.adminUser.update({ where: { id: sameEmail.id }, data: { passwordHash } }),
        prisma.adminSession.deleteMany({ where: { adminUserId: sameEmail.id } }),
      ]);
      console.log(`Password reset for ${email}. Signed out ${signedOut.count} open session(s).`);
      return;
    }

    const existing = await prisma.adminUser.findMany({ select: { id: true, email: true } });
    if (existing.length > 0 && !replace) {
      fail(
        `an admin account already exists (${existing.map((user) => user.email).join(", ")}). ` +
          "The site has a single admin: run again with that email to reset its password, " +
          "or add --replace to move the account to this email.",
      );
    }

    if (existing.length > 0) {
      const [keep, ...extra] = existing;
      await prisma.$transaction([
        prisma.adminSession.deleteMany({}),
        prisma.adminUser.deleteMany({ where: { id: { in: extra.map((user) => user.id) } } }),
        prisma.adminUser.update({ where: { id: keep.id }, data: { email, passwordHash } }),
      ]);
      console.log(`Admin account moved from ${keep.email} to ${email}. All sessions signed out.`);
      return;
    }

    await prisma.adminUser.create({ data: { email, passwordHash } });
    console.log(`Admin account created for ${email}. Sign in at /admin/login.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error("admin:create failed:", error);
  process.exitCode = 1;
});
