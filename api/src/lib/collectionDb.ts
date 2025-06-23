import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument, GetCommandInput, QueryCommandInput } from '@aws-sdk/lib-dynamodb';

export default class CollectionDB {
  client: DynamoDBClient;
  documentClient: DynamoDBDocument;

  constructor() {
    this.client = new DynamoDBClient({
      region: process.env.REGION || 'us-east-1',
    });
    this.documentClient = DynamoDBDocument.from(this.client);
  }

  addUserByTenant = async (tenantId: string, email: string, connectionId: string) => {
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Item: {
        tenantId,
        email,
        connectionId,
      },
    };
    return this.documentClient.put(params);
  };

  getUsersByTenant = async (tenantId: string) => {
    const params: QueryCommandInput = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      KeyConditionExpression: 'tenantId = :partitionKey',
      ExpressionAttributeValues: {
        ':partitionKey': tenantId,
      },
    };
    return this.documentClient.query(params);
  };

  getUserByEmail = async (tenantId: string, email: string) => {
    const params: GetCommandInput = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: {
        tenantId,
        email,
      },
    };
    return this.documentClient.get(params);
  };
}
