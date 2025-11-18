// src/Utils/graphqlClient.js - IMPROVED AUTH HANDLING
const GRAPHQL_ENDPOINT = 'http://localhost:1337/graphql';

export const graphqlRequest = async (query, variables = {}, token = null) => {
  try {
    // Use provided token or get from localStorage
    const authToken = token || localStorage.getItem('jwt');
    
    const headers = {
      'Content-Type': 'application/json',
    };

    // Add authorization header if token exists
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    console.log('🔐 GraphQL request with token:', authToken ? 'YES' : 'NO');
    console.log('📤 GraphQL variables:', variables);

    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        query: query.loc ? query.loc.source.body : query,
        variables,
      }),
    });

    const result = await response.json();
    console.log('📡 GraphQL response status:', response.status);
    console.log('📦 GraphQL response data:', result);

    if (result.errors) {
      console.error('❌ GraphQL errors:', result.errors);
      const errorMessage = result.errors[0]?.message || 'Unknown GraphQL error';
      throw new Error(`GraphQL errors: ${errorMessage}`);
    }

    return result.data;
  } catch (error) {
    console.error('💥 GraphQL request failed:', error);
    throw error;
  }
};