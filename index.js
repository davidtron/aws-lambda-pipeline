'use strict';

// Any dependencies in package.json are packaged with this aws lambda


/**
 * Provide an event that contains the following keys:
 *
 *   - operation: either succeed or fail
 *   - payload: to return back as the response
 */
exports.handler = function(event, context) {

    // Written to cloudflare logs
    console.log('Received event:', JSON.stringify(event, null, 2));
    var operation = event.operation;
    if(operation === 'succeed') {
        context.succeed(event.payload);
    } else {
        context.fail('failure occurred');
    }
};
