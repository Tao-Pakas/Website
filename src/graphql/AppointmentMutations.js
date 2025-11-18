export const CREATE_APPOINTMENT = `
  mutation CreateAppointment($data: AppointmentInput!) {
    createAppointment(data: $data) {
      data {
        id
        attributes {
          date
          time
          user {
            data {
              id
              attributes {
                username
                email
              }
            }
          }
          property {
            data {
              id
              attributes {
                title
              }
            }
          }
        }
      }
    }
  }
`;

export const CREATE_NOTIFICATION = `
  mutation CreateNotification($data: NotificationInput!) {
    createNotification(data: $data) {
      data {
        id
        attributes {
          message
          isRead
          createdAt
          landlord {
            data {
              id
              attributes {
                username
              }
            }
          }
        }
      }
    }
  }
`;
