/**
 * Creates the site's admin account, or replaces it.
 *
 *   npm run admin:create -- --email you@example.com --password "a long passphrase"
 *   npm run admin:create -- --email you@example.com --password "a long passphrase" --replace
 *
 * In PowerShell, quote the double dash: npm run admin:create '--' --email ... There `npm`
 * is npm.ps1, a PowerShell script, and PowerShell drops a bare `--` before npm sees it, so
 * npm takes --email, --password and --replace as its own options and they never reach this
 * script. The script refuses to run when it can tell that happened.
 *
 * The site has one admin. If any admin account exists (this email or another), the script
 * stops unless --replace is given. --replace gives that account this email and password and
 * signs out every open session. Without flags, ADMIN_EMAIL and ADMIN_PASSWORD are read.
 *
 * Nothing is hard-coded and the password is never printed.
 */

import { parseArgs } from "node:util";
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const BCRYPT_COST = 12;
const MIN_PASSWORD_LENGTH = 12;
/** bcrypt ignores everything after 72 bytes, so longer passwords are refused. */
const MAX_PASSWORD_BYTES = 72;

const POWERSHELL_HINT =
  "In PowerShell, quote the double dash so npm passes the flags on: " +
  "npm run admin:create '--' --email <email> --password '<password>' --replace";

function fail(message: string): never {
  console.error(`admin:create: ${message}`);
  process.exit(1);
}

type Options = {
  email: string;
  emailSource: string;
  password: string;
  replace: boolean;
};

function readOptions(): Options {
  // npm stores a flag it has taken for itself as "true" and passes its value on as a stray
  // argument; either is the sign that PowerShell dropped the `--`.
  if (process.env.npm_config_email === "true" || process.env.npm_config_password === "true") {
    fail(
      `npm took --email/--password as its own options, so they never reached this script.\n${POWERSHELL_HINT}`,
    );
  }

  let values: { email?: string; password?: string; replace?: boolean };
  try {
    ({ values } = parseArgs({
      args: process.argv.slice(2),
      options: {
        email: { type: "string" },
        password: { type: "string" },
        replace: { type: "boolean" },
      },
      strict: true,
      allowPositionals: false,
    }));
  } catch (error) {
    fail(`${error instanceof Error ? error.message : String(error)}\n${POWERSHELL_HINT}`);
  }

  const emailSource = values.email !== undefined ? "--email" : "ADMIN_EMAIL";
  const email = (values.email ?? process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
  const password = values.password ?? process.env.ADMIN_PASSWORD ?? "";

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fail(`give the admin's email with --email or ADMIN_EMAIL.\n${POWERSHELL_HINT}`);
  }
  if ([...password].length < MIN_PASSWORD_LENGTH) {
    fail(`the password must be at least ${MIN_PASSWORD_LENGTH} characters; nothing was changed.`);
  }
  if (new TextEncoder().encode(password).length > MAX_PASSWORD_BYTES) {
    fail(`the password is longer than ${MAX_PASSWORD_BYTES} bytes; use a shorter one.`);
  }
  return { email, emailSource, password, replace: values.replace === true };
}

/** Host, database and schema from DATABASE_URL, without the credentials. */
function databaseLabel(): string {
  try {
    const url = new URL(process.env.DATABASE_URL ?? "");
    return `${url.hostname}${url.pathname} (schema ${url.searchParams.get("schema") ?? "public"})`;
  } catch {
    return "DATABASE_URL is not a valid URL";
  }
}

async function main() {
  const { email, emailSource, password, replace } = readOptions();
  console.log(`Database: ${databaseLabel()}`);
  console.log(`Email: ${email} (from ${emailSource})`);

  const prisma = new PrismaClient();
  try {
    const existing = await prisma.adminUser.findMany({
      select: { id: true, email: true },
      orderBy: { createdAt: "asc" },
    });

    if (existing.length > 0 && !replace) {
      const others = existing.filter((user) => user.email !== email).map((user) => user.email);
      fail(
        (others.length === existing.length
          ? `an admin account already exists (${others.join(", ")}) and the site has one admin. ` +
            `Add --replace to move it to ${email} with the new password.`
          : `an admin account for ${email} already exists. Add --replace to give it the new password.`) +
          ` --replace signs out every open session. Nothing was changed.\n${POWERSHELL_HINT}`,
      );
    }

    const passwordHash = await hash(password, BCRYPT_COST);

    if (existing.length === 0) {
      await prisma.adminUser.create({ data: { email, passwordHash } });
      console.log(`Created admin account: ${email}. Sign in at /admin/login.`);
      return;
    }

    // Keep one row (the one with this email, if there is one), give it this email and
    // password, and remove any others.
    const keep = existing.find((user) => user.email === email) ?? existing[0];
    const removed = existing.filter((user) => user.id !== keep.id);
    const [signedOut] = await prisma.$transaction([
      prisma.adminSession.deleteMany({}),
      prisma.adminUser.deleteMany({ where: { id: { in: removed.map((user) => user.id) } } }),
      prisma.adminUser.update({ where: { id: keep.id }, data: { email, passwordHash } }),
    ]);

    console.log(
      keep.email === email
        ? `Replaced admin account: ${email} (new password).`
        : `Replaced admin account: ${keep.email} is now ${email}, with the new password.`,
    );
    if (removed.length > 0) {
      console.log(`Removed other admin accounts: ${removed.map((user) => user.email).join(", ")}.`);
    }
    console.log(`Signed out ${signedOut.count} open session(s).`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error("admin:create failed:", error);
  process.exitCode = 1;
});
