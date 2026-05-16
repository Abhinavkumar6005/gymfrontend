import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '../../utils/apiservices';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Payment {
  _id: string;
  memberId: string | { _id: string; name: string; email: string; phone: string };
  amount: number;
  paymentForMonths: number;
  paymentMethod: 'cash' | 'online' | 'upi' | 'card' | 'netbanking';
  transactionId: string;
  razorpayOrderId?: string;
  razorpaySignature?: string;
  receiptNumber: string;
  status: 'completed' | 'pending' | 'failed' | 'deleted';
  deletedReason?: string;
  deletedAt?: string;
  createdAt: string;
}

// What createOrder returns from the backend
export interface RazorpayOrderResponse {
  orderId: string;       // Razorpay order ID → pass to Razorpay modal
  amount: number;        // in paise
  currency: string;
  receipt: string;
  keyId: string;         // RAZORPAY_KEY_ID → needed to init modal
  memberName: string;
  memberEmail: string;
  memberPhone: string;
}

// What the frontend sends to /verify after the modal succeeds
export interface VerifyPaymentPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  memberId: string;
  amount: number;
  paymentForMonths: number;
  paymentMethod?: string;
}

// What the frontend sends to /manual
export interface ManualPaymentPayload {
  memberId: string;
  amount: number;
  paymentForMonths: number;
  paymentMethod: 'cash' | 'upi' | 'card' | 'netbanking';
}

// What the frontend sends to /delete
export interface DeletePaymentPayload {
  paymentId: string;
  memberId: string;
  reason: string;
}

// ─── State ────────────────────────────────────────────────────────────────────

interface PaymentsState {
  payments: Payment[];                          // member payment history
  activeOrder: RazorpayOrderResponse | null;    // current Razorpay order pending modal
  isCreatingOrder: boolean;                     // Step 1 loading
  isVerifying: boolean;                         // Step 2 loading
  isProcessingManual: boolean;                  // manual/cash payment loading
  isDeleting: boolean;                          // delete payment loading
  isLoading: boolean;                           // fetching payment list
  error: string | null;
  successMessage: string | null;
  receiptNumber: string | null;                 // last receipt after successful payment
}

const initialState: PaymentsState = {
  payments: [],
  activeOrder: null,
  isCreatingOrder: false,
  isVerifying: false,
  isProcessingManual: false,
  isDeleting: false,
  isLoading: false,
  error: null,
  successMessage: null,
  receiptNumber: null,
};

// ─── Thunks ───────────────────────────────────────────────────────────────────

// STEP 1 — Create Razorpay order (before opening the modal)
export const createRazorpayOrder = createAsyncThunk<
  RazorpayOrderResponse,
  { memberId: string; amount: number; paymentForMonths: number; paymentMethod?: string },
  { rejectValue: string }
>(
  'payments/createOrder',
  async (payload, { rejectWithValue }) => {
    try {
      return await apiService.post('/api/payments/create-order', payload);
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create order');
    }
  }
);

// STEP 2 — Verify payment after Razorpay modal success
export const verifyRazorpayPayment = createAsyncThunk<
  { success: boolean; payment: Payment; receiptNumber: string },
  VerifyPaymentPayload,
  { rejectValue: string }
>(
  'payments/verifyPayment',
  async (payload, { rejectWithValue }) => {
    try {
      return await apiService.post('/api/payments/verify', payload);
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'Payment verification failed');
    }
  }
);

// Manual / Cash payment (no Razorpay modal needed)
export const processManualPayment = createAsyncThunk<
  { payment: Payment; receiptNumber: string },
  ManualPaymentPayload,
  { rejectValue: string }
>(
  'payments/manualPayment',
  async (payload, { rejectWithValue }) => {
    try {
      return await apiService.post('/api/payments/manual', payload);
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to process payment');
    }
  }
);

// Get all payments for a member
export const fetchMemberPayments = createAsyncThunk<
  Payment[],
  string,           // memberId
  { rejectValue: string }
>(
  'payments/fetchMemberPayments',
  async (memberId, { rejectWithValue }) => {
    try {
      return await apiService.get(`/api/payments/member/${memberId}`);
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch payments');
    }
  }
);

// Get receipt by receipt number
export const fetchReceipt = createAsyncThunk<
  Payment,
  string,           // receiptNumber
  { rejectValue: string }
>(
  'payments/fetchReceipt',
  async (receiptNumber, { rejectWithValue }) => {
    try {
      return await apiService.get(`/api/payments/receipt/${receiptNumber}`);
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'Receipt not found');
    }
  }
);

// Delete payment (created by mistake)
// export const deletePayment = createAsyncThunk<
//   { paymentId: string; payment: Payment; member: any },
//   DeletePaymentPayload,
//   { rejectValue: string }
// >(
//   'payments/deletePayment',
//   async ({ paymentId, memberId, reason }, { rejectWithValue }) => {
//     try {
//       const response = await apiService.delete(`/api/payments/${paymentId}`, {
//         data: { memberId, reason }
//       });
//       return { paymentId, payment: response.payment, member: response.member };
//     } catch (error: unknown) {
//       return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete payment');
//     }
//   }
// );

// Delete payment (created by mistake)
export const deletePayment = createAsyncThunk<
  { paymentId: string; payment: Payment; member: any },
  DeletePaymentPayload,
  { rejectValue: string }
>(
  'payments/deletePayment',
  async ({ paymentId, memberId, reason }, { rejectWithValue }) => {
    try {
      // The paymentId is already in the URL, so we don't need to send it in the body
      const response = await apiService.delete(`/api/payments/${paymentId}`, {
        memberId,
        reason
      });
      return { paymentId, payment: response.payment, member: response.member };
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete payment');
    }
  }
);
// ─── Slice ────────────────────────────────────────────────────────────────────

const paymentsSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
    clearSuccessMessage: (state) => { state.successMessage = null; },
    clearActiveOrder: (state) => { state.activeOrder = null; },  // call when modal is closed/cancelled
    clearReceiptNumber: (state) => { state.receiptNumber = null; },
  },
  extraReducers: (builder) => {
    builder

      // ── createRazorpayOrder (Step 1) ────────────────────────────────────
      .addCase(createRazorpayOrder.pending, (state) => {
        state.isCreatingOrder = true;
        state.error = null;
        state.activeOrder = null;
      })
      .addCase(createRazorpayOrder.fulfilled, (state, action: PayloadAction<RazorpayOrderResponse>) => {
        state.isCreatingOrder = false;
        state.activeOrder = action.payload;  // frontend reads this to open Razorpay modal
      })
      .addCase(createRazorpayOrder.rejected, (state, action) => {
        state.isCreatingOrder = false;
        state.error = action.payload ?? 'Failed to create Razorpay order';
      })

      // ── verifyRazorpayPayment (Step 2) ──────────────────────────────────
      .addCase(verifyRazorpayPayment.pending, (state) => {
        state.isVerifying = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(verifyRazorpayPayment.fulfilled, (state, action) => {
        state.isVerifying = false;
        state.activeOrder = null;                           // order is done
        state.payments.unshift(action.payload.payment);    // prepend to history
        state.receiptNumber = action.payload.receiptNumber;
        state.successMessage = `Payment successful! Receipt: ${action.payload.receiptNumber}`;
      })
      .addCase(verifyRazorpayPayment.rejected, (state, action) => {
        state.isVerifying = false;
        state.error = action.payload ?? 'Payment verification failed';
      })

      // ── processManualPayment ────────────────────────────────────────────
      .addCase(processManualPayment.pending, (state) => {
        state.isProcessingManual = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(processManualPayment.fulfilled, (state, action) => {
        state.isProcessingManual = false;
        state.payments.unshift(action.payload.payment);
        state.receiptNumber = action.payload.receiptNumber;
        state.successMessage = `Payment recorded! Receipt: ${action.payload.receiptNumber}`;
      })
      .addCase(processManualPayment.rejected, (state, action) => {
        state.isProcessingManual = false;
        state.error = action.payload ?? 'Failed to process payment';
      })

      // ── fetchMemberPayments ─────────────────────────────────────────────
      .addCase(fetchMemberPayments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMemberPayments.fulfilled, (state, action: PayloadAction<Payment[]>) => {
        state.isLoading = false;
        state.payments = action.payload;
      })
      .addCase(fetchMemberPayments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Failed to fetch payments';
      })

      // ── fetchReceipt ────────────────────────────────────────────────────
      .addCase(fetchReceipt.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchReceipt.fulfilled, (state) => {
        state.isLoading = false;
        // receipt data is returned from the thunk — consume via .unwrap() in the component
      })
      .addCase(fetchReceipt.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Receipt not found';
      })

      // ── deletePayment ────────────────────────────────────────────────────
      .addCase(deletePayment.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deletePayment.fulfilled, (state, action) => {
        console.log("----",action)
        state.isDeleting = false;
        // Update the payment in the payments array to show it as deleted
        const index = state.payments.findIndex(p => p._id === action.payload.paymentId);
        if (index !== -1) {
          state.payments[index] = {
            ...state.payments[index],
            status: 'deleted',
            // deletedReason: action.payload.deletedReason ,
            // deletedAt: action.payload.payment.deletedAt,
          };
        }
        // state.successMessage = `Payment of ₹${action.payload.payment.amount} has been deleted successfully`;
      })
      .addCase(deletePayment.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload ?? 'Failed to delete payment';
      });
  },
});

// ─── Actions ──────────────────────────────────────────────────────────────────

export const {
  clearError,
  clearSuccessMessage,
  clearActiveOrder,
  clearReceiptNumber,
} = paymentsSlice.actions;

export default paymentsSlice.reducer;