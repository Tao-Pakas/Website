// src/services/authService.js - FIXED (REMOVED DUPLICATE)
import { 
  REGISTER_USER, 
  LOGIN_USER, 
  GET_CURRENT_USER,
  CREATE_LANDLORD_PROFILE,
  CREATE_STUDENT_PROFILE,
  UPDATE_USER_ROLE
} from '../graphql/createProfile';
import { graphqlRequest } from '../Utils/graphqlClient';

export const authService = {
  async completeSignup(userData) {
    try {
      console.log('🔧 [AuthService] Starting signup with role assignment');

      // Step 1: Basic user registration
      console.log('🚀 Step 1: User registration...');
      const registerResult = await graphqlRequest(REGISTER_USER, {
        input: {
          username: userData.username,
          email: userData.email,
          password: userData.password,
        }
      });

      if (!registerResult?.register?.jwt) {
        throw new Error('Registration failed - no JWT token received');
      }

      const userId = registerResult.register.user.id;
      const jwt = registerResult.register.jwt;
      console.log('✅ Registered user ID:', userId);

      // Store tokens
      localStorage.setItem('authToken', jwt);
      localStorage.setItem('jwt', jwt);

      // Wait for user persistence
      console.log('⏳ Waiting for user persistence...');
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Step 2: Update user role
      console.log(`🔄 Step 2: Updating user role to ${userData.role}...`);
      
      // Use correct role IDs - VERIFY THESE ARE CORRECT
      const roleIds = {
        student: 3,  // Verify this is correct Student role ID
        landlord: 1  // Verify this is correct Landlord role ID
      };

      const roleId = userData.role === 'landlord' ? roleIds.landlord : roleIds.student;
      
      console.log(`🎯 Using role ID: ${roleId} for ${userData.role}`);
      
      const roleUpdateResult = await this.updateUserRole(userId, roleId, jwt);
      console.log('✅ Role updated successfully:', roleUpdateResult);

      // Wait for role propagation
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 3: Create role-specific profile
      if (userData.role === 'landlord') {
        console.log('🏠 Step 3: Creating landlord profile...');
        return await this.createLandlordProfile(userData, userId, jwt);
      } else {
        console.log('🎓 Step 3: Creating student profile...');
        return await this.createStudentProfile(userData, userId, jwt);
      }
      
    } catch (error) {
      console.error('❌ Complete signup failed:', error);
      localStorage.removeItem('authToken');
      localStorage.removeItem('jwt');
      return this.handleAuthError(error);
    }
  },

  async updateUserRole(userId, roleId, jwt) {
    try {
      console.log(`🔄 Updating user ${userId} (type: ${typeof userId}) to role ${roleId}...`);
      
      // DEBUG: Check the exact ID value and type
      console.log('🔍 User ID details:', {
        raw: userId,
        type: typeof userId,
        asString: String(userId),
        asNumber: Number(userId)
      });
      
      const variables = {
        updateUsersPermissionsUserId: userId,
        role: roleId
      };
      
      console.log('🎯 Final variables being sent:', variables);
      
      const result = await graphqlRequest(UPDATE_USER_ROLE, variables, jwt);
      console.log('✅ User role updated successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ Role update failed:', error);
      throw new Error(`Role update failed: ${error.message}`);
    }
  },

  async createLandlordProfile(userData, userId, jwt) {
    try {
      console.log('📋 Creating landlord profile...');
      
      const phoneNumber = this.formatPhoneNumberForBigInt(userData.phone);

      const landlordData = {
        fullName: userData.fullName || `${userData.firstName} ${userData.lastName}`.trim() || userData.username,
        phoneNumber: phoneNumber,
        companyName: userData.companyName || '',
        address: userData.address || '',
        verified: false,
        users_permissions_user: userId
      };

      console.log('🏠 Creating landlord with data:', landlordData);

      const landlordResult = await graphqlRequest(CREATE_LANDLORD_PROFILE, {
        data: landlordData
      }, jwt);

      console.log('✅ Landlord profile creation response:', landlordResult);

      // Check if the mutation returned data
      if (!landlordResult || !landlordResult.createLandlord) {
        console.error('❌ Landlord profile creation returned null response');
        throw new Error('Landlord profile creation failed - no data returned');
      }

      console.log('✅ Landlord profile created successfully:', landlordResult.createLandlord);

      // Get complete user data
      const userResult = await graphqlRequest(GET_CURRENT_USER);
      
      return { 
        success: true, 
        data: {
          user: userResult.me,
          landlord: landlordResult.createLandlord,
          jwt: jwt
        }
      };
    } catch (error) {
      console.error('❌ Landlord profile creation failed:', error);
      throw new Error(`Landlord profile creation failed: ${error.message}`);
    }
  },

  async createStudentProfile(userData, userId, jwt) {
    try {
      console.log('📋 Creating student profile...');

      const phoneNumber = this.formatPhoneNumberForBigInt(userData.phone);

      const studentData = {
        firstName: userData.firstName || userData.username,
        lastName: userData.lastName || 'User',
        phoneNumber: phoneNumber,
        users_permissions_user: userId
      };

      console.log('🎓 Creating student with data:', studentData);

      const studentResult = await graphqlRequest(CREATE_STUDENT_PROFILE, {
        data: studentData
      }, jwt);

      console.log('✅ Student profile creation response:', studentResult);

      // Check if the mutation returned data
      if (!studentResult || !studentResult.createStudent) {
        console.error('❌ Student profile creation returned null response');
        throw new Error('Student profile creation failed - no data returned');
      }

      console.log('✅ Student profile created successfully:', studentResult.createStudent);

      // Get complete user data
      const userResult = await graphqlRequest(GET_CURRENT_USER);
      
      return { 
        success: true, 
        data: {
          user: userResult.me,
          student: studentResult.createStudent,
          jwt: jwt
        }
      };
    } catch (error) {
      console.error('❌ Student profile creation failed:', error);
      throw new Error(`Student profile creation failed: ${error.message}`);
    }
  },

  // Helper function to convert phone number to BigInt format
  formatPhoneNumberForBigInt(phone) {
    if (!phone) return 0;
    
    const digitsOnly = phone.replace(/[^\d]/g, '');
    const phoneNumber = parseInt(digitsOnly, 10);
    
    if (isNaN(phoneNumber)) {
      console.warn('⚠️ Invalid phone number format, using 0:', phone);
      return 0;
    }
    
    console.log(`📞 Converted phone: "${phone}" -> ${phoneNumber}`);
    return phoneNumber;
  },

  handleAuthError(error) {
    console.error('🔍 Analyzing auth error:', error.message);
    
    let userMessage = 'Registration failed. Please try again.';
    
    if (error.message.includes('Forbidden access') || error.message.includes('permission')) {
      userMessage = 'Permission denied. Please contact support or try different credentials.';
    } else if (error.message.includes('BigInt cannot represent value')) {
      userMessage = 'Invalid phone number format. Please use numbers only (no + sign or spaces).';
    } else if (error.message.includes('Email or Username are already taken') || 
        error.message.includes('already taken')) {
      userMessage = 'Username or email is already registered. Please use different credentials or login.';
    } else if (error.message.includes('username') && error.message.includes('taken')) {
      userMessage = 'Username is already taken. Please choose another.';
    } else if (error.message.includes('email') && error.message.includes('taken')) {
      userMessage = 'Email is already registered. Please use a different email or login.';
    } else if (error.message.includes('password')) {
      userMessage = 'Password requirements not met. Please use a stronger password.';
    } else if (error.message.includes('Internal Server Error')) {
      userMessage = 'Server error during registration. Please try different credentials.';
    } else if (error.message.includes('Network Error') || error.message.includes('Failed to fetch')) {
      userMessage = 'Cannot connect to server. Please check your internet connection.';
    }
    
    return { 
      success: false, 
      error: userMessage 
    };
  },

  // Login method
  async login(identifier, password) {
    try {
      console.log('🔐 Attempting login for:', identifier);
      const result = await graphqlRequest(LOGIN_USER, {
        input: {
          identifier,
          password
        }
      });
      
      if (result.login.jwt) {
        localStorage.setItem('authToken', result.login.jwt);
        localStorage.setItem('jwt', result.login.jwt);
        console.log('✅ Login successful');
      }
      
      return { success: true, data: result.login };
    } catch (error) {
      console.error('❌ Login error:', error);
      return { 
        success: false, 
        error: this.handleAuthError(error).error 
      };
    }
  },

  async getCurrentUser() {
    try {
      const result = await graphqlRequest(GET_CURRENT_USER);
      return { success: true, data: result.me };
    } catch (error) {
      console.error('Get current user error:', error);
      return { success: false, error: error.message };
    }
  },

  // Logout method
  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('jwt');
    console.log('✅ Logged out successfully');
  }
};