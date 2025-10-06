import { gql } from "@apollo/client";

export const About_Page_Data = gql`
    query Query {
        about {
            CompanyOverView
            HeroSection {
                id
                topDescription
                bottomDescription
                heroImage {
                    alternativeText
                    url
                }
            }
            OurMission {
                id
                description
                aboutImage {
                    alternativeText
                    url
                }
            }
            ValuesAndCulture {
                id
                description
                aboutImage {
                    alternativeText
                    url
                }
            }
        }
    }
`