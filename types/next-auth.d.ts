import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      githubUsername?: string | null;
      githubId?: number | null;
    };
  }

  interface User {
    id: string;
    githubUsername?: string | null;
    githubId?: number | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    githubUsername?: string | null;
    githubId?: number | null;
  }
}

