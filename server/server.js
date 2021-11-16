const express = require('express');
const path = require('path');
const db = require('./config/connection');
//const routes = require('./routes');

//added for apollo server-express
const { ApolloServer } = require('apollo-server-express');
// require my routes with graphQL
const { typeDefs, resolvers } = require('./schemas');

const app = express();
const PORT = process.env.PORT || 3001;

//require apollo server
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// apply apollo server to express as middleware
server.applyMiddleware({ app });

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

db.once('open', () => {
  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}!`);
    // log where we can go to test our GQL API
    console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
  });
});






// not needed for apollo
//app.use(routes);

// need the graphQL path
// db.once('open', () => {
//   app.listen(PORT, () => console.log(`🌍 Now listening on localhost:${PORT}`));
// });
