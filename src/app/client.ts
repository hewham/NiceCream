import { ApolloClient, createNetworkInterface } from 'apollo-client';
// import { SubscriptionClient, addGraphQLSubscriptions} from 'subscriptions-transport-ws'
// import { ApolloProvider } from 'react-apollo';
//import { EventEmitter } from 'eventemitter3';

// Create WebSocket client
// const wsClient = new SubscriptionClient(`wss://subscriptions.graph.cool/v1/cj0dxtf1mrvfp018243hjoigl`, {
//   reconnect: true,
//   timeout: 20000,
//   connectionParams: {
//     // Pass any arguments you want for initialization
//   }
// })

// let webSocket = new WebSocket('wss://subscriptions.graph.cool/v1/cj0dxtf1mrvfp018243hjoigl', 'graphql-subscriptions');
//
// webSocket.onopen = (event) => {
//   const message = {
//       type: 'init'
//   }
//
//   webSocket.send(JSON.stringify(message))
// }

const networkInterface = createNetworkInterface({
  uri: 'https://api.graph.cool/simple/v1/cj0dxtf1mrvfp018243hjoigl'
  // uri: 'wss://subscriptions.graph.cool/v1/cj0dxtf1mrvfp018243hjoigl'
});

// const networkInterfaceWithSubscriptions = addGraphQLSubscriptions(
//   networkInterface,
//   wsClient
// )


// The x-graphcool-source header is to let the server know that the example app has started.
// (Not necessary for normal projects)
networkInterface.use([{
  applyMiddleware (req, next) {
    if (!req.options.headers) {
      // Create the header object if needed.
      req.options.headers = {};
    }
    req.options.headers = {};
    req.options.headers["Access-Control-Allow-Origin"] =  `*`;


    if (localStorage.getItem('graphcoolToken')){
        console.log("GETTING GRAPHCOOL TOKEN");
        req.options.headers['Authorization'] = `Bearer ${localStorage.getItem('graphcoolToken')}`
    }
    // req.options.headers['authorization'] = localStorage.getItem('token') || null;
    next();
  },
}]);

const client = new ApolloClient({ networkInterface });
// const client = new ApolloClient({
//   networkInterface: networkInterfaceWithSubscriptions,
// })

export function provideClient(): ApolloClient {
  return client;
}
