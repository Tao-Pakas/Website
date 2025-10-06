import { gql } from '@apollo/client'

export const Home_Page_Data = gql`
    query home_Data{
        homepage {
            HomePage{
            
            ... on ComponentBlocksWhyChooseUs {
                id
                Card {
                description
                Icon {
                    alternativeText
                    url
                }
                id
                }
            }
            ... on ComponentBlocksDiscoverSection {
                id
                heading
                Paragraph
            }
            ... on ComponentListingsFeaturedProperty {
                id
                summary
                Location {
                id
                Address
                City
                longitude
                latitude
                }
                Media {
                id
                CoverImage {
                alternativeText
                url 
                }
                Gallery_connection {
                    nodes {
                    alternativeText
                    url
                    }
                }
                Gallery {
                    alternativeText
                    url
                }
                Rooms_connection {
                    nodes {
                    alternativeText
                    url
                    }
                }
                Rooms {
                    alternativeText
                    url
                }
                ShowCase {
                    alternativeText
                    url
                }
                }
            }
            ... on ComponentBlocksPopularProperties {
                id
                heding
                subHeading
                Card {
                id
                Name
                Description
                Media {
                    id
                    CoverImage {
                    alternativeText
                    url
                    }
                    Gallery_connection {
                    nodes {
                        alternativeText
                        url
                    }
                    }
                    Gallery {
                    alternativeText
                    url
                    }
                    Rooms_connection {
                    nodes {
                        alternativeText
                        url
                    }
                    }
                    Rooms {
                    alternativeText
                    url
                    }
                    ShowCase {
                    alternativeText
                    url
                    }
                }
                Location {
                    id
                    Address
                    City
                    longitude
                    latitude
                }
                Details {
                    id
                    Bedrooms
                    Bathrooms
                    isFull
                    Category
                    Type
                    Facilities {
                    id
                    wifi
                    solar
                    gas
                    security
                    kitchen
                    SwimmingPool
                    }
                    distance
                    price
                }
                Owner_connection {
                    nodes {
                    blocked
                    }
                }
                Owner {
                    documentId
                    username
                    email
                    provider
                    confirmed
                    blocked
                }
                }
            }
            ... on ComponentCommonHero {
                id
                topDescription
                bottomDescription
                heroImage {
                alternativeText
                url
                }
            }
            }
        }
    about {
        CompanyOverView
  }
}
`