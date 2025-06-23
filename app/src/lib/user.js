import { fetchAuthSession } from 'aws-amplify/auth';

async function getJwtToken() {
  try {
    const session = await fetchAuthSession();
    return { token: session.tokens?.idToken, tokenString: session.tokens?.idToken?.toString() };
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

export async function fetchUserClaims() {
  const { token, tokenString } = await getJwtToken();
  if (!token) return null;
  const userId = token.payload.sub;
  const userEmail = token.payload.email;
  const tenantId = token.payload['custom:tenant_id'];
  const role = token.payload['custom:role'];
  return { userId, userEmail, tenantId, role, token, tokenString };
}
