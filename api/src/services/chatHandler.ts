import { APIGatewayProxyWebsocketEventV2 } from 'aws-lambda';
import { ApiGatewayManagementApi } from '@aws-sdk/client-apigatewaymanagementapi';
import { DBUser, Message, MessageBody } from '../types';
import CollectionDB from '../lib/collectionDb';

const endpoint = process.env.SOCKET_API_URL;
const client = new ApiGatewayManagementApi({ endpoint });
const dbClient = new CollectionDB();

const sendMessage = async (ids: string[], body: Message) => {
  try {
    const reqs: any[] = [];
    ids.forEach((id) => {
      reqs.push(client.postToConnection({ ConnectionId: id, Data: Buffer.from(JSON.stringify(body)) }));
    });
    await Promise.all(reqs);
  } catch (error) {
    console.log(error);
  }
};

exports.handler = async (event: APIGatewayProxyWebsocketEventV2) => {
  try {
    if (event.requestContext) {
      const { connectionId, routeKey } = event.requestContext;
      let body!: MessageBody;
      if (event.body) {
        body = JSON.parse(event.body);
      }
      switch (routeKey) {
        case '$connect':
          break;
        case '$disconnect':
          const otherUsers = await dbClient.getUsersByTenant(body?.user.tenantId);
          const otherTenantUsers = otherUsers.Items?.filter((c) => c.connectionId !== connectionId).map((item) => {
            return item as DBUser;
          });
          await sendMessage(otherTenantUsers?.map((c) => c.connectionId) as string[], {
            message: `${body.user.userEmail} has left the chat.`,
          });
          break;
        case 'setUser':
          const res = await dbClient.addUserByTenant(body?.user.tenantId, body.user.userEmail, connectionId);
          const connections = await dbClient.getUsersByTenant(body?.user.tenantId);
          if (connections.Items?.length) {
            await sendMessage(
              connections.Items?.map((c) => c.connectionId),
              {
                message: `${body.user.userEmail} has joined the chat`,
                users: connections.Items?.map((item) => item as DBUser),
              }
            );
          }
          break;
        case 'sendPublicMessage':
          const allUsers = await dbClient.getUsersByTenant(body?.user.tenantId);
          if (allUsers.Items?.length) {
            await sendMessage(
              allUsers.Items?.map((c) => c.connectionId),
              { message: body.message?.message }
            );
          }
          break;
        case 'sendPrivateMessage':
          await sendMessage([body.message?.to!], { message: body.message?.message });
          break;
        default:
          break;
      }
    }
    return {
      statusCode: 200,
    };
  } catch (error) {
    return {
      statusCode: 500,
    };
  }
};
