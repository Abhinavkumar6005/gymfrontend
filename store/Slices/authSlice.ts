// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import { apiService } from '@/utils/apiservices';
// import { encryptData, decryptData } from '@/utils/crypto';

// interface User {
//   _id: string;
//   email: string;
//   fullName: string;
//   role: 'admin' | 'staff';
// }

// interface AuthState {
//   user: User | null;
//   token: string | null;
//   isLoading: boolean;
//   error: string | null;
//   isAuthenticated: boolean;
// }

// const loadFromStorage = () => {
//   if (typeof window === 'undefined') return { user: null, token: null };
//   try {
//     const encryptedToken = localStorage.getItem('token');
//     const encryptedUser = localStorage.getItem('user');
//     return {
//       token: encryptedToken ? decryptData(encryptedToken) : null,
//       user: encryptedUser ? JSON.parse(decryptData(encryptedUser)) : null,
//     };
//   } catch {
//     return { user: null, token: null };
//   }
// };

// const { token, user } = loadFromStorage();

// const initialState: AuthState = {
//   user,
//   token,
//   isLoading: false,
//   error: null,
//   isAuthenticated: !!token,
// };

// export const adminLogin = createAsyncThunk(
//   'auth/adminLogin',
//   async (credentials: { email: string; password: string }, { rejectWithValue }) => {
//     try {
//       const response = await apiService.postPublic('/api/auth/admin/login', credentials);
//       return response;
//     } catch (error: unknown) {
//       return rejectWithValue(error instanceof Error ? error.message : 'Login failed');
//     }
//   }
// );

// const authSlice = createSlice({
//   name: 'auth',
//   initialState,
//   reducers: {
//     logout: (state) => {
//       state.user = null;
//       state.token = null;
//       state.isAuthenticated = false;
//       state.error = null;
//       if (typeof window !== 'undefined') {
//         localStorage.removeItem('token');
//         localStorage.removeItem('user');
//       }
//     },
//     clearError: (state) => {
//       state.error = null;
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(adminLogin.pending, (state) => {
//         state.isLoading = true;
//         state.error = null;
//       })
//       .addCase(adminLogin.fulfilled, (state, action) => {
//         state.isLoading = false;
//         state.token = action.payload.token;
//         state.user = action.payload.user;
//         state.isAuthenticated = true;

//         // Store encrypted in localStorage
//         if (typeof window !== 'undefined') {
//           localStorage.setItem('token', encryptData(action.payload.token));
//           localStorage.setItem('user', encryptData(JSON.stringify(action.payload.user)));
//           apiService.setToken(action.payload.token);
//         }
//       })
//       .addCase(adminLogin.rejected, (state, action) => {
//         state.isLoading = false;
//         state.error = action.payload as string;
//         state.isAuthenticated = false;
//       });
//   },
// });

// export const { logout, clearError } = authSlice.actions;
// export default authSlice.reducer;


import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiService } from '@/utils/apiservices';
import { saveAuthToken, saveUserData, clearAuthData, getAuthToken } from '../../utils/crypto';

interface AuthState {
  user: any;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
};

// Admin login
export const adminLogin = createAsyncThunk(
  'auth/adminLogin',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await apiService.postPublic('/api/auth/admin/login', { email, password });
      
      // Save encrypted token and user data
      if (response.token) {
        saveAuthToken(response.token);
        saveUserData(response.user);
      }
      
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

// Logout
export const logout = createAsyncThunk('auth/logout', async () => {
  clearAuthData();
  
  return null;
});

// Check if user is already logged in (on app load)
export const checkAuth = createAsyncThunk('auth/checkAuth', async () => {
  const token = getAuthToken();
  if (token) {
    // Optionally verify token with backend
    return { token };
  }
  return null;
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Admin login
      .addCase(adminLogin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(adminLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(adminLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
      })
      // Check auth
      .addCase(checkAuth.fulfilled, (state, action) => {
        if (action.payload) {
          state.token = action.payload.token;
        }
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;