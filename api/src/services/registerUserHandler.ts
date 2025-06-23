import { APIGatewayProxyHandler } from 'aws-lambda';
import DB from '../lib/db';
import Auth from '../lib/auth';
import { apiGatewayResponse } from '../lib/util';

let dbClient: DB;
let authClient = new Auth();

export const handler: APIGatewayProxyHandler = async (event) => {
  const body = JSON.parse(event.body || '{}');
  const { email, role, name, tenantId }: { email: string; tenantId: string; role: string; name: string } = body;

  const claims = event?.requestContext?.authorizer?.claims;
  const tenant_Id = claims['custom:tenant_id'];
  const userRole = claims['custom:role'];
  console.log(userRole);
  if (userRole !== 'super-admin' && (!tenant_Id || userRole !== 'admin')) {
    return { statusCode: 403, body: JSON.stringify({ message: 'Insufficient permissions' }) };
  }

  try {
    if (!dbClient) {
      dbClient = new DB(process.env.DB_USERNAME ?? '', process.env.DB_PASSWORD ?? '');
    }
    await dbClient.connect();
    const roleData = await dbClient.getRole(role);

    if (roleData.rowCount === 0) throw new Error('Role not found');
    const roleDetails = roleData.rows[0];

    const response = await authClient.addUserToCognito(email, userRole === 'super-admin' ? tenantId : tenant_Id, role);
    console.log(response);

    await dbClient.addUser(email, userRole === 'super-admin' ? tenantId : tenant_Id, roleDetails['role_id'], name);

    return apiGatewayResponse(201, { message: 'User registered successfully' });
  } catch (err: any) {
    console.error(err);
    return apiGatewayResponse(500, { message: 'Error registering user' });
  } finally {
    dbClient.release();
  }
};
