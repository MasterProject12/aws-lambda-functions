
const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = "travel_flare_push_details";

exports.handler = async (event) => {
    let statusCode = 400;
    let body = {message: "Error in subscribing"};
    try {
        const getSubscribeObject = JSON.parse(event.body);
        var params = {
            TableName : TABLE_NAME,
            Key: {
                city_name: getSubscribeObject.city
            }
        };
        console.log(`SUBSCRIBE DYNAMO DB REQUEST PARAMS ${JSON.stringify(params)}`);    
        const data = await dynamo.get(params).promise();    
        var pushTokens = [];
        if(!data.Item) {
            pushTokens.push(getSubscribeObject.token);
        } else {
            pushTokens = data.Item.ListAttribute;
            pushTokens.push(getSubscribeObject.token);
            pushTokens = [...new Set(pushTokens)];
        }
        var params = {
            TableName : TABLE_NAME,
            Item: {
                city_name: getSubscribeObject.city,
                ListAttribute: pushTokens,
            }
        };
        
        console.log(`SUBSCRIBE:: PARAS TO WRITE:: ${JSON.stringify(params)}`);
        
        await dynamo.put(params).promise();    
        body.message = "Success";
        statusCode = 200;
    } catch (e) {
        console.log(`Authentication:: Error in authenticating user:: ${e.message}`);   
        body.message = e.message;
    }
    
    const response = {
        statusCode,
        body: JSON.stringify(body),
    };
    return response;
};

