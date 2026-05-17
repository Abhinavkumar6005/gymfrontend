import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '@/utils/apiservices';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MembershipPlan {
  _id: string;
  name: string;
  durationMonths: number;
  price: number;
  description: string;
  features: string[];
}

export interface Member {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  membershipPlan: MembershipPlan | string; // populated obj OR ObjectId string
  membershipStart: string;
  membershipEnd: string;
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  paymentStatus: 'paid' | 'pending' | 'overdue';
  amountPaid: number;
  remainingAmount: number;
  profileImage?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relation: string;
  };
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface MembersState {
  members: Member[];
  selectedMember: Member | null;
  expiringMembers: Member[];
  isLoading: boolean;
  isLoadingExpiring: boolean; // ✅ FIX: separate flag so expiring fetch doesn't block main table
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: MembersState = {
  members: [],
  selectedMember: null,
  expiringMembers: [],
  isLoading: false,
  isLoadingExpiring: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
  successMessage: null,
};

// ─── Async Thunks ─────────────────────────────────────────────────────────────

// Get all members
export const fetchMembers = createAsyncThunk(
  'members/fetchMembers',
  async (_, { rejectWithValue }) => {
    try {
      return await apiService.get('/api/members/');
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch members');
    }
  }
);

// Get single member by ID
export const fetchMemberById = createAsyncThunk(
  'members/fetchMemberById',
  async (id: string, { rejectWithValue }) => {
    try {
      // ✅ FIX: was '/members/:id' — missing /api prefix → 404
      return await apiService.get(`/api/members/${id}`);
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch member');
    }
  }
);

// Create new member
export const createMember = createAsyncThunk(
  'members/createMember',
  async (memberData: Omit<Member, '_id' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      return await apiService.post('/api/members/', memberData);
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create member');
    }
  }
);

// Update member
export const updateMember = createAsyncThunk(
  'members/updateMember',
  async ({ id, memberData }: { id: string; memberData: Partial<Member> }, { rejectWithValue }) => {
    try {
      // ✅ FIX: was '/members/:id' — missing /api prefix → 404
      return await apiService.put(`/api/members/${id}`, memberData);
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update member');
    }
  }
);

// Delete member
export const deleteMember = createAsyncThunk(
  'members/deleteMember',
  async (id: string, { rejectWithValue }) => {
    try {
      // ✅ FIX: was '/members/:id' — missing /api prefix → 404
      await apiService.delete(`/api/members/${id}`);
      return id;
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete member');
    }
  }
);

// Get expiring members (membership ending within 7 days)
export const fetchExpiringMembers = createAsyncThunk(
  'members/fetchExpiringMembers',
  async (_, { rejectWithValue }) => {
    try {
      // ✅ FIX: was '/members/expiring' — missing /api prefix → 404
      return await apiService.get('/api/members/expiring');
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch expiring members');
    }
  }
);

// Get members by status
export const fetchMembersByStatus = createAsyncThunk(
  'members/fetchMembersByStatus',
  async (status: string, { rejectWithValue }) => {
    try {
      // ✅ FIX: was '/members/status/:s' — missing /api prefix → 404
      return await apiService.get(`/api/members/status/${status}`);
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch members by status');
    }
  }
);

// Search members
export const searchMembers = createAsyncThunk(
  'members/searchMembers',
  async (query: string, { rejectWithValue }) => {
    try {
      // ✅ FIX 1: was '/members/search' — missing /api prefix → 404
      // ✅ FIX 2: encodeURIComponent so "John Doe" doesn't break the URL
      return await apiService.get(`/api/members/search?q=${encodeURIComponent(query)}`);
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to search members');
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const membersSlice = createSlice({
  name: 'members',
  initialState,
  reducers: {
    clearSelectedMember: (state) => { state.selectedMember = null; },
    clearError: (state) => { state.error = null; },
    clearSuccessMessage: (state) => { state.successMessage = null; },
    addMember: (state, action: PayloadAction<Member>) => {
      state.members.push(action.payload);
    },
    updateMemberInState: (state, action: PayloadAction<Member>) => {
      const index = state.members.findIndex(m => m._id === action.payload._id);
      if (index !== -1) state.members[index] = action.payload;
    },
    removeMember: (state, action: PayloadAction<string>) => {
      state.members = state.members.filter(m => m._id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // ── fetchMembers ──────────────────────────────────────────────────────
      .addCase(fetchMembers.pending, (state) => {
        state.isLoading = true; state.error = null;
      })
      .addCase(fetchMembers.fulfilled, (state, action) => {
        state.isLoading = false; state.members = action.payload;
      })
      .addCase(fetchMembers.rejected, (state, action) => {
        state.isLoading = false; state.error = action.payload as string;
      })

      // ── fetchMemberById ───────────────────────────────────────────────────
      .addCase(fetchMemberById.pending, (state) => {
        state.isLoading = true; state.error = null;
      })
      .addCase(fetchMemberById.fulfilled, (state, action) => {
        state.isLoading = false; state.selectedMember = action.payload;
      })
      .addCase(fetchMemberById.rejected, (state, action) => {
        state.isLoading = false; state.error = action.payload as string;
      })

      // ── createMember ──────────────────────────────────────────────────────
      .addCase(createMember.pending, (state) => {
        state.isCreating = true; state.error = null; state.successMessage = null;
      })
      .addCase(createMember.fulfilled, (state, action) => {
        state.isCreating = false;
        state.members.push(action.payload);
        state.successMessage = 'Member created successfully!';
      })
      .addCase(createMember.rejected, (state, action) => {
        state.isCreating = false; state.error = action.payload as string;
      })

      // ── updateMember ──────────────────────────────────────────────────────
      .addCase(updateMember.pending, (state) => {
        state.isUpdating = true; state.error = null; state.successMessage = null;
      })
      .addCase(updateMember.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.members.findIndex(m => m._id === action.payload._id);
        if (index !== -1) state.members[index] = action.payload;
        if (state.selectedMember?._id === action.payload._id) {
          state.selectedMember = action.payload;
        }
        state.successMessage = 'Member updated successfully!';
      })
      .addCase(updateMember.rejected, (state, action) => {
        state.isUpdating = false; state.error = action.payload as string;
      })

      // ── deleteMember ──────────────────────────────────────────────────────
      .addCase(deleteMember.pending, (state) => {
        state.isDeleting = true; state.error = null; state.successMessage = null;
      })
      .addCase(deleteMember.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.members = state.members.filter(m => m._id !== action.payload);
        if (state.selectedMember?._id === action.payload) state.selectedMember = null;
        state.successMessage = 'Member deleted successfully!';
      })
      .addCase(deleteMember.rejected, (state, action) => {
        state.isDeleting = false; state.error = action.payload as string;
      })

      // ── fetchExpiringMembers ──────────────────────────────────────────────
      // // ✅ FIX: uses isLoadingExpiring so it doesn't block the main member table
      // .addCase(fetchExpiringMembers.pending, (state) => {
      //   state.isLoadingExpiring = true; state.error = null;
      // })
      // .addCase(fetchExpiringMembers.fulfilled, (state, action) => {
      //   state.isLoadingExpiring = false; state.expiringMembers = action.payload;
      // })
      // .addCase(fetchExpiringMembers.rejected, (state, action) => {
      //   state.isLoadingExpiring = false; state.error = action.payload as string;
      // })
// ✅ CORRECT in your slice
.addCase(fetchExpiringMembers.pending, (state) => {
  state.isLoadingExpiring = true;  // ← NOT isLoading
  state.error = null;
})
.addCase(fetchExpiringMembers.fulfilled, (state, action) => {
  state.isLoadingExpiring = false; // ← NOT isLoading
  state.expiringMembers = action.payload;
})
.addCase(fetchExpiringMembers.rejected, (state, action) => {
  state.isLoadingExpiring = false; // ← NOT isLoading
  state.error = action.payload as string;
})
      // ── fetchMembersByStatus ──────────────────────────────────────────────
      // ✅ FIX: was missing entirely — thunk dispatched but results were never stored
      .addCase(fetchMembersByStatus.pending, (state) => {
        state.isLoading = true; state.error = null;
      })
      .addCase(fetchMembersByStatus.fulfilled, (state, action) => {
        state.isLoading = false; state.members = action.payload;
      })
      .addCase(fetchMembersByStatus.rejected, (state, action) => {
        state.isLoading = false; state.error = action.payload as string;
      })

      // ── searchMembers ─────────────────────────────────────────────────────
      // ✅ FIX: was missing entirely — thunk dispatched but results were never stored
      .addCase(searchMembers.pending, (state) => {
        state.isLoading = true; state.error = null;
      })
      .addCase(searchMembers.fulfilled, (state, action) => {
        state.isLoading = false; state.members = action.payload;
      })
      .addCase(searchMembers.rejected, (state, action) => {
        state.isLoading = false; state.error = action.payload as string;
      });
  },
});

// ─── Exports ──────────────────────────────────────────────────────────────────

export const {
  clearSelectedMember,
  clearError,
  clearSuccessMessage,
  addMember,
  updateMemberInState,
  removeMember,
} = membersSlice.actions;

export default membersSlice.reducer;