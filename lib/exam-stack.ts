import * as cdk from "aws-cdk-lib";
import * as lambdanode from "aws-cdk-lib/aws-lambda-nodejs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as events from "aws-cdk-lib/aws-lambda-event-sources";
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as sns from "aws-cdk-lib/aws-sns";
import * as subs from "aws-cdk-lib/aws-sns-subscriptions";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { generateSeedData } from "../shared/util";
import * as custom from "aws-cdk-lib/custom-resources";
import { Construct } from "constructs";

export class ExamStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const tournament = new dynamodb.Table(this, "Tournament", {
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      partitionKey: { name: "pk", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "sk", type: dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      tableName: "Tournament",
    });

    new custom.AwsCustomResource(this, "itemsddbInitData", {
      onCreate: {
        service: "DynamoDB",
        action: "batchWriteItem",
        parameters: {
          RequestItems: {
            [tournament.tableName]: generateSeedData(),
          },
        },
        physicalResourceId: custom.PhysicalResourceId.of("itemsddbInitData"),
      },
      policy: custom.AwsCustomResourcePolicy.fromSdkCalls({
        resources: [tournament.tableArn],
      }),
    });

    // Integration infrastructure

    const dlq = new sqs.Queue(this, "InvalidTeamDLQ", {
      receiveMessageWaitTime: cdk.Duration.seconds(5),
    });

  
    const queue = new sqs.Queue(this, "TournamentQ", {
      receiveMessageWaitTime: cdk.Duration.seconds(5),
      deadLetterQueue: {
        queue: dlq,
        maxReceiveCount: 1,
      },
    });

    const topic = new sns.Topic(this, "TournamentTopic", {
      displayName: "Exam topic",
    });

    // Lambda functions

    const lambdaA = new lambdanode.NodejsFunction(this, "lambdaA", {
      runtime: lambda.Runtime.NODEJS_22_X,
      entry: `${__dirname}/../lambdas/lambdaA.ts`,
      timeout: cdk.Duration.seconds(15),
      memorySize: 128,
      environment: {
        TABLE_NAME: tournament.tableName,
        REGION: "eu-west-1",
      },
    });

    const lambdaB = new lambdanode.NodejsFunction(this, "lambdaB", {
      runtime: lambda.Runtime.NODEJS_22_X,
      entry: `${__dirname}/../lambdas/lambdaB.ts`,
      timeout: cdk.Duration.seconds(15),
      memorySize: 128,
      environment: {
        REGION: "eu-west-1",
      },
    });


    const lambdaC = new lambdanode.NodejsFunction(this, "lambdaC", {
      runtime: lambda.Runtime.NODEJS_22_X,
      entry: `${__dirname}/../lambdas/lambdaC.ts`,
      timeout: cdk.Duration.seconds(15),
      memorySize: 128,
      environment: {
        TABLE_NAME: tournament.tableName,
        REGION: "eu-west-1",
      },
    });

    // Subscriptions

    topic.addSubscription(
      new subs.SqsSubscription(queue, {
        rawMessageDelivery: true,
        filterPolicy: {
          age_grade: sns.SubscriptionFilter.stringFilter({
            allowlist: ["U14", "U17", "U20"],
          }),
        },
      })
    );


    topic.addSubscription(
      new subs.LambdaSubscription(lambdaC)
    );

    lambdaA.addEventSource(
      new events.SqsEventSource(queue, {
        batchSize: 5,
        maxBatchingWindow: cdk.Duration.seconds(5),
      })
    );

    
    lambdaB.addEventSource(
      new events.SqsEventSource(dlq, {
        batchSize: 5,
        maxBatchingWindow: cdk.Duration.seconds(5),
      })
    );

    // Permissions

    tournament.grantReadWriteData(lambdaA);
    tournament.grantReadWriteData(lambdaC); 

    // Output

    new cdk.CfnOutput(this, "SNS Topic ARN", {
      value: topic.topicArn,
    });
  }
}