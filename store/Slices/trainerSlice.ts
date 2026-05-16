import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '../../utils/apiservices';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Trainer {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  specialization: string;
  certification: string;
  experience: number;
  photo?: string;
  bio?: string;
  achievements?: string[];
  availableDays?: string[];
  availableTime?: {
    start: string;
    end: string;
  };
  rating: number;
  totalClients: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TrainerFormData {
  fullName: string;
  email: string;
  phone: string;
  specialization: string;
  certification: string;
  experience: number;
  photo?: string;
  bio?: string;
  achievements?: string[];
  availableDays?: string[];
  availableTime?: {
    start: string;
    end: string;
  };
}

interface TrainerState {
  trainers: Trainer[];
  selectedTrainer: Trainer | null;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
  successMessage: string | null;
  totalCount: number;
}

const initialState: TrainerState = {
  trainers: [],
  selectedTrainer: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
  successMessage: null,
  totalCount: 0,
};

// ─── Async Thunks ─────────────────────────────────────────────────────────────

// Get all trainers
export const fetchTrainers = createAsyncThunk(
  'trainers/fetchTrainers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.get('/api/trainers');
      return response;
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch trainers');
    }
  }
);

// Get trainer by ID
export const fetchTrainerById = createAsyncThunk(
  'trainers/fetchTrainerById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await apiService.get(`/api/trainers/${id}`);
      return response;
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch trainer');
    }
  }
);

// Create new trainer with image
export const createTrainer = createAsyncThunk(
  'trainers/createTrainer',
  async (trainerData: FormData, { rejectWithValue }) => {
    try {
      const response = await apiService.postFormData('/api/trainers/', trainerData);
      return response;
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create trainer');
    }
  }
);

// Update trainer with image
export const updateTrainer = createAsyncThunk(
  'trainers/updateTrainer',
  async ({ id, trainerData }: { id: string; trainerData: FormData }, { rejectWithValue }) => {
    try {
      const response = await apiService.putFormData(`/api/trainers/${id}`, trainerData);
      return response;
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update trainer');
    }
  }
);

// Delete trainer (soft delete)
export const deleteTrainer = createAsyncThunk(
  'trainers/deleteTrainer',
  async (id: string, { rejectWithValue }) => {
    try {
      await apiService.delete(`/api/trainers/${id}`);
      return id;
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete trainer');
    }
  }
);

// Get trainers by specialization
export const fetchTrainersBySpecialization = createAsyncThunk(
  'trainers/fetchTrainersBySpecialization',
  async (specialization: string, { rejectWithValue }) => {
    try {
      const response = await apiService.get(`/api/trainers/specialization/${specialization}`);
      return response;
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch trainers by specialization');
    }
  }
);

// Update trainer rating
export const updateTrainerRating = createAsyncThunk(
  'trainers/updateTrainerRating',
  async ({ id, rating }: { id: string; rating: number }, { rejectWithValue }) => {
    try {
      const response = await apiService.patch(`/api/trainers/${id}/rating`, { rating });
      return response;
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update trainer rating');
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const trainerSlice = createSlice({
  name: 'trainers',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    clearSelectedTrainer: (state) => {
      state.selectedTrainer = null;
    },
    addTrainer: (state, action: PayloadAction<Trainer>) => {
      state.trainers.unshift(action.payload);
      state.totalCount += 1;
    },
    updateTrainerInState: (state, action: PayloadAction<Trainer>) => {
      const index = state.trainers.findIndex(t => t._id === action.payload._id);
      if (index !== -1) {
        state.trainers[index] = action.payload;
      }
      if (state.selectedTrainer?._id === action.payload._id) {
        state.selectedTrainer = action.payload;
      }
    },
    removeTrainer: (state, action: PayloadAction<string>) => {
      state.trainers = state.trainers.filter(t => t._id !== action.payload);
      if (state.selectedTrainer?._id === action.payload) {
        state.selectedTrainer = null;
      }
      state.totalCount -= 1;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── fetchTrainers ──────────────────────────────────────────────────────
      .addCase(fetchTrainers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTrainers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.trainers = action.payload.data || action.payload;
        state.totalCount = action.payload.count || (action.payload.data?.length || 0);
      })
      .addCase(fetchTrainers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // ── fetchTrainerById ───────────────────────────────────────────────────
      .addCase(fetchTrainerById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTrainerById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedTrainer = action.payload.data || action.payload;
      })
      .addCase(fetchTrainerById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // ── createTrainer ──────────────────────────────────────────────────────
      .addCase(createTrainer.pending, (state) => {
        state.isCreating = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createTrainer.fulfilled, (state, action) => {
        state.isCreating = false;
        const newTrainer = action.payload.data || action.payload;
        state.trainers.unshift(newTrainer);
        state.totalCount += 1;
        state.successMessage = 'Trainer created successfully!';
      })
      .addCase(createTrainer.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      })

      // ── updateTrainer ──────────────────────────────────────────────────────
      .addCase(updateTrainer.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateTrainer.fulfilled, (state, action) => {
        state.isUpdating = false;
        const updatedTrainer = action.payload.data || action.payload;
        const index = state.trainers.findIndex(t => t._id === updatedTrainer._id);
        if (index !== -1) {
          state.trainers[index] = updatedTrainer;
        }
        if (state.selectedTrainer?._id === updatedTrainer._id) {
          state.selectedTrainer = updatedTrainer;
        }
        state.successMessage = 'Trainer updated successfully!';
      })
      .addCase(updateTrainer.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      })

      // ── deleteTrainer ──────────────────────────────────────────────────────
      .addCase(deleteTrainer.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(deleteTrainer.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.trainers = state.trainers.filter(t => t._id !== action.payload);
        if (state.selectedTrainer?._id === action.payload) {
          state.selectedTrainer = null;
        }
        state.totalCount -= 1;
        state.successMessage = 'Trainer deleted successfully!';
      })
      .addCase(deleteTrainer.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload as string;
      })

      // ── fetchTrainersBySpecialization ──────────────────────────────────────
      .addCase(fetchTrainersBySpecialization.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTrainersBySpecialization.fulfilled, (state, action) => {
        state.isLoading = false;
        state.trainers = action.payload.data || action.payload;
        state.totalCount = action.payload.count || (action.payload.data?.length || 0);
      })
      .addCase(fetchTrainersBySpecialization.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // ── updateTrainerRating ────────────────────────────────────────────────
      .addCase(updateTrainerRating.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateTrainerRating.fulfilled, (state, action) => {
        state.isUpdating = false;
        const updatedTrainer = action.payload.data || action.payload;
        const index = state.trainers.findIndex(t => t._id === updatedTrainer._id);
        if (index !== -1) {
          state.trainers[index] = updatedTrainer;
        }
        if (state.selectedTrainer?._id === updatedTrainer._id) {
          state.selectedTrainer = updatedTrainer;
        }
      })
      .addCase(updateTrainerRating.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });
  },
});

// ─── Exports ──────────────────────────────────────────────────────────────────

export const {
  clearError,
  clearSuccessMessage,
  clearSelectedTrainer,
  addTrainer,
  updateTrainerInState,
  removeTrainer,
} = trainerSlice.actions;

export default trainerSlice.reducer;