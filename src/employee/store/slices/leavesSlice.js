import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import apiClient from '../../../utils/apiClient';

// Fetch Employee Leaves
// Fetch Employee Leaves - Use admin API to get all leaves for this employee
export const fetchEmployeeLeaves = createAsyncThunk(
  "leaves/fetchEmployeeLeaves",
  async (_, { getState, rejectWithValue }) => {
    try {
      // Get the current employee ID from auth state
      const state = getState();
      const currentUser = state.auth?.user;
      const employeeId = currentUser?.employee?.id || currentUser?.id;
      
      console.log("Fetching leaves for employee ID:", employeeId);
      
      // Use admin endpoint to get leaves for this employee
      const response = await apiClient.get(`/admin/leaves?employee_id=${employeeId}`);
      console.log("Admin leaves response:", response.data);
      
      let leavesData = [];
      
      if (response.data && response.data.status === "success") {
        if (Array.isArray(response.data.data)) {
          leavesData = response.data.data;
        } else if (response.data.data && Array.isArray(response.data.data.data)) {
          leavesData = response.data.data.data;
        } else {
          leavesData = [];
        }
        
        // Transform the data to ensure consistent format
        const transformedLeaves = leavesData.map(leave => ({
          id: leave.id,
          leave_type: leave.leave_type?.name || leave.leave_type || leave.type,
          leave_type_id: leave.leave_type_id || leave.leave_type?.id,
          start_date: leave.start_date || leave.from_date,
          end_date: leave.end_date || leave.to_date,
          duration_days: leave.duration_days || leave.days,
          reason: leave.reason,
          status: leave.status,
          claim_salary: leave.claim_salary,
          document: leave.document,
          created_at: leave.created_at
        }));
        
        console.log("Transformed leaves:", transformedLeaves);
        return transformedLeaves;
      } else {
        return rejectWithValue(response.data?.message || "Failed to fetch leaves");
      }
    } catch (error) {
      console.error("Fetch leaves error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch leaves"
      );
    }
  }
);
// Fetch Leave Balance - Use the employee API endpoint (correct one)
export const fetchLeaveBalance = createAsyncThunk(
  "leaves/fetchLeaveBalance",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const currentUser = state.auth?.user;
      const employeeId = currentUser?.employee?.id || currentUser?.id;
      
      console.log("Fetching leave balance for employee ID:", employeeId);
      
      // Use the employee API endpoint instead of admin API
      const response = await apiClient.get("/employee/leave-balance");
      console.log("Employee leave balance response:", response.data);
      
      if (response.data && response.data.status === "success") {
        const leaveTypesData = response.data.data.leave_types || [];
        
        const leaveBalances = {};
        
        // Process each leave type from the employee API response
        leaveTypesData.forEach(leaveType => {
          leaveBalances[leaveType.name] = {
            allocated: leaveType.allocated || 0,
            taken: leaveType.taken || 0,
            pending: leaveType.pending || 0,
            remaining: leaveType.balance || 0,
            id: leaveType.id,
            status: leaveType.status,
            leave_type_id: leaveType.id,
            leave_type_name: leaveType.name
          };
        });
        
        // Add total balance
        leaveBalances.total = {
          allocated: response.data.data.total_allocated || 0,
          taken: response.data.data.leaves_taken || 0,
          pending: 0,
          remaining: response.data.data.remaining_balance || 0
        };
        
        console.log("Processed leave balances from employee API:", leaveBalances);
        return leaveBalances;
      } else {
        return rejectWithValue(response.data?.message || "Failed to fetch leave balance");
      }
    } catch (error) {
      console.error("Fetch leave balance error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch leave balance"
      );
    }
  }
);

// Store New Leave Request - Updated to use employee API balance
export const addLeaveRequest = createAsyncThunk(
  "leaves/storeLeaveRequest",
  async (formData, { rejectWithValue, dispatch, getState }) => {
    try {
      // Get the current state
      const state = getState();
      const leaveBalances = state.EmpLeaves?.leaveBalances || {};
      
      // Find the leave type ID and balance from the employee API data
      let leaveTypeId = null;
      let leaveTypeBalance = null;
      
      for (const [name, balance] of Object.entries(leaveBalances)) {
        if (name === formData.leaveType && balance.id) {
          leaveTypeId = balance.id;
          leaveTypeBalance = balance;
          break;
        }
      }
      
      // If not found in balances, use mapping as fallback
      const leaveTypeMapping = {
        'Sick Leave': 1,
        'Annual Leave': 2,
        'Casual Leave': 3,
        'Unpaid Leave': 4,
        'Maternity Leave': 5,
        'Paternity Leave': 6,
        'Emergency Leave': 7,
        'Study / Exam Leave': 8,
        'Bereavement Leave': 9
      };
      
      if (!leaveTypeId) {
        leaveTypeId = leaveTypeMapping[formData.leaveType];
      }
      
      // Get current year
      const currentYear = new Date().getFullYear();
      
      // Calculate total days
      const from = new Date(formData.fromDate);
      const to = new Date(formData.toDate);
      const totalDays = Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1;
      
      // Frontend validation using the employee API balance
      if (leaveTypeBalance && totalDays > leaveTypeBalance.remaining && leaveTypeBalance.remaining >= 0 && formData.leaveType !== 'Unpaid Leave') {
        return rejectWithValue(`Insufficient balance. You have only ${leaveTypeBalance.remaining} days remaining for ${formData.leaveType}`);
      }
      
      // Use FormData for file upload
      const formPayload = new FormData();
      formPayload.append('leave_type_id', leaveTypeId);
      formPayload.append('start_date', formData.fromDate);
      formPayload.append('end_date', formData.toDate);
      formPayload.append('reason', formData.reason);
      formPayload.append('claim_salary', formData.claimSalary === "Yes" ? 1 : 0);
      formPayload.append('year', currentYear);
      
      if (formData.document) {
        formPayload.append('document', formData.document);
      }
      
      console.log("Sending leave request with payload:", {
        leave_type_id: leaveTypeId,
        start_date: formData.fromDate,
        end_date: formData.toDate,
        reason: formData.reason,
        claim_salary: formData.claimSalary === "Yes" ? 1 : 0,
        year: currentYear
      });
      console.log("Leave type balance from frontend (employee API):", leaveTypeBalance);
      
      const response = await apiClient.post("/employee/leaves", formPayload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log("Store leave response:", response.data);
      
      if (response.data && response.data.status === "success") {
        // Refresh balance after successful submission
        await dispatch(fetchLeaveBalance());
        await dispatch(fetchEmployeeLeaves());
        return response.data.data;
      } else {
        return rejectWithValue(response.data?.message || "Failed to submit leave request");
      }
    } catch (error) {
      console.error("Store leave error:", error);
      console.error("Error response:", error.response?.data);
      
      // Extract error message from response
      let errorMessage = "Failed to submit leave request";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        errorMessage = Object.values(errors).flat()[0];
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

// Calculate leave balances (now uses the API data)
export const calculateLeaveBalances = createAsyncThunk(
  "leaves/calculateLeaveBalances",
  async (_, { getState }) => {
    const state = getState();
    return state.leaves.leaveBalances;
  }
);

const initialState = {
  leaves: [],
  leaveBalances: {
    total: {
      allocated: 0,
      taken: 0,
      pending: 0,
      remaining: 0
    }
  },
  filter: {
    status: 'all',
    search: '',
  },
  pagination: {
    currentPage: 1,
    perPage: 10,
  },
  loading: false,
  error: null,
  submitting: false,
};

const leavesSlice = createSlice({
  name: 'leaves',
  initialState,
  reducers: {
    setLeaveFilter: (state, action) => {
      state.filter.status = action.payload.status;
      state.filter.search = action.payload.search || '';
      state.pagination.currentPage = 1;
    },
    setLeavePagination: (state, action) => {
      state.pagination.currentPage = action.payload.currentPage;
      state.pagination.perPage = action.payload.perPage;
    },
    clearLeaveError: (state) => {
      state.error = null;
    },
    updateLeaveBalance: (state, action) => {
      state.leaveBalances = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Employee Leaves
      .addCase(fetchEmployeeLeaves.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployeeLeaves.fulfilled, (state, action) => {
        state.loading = false;
        state.leaves = action.payload;
        state.error = null;
      })
      .addCase(fetchEmployeeLeaves.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Leave Balance
      .addCase(fetchLeaveBalance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeaveBalance.fulfilled, (state, action) => {
        state.loading = false;
        state.leaveBalances = action.payload;
        state.error = null;
      })
      .addCase(fetchLeaveBalance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Store Leave Request
      .addCase(addLeaveRequest.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(addLeaveRequest.fulfilled, (state, action) => {
        state.submitting = false;
        state.leaves.unshift(action.payload);
        state.error = null;
      })
      .addCase(addLeaveRequest.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })
      
      // Calculate Leave Balances
      .addCase(calculateLeaveBalances.pending, (state) => {
        state.loading = true;
      })
      .addCase(calculateLeaveBalances.fulfilled, (state) => {
        state.loading = false;
        // Keep existing balances, don't overwrite
      })
      .addCase(calculateLeaveBalances.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setLeaveFilter, setLeavePagination, clearLeaveError, updateLeaveBalance } = leavesSlice.actions;
export default leavesSlice.reducer;