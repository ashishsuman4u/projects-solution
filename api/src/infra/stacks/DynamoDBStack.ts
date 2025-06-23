import { SecretValue, Stack, StackProps } from 'aws-cdk-lib';
import { AttributeType, BillingMode, Table, ITable } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import 'dotenv/config';
import { Integration } from '../../types';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';

interface DynamoDBStackProps extends StackProps {
  integration?: Integration;
}

export class DynamoDBStack extends Stack {
  public readonly connectionsTable: ITable;
  constructor(scope: Construct, id: string, props: DynamoDBStackProps) {
    super(scope, id, props);
    if (props.integration) {
      this.connectionsTable = new Table(this, 'ConnectionsTable', {
        tableName: process.env.DYNAMODB_TABLE_NAME,
        partitionKey: { name: 'tenantId', type: AttributeType.STRING },
        sortKey: { name: 'email', type: AttributeType.STRING },
        billingMode: BillingMode.PAY_PER_REQUEST,
      });

      this.connectionsTable.grantReadWriteData(props.integration.lambdaFunction);
    }
  }
}
