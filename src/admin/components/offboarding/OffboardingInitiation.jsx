import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Search,
  X,
  ArrowRight,
  Save,
  ChevronDown,
  TrendingUp,
  Clock,
  CheckCircle,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import DateInput from "../common/DateInput";
import { showToast } from "../common/Toast";
import OffboardingHeader from "./OffboardingHeader";
import { fetchEmployees } from "../../store/slices/employeeSlice";
import { fetchDepartments } from "../../store/slices/departmentSlice";
import { fetchDesignations } from "../../store/slices/designationSlice";
import {
  initiateOffboarding,
  saveOffboardingDraft,
  fetchOffboardingProgress,
} from "../../store/slices/offboardingSlice";

// ----------------------------------------------------
// STATIC REPORTING MANAGERS DATA
// ----------------------------------------------------
const STATIC_MANAGERS = [
  {
    id: "mgr_001",
    name: "Sara Al Hashmi",
    designation: "Operations Director",
    department: "Operations",
  },
  {
    id: "mgr_002",
    name: "Elena Rostova",
    designation: "HR Manager",
    department: "Human Resources",
  },
  {
    id: "mgr_003",
    name: "Marcus Aurelius",
    designation: "IT Director",
    department: "IT Department",
  },
  {
    id: "mgr_004",
    name: "John Doe",
    designation: "Finance Manager",
    department: "Finance",
  },
  {
    id: "mgr_005",
    name: "Ahmed Al Qasimi",
    designation: "Sales Director",
    department: "Sales",
  },
  {
    id: "mgr_006",
    name: "Fatima Al Zaabi",
    designation: "Marketing Manager",
    department: "Marketing",
  },
  {
    id: "mgr_007",
    name: "David Chen",
    designation: "Product Manager",
    department: "Product",
  },
];

// ----------------------------------------------------
// ZOD RESOLVER SCHEMA
// ----------------------------------------------------
const offboardingSchema = z.object({
  employeeId: z.string().min(1, "Employee ID is required"),
  backendEmployeeId: z.string().optional(),
  employeeName: z.string().min(1, "Employee name is required"),
  department: z.string().min(1, "Department is required"),
  designation: z.string().min(1, "Designation is required"),
  reportingManager: z.string().min(1, "Reporting manager is required"),
  reportingManagerId: z.string().optional(),
  noticeStartDate: z.string().min(1, "Notice start date is required"),
  noticePeriodDays: z.coerce.number().min(0, "Notice period must be 0 or more"),
  lastWorkingDay: z.string().min(1, "Last working day is required"),
  separationType: z.string().min(1, "Separation type is required"),
  visaSponsorship: z.string().min(1, "Visa sponsorship is required"),
  nationality: z.string().min(1, "Nationality is required"),
  email: z.string().email("Invalid email").optional(),
  reasonForLeaving: z
    .string()
    .min(5, "Please enter a reason for leaving (min 5 chars)"),
});

const OffboardingInitiation = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const dropdownRef = useRef(null);
  const managerDropdownRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showManagerDropdown, setShowManagerDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [managerSearchQuery, setManagerSearchQuery] = useState("");
  const [showProgress, setShowProgress] = useState(false);

  // Redux state
  const { employees, loading: employeesLoading } = useSelector(
    (state) => state.employees,
  );
  const { departments } = useSelector((state) => state.departments);
  const { designations } = useSelector((state) => state.designations);
  const {
    loading: offboardingLoading,
    error: offboardingError,
    currentProgress,
  } = useSelector((state) => state.offboarding);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(offboardingSchema),
    defaultValues: {
      employeeId: "",
      backendEmployeeId: "",
      employeeName: "",
      department: "",
      designation: "",
      reportingManager: "",
      reportingManagerId: "",
      noticeStartDate: "",
      noticePeriodDays: 30,
      lastWorkingDay: "",
      separationType: "Resignation",
      visaSponsorship: "",
      nationality: "",
      email: "",
      reasonForLeaving: "",
    },
  });

  // Fetch employees, departments, designations on component mount
  useEffect(() => {
    dispatch(fetchEmployees());
    dispatch(fetchDepartments());
    dispatch(fetchDesignations());
  }, [dispatch]);

  // Handle offboarding error
  useEffect(() => {
    if (offboardingError) {
      showToast(offboardingError, "error");
    }
  }, [offboardingError]);

  // Fetch progress when available
  useEffect(() => {
    if (currentProgress && currentProgress.offboarding_id && showProgress) {
      const timer = setTimeout(() => {
        navigate(
          `/admin/employees/visa-cancellation?id=${currentProgress.offboarding_id}`,
        );
        setShowProgress(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentProgress, showProgress, navigate]);

  useEffect(() => {
    let fallbackTimer;
    if (showProgress && !currentProgress) {
      fallbackTimer = setTimeout(() => {
        const offboardingId = localStorage.getItem("offboarding_id");
        if (offboardingId) {
          navigate(`/admin/employees/visa-cancellation?id=${offboardingId}`);
          setShowProgress(false);
        }
      }, 3000);
    }
    return () => {
      if (fallbackTimer) clearTimeout(fallbackTimer);
    };
  }, [showProgress, currentProgress, navigate]);

  // Handle click outside to close employee dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (
        managerDropdownRef.current &&
        !managerDropdownRef.current.contains(event.target)
      ) {
        setShowManagerDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Watch notice start date and notice period days to auto-calculate last working day
  const watchedNoticeStartDate = watch("noticeStartDate");
  const watchedNoticePeriodDays = watch("noticePeriodDays");

  // Calculate last working day automatically when notice start date or notice period changes
  // Replace the existing useEffect with this corrected version
  useEffect(() => {
    if (
      watchedNoticeStartDate &&
      watchedNoticePeriodDays !== undefined &&
      watchedNoticePeriodDays !== null &&
      watchedNoticePeriodDays >= 0
    ) {
      // Parse the date string (assuming YYYY-MM-DD format)
      const [year, month, day] = watchedNoticeStartDate.split("-").map(Number);

      // Create a new date object (month is 0-indexed)
      const startDate = new Date(year, month - 1, day);

      // Validate the date
      if (isNaN(startDate.getTime())) {
        console.error("Invalid date:", watchedNoticeStartDate);
        return;
      }

      // Create a new date object for the end date
      // IMPORTANT: Create a new Date object, don't mutate the original
      const endDate = new Date(startDate);

      // Add the days - this should work correctly now
      endDate.setDate(startDate.getDate() + Number(watchedNoticePeriodDays));

      // Format the result
      const endYear = endDate.getFullYear();
      const endMonth = String(endDate.getMonth() + 1).padStart(2, "0");
      const endDay = String(endDate.getDate()).padStart(2, "0");
      const formattedEndDate = `${endYear}-${endMonth}-${endDay}`;

      setValue("lastWorkingDay", formattedEndDate, { shouldValidate: true });
    }
  }, [watchedNoticeStartDate, watchedNoticePeriodDays, setValue]);

  // Filter employees based on search query (using real data from API)
  const filteredEmployees = (employees || []).filter((emp) => {
    const employeeId = emp.raw?.employee_id ? String(emp.raw.employee_id) : "";
    const employeeName = emp.name ? String(emp.name).toLowerCase() : "";
    const employeeEmail = emp.raw?.user?.email
      ? String(emp.raw.user.email).toLowerCase()
      : "";
    const searchLower = searchQuery.toLowerCase();

    return (
      employeeName.includes(searchLower) ||
      employeeId.includes(searchLower) ||
      employeeEmail.includes(searchLower)
    );
  });

  // Filter managers based on search query
  const filteredManagers = STATIC_MANAGERS.filter((manager) => {
    const managerName = manager.name.toLowerCase();
    const managerDesignation = manager.designation.toLowerCase();
    const managerDepartment = manager.department.toLowerCase();
    const searchLower = managerSearchQuery.toLowerCase();

    return (
      managerName.includes(searchLower) ||
      managerDesignation.includes(searchLower) ||
      managerDepartment.includes(searchLower)
    );
  });

  // Handle employee selection and auto-populate all form fields
  const handleSelectEmployee = (emp) => {
    setSearchQuery(emp.name);
    setShowDropdown(false);

    const rawEmployee = emp.raw || {};
    const userData = rawEmployee.user || {};

    // Find department name from department ID
    const departmentObj = departments?.find(
      (dept) => dept.id === userData.department_id,
    );
    const departmentName =
      departmentObj?.name || userData.department?.name || "";

    // Find designation name from designation ID
    const designationObj = designations?.find(
      (des) => des.id === userData.designation_id,
    );
    const designationName =
      designationObj?.name || userData.designation?.name || "";

    // Set form fields with real data from API
    setValue("employeeId", rawEmployee.employee_id || String(emp.id), {
      shouldValidate: true,
    });
    setValue("employeeName", emp.name, { shouldValidate: true });
    setValue("department", departmentName, { shouldValidate: true });
    setValue("designation", designationName, { shouldValidate: true });
    setValue("nationality", rawEmployee.nationality || "", {
      shouldValidate: true,
    });
    setValue("email", userData.email || "", { shouldValidate: true });

    // Store the backend ID for API submission
    setValue("backendEmployeeId", String(emp.id), { shouldValidate: true });

    // Set default visa sponsorship based on employee data or leave empty
    const visaStatus =
      rawEmployee.visa_status || rawEmployee.visa_sponsorship || "";
    setValue("visaSponsorship", visaStatus, { shouldValidate: true });

    showToast(`Employee ${emp.name} loaded successfully!`, "success");
  };

  // Handle manager selection
  const handleSelectManager = (manager) => {
    setValue("reportingManager", manager.name, { shouldValidate: true });
    setValue("reportingManagerId", manager.id, { shouldValidate: true });
    setManagerSearchQuery(manager.name);
    setShowManagerDropdown(false);
    showToast(`Reporting manager ${manager.name} selected`, "success");
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      // Prepare payload for offboarding API
      const payload = {
        employee_id: data.backendEmployeeId,
        employee_name: data.employeeName,
        department: data.department,
        designation: data.designation,
        reporting_manager: data.reportingManager,
        reporting_manager_id: data.reportingManagerId,
        last_working_day: data.lastWorkingDay,
        separation_type: data.separationType.toLowerCase(),
        notice_period_days: data.noticePeriodDays,
        notice_start_date: data.noticeStartDate,
        visa_sponsorship: data.visaSponsorship,
        nationality: data.nationality,
        email: data.email,
        reason_for_leaving: data.reasonForLeaving,
        status: "initiated",
        current_step: "initiation",
      };

      // Dispatch the initiateOffboarding action
      const result = await dispatch(initiateOffboarding(payload)).unwrap();

      console.log("Offboarding initiated successfully:", result);

      // Save the offboarding ID to localStorage for later steps
      if (result && result.id) {
        localStorage.setItem("offboarding_id", result.id);
        localStorage.setItem("offboarding_employee_id", data.backendEmployeeId);
        localStorage.setItem("offboarding_employee_name", data.employeeName);

        // Fetch and show progress
        try {
          await dispatch(fetchOffboardingProgress(result.id)).unwrap();
        } catch (progressError) {
          console.log("Progress fetch failed:", progressError);
        }
        setShowProgress(true);
      }

      showToast(
        <div className="text-sm">
          <span className="font-bold block text-green-800 dark:text-green-300">
            Offboarding Initiated
          </span>
          <span>
            Successfully triggered offboarding workflows for {data.employeeName}
          </span>
        </div>,
        "success",
      );

      // Clear draft from localStorage if exists
      localStorage.removeItem("offboarding_draft");

      // Reset form and search
      reset();
      setSearchQuery("");
      setManagerSearchQuery("");
    } catch (error) {
      console.error("Offboarding initiation error:", error);
      showToast(
        error || "Failed to initiate offboarding. Please try again.",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    const formData = watch();

    try {
      localStorage.setItem("offboarding_draft", JSON.stringify(formData));
      showToast("Offboarding details saved as draft.", "success");
    } catch (error) {
      console.error("Save draft error:", error);
      showToast("Failed to save draft. Data saved locally.", "warning");
    }
  };

  // Load draft from localStorage on mount
  useEffect(() => {
    const draft = localStorage.getItem("offboarding_draft");
    if (draft) {
      const parsedDraft = JSON.parse(draft);
      Object.keys(parsedDraft).forEach((key) => {
        if (parsedDraft[key]) {
          setValue(key, parsedDraft[key]);
        }
      });
      if (parsedDraft.reportingManager) {
        setManagerSearchQuery(parsedDraft.reportingManager);
      }
    }
  }, [setValue]);

  // Progress Modal Component
  const ProgressModal = () => {
    if (!showProgress) return null;

    const hasProgress = currentProgress && currentProgress.offboarding_id;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-xl">
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle size={32} className="text-green-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Offboarding Initiated!
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Redirecting to next step...
              </p>
            </div>

            {hasProgress ? (
              <>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Overall Progress
                    </span>
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      {currentProgress.progress_percentage || 0}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 transition-all duration-500"
                      style={{
                        width: `${currentProgress.progress_percentage || 0}%`,
                      }}
                    />
                  </div>

                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 pt-2">
                    <span>
                      Completed Steps: {currentProgress.completed_steps || 0}
                    </span>
                    <span>Total Steps: {currentProgress.total_steps || 7}</span>
                  </div>
                </div>

                {currentProgress.steps && currentProgress.steps.length > 0 && (
                  <div className="mt-6 space-y-2">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Steps Status
                    </p>
                    <div className="space-y-2">
                      {currentProgress.steps.map((step, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between"
                        >
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {step.name}
                          </span>
                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                              step.status === "completed"
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : step.status === "in_progress"
                                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                  : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                            }`}
                          >
                            {step.status === "completed"
                              ? "Completed"
                              : step.status === "in_progress"
                                ? "In Progress"
                                : "Pending"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                  Loading offboarding progress...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50/30 dark:bg-gray-900/40 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* SaaS Offboarding Header */}
        <OffboardingHeader currentStep={1} />

        {/* Form Container Card */}
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/80 rounded-2xl shadow-soft p-6 sm:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Header Title with Draft Badge */}
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-4 mb-6">
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                Initiate offboarding
              </h1>
              <span className="px-3 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/60 rounded text-xs font-bold uppercase tracking-wider">
                Draft
              </span>
            </div>

            {/* Form Fields Grid - Two columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
              {/* Employee Name (Searchable Select Input) */}
              <div className="space-y-1.5 relative" ref={dropdownRef}>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Employee name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search or select employee..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border rounded-lg text-sm text-gray-800 dark:text-gray-200 transition-all focus:outline-none focus:ring-2 ${
                      errors.employeeName
                        ? "border-red-500 focus:ring-red-500/20"
                        : "border-gray-200 dark:border-gray-700 focus:border-green-500 focus:ring-green-500/20"
                    }`}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        setValue("employeeName", "");
                        setValue("employeeId", "");
                        setValue("backendEmployeeId", "");
                        setValue("department", "");
                        setValue("designation", "");
                        setValue("nationality", "");
                        setValue("visaSponsorship", "");
                        setValue("email", "");
                      }}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>

                {/* Dropdown suggestions list */}
                {showDropdown && (
                  <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
                    {employeesLoading ? (
                      <div className="p-3 text-center text-xs text-gray-400">
                        Loading employees...
                      </div>
                    ) : filteredEmployees.length > 0 ? (
                      filteredEmployees.map((emp) => (
                        <button
                          key={emp.id}
                          type="button"
                          onClick={() => handleSelectEmployee(emp)}
                          className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                {emp.name}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {emp.designation} • {emp.department}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="p-3 text-center text-xs text-gray-400">
                        No employees found matching "{searchQuery}"
                      </div>
                    )}
                  </div>
                )}
                {errors.employeeName && (
                  <p className="text-xxs font-bold text-red-500 mt-1">
                    {errors.employeeName.message}
                  </p>
                )}
              </div>
              {/* Employee ID */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Employee ID
                </label>
                <input type="hidden" {...register("backendEmployeeId")} />
                <input
                  type="text"
                  placeholder="Auto-populated"
                  {...register("employeeId")}
                  className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border rounded-lg text-sm text-gray-800 dark:text-gray-200 font-semibold focus:outline-none ${
                    errors.employeeId
                      ? "border-red-500"
                      : "border-gray-200 dark:border-gray-700"
                  }`}
                  readOnly
                />
                {errors.employeeId && (
                  <p className="text-xxs font-bold text-red-500 mt-1">
                    {errors.employeeId.message}
                  </p>
                )}
              </div>
              {/* Department */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Department
                </label>
                <input
                  type="text"
                  placeholder="Auto-populated"
                  {...register("department")}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-800 dark:text-gray-200 font-semibold focus:outline-none"
                  readOnly
                />
                {errors.department && (
                  <p className="text-xxs font-bold text-red-500 mt-1">
                    {errors.department.message}
                  </p>
                )}
              </div>
              {/* Designation */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Designation
                </label>
                <input
                  type="text"
                  placeholder="Auto-populated"
                  {...register("designation")}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-800 dark:text-gray-200 font-semibold focus:outline-none"
                  readOnly
                />
                {errors.designation && (
                  <p className="text-xxs font-bold text-red-500 mt-1">
                    {errors.designation.message}
                  </p>
                )}
              </div>
              {/* Reporting Manager (Searchable Dropdown) */}
              <div className="space-y-1.5 relative" ref={managerDropdownRef}>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Reporting manager <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search or select reporting manager..."
                    value={managerSearchQuery}
                    onChange={(e) => {
                      setManagerSearchQuery(e.target.value);
                      setShowManagerDropdown(true);
                      if (e.target.value === "") {
                        setValue("reportingManager", "");
                        setValue("reportingManagerId", "");
                      }
                    }}
                    onFocus={() => setShowManagerDropdown(true)}
                    className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border rounded-lg text-sm text-gray-800 dark:text-gray-200 transition-all focus:outline-none focus:ring-2 ${
                      errors.reportingManager
                        ? "border-red-500 focus:ring-red-500/20"
                        : "border-gray-200 dark:border-gray-700 focus:border-green-500 focus:ring-green-500/20"
                    }`}
                  />
                  <ChevronDown
                    size={16}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-400 pointer-events-none top-1/2 -translate-y-1/2"
                  />
                  {managerSearchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setManagerSearchQuery("");
                        setValue("reportingManager", "");
                        setValue("reportingManagerId", "");
                      }}
                      className="absolute inset-y-0 right-8 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {showManagerDropdown && (
                  <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
                    {filteredManagers.length > 0 ? (
                      filteredManagers.map((manager) => (
                        <button
                          key={manager.id}
                          type="button"
                          onClick={() => handleSelectManager(manager)}
                          className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        >
                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {manager.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {manager.designation} • {manager.department}
                            </p>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="p-3 text-center text-xs text-gray-400">
                        No managers found matching "{managerSearchQuery}"
                      </div>
                    )}
                  </div>
                )}
                {errors.reportingManager && (
                  <p className="text-xxs font-bold text-red-500 mt-1">
                    {errors.reportingManager.message}
                  </p>
                )}
              </div>
              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Auto-populated"
                  {...register("email")}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-800 dark:text-gray-200 font-semibold focus:outline-none"
                  readOnly
                />
                {errors.email && (
                  <p className="text-xxs font-bold text-red-500 mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>
              {/* NOTICE START DATE - FIRST */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Notice start date <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="noticeStartDate"
                  control={control}
                  render={({ field }) => (
                    <DateInput
                      {...field}
                      placeholder="Select notice start date"
                      error={!!errors.noticeStartDate}
                      className="w-full bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                    />
                  )}
                />
                {errors.noticeStartDate && (
                  <p className="text-xxs font-bold text-red-500 mt-1">
                    {errors.noticeStartDate.message}
                  </p>
                )}
              </div>
              {/* NOTICE PERIOD DAYS - SECOND */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Notice period (days) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  placeholder="30"
                  {...register("noticePeriodDays")}
                  className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border rounded-lg text-sm text-gray-800 dark:text-gray-200 font-semibold focus:outline-none focus:ring-2 focus:ring-green-500/20 ${
                    errors.noticePeriodDays
                      ? "border-red-500"
                      : "border-gray-200 dark:border-gray-700 focus:border-green-500"
                  }`}
                />
                {errors.noticePeriodDays && (
                  <p className="text-xxs font-bold text-red-500 mt-1">
                    {errors.noticePeriodDays.message}
                  </p>
                )}
              </div>
              {/* LAST WORKING DAY - THIRD (Auto-calculated) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Last working day <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="lastWorkingDay"
                  control={control}
                  render={({ field }) => (
                    <DateInput
                      {...field}
                      placeholder="Auto-calculated from notice period"
                      error={!!errors.lastWorkingDay}
                      className="w-full bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                      disabled={true}
                    />
                  )}
                />
                {errors.lastWorkingDay && (
                  <p className="text-xxs font-bold text-red-500 mt-1">
                    {errors.lastWorkingDay.message}
                  </p>
                )}
              </div>
              {/* Separation Type */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Separation type <span className="text-red-500">*</span>
                </label>
                <select
                  {...register("separationType")}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-800 dark:text-gray-200 outline-none transition-all focus:border-green-500 focus:ring-2 focus:ring-green-500/20 font-semibold"
                >
                  <option value="Resignation">Resignation</option>
                  <option value="Termination">Termination</option>
                  <option value="Retirement">Retirement</option>
                  <option value="Contract End">Contract End</option>
                </select>
                {errors.separationType && (
                  <p className="text-xxs font-bold text-red-500 mt-1">
                    {errors.separationType.message}
                  </p>
                )}
              </div>
              {/* Visa Sponsorship */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Visa sponsorship <span className="text-red-500">*</span>
                </label>
                <select
                  {...register("visaSponsorship")}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-800 dark:text-gray-200 outline-none transition-all focus:border-green-500 focus:ring-2 focus:ring-green-500/20 font-semibold"
                >
                  <option value="">Select Sponsorship</option>
                  <option value="Company sponsored">Company sponsored</option>
                  <option value="Self sponsored">Self sponsored</option>
                  <option value="Golden Visa">Golden Visa</option>
                  <option value="Family sponsored">Family sponsored</option>
                  <option value="Not Applicable">
                    Not Applicable (No visa required)
                  </option>
                </select>
                {errors.visaSponsorship && (
                  <p className="text-xxs font-bold text-red-500 mt-1">
                    {errors.visaSponsorship.message}
                  </p>
                )}
              </div>
              {/* Nationality */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Nationality
                </label>
                <input
                  type="text"
                  placeholder="e.g. Jordanian"
                  {...register("nationality")}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-800 dark:text-gray-200 font-semibold focus:outline-none"
                />
                {errors.nationality && (
                  <p className="text-xxs font-bold text-red-500 mt-1">
                    {errors.nationality.message}
                  </p>
                )}
              </div>
              {/* Reason for Leaving - Full width spans both columns */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Reason for leaving <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="Please provide the reason for employee's departure..."
                  {...register("reasonForLeaving")}
                  className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border rounded-lg text-sm text-gray-800 dark:text-gray-200 outline-none transition-all focus:ring-2 focus:ring-green-500/20 focus:border-green-500 font-semibold ${
                    errors.reasonForLeaving
                      ? "border-red-500"
                      : "border-gray-200 dark:border-gray-700"
                  }`}
                ></textarea>
                {errors.reasonForLeaving && (
                  <p className="text-xxs font-bold text-red-500 mt-1">
                    {errors.reasonForLeaving.message}
                  </p>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={offboardingLoading}
                className="px-6 py-2.5 rounded-full font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Save size={16} />
                Save draft
              </button>

              <button
                type="submit"
                disabled={isSubmitting || offboardingLoading}
                className="px-6 py-2.5 rounded-full font-semibold bg-green-500 text-white hover:bg-green-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting || offboardingLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Initiating...
                  </>
                ) : (
                  <>
                    <ArrowRight size={16} />
                    Initiate offboarding
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Progress Modal */}
      <ProgressModal />
    </div>
  );
};

export default OffboardingInitiation;
