import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import {
  createAuthMiddleware,
  getOAuthState,
} from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { createAccessControl } from "better-auth/plugins/access";
import {
  adminAc,
  defaultStatements,
} from "better-auth/plugins/admin/access";
import { admin } from "better-auth/plugins";
import { defineRequestState } from "@better-auth/core/context";
import { prisma } from "@/src/lib/prisma";

const ac = createAccessControl(defaultStatements);

const learner = ac.newRole({ user: [], session: [] });
const instructor = ac.newRole({ user: [], session: [] });
const adminRole = ac.newRole({ ...adminAc.statements });

const signUpRole = defineRequestState(
  (): "learner" | "instructor" | null => null,
);

function chosenRole(value: unknown) {
  return value === "learner" || value === "instructor" ? value : null;
}

async function roleFromSignUp() {
  try {
    return chosenRole(await signUpRole.get());
  } catch {
    return null;
  }
}

async function googleSignUp() {
  try {
    return (await getOAuthState()) !== null;
  } catch {
    return false;
  }
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          if (await googleSignUp()) {
            return { data: { ...user, role: "" } };
          }

          const picked = await roleFromSignUp();
          if (picked) {
            return { data: { ...user, role: picked } };
          }

          if (
            user.role === "admin" ||
            user.role === "learner" ||
            user.role === "instructor"
          ) {
            return { data: user };
          }

          return { data: { ...user, role: "" } };
        },
      },
    },
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/sign-up/email") return;

      const picked = chosenRole(ctx.body?.role);
      if (ctx.body && "role" in ctx.body) {
        delete ctx.body.role;
      }
      if (picked) {
        await signUpRole.set(picked);
      }
    }),
  },
  plugins: [
    admin({
      ac,
      roles: {
        learner,
        instructor,
        admin: adminRole,
      },
      defaultRole: "",
      adminRoles: ["admin"],
    }),
    nextCookies(),
  ],
});
