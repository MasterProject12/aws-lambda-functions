const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = "travel_flare_user_registration";

exports.handler = async (event, context) => {
    console.log('Received event:', JSON.stringify(event));

    let body;
    let statusCode = 200;
    const headers = {
        'Content-Type': 'application/json',
        "Access-Control-Allow-Headers" : "Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
    };

    try {
        switch (event.requestContext.http.method) {
            case 'POST':
                var addUserObject = JSON.parse(event.body);
                var params = {
                    TableName : TABLE_NAME,
                    Item: {
                        email_id: addUserObject.email_id,
                        MapAttribute: addUserObject
                        }
                    };
                console.log(`--------------- ${JSON.stringify(params)}`);    
                await dynamo.put(params).promise();    
                body = params.Item.MapAttribute;
                break;
            default:
                throw new Error(`Unsupported method "${event.httpMethod}"`);
        }
    } catch (err) {
        statusCode = 400;
        body = err.message;
    } finally {
        body = JSON.stringify(body);
    }

    return {
        statusCode,
        body,
        headers,
    };
};
