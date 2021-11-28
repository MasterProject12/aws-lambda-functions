const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = "travel_flare_user_registration";

exports.handler = async (event) => {
    let statusCode = 401;
    let body = {message: "Authentication Failed"};
    try {
        const getUserObject = JSON.parse(event.body);
        var params = {
            TableName : TABLE_NAME,
            Key: {
                email_id: getUserObject.email_id
            }
        };
        console.log(`DYNAMO DB REQUEST PARAMS ${JSON.stringify(params)}`);    
        data = await dynamo.get(params).promise();    
        if(!data.Item){
            throw new Error(`Authentication Failed. Email Id doesn't exist in records.`);
        }
        
        if(data.Item.MapAttribute.password !== getUserObject.password) {
            throw new Error(`Authentication Failed. password didn't match.`);
        }
        
        body.message = "Success";
        body.email_id = data.Item.MapAttribute.email_id;
        body.user_name = data.Item.MapAttribute.user_name;
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
