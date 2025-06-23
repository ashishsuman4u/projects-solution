import { PreTokenGenerationTriggerEvent } from 'aws-lambda';
import { SecretsManager } from 'aws-sdk';
import DB from '../lib/db';

let dbClient: DB;

export const handler = async (event: PreTokenGenerationTriggerEvent): Promise<PreTokenGenerationTriggerEvent> => {
  const email = event?.request?.userAttributes?.email;
  if (!dbClient) {
    dbClient = new DB(process.env.DB_USERNAME ?? '', process.env.DB_PASSWORD ?? '');
  }

  try {
    await dbClient.connect();
    const roleRes = await dbClient.getUserRoleByEmail(email);
    if (roleRes.rowCount === 0) throw new Error('User not found');

    const userRole = roleRes.rows[0];
    console.log('userRole', userRole);
    event.response = {
      claimsOverrideDetails: {
        claimsToAddOrOverride: {
          'custom:tenant_id': userRole['tenant_id'],
          'custom:role': userRole['role'],
        },
      },
    };
  } catch (err) {
    console.error(err);
  } finally {
    await dbClient.release();
  }

  return event;
};
