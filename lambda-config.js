module.exports = {

    region: 'eu-west-1',
    handler: 'index.handler',
    role: 'arn:aws:iam::844736534595:role/APIGatewayLambdaExecRole',
    functionName: 'GetHelloWithName',
    timeout: 10,
    memorySize: 128,
    runtime: 'nodejs'
}