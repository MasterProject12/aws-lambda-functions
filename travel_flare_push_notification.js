const https = require("https");
const AWS = require("aws-sdk");
var location = new AWS.Location();
const dynamo = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = "travel_flare_push_details";

var sendPush = async (token, text) => {
    console.log(`-----START SENDING PUSH:::${token}`);
    //Shivams
    // const SERVER_KEY = "AAAAieMCxPc:APA91bG7YB-r-dUWW72xq8VWklL25CIUHkLu7bk9cqTyHg4SMxBCRjwjXvTZ6Zv74CBr7CdRGv2z7OkC-pYX36Ktz3p3ipvQ90ZJsVQ2NyZ88KFjZlnO8-GyQL_vroMfIj1HzV1TvGY5";
    const SERVER_KEY = "AAAA3dqFyvI:APA91bG0e6kz0ma-UPDbLJsWctt_e2xnX6aTANPbl3M-Ud9NOb0M2xVKcr2MuZNg0fQCYN9Vb5KsjfGf00eaezsAEKsXysI6o50gMmarkFgJ7C2GxzDPl8PsyYYIJWGuOJYndkB6-I3W";
    return new Promise((resolve, reject) => {
            
            var postData = JSON.stringify({
                "to": token,
                "notification": {
                    "title": "Travel Flare Alert!!",
                    "body": `Road Accident reported at: ${text}`,
                }
            });
            
            var options = {
                hostname: 'fcm.googleapis.com',
                path: '/fcm/send',
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `key=${SERVER_KEY}`
                }
            };
            
            var req = https.request(options, (res) => {
                console.log('::::statusCode:', res.statusCode);
                res.on('data', (d) => {
                    var body = [];
                    body.push(d);
                    console.log("------"+Buffer.concat(body).toString());
                    resolve(":::SUCCESS SENDING NOTIFICATION::::");
                });
            });
        
            req.on('error', (e) => {
                console.error(`:::ERROR:: e`);
                reject(":::ERROR SENDING NOTIFICATION:::");
            });
            
            req.write(postData);
            req.end();
        });
};

exports.handler = async (event) => {
console.log(`KINESIS:::: data Received ${Buffer(event.records[0].data, 'base64').toString()}`);
var dataLocation = JSON.parse(Buffer(event.records[0].data, 'base64').toString());
var lat = parseFloat(dataLocation.latitude);
var lon = parseFloat(dataLocation.longitude);
console.log(`Latitude:: ${lat}`);    
console.log(`Longitude:: ${lon}`);    
    
var params = {
  IndexName: 'TravelFlarePlaceIndex',
  Position: [lon, lat],
  MaxResults: '1'
};
console.log("----------------1");
const data = await location.searchPlaceIndexForPosition(params).promise();
console.log(JSON.stringify(data));
console.log("----------------2");
var places = JSON.parse(JSON.stringify(data));
var city = places.Results[0].Place.Municipality;
console.log(`------${places.Results[0].Place.Label}`);
// var city = "Fremont";

var DBParams = {
    TableName : TABLE_NAME,
    Key: {
        city_name: city
     }
};
const dbData = await dynamo.get(DBParams).promise();    

if(dbData.Item) {
    var pushTokens = dbData.Item.ListAttribute;
    console.log(`Push Token read are::: ${pushTokens}`);
    for(let i=0; i<pushTokens.length;i++){
        const result = await sendPush(pushTokens[i], places.Results[0].Place.Label);    
        // const result = await sendPush(pushTokens[i], "Fremont");    
        console.log(`PUSH SEND RESULT::: ${result}`);
    }
}


    const output = event.records.map((record) => ({
        
        recordId: record.recordId,
        result: 'Ok',
        data: record.data,
    }));
    console.log(`KINESIS Processing completed:::  Successful records ${output.length}.`);
    return { records: output };
};
