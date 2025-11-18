import { useAuth } from './Contexts/AuthContext';

function App() {
  const { user } = useAuth();
  
  // Access the IDs
  console.log('User role:', user?.userRole);
  console.log('Student ID:', user?.studentId);
  console.log('Landlord ID:', user?.landlordId);
  console.log('Full name:', user?.fullName);
  
  return (
    <div>
      {/* Display based on role */}
      {user?.userRole === 'student' && (
        <p>Student ID: {user.studentId}</p>
      )}
      
      {user?.userRole === 'landlord' && (
        <p>Landlord ID: {user.landlordId}</p>
      )}
    </div>
  );
}

export default App