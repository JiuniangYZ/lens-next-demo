const getEnv = (): Record<string, string> => {
  return {
    NEXT_PUBLIC_AUTH0_DOMAIN: process.env.NEXT_PUBLIC_AUTH0_DOMAIN ?? '',
    NEXT_PUBLIC_AUTH0_CLIENT_ID: process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID ?? '',
    NEXT_PUBLIC_AUTH0_AUDIENCE: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE ?? '',
    NEXT_PUBLIC_ANOTHER_AUTH0_AUDIENCE: process.env.NEXT_PUBLIC_ANOTHER_AUTH0_AUDIENCE ?? '',
  };
};

export default getEnv;