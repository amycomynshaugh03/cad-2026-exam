import { SQSHandler } from "aws-lambda";

export const handler: SQSHandler = async (event: any) => {
  console.log("Event ", JSON.stringify(event));

};
