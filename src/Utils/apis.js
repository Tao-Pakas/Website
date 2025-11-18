// src/utils/api.js

const API_URL = "http://localhost:1337/graphql";

export const apiRequest = async (query, variables = {}, token = "") => {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({ query, variables }),
    });

    const result = await res.json();

    if (result.errors) {
      console.error("GraphQL errors:", result.errors);
      throw new Error(result.errors[0].message || "GraphQL error");
    }

    return result.data;
  } catch (err) {
    console.error("API request failed:", err);
    throw err;
  }
};
