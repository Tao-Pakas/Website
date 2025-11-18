import { gql } from 'graphql-tag';

// ===== BASIC USER QUERIES WITH POPULATION =====

// ============ SIGNUP MUTATION ================//
export const REGISTER_USER = gql`
    mutation RegisterUser($input: UsersPermissionsRegisterInput!) {
        register(input: $input) {
        jwt
        user {
            id
            username
            email
            documentId
            confirmed
            blocked
            role {
                id
                name
                type
                }
            }
        }
    }
`;

// ============ LOGIN MUTATION ================//
export const LOGIN_USER = gql`
    mutation LoginUser($input: UsersPermissionsLoginInput!) {
        login(input: $input) {
        jwt
        user {
            id
            username
            email
            confirmed
            blocked
            role {
                id
                name
                type
                }
            }
        }
    }
`;

// ===== LANDLORD PROFILE MUTATIONS =====
export const CREATE_LANDLORD_PROFILE = gql`
    mutation CreateLandlordProfile($data: LandlordInput!) {
        createLandlord(data: $data) {
            documentId
            fullName
            phoneNumber
            address
            companyName
            verified
            accommodations{
                documentId
            }
            profile{
                alternativeText
                url
            }
            users_permissions_user {
                documentId 
                username
                email
            }
        }
    }
`;

// =========== UPDATING LANDLORD PROFILE MUTATION ============== //
export const UPDATE_LANDLORD_PROFILE = gql`
    mutation UpdateLandlordProfile($id: ID!, $data: LandlordInput!) {
        updateLandlord(documentId: $id, data: $data) {
            documentId
            fullName
            phoneNumber
            address
            companyName
            verified
            users_permissions_user {
                documentId
                username
                email
            }
            profile {
                url
                alternativeText
            }
        }
    }
`;

// ===== STUDENT PROFILE MUTATIONS =====
export const CREATE_STUDENT_PROFILE = gql`
    mutation CreateStudentProfile($data: StudentInput!) {
            createStudent(data: $data) {
            documentId
            firstName
            lastName
            phoneNumber
            users_permissions_user {
                documentId 
                username
                email
            }
            profile {
                alternativeText
                url
            }
        }
    }
`;

// =========== UPDATING STUDENT PROFILE MUTATION ============== //
export const UPDATE_STUDENT_PROFILE = gql`
    mutation UpdateStudentProfile($id: ID!, $data: StudentInput!) {
        updateStudent(documentId: $id, data: $data) {
            documentId
            firstName
            lastName
            phoneNumber
            users_permissions_user {
                documentId 
                username
                email
            }
            profile {
                alternativeText
                url
            }
        }
    }
`;

// =========== GET USER DETAILS QUERY ============== //
export const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    me {
      id
      username
      email
      documentId
      confirmed
      blocked
      role {
        id
        name
        type
      }
    }
  }
`;

// =========== GET LANDLORD DETAILS QUERY ============== //
export const GET_LANDLORD_BY_USER_ID = gql`
  query GetLandlordByUserDocumentId($userDocumentId: ID!) {
    landlords(filters: { users_permissions_user: { documentId: { eq: $userDocumentId } } }) {
      documentId
      landlordId
      fullName
      phoneNumber
      address
      companyName
      verified
      users_permissions_user {
        documentId
        username
        email
      }
      profile {
        alternativeText
        url
      }
    }
  }
`;

// =========== GET STUDENT DETAILS QUERY ============== //
export const GET_STUDENT_BY_USER_ID = gql`
    query GetStudentByUserId($userId: ID!) {
        students(filters: { users_permissions_user: { documentId: { eq: $userId } } }) {
            documentId
            studentId
            firstName
            lastName
            phoneNumber
            users_permissions_user {
                documentId 
                username
                email
            }
            profile {
                alternativeText
                url
            }
        }
    }
`;

// =========== UPDATE USER ROLE MUTATION ============== //
export const UPDATE_USER_ROLE = gql`
  mutation UpdateUserRole($role: ID!, $updateUsersPermissionsUserId: ID!) {
    updateUsersPermissionsUser(data: { role: $role }, id: $updateUsersPermissionsUserId) {
      data {
        documentId
        username
        email
        role {
          documentId
          name
          type
        }
      }
    }
  }
`;

// =========== FORGOT PASSWORD MUTATION ============== //
export const FORGOT_PASSWORD = gql`
  mutation ForgotPassword($email: String!) {
    forgotPassword(email: $email) {
      ok
    }
  }
`;

// =========== RESET PASSWORD MUTATION ============== //
export const RESET_PASSWORD = gql`
  mutation ResetPassword($password: String!, $passwordConfirmation: String!, $code: String!) {
    resetPassword(password: $password, passwordConfirmation: $passwordConfirmation, code: $code) {
      jwt
      user {
        id
        username
        email
      }
    }
  }
`;

// Export all queries
const allQueries = {
  REGISTER_USER,
  LOGIN_USER,
  GET_CURRENT_USER,
  CREATE_LANDLORD_PROFILE,
  CREATE_STUDENT_PROFILE,
  UPDATE_USER_ROLE,
  FORGOT_PASSWORD,
  RESET_PASSWORD,
  UPDATE_LANDLORD_PROFILE,
  UPDATE_STUDENT_PROFILE,
  GET_LANDLORD_BY_USER_ID,
  GET_STUDENT_BY_USER_ID
};

export default allQueries;