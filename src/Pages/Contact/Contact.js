import { gql } from "@apollo/client";

export const Get_Contact_Page_Data_Query = gql`
    query Query {
        contactUs {
            HeroSection {
                id
                topDescription
                bottomDescription
                heroImage {
                    alternativeText
                    url
                }
            }
            contactUs {
            id
            name
            email
            phone
            address
            }
        }
    }
`