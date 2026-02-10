import { NextAuthConfig } from "next-auth";
import Nodemailer from "next-auth/providers/nodemailer";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "database" },
  pages: { signIn: "/profile" },
  providers: [
    Nodemailer({
      from: process.env.EMAIL_FROM,
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT ?? 587),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD
        }
      }
    })
  ],
  callbacks: {
    async session({ session, user }) {
      if (!session.user) {
        return session;
      }

      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { role: true }
      });

      (session.user as { id: string; role: "USER" | "ADMIN" }).id = user.id;
      (session.user as { id: string; role: "USER" | "ADMIN" }).role = dbUser?.role ?? "USER";

      return session;
    }
  }
};