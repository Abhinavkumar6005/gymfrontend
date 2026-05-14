import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '../../utils/apiservices';

export interface Plan {
  _id: string;
  name: string;
  durationMonths: number;
  price: number;
  description: string;
  features: string[];
  isActive: boolean;
  createdAt: string;
}

interface PlansState {
  plans: Plan[];
  selectedPlan: Plan | null;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: PlansState = {
  plans: [],
  selectedPlan: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
  successMessage: null,
};

// Async Thunks for CRUD operations

// Fetch all plans - PUBLIC ROUTE (no auth needed)
export const fetchPlans = createAsyncThunk(
  'plans/fetchPlans',
  async (_, { rejectWithValue }) => {
    try {
      // Use getPublic instead of get for public endpoint
      // Add trailing slash to match backend route
const response = await apiService.getPublic('/api/plans/');
      return response;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch plans';
      return rejectWithValue(errorMessage);
    }
  }
);

// Fetch single plan by ID - PUBLIC ROUTE (no auth needed for viewing)
export const fetchPlanById = createAsyncThunk(
  'plans/fetchPlanById',
  async (id: string, { rejectWithValue }) => {
    try {
      // Use getPublic for public viewing
      const response = await apiService.getPublic(`/api/plans/${id}/`);
      return response;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch plan';
      return rejectWithValue(errorMessage);
    }
  }
);

// Create new plan - ADMIN ONLY (requires auth)
export const createPlan = createAsyncThunk(
  'plans/createPlan',
  async (planData: Omit<Plan, '_id' | 'createdAt'>, { rejectWithValue }) => {
    try {
      // Use regular post (requires authentication)
      const response = await apiService.post('/api/plans/', planData);
      return response;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create plan';
      return rejectWithValue(errorMessage);
    }
  }
);

// Update plan - ADMIN ONLY (requires auth)
export const updatePlan = createAsyncThunk(
  'plans/updatePlan',
  async ({ id, planData }: { id: string; planData: Partial<Plan> }, { rejectWithValue }) => {
    try {
      // Use regular put (requires authentication)
      const response = await apiService.put(`/api/plans/${id}/`, planData);
      return response;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update plan';
      return rejectWithValue(errorMessage);
    }
  }
);

// Delete plan - ADMIN ONLY (requires auth)
export const deletePlan = createAsyncThunk(
  'plans/deletePlan',
  async (id: string, { rejectWithValue }) => {
    try {
      // Use regular delete (requires authentication)
      await apiService.delete(`/api/plans/${id}/`);
      return id;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete plan';
      return rejectWithValue(errorMessage);
    }
  }
);

const plansSlice = createSlice({
  name: 'plans',
  initialState,
  reducers: {
    clearSelectedPlan: (state) => {
      state.selectedPlan = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    setPlans: (state, action: PayloadAction<Plan[]>) => {
      state.plans = action.payload;
    },
    addPlan: (state, action: PayloadAction<Plan>) => {
      state.plans.push(action.payload);
    },
    updatePlanInState: (state, action: PayloadAction<Plan>) => {
      const index = state.plans.findIndex(plan => plan._id === action.payload._id);
      if (index !== -1) {
        state.plans[index] = action.payload;
      }
    },
    removePlan: (state, action: PayloadAction<string>) => {
      state.plans = state.plans.filter(plan => plan._id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all plans
      .addCase(fetchPlans.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPlans.fulfilled, (state, action) => {
        state.isLoading = false;
        state.plans = action.payload;
        console.log('✅ Plans loaded successfully:', action.payload.length);
      })
      .addCase(fetchPlans.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        console.error('❌ Failed to load plans:', state.error);
      })
      
      // Fetch single plan
      .addCase(fetchPlanById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPlanById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedPlan = action.payload;
      })
      .addCase(fetchPlanById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Create plan
      .addCase(createPlan.pending, (state) => {
        state.isCreating = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createPlan.fulfilled, (state, action) => {
        state.isCreating = false;
        state.plans.push(action.payload);
        state.successMessage = 'Plan created successfully!';
      })
      .addCase(createPlan.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      })
      
      // Update plan
      .addCase(updatePlan.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updatePlan.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.plans.findIndex(plan => plan._id === action.payload._id);
        if (index !== -1) {
          state.plans[index] = action.payload;
        }
        if (state.selectedPlan?._id === action.payload._id) {
          state.selectedPlan = action.payload;
        }
        state.successMessage = 'Plan updated successfully!';
      })
      .addCase(updatePlan.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      })
      
      // Delete plan
      .addCase(deletePlan.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(deletePlan.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.plans = state.plans.filter(plan => plan._id !== action.payload);
        if (state.selectedPlan?._id === action.payload) {
          state.selectedPlan = null;
        }
        state.successMessage = 'Plan deleted successfully!';
      })
      .addCase(deletePlan.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  clearSelectedPlan, 
  clearError, 
  clearSuccessMessage,
  setPlans,
  addPlan,
  updatePlanInState,
  removePlan
} = plansSlice.actions;

export default plansSlice.reducer;