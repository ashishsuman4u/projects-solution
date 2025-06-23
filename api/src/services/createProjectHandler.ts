import { APIGatewayProxyHandler } from 'aws-lambda';
import DB from '../lib/db';
import { apiGatewayResponse } from '../lib/util';

let dbClient: DB;

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log(JSON.stringify(event));
  const { name, description, tenantId } = JSON.parse(event.body || '{}');
  const claims = event?.requestContext?.authorizer?.claims;
  const tenant_Id = claims['custom:tenant_id'];
  const userRole = claims['custom:role'];
  if (userRole !== 'super-admin' && (!tenant_Id || (userRole !== 'admin' && userRole !== 'manager'))) {
    return { statusCode: 403, body: JSON.stringify({ message: 'Insufficient permissions' }) };
  }
  try {
    if (!dbClient) {
      dbClient = new DB(process.env.DB_USERNAME ?? '', process.env.DB_PASSWORD ?? '');
    }
    await dbClient.connect();
    const result = await dbClient.addProject(userRole === 'super-admin' ? tenantId : tenant_Id, name, description);
    console.log(result);
    return apiGatewayResponse(201, { message: result.rows[0].id });
  } catch (err: any) {
    console.error(err);
    return apiGatewayResponse(201, { message: 'Error creating project' });
  } finally {
    dbClient.release();
  }
};
