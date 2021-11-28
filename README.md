# Travel Flare AWS Lambda Functions
Travel Flare uses AWS Lambda functions for following Web API's
1. User registration
2. User authentication
3. Subscribe for push notification

AWS Lambda function is also used to send push notifications and is triggered by Kinesis Data Stream.

This repository contains Lambda functions defined for these use cases.

### Lambda functions added to this repisitory

1. [travelflare_user_registration.js](./travelflare_user_registration.js): It is used for user registration. It is invoked by mobile apps through API gateway.
2. [travel_flare_authentication.js](./travel_flare_authentication.js): It is used for user authentication. It is invoked by mobile apps through API gateway.
3. [subscribe_to_push.js](./subscribe_to_push.js): It is used for subscribing to receive a push notification. It is invoked by mobile apps through API gateway.
4. [travel_flare_push_notification.js](./travel_flare_push_notification.js): It is used to send push notifications to subscribed users. It is invoked by Kinesis data stream.
