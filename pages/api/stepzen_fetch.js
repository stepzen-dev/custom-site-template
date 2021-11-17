// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { request, gql, GraphQLClient } from "graphql-request";

function usernameVariableMassage() {
  // Environment variable massaging. Much of the logic borrowed from https://github.com/cassidoo/link-in-bio-template
  const username_to_idx = Object.entries(process.env).filter((key) =>
    key[0].startsWith("NEXT_DEVTO_USERNAME")
  );
  const username = username_to_idx[0][1];
  return username;
}

export default async function getData(req, res) {
  let username = usernameVariableMassage();
  let github_token = process.env.NEXT_GITHUB_TOKEN;
  let twitter_bearerToken = process.env.NEXT_TWITTER_BEARER_TOKEN;

  //Here we retrieve data from 3 different sources with one query, woven together in a StepZen layer accessible at
  const query = gql`
    query MyQuery(
      $github_token: Secret!
      $twitter_bearerToken: Secret!
      $username: String!
    ) {
      devto_getArticles(username: $username, top: 3) {
        title
        published_at
        user {
          github_details(github_token: $github_token) {
            pinnedItems(first: 3) {
              nodes {
                ... on Github_Repository {
                  id
                  name
                  description
                }
              }
            }
          }

          twitter_details(twitter_bearerToken: $twitter_bearerToken) {
            pinned_tweet(twitter_bearerToken: $twitter_bearerToken) {
              text
            }
          }
          github_username
          username
          twitter_username
        }
      }
    }
  `;

  const variables = {
    github_token: github_token,
    twitter_bearerToken: twitter_bearerToken,
    username: username,
  };

  const endpoint =
    "https://graphql1f.steprz.net/api/1fec739d90f6028c74a6f19855c34277/__graphql";

  const graphQLClient = new GraphQLClient(endpoint, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  try {
    await graphQLClient.request(query, variables).then((res) => {
      return res;
    });
  } catch (error) {
    console.log(error);
    return error;
  }
}
