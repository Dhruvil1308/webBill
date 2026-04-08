import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

// Interface extensions for TypeScript
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      role: string;
      hotelId: string | null;
      hotelActive?: boolean;
    }
  }
  interface User {
    role: string;
    hotelId: string | null;
    hotelActive?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    hotelId: string | null;
    hotelActive?: boolean;
  }
}
