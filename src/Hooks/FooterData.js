import { gql } from "@apollo/client";

export const Footer_Data = gql`
  query Footer_Data{
    footer {
      documentId
      address
      phone
      city
      email
    }
  }
`