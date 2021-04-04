// Use this code snippet in your app.
// If you need more information about configurations or implementing the sample code, visit the AWS docs:
// https://aws.amazon.com/developers/getting-started/nodejs/

// Load the AWS SDK
import * as AWS from 'aws-sdk';
// let secret, decodedBinarySecret;

// In this sample we only handle the specific exceptions for the 'GetSecretValue' API.
// See https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
// We rethrow the exception by default.
export const secretService = async (
  secretName: string,
  decrypt = false
): Promise<AWS.SSM.GetParameterResult> => {
  const ssmClient = new AWS.SSM({
    region: process.env.AWS_REGION || 'ap-southeast-1',
  });
  const data = await ssmClient
    .getParameter({ Name: secretName, WithDecryption: decrypt })
    .promise();

  return data;
};
