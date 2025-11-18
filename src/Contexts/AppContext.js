import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
  useMemo,
  useRef
} from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { useAuth } from './AuthContext';
import { accommodationService } from '../Services/accommodationService';

import {
  LIKE_PROPERTY,
  UNLIKE_PROPERTY,
} from '../graphql/useBooking';
import { useLazyQuery } from '@apollo/client/react'; 

import { GET_ACCOMMODATIONS_INQUIRIES, 
  GET_STUDENT_INQUIRIES_WITH_PROPERTIES } from '../graphql/inquiries';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};

// 🔥 ADDED: Define UPDATE_INQUIRY_STATUS locally since it's not in the import
const UPDATE_INQUIRY_STATUS = gql`
  mutation UpdateInquiry($id: ID!, $data: InquiryInput!) {
    updateInquiry(documentId: $id, data: $data) {
      documentId
      attributes {
        state
        landlordReply
        counterDate
      }
    }
  }
`;

// =============================
// 🔹 COMPLETE Inquiry Creation Function
// =============================
const createUserInquiry = async (inquiryData, currentUser) => {
  try {
    console.log('🚀 Starting inquiry creation process...');

    // FIRST: Get the student profile to get the correct documentId
    console.log('🔍 Step 0: Getting student profile...');
    const studentResult = await accommodationService.getStudentIdByUser(currentUser.documentId);
    
    if (!studentResult || !studentResult.documentId) {
      throw new Error('Student profile not found. Please complete your student profile first.');
    }

    const studentDocumentId = studentResult.documentId;
    console.log('✅ Using student documentId:', studentDocumentId);

    // STEP 1: Create the inquiry with the CORRECT student documentId
    console.log('🔍 Step 1: Creating inquiry with student & accommodation relations...');

    const CREATE_INQUIRY_WITH_RELATIONS = gql`
      mutation CreateInquiryWithRelations($data: InquiryInput!) {
        createInquiry(data: $data) {
          documentId
          attributes {
            propertyId
            propertyName
            userName
            userEmail
            userPhone
            message
            preferredDate
            state
            landlordReply
            counterDate
            userId
            role
          }
          students {
            documentId
            firstName
            lastName
          }
          accommodation {
            documentId
            name
            landlord {
              documentId
              fullName
            }
          }
        }
      }
    `;

    const inquiryInput = {
      attributes: {
        propertyId: inquiryData.propertyId,
        propertyName: inquiryData.propertyName,
        userName: inquiryData.userName || currentUser.username,
        userEmail: inquiryData.userEmail || currentUser.email,
        userPhone: parseInt(inquiryData.userPhone.replace(/[^\d]/g, ''), 10),
        message: inquiryData.message,
        preferredDate: inquiryData.preferredDate,
        state: 'unread',
        landlordReply: null,
        counterDate: null,
        role: 'student'
      },
      students: [studentDocumentId], // ✅ CORRECT: Use student profile documentId
      accommodation: inquiryData.propertyId
    };

    console.log('📤 Inquiry Input Data:', inquiryInput);

    const inquiryResult = await accommodationService.graphqlRequest(CREATE_INQUIRY_WITH_RELATIONS, {
      data: inquiryInput
    });

    console.log('✅ Inquiry Created:', inquiryResult);

    if (!inquiryResult?.createInquiry) {
      throw new Error('Failed to create inquiry - no data returned');
    }

    const finalInquiry = {
      id: inquiryResult.createInquiry.documentId,
      documentId: inquiryResult.createInquiry.documentId,
      ...inquiryResult.createInquiry.attributes,
      students: inquiryResult.createInquiry.students || [],
      accommodation: inquiryResult.createInquiry.accommodation || null
    };

    console.log('🎉 INQUIRY CREATION COMPLETE:', finalInquiry);

    return {
      success: true,
      data: finalInquiry,
      message: 'Inquiry created successfully and sent to property owner!'
    };

  } catch (error) {
    console.error('💥 INQUIRY CREATION FAILED:', error);
    
    return {
      success: false,
      error: error.message,
      type: 'INQUIRY_CREATION_ERROR'
    };
  }
};

// =============================
// 🔹 Inquiries Hook - FIXED VERSION
// =============================
const useInquiries = (user, landlordDocumentId, studentDocumentId) => {
  const [userInquiries, setUserInquiries] = useState([]);
  const [landlordPropertiesWithInquiries, setLandlordPropertiesWithInquiries] = useState([]);
  const abortControllerRef = useRef(null);

  const userRole = user?.role?.name || user?.role;

  console.log('🔍 INQUIRIES DEBUG - User role:', userRole);
  console.log('🔍 INQUIRIES DEBUG - Landlord documentId:', landlordDocumentId);
  console.log('🔍 INQUIRIES DEBUG - Student documentId:', studentDocumentId);

  const [
    fetchStudentInquiries,
    { data: studentInquiriesData, refetch: refetchStudentInquiries, loading: studentInquiriesLoading, error: studentInquiriesError }
  ] = useLazyQuery(GET_STUDENT_INQUIRIES_WITH_PROPERTIES, {
    fetchPolicy: 'cache-and-network'
  });

  const [
    fetchLandlordProperties,
    { data: landlordPropertiesData, refetch: refetchLandlordProperties, loading: landlordPropertiesLoading, error: landlordPropertiesError }
  ] = useLazyQuery(GET_ACCOMMODATIONS_INQUIRIES, {
    fetchPolicy: 'cache-and-network'
  });

  // 🔥 ADD: Debug when landlordPropertiesWithInquiries changes
  useEffect(() => {
    console.log('🔄 landlordPropertiesWithInquiries state changed:', landlordPropertiesWithInquiries);
    console.log('🔄 Length:', landlordPropertiesWithInquiries.length);
  }, [landlordPropertiesWithInquiries]);

  // 🧹 Cleanup for component unmount
  useEffect(() => {
    return () => abortControllerRef.current?.abort();
  }, []);

  // 🔥 FIXED: Fetch data only when document IDs are available
  useEffect(() => {
    if (!user?.id) {
      setUserInquiries([]);
      setLandlordPropertiesWithInquiries([]);
      return;
    }

    console.log('🔄 useInquiries useEffect - Checking document IDs...');

    // Abort previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();

    if (userRole === 'student' && studentDocumentId) {
      console.log('🎯 Fetching student inquiries...');
      fetchStudentInquiries({
        variables: { studentDocumentId },
        context: {
          fetchOptions: {
            signal: abortControllerRef.current.signal
          }
        }
      });
    } else if (userRole === 'landlord' && landlordDocumentId) {
      console.log('🎯 Fetching landlord properties with inquiries...');
      fetchLandlordProperties({
        variables: { landlordDocumentId },
        context: {
          fetchOptions: {
            signal: abortControllerRef.current.signal
          }
        }
      });
    }
  }, [user?.id, userRole, studentDocumentId, landlordDocumentId, fetchStudentInquiries, fetchLandlordProperties]);

  // 🔥 FIXED: MAIN TRANSFORMATION PIPELINE
  useEffect(() => {
    if (!user?.id) {
      setUserInquiries([]);
      setLandlordPropertiesWithInquiries([]);
      return;
    }

    console.log('🔍 INQUIRIES TRANSFORM DEBUG:');
    console.log('User role:', userRole);
    console.log('Student inquiries data available:', !!studentInquiriesData);
    console.log('Landlord properties data available:', !!landlordPropertiesData);
    console.log('Landlord properties data structure:', landlordPropertiesData);

    /** 👇 For LANDLORD — FIXED to handle both accommodation and accommodations */
    if (userRole === "landlord" && landlordPropertiesData) {
      let accommodations = [];
      
      // Handle both accommodation (singular) and accommodations (plural)
      if (landlordPropertiesData.accommodations) {
        accommodations = landlordPropertiesData.accommodations;
        console.log('📦 Using accommodations (plural) array:', accommodations);
      } else if (landlordPropertiesData.accommodation) {
        accommodations = Array.isArray(landlordPropertiesData.accommodation) 
          ? landlordPropertiesData.accommodation 
          : [landlordPropertiesData.accommodation];
        console.log('📦 Using accommodation (singular) array:', accommodations);
      }

      if (accommodations.length > 0) {
        console.log(`🏠 Found ${accommodations.length} accommodations for landlord`);
        
        const transformed = accommodations.flatMap(acc => {
          console.log('🔍 Processing accommodation:', acc.name, 'with inquiries:', acc.inquiries?.length || 0);
          
          const inquiries = acc.inquiries || [];
          return inquiries.map(inq => ({
            id: inq.documentId,
            documentId: inq.documentId,
            ...inq.attributes, // Make sure to spread attributes
            student: inq.students?.[0] || {},
            accommodation: {
              id: acc.documentId,
              name: acc.name,
              location: acc.location,
              details: acc.details,
              media: acc.media,
              landlord: acc.landlord,
            }
          }));
        });

        console.log('🎯 Transformed landlord inquiries:', transformed);
        console.log('📊 Total inquiries extracted:', transformed.length);
        
        setUserInquiries(transformed);
        setLandlordPropertiesWithInquiries(accommodations);
        return;
      }
    }

    /** 👇 For STUDENT */
    if (userRole === "student" && studentInquiriesData?.inquiries) {
      const inquiries = Array.isArray(studentInquiriesData.inquiries)
        ? studentInquiriesData.inquiries
        : [studentInquiriesData.inquiries];

      const transformed = inquiries.map(inq => {
        const acc = inq.accommodations?.[0] || inq.accommodation || {};
        return {
          id: inq.documentId,
          documentId: inq.documentId,
          ...inq.attributes, // Make sure to spread attributes
          student: inq.students?.[0] || {},
          accommodation: {
            id: acc.documentId,
            name: acc.name,
            location: acc.location,
            details: acc.details,
            media: acc.media,
            landlord: acc.landlord
          }
        };
      });

      console.log('✅ Transformed student inquiries:', transformed.length);
      setUserInquiries(transformed);
      setLandlordPropertiesWithInquiries([]);
      return;
    }

  }, [user?.id, userRole, studentInquiriesData, landlordPropertiesData]);

  // 🔥 UPDATE MUTATION
  const [updateInquiryMutation] = useMutation(UPDATE_INQUIRY_STATUS);

  const updateInquiry = useCallback(
    async (inquiryId, updates) => {
      const dataPayload = {
        attributes: {
          state: updates.state,
          landlordReply: updates.landlordReply,
          counterDate: updates.counterDate,
        }
      };

      try {
        await updateInquiryMutation({ variables: { id: inquiryId, data: dataPayload } });

        // Refresh queries depending on user role
        if (userRole === "student" && studentDocumentId) {
          await fetchStudentInquiries({ variables: { studentDocumentId } });
        } else if (userRole === "landlord" && landlordDocumentId) {
          await fetchLandlordProperties({ variables: { landlordDocumentId } });
        }

        return { success: true, message: "Inquiry updated successfully!" };
      } catch (e) {
        throw new Error(`Failed to update inquiry: ${e.message}`);
      }
    },
    [userRole, studentDocumentId, landlordDocumentId, fetchStudentInquiries, fetchLandlordProperties, updateInquiryMutation]
  );

  // Create inquiry function
  const createInquiry = useCallback(
    async (inquiryData) => {
      return await createUserInquiry(inquiryData, user);
    },
    [user]
  );

  // 🔄 REFRESH
  const refreshInquiries = useCallback(async () => {
    console.log('🔄 Refreshing inquiries for role:', userRole);
    
    try {
      if (userRole === "student" && studentDocumentId) {
        console.log('🎯 Refreshing student inquiries...');
        await fetchStudentInquiries({ variables: { studentDocumentId } });
      } else if (userRole === "landlord" && landlordDocumentId) {
        console.log('🎯 Refreshing landlord properties with inquiries...');
        await fetchLandlordProperties({ variables: { landlordDocumentId } });
      }
      console.log('✅ Refresh inquiries completed successfully');
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('⚠️ Inquiry refresh was aborted (likely component unmounted)');
      } else {
        console.error('❌ Error refreshing inquiries:', error);
      }
    }
  }, [userRole, studentDocumentId, landlordDocumentId, fetchStudentInquiries, fetchLandlordProperties]);

  return {
    /** Main output */
    userInquiries,
    landlordPropertiesWithInquiries,

    /** Aliases (keep backwards compatibility) */
    landlordInquiries: userInquiries, // 🔥 FIXED: This should point to extracted inquiries
    propertyInquiries: landlordPropertiesWithInquiries,

    /** Methods */
    createInquiry, // 🔥 ADDED: Missing function
    updateInquiry,
    refreshInquiries,

    /** Loading states */
    studentInquiriesLoading,
    landlordInquiriesLoading: landlordPropertiesLoading,
    propertyInquiriesLoading: landlordPropertiesLoading,

    /** Error states */
    studentInquiriesError,
    landlordInquiriesError: landlordPropertiesError,
    propertyInquiriesError: landlordPropertiesError
  };
};

// =============================
// 🔹 Like System Hook
// =============================
const useLikeSystem = (user) => {
  const [likedProperties, setLikedProperties] = useState([]);
  const [likeMutation] = useMutation(LIKE_PROPERTY);
  const [unlikeMutation] = useMutation(UNLIKE_PROPERTY);

  useEffect(() => {
    if (user?.id) {
      const saved = localStorage.getItem(`likedProperties_${user.id}`);
      if (saved) setLikedProperties(JSON.parse(saved));
    }
  }, [user?.id]);

  const isLiked = useCallback(
    (propertyId) => likedProperties.includes(propertyId),
    [likedProperties]
  );

  const likeProperty = useCallback(async (propertyId) => {
    if (!user) throw new Error('Login required');
    if (likedProperties.includes(propertyId)) return;

    await likeMutation({ variables: { documentId: propertyId } });
    const updated = [...likedProperties, propertyId];
    setLikedProperties(updated);
    localStorage.setItem(`likedProperties_${user.id}`, JSON.stringify(updated));
  }, [user, likedProperties, likeMutation]);

  const unlikeProperty = useCallback(async (propertyId) => {
    if (!user) throw new Error('Login required');

    await unlikeMutation({ variables: { documentId: propertyId } });
    const updated = likedProperties.filter(id => id !== propertyId);
    setLikedProperties(updated);
    localStorage.setItem(`likedProperties_${user.id}`, JSON.stringify(updated));
  }, [user, likedProperties, unlikeMutation]);

  const toggleLike = useCallback(async (propertyId) => {
    if (isLiked(propertyId)) await unlikeProperty(propertyId);
    else await likeProperty(propertyId);
  }, [isLiked, unlikeProperty, likeProperty]);

  return {
    isLiked,
    toggleLike,
    likedProperties,
  };
};

// =============================
// 🔹 Main Provider - UPDATED FOR DOCUMENT ID
// =============================
export const AppProvider = ({ children }) => {
  const { user } = useAuth();
  const [userAccommodations, setUserAccommodations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [shortlist, setShortlist] = useState([]);
  
  const [landlordDocumentId, setLandlordDocumentId] = useState(null);
  const [landlordData, setLandlordData] = useState(null);
  const [studentDocumentId, setStudentDocumentId] = useState(null);
  const [studentData, setStudentData] = useState(null);

  // 🔥 FIXED: Memoize loadUserProfile to prevent unnecessary re-renders
  const loadUserProfile = useCallback(async (currentUser) => {
    if (!currentUser?.id) {
      setLandlordDocumentId(null);
      setLandlordData(null);
      setStudentDocumentId(null);
      setStudentData(null);
      return null;
    }

    const userRole = currentUser?.role?.name || currentUser?.role;
    
    try {
      console.log('👤 Loading user profile for:', currentUser.id, 'Role:', userRole);
      
      if (userRole === 'landlord') {
        const landlordResult = await accommodationService.getLandlordId(currentUser);
        
        console.log('🔍 Raw result from accommodationService.getLandlordId:', landlordResult);
        
        let landlordDocumentId = null;
        let landlordProfile = null;
        
        if (typeof landlordResult === 'string') {
          landlordDocumentId = landlordResult;
          landlordProfile = { documentId: landlordDocumentId };
          console.log('✅ accommodationService returned documentId string:', landlordDocumentId);
        } else if (landlordResult && landlordResult.documentId) {
          landlordDocumentId = landlordResult.documentId;
          landlordProfile = landlordResult;
          console.log('✅ accommodationService returned profile with documentId:', landlordDocumentId);
        } else if (landlordResult && landlordResult.id) {
          landlordDocumentId = landlordResult.id;
          landlordProfile = { ...landlordResult, documentId: landlordDocumentId };
          console.log('✅ accommodationService returned object with id as documentId:', landlordDocumentId);
        }
        
        if (landlordDocumentId) {
          console.log('✅ Setting landlordDocumentId:', landlordDocumentId);
          setLandlordDocumentId(landlordDocumentId);
          setLandlordData(landlordProfile);
          setStudentDocumentId(null);
          setStudentData(null);
          return landlordProfile;
        } else {
          console.log('❌ Could not extract landlord documentId from result:', landlordResult);
          setLandlordDocumentId(null);
          setLandlordData(null);
          return null;
        }
      } else if (userRole === 'student') {
        const studentResult = await accommodationService.getStudentIdByUser(currentUser.documentId);
        
        console.log('🔍 Raw result from accommodationService.getStudentIdByUser:', studentResult);
        
        let studentDocumentId = null;
        let studentProfile = null;
        
        if (typeof studentResult === 'string') {
          studentDocumentId = studentResult;
          studentProfile = { documentId: studentDocumentId };
          console.log('✅ accommodationService returned student documentId string:', studentDocumentId);
        } else if (studentResult && studentResult.documentId) {
          studentDocumentId = studentResult.documentId;
          studentProfile = studentResult;
          console.log('✅ accommodationService returned student profile with documentId:', studentDocumentId);
        } else if (studentResult && studentResult.id) {
          studentDocumentId = studentResult.id;
          studentProfile = { ...studentResult, documentId: studentDocumentId };
          console.log('✅ accommodationService returned student object with id as documentId:', studentDocumentId);
        }
        
        if (studentDocumentId) {
          console.log('✅ Setting studentDocumentId:', studentDocumentId);
          setStudentDocumentId(studentDocumentId);
          setStudentData(studentProfile);
          setLandlordDocumentId(null);
          setLandlordData(null);
          return studentProfile;
        } else {
          console.log('❌ Could not extract student documentId from result:', studentResult);
          setStudentDocumentId(null);
          setStudentData(null);
          return null;
        }
      } else {
        console.log('👤 User has unrecognized role:', userRole);
        setLandlordDocumentId(null);
        setLandlordData(null);
        setStudentDocumentId(null);
        setStudentData(null);
        return null;
      }
    } catch (error) {
      console.error('💥 Error loading user profile from accommodationService:', error);
      setLandlordDocumentId(null);
      setLandlordData(null);
      setStudentDocumentId(null);
      setStudentData(null);
      return null;
    }
  }, []);

  // 🔥 UPDATED: Inquiries hook with documentId
  const inquiries = useInquiries(user, landlordDocumentId, studentDocumentId);

  const likeSystem = useLikeSystem(user);

  // 🔥 FIXED: Memoize loadUserAccommodations
  const loadUserAccommodations = useCallback(async (currentUser) => {
    if (!currentUser?.id) {
      console.log('🔄 No user, clearing accommodations');
      setUserAccommodations([]);
      return [];
    }

    const userRole = currentUser?.role?.name || currentUser?.role;
    if (userRole !== 'landlord') {
      console.log('👤 User is not a landlord, skipping accommodations load');
      setUserAccommodations([]);
      return [];
    }

    try {
      setLoading(true);
      console.log('🔍 DEBUG: Loading accommodations for landlord:', currentUser.id, currentUser.username);
      
      await loadUserProfile(currentUser);
      
      const data = await accommodationService.getUserAccommodations(currentUser);
      
      console.log('📦 DEBUG: Accommodations received:', data?.length);
      
      const validData = data ? data.filter(acc => acc !== null) : [];
      
      console.log('✅ DEBUG: Valid accommodations after filtering:', validData.length);
      
      setUserAccommodations(validData);
      setError(null);
      return validData;
    } catch (err) {
      console.error('Error loading accommodations:', err);
      setError(err.message);
      setUserAccommodations([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [loadUserProfile]);

  // Student data loader functions (placeholder)
  const loadStudentData = useCallback(async (currentUser) => {
    // Add student-specific data loading here if needed
    console.log('👤 Loading student data for:', currentUser.id);
  }, []);

  const loadStudentAccommodations = useCallback(async (currentUser) => {
    // Add student accommodations loading here if needed
    console.log('👤 Loading student accommodations for:', currentUser.id);
  }, []);

  // 🔥 FIXED: Wait for AuthContext before loading and avoid double resets
  useEffect(() => {
    console.log("🔄 AppProvider useEffect TRIGGERED | user:", user);

    // ⏳ AuthContext still initializing
    if (user === undefined) {
      console.log("⏳ AuthContext still initializing...");
      return;
    }

    // 🚪 User logged out → reset all relevant state
    if (!user) {
      console.log("🚪 No user found — resetting AppContext state");
      setLandlordDocumentId(null);
      setLandlordData(null);
      setStudentDocumentId(null);
      setStudentData(null);
      setUserAccommodations([]);
      return;
    }

    // ✅ User is logged in → handle based on role
    const role = user?.role?.name || user?.role;
    console.log(`👤 User authenticated (${role}) — fetching relevant data`);

    // Load profile (common for both roles)
    loadUserProfile(user);

    // Role-specific data
    if (role === "landlord") {
      loadUserAccommodations(user);
    } else if (role === "student") {
      // Add student-specific loaders here
      loadStudentData(user);
      loadStudentAccommodations(user);
    } else {
      // Unknown role → clear accommodations
      setUserAccommodations([]);
    }
  }, [user, loadUserProfile, loadUserAccommodations, loadStudentData, loadStudentAccommodations]);

  useEffect(() => {
    if (user?.id && inquiries.refreshInquiries) {
      const userRole = user?.role?.name || user?.role;
      
      // Only refresh if we have the required document ID
      if ((userRole === 'landlord' && landlordDocumentId) || 
          (userRole === 'student' && studentDocumentId)) {
        console.log('🔄 Document IDs available, refreshing inquiries...');
        inquiries.refreshInquiries();
      }
    }
  }, [landlordDocumentId, studentDocumentId, user, inquiries.refreshInquiries]);

  const isFavorite = useCallback(
    (id) => favorites.some(f => f.id === id),
    [favorites]
  );

  const toggleFavorite = useCallback((property) => {
    setFavorites(prev =>
      prev.some(f => f.id === property.id)
        ? prev.filter(f => f.id !== property.id)
        : [...prev, property]
    );
  }, []);

  const addToShortlist = useCallback((property) => {
    setShortlist(prev =>
      prev.some(item => item.id === property.id)
        ? prev
        : [...prev, property]
    );
  }, []);

  const removeFromShortlist = useCallback(
    (id) => setShortlist(prev => prev.filter(i => i.id !== id)),
    []
  );

  const isInShortlist = useCallback(
    (id) => shortlist.some(item => item.id === id),
    [shortlist]
  );

  const value = useMemo(() => {
    console.log('🎯 DEBUG - AppContext value being created:');
    console.log('  - landlordInquiries:', inquiries.userInquiries); // 🔥 FIXED: Changed to userInquiries
    console.log('  - landlordInquiries length:', inquiries.userInquiries?.length); // 🔥 FIXED: Changed to userInquiries
    
    return {
      user,
      userAccommodations,
      loading,
      error,
      favorites,
      shortlist,
      isFavorite,
      toggleFavorite,
      addToShortlist,
      removeFromShortlist,
      isInShortlist,

      // Profile data - using documentId
      landlordId: landlordDocumentId,
      landlordDocumentId,
      landlordData,
      studentId: studentDocumentId,
      studentDocumentId,
      studentData,

      createAccommodation: async (data) => accommodationService.createAccommodation(data, user),
      updateAccommodation: async (id, data) => accommodationService.updateAccommodation(id, data, user),
      deleteAccommodation: async (id) => accommodationService.deleteAccommodation(id, user),
      refreshAccommodations: async () => loadUserAccommodations(user),

      // 🔥 UPDATED: Inquiries with documentId and property-based approach
      userInquiries: inquiries.userInquiries,
      landlordPropertiesWithInquiries: inquiries.landlordPropertiesWithInquiries,
      landlordInquiries: inquiries.userInquiries, // 🔥 FIXED: This should point to extracted inquiries
      propertyInquiries: inquiries.landlordPropertiesWithInquiries,
      createInquiry: inquiries.createInquiry,
      updateInquiry: inquiries.updateInquiry,
      refreshInquiries: inquiries.refreshInquiries,

      isPropertyLiked: likeSystem.isLiked,
      togglePropertyLike: likeSystem.toggleLike,
      getLikedProperties: () => likeSystem.likedProperties,
    };
  }, [
    user,
    userAccommodations,
    loading,
    error,
    favorites,
    shortlist,
    isFavorite,
    toggleFavorite,
    addToShortlist,
    removeFromShortlist,
    isInShortlist,
    landlordDocumentId,
    landlordData,
    studentDocumentId,
    studentData,
    inquiries,
    likeSystem,
    loadUserAccommodations
  ]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;