import { APIGatewayProxyResult } from 'aws-lambda';
import { AppUser, DBUser } from '../types';

export const apiGatewayResponse = (status: number, body: unknown): APIGatewayProxyResult => {
  return {
    statusCode: status,
    headers: {
      contentType: 'application/json',
      'Access-Control-Allow-Origin': '*', //NEED TO CHANGE
    },
    body: JSON.stringify(body),
  };
};
