import React from 'react'
import UnderDevelopment from '../../components/common/UnderDevelopment'

const OffboardingInitiation = () => {
  return (
    <UnderDevelopment pageName="Offboarding"/>
  )
}

export default OffboardingInitiation

// import React, { useState, useEffect, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import { useForm, Controller } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import * as z from "zod";
// import { Search, X, ArrowRight, Save } from "lucide-react";
// import { useDispatch, useSelector } from "react-redux";
// import DateInput from "../components/common/DateInput";
// import { showToast } from "../components/common/Toast";
// import OffboardingHeader from "../components/offboarding/OffboardingHeader";
// import { fetchEmployees } from "../store/slices/employeeSlice";
// import { fetchDepartments } from "../store/slices/departmentSlice";
// import { fetchDesignations } from "../store/slices/designationSlice";

// // ----------------------------------------------------
// // ZOD RESOLVER SCHEMA
// // ----------------------------------------------------
// const offboardingSchema = z.object({
//   employeeId: z.string().min(1, "Employee ID is required"),
//   employeeName: z.string().min(1, "Employee name is required"),
//   department: z.string().min(1, "Department is required"),
//   designation: z.string().min(1, "Designation is required"),
//   reportingManager: z.string().min(1, "Reporting manager is required"),
//   reportingManagerId: z.string().optional(),
//   lastWorkingDay: z.string().min(1, "Last working day is required"),
//   separationType: z.string().min(1, "Separation type is required"),
//   noticePeriodDays: z.coerce.number().min(0, "Notice period must be 0 or more"),
//   noticeStartDate: z.string().min(1, "Notice start date is required"),
//   visaSponsorship: z.string().min(1, "Visa sponsorship is required"),
//   nationality: z.string().min(1, "Nationality is required"),
//   email: z.string().email("Invalid email").optional(),
//   reasonForLeaving: z.string().min(5, "Please enter a reason for leaving (min 5 chars)")
// });

// const OffboardingInitiation = () => {
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const dropdownRef = useRef(null);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [showDropdown, setShowDropdown] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   // Redux state
//   const { employees, loading: employeesLoading } = useSelector((state) => state.employees);
//   const { departments } = useSelector((state) => state.departments);
//   const { designations } = useSelector((state) => state.designations);

//   const {
//     register,
//     handleSubmit,
//     setValue,
//     watch,
//     control,
//     reset,
//     formState: { errors }
//   } = useForm({
//     resolver: zodResolver(offboardingSchema),
//     defaultValues: {
//       employeeId: "",
//       employeeName: "",
//       department: "",
//       designation: "",
//       reportingManager: "",
//       reportingManagerId: "",
//       lastWorkingDay: "",
//       separationType: "Resignation",
//       noticePeriodDays: 30,
//       noticeStartDate: "",
//       visaSponsorship: "",
//       nationality: "",
//       email: "",
//       reasonForLeaving: ""
//     }
//   });

//   // Fetch employees, departments, designations on component mount
//   useEffect(() => {
//     dispatch(fetchEmployees());
//     dispatch(fetchDepartments());
//     dispatch(fetchDesignations());
//   }, [dispatch]);

//   // Handle click outside to close dropdown
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         setShowDropdown(false);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);

//   // Watch notice start date and last working day to auto-calculate notice period
//   const watchedNoticeStartDate = watch("noticeStartDate");
//   const watchedLastWorkingDay = watch("lastWorkingDay");

//   // Calculate notice duration in days when dates change
//   useEffect(() => {
//     if (watchedNoticeStartDate && watchedLastWorkingDay) {
//       const start = new Date(watchedNoticeStartDate);
//       const end = new Date(watchedLastWorkingDay);
//       const diffTime = end - start;
//       const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

//       if (!isNaN(diffDays) && diffDays > 0) {
//         setValue("noticePeriodDays", diffDays, { shouldValidate: true });
//       }
//     }
//   }, [watchedNoticeStartDate, watchedLastWorkingDay, setValue]);

//   // Filter employees based on search query (using real data from API)
//   const filteredEmployees = (employees || []).filter(emp => {
//     const employeeId = emp.id ? String(emp.id) : "";
//     const employeeName = emp.name ? String(emp.name).toLowerCase() : "";
//     const employeeEmail = emp.raw?.user?.email ? String(emp.raw.user.email).toLowerCase() : "";
//     const searchLower = searchQuery.toLowerCase();
    
//     return employeeName.includes(searchLower) || 
//            employeeId.includes(searchLower) || 
//            employeeEmail.includes(searchLower);
//   });

//   // Get manager name by manager ID from raw employee data
//   const getManagerName = (managerId) => {
//     if (!managerId) return "";
//     const manager = employees?.find(emp => emp.id === managerId);
//     if (manager) return manager.name;
    
//     // Also check if manager is stored in raw data
//     const rawManager = employees?.find(emp => emp.raw?.user?.id === managerId);
//     return rawManager ? rawManager.name : managerId;
//   };

//   // Handle employee selection and auto-populate all form fields
//   const handleSelectEmployee = (emp) => {
//     setSearchQuery(emp.name);
//     setShowDropdown(false);

//     const rawEmployee = emp.raw || {};
//     const userData = rawEmployee.user || {};
    
//     // Find department name from department ID
//     const departmentObj = departments?.find(dept => dept.id === userData.department_id);
//     const departmentName = departmentObj?.name || userData.department?.name || "";
    
//     // Find designation name from designation ID
//     const designationObj = designations?.find(des => des.id === userData.designation_id);
//     const designationName = designationObj?.name || userData.designation?.name || "";

//     // Get reporting manager name
//     const managerName = getManagerName(userData.reporting_manager_id);

//     // Set form fields with real data from API
//     setValue("employeeId", String(emp.id), { shouldValidate: true });
//     setValue("employeeName", emp.name, { shouldValidate: true });
//     setValue("department", departmentName, { shouldValidate: true });
//     setValue("designation", designationName, { shouldValidate: true });
//     setValue("reportingManager", managerName, { shouldValidate: true });
//     setValue("reportingManagerId", userData.reporting_manager_id || "", { shouldValidate: true });
//     setValue("nationality", rawEmployee.nationality || "", { shouldValidate: true });
//     setValue("email", userData.email || "", { shouldValidate: true });
    
//     // Set default visa sponsorship based on employee data or leave empty
//     const visaStatus = rawEmployee.visa_status || rawEmployee.visa_sponsorship || "";
//     setValue("visaSponsorship", visaStatus, { shouldValidate: true });

//     showToast(`Employee ${emp.name} loaded successfully!`, "success");
//   };

//   const onSubmit = async (data) => {
//     setIsSubmitting(true);

//     try {
//       // Prepare payload for offboarding API
//       const payload = {
//         employeeId: data.employeeId,
//         employeeName: data.employeeName,
//         department: data.department,
//         designation: data.designation,
//         reportingManager: data.reportingManager,
//         reportingManagerId: data.reportingManagerId,
//         lastWorkingDay: data.lastWorkingDay,
//         separationType: data.separationType,
//         noticePeriodDays: data.noticePeriodDays,
//         noticeStartDate: data.noticeStartDate,
//         visaSponsorship: data.visaSponsorship,
//         nationality: data.nationality,
//         email: data.email,
//         reasonForLeaving: data.reasonForLeaving,
//         status: "initiated",
//         initiatedAt: new Date().toISOString()
//       };

//       // TODO: Call your offboarding API endpoint here
//       // const response = await apiClient.post("/admin/offboarding/initiate", payload);
      
//       console.log("Offboarding initiated with data:", payload);

//       showToast(
//         <div className="text-sm">
//           <span className="font-bold block text-green-800 dark:text-green-300">Offboarding Initiated</span>
//           <span>Successfully triggered offboarding workflows for {data.employeeName}.</span>
//         </div>,
//         "success"
//       );

//       // Clear draft from localStorage if exists
//       localStorage.removeItem("offboarding_draft");
      
//       // Reset form and search
//       reset();
//       setSearchQuery("");
      
//       // Navigate to next step (Visa Cancellation)
//       navigate("/admin/employees/visa-cancellation");
//     } catch (error) {
//       console.error("Offboarding initiation error:", error);
//       showToast("Failed to initiate offboarding. Please try again.", "error");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleSaveDraft = () => {
//     const formData = watch();
//     localStorage.setItem("offboarding_draft", JSON.stringify(formData));
//     showToast("Offboarding details saved as draft.", "success");
//   };

//   // Load draft from localStorage on mount
//   useEffect(() => {
//     const draft = localStorage.getItem("offboarding_draft");
//     if (draft) {
//       const parsedDraft = JSON.parse(draft);
//       Object.keys(parsedDraft).forEach(key => {
//         if (parsedDraft[key]) {
//           setValue(key, parsedDraft[key]);
//         }
//       });
//     }
//   }, [setValue]);

//   return (
//     <div className="min-h-screen bg-gray-50/30 dark:bg-gray-900/40 p-4 sm:p-6 lg:p-8">
//       <div className="max-w-5xl mx-auto space-y-6">

//         {/* SaaS Offboarding Header */}
//         <OffboardingHeader currentStep={1} />

//         {/* Form Container Card */}
//         <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/80 rounded-2xl shadow-soft p-6 sm:p-8">

//           <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

//             {/* Header Title with Draft Badge */}
//             <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-4 mb-6">
//               <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
//                 Initiate offboarding
//               </h1>
//               <span className="px-3 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/60 rounded text-xs font-bold uppercase tracking-wider">
//                 Draft
//               </span>
//             </div>

//             {/* Form Fields Grid - Two columns */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">

//               {/* Employee Name (Searchable Select Input) */}
//               <div className="space-y-1.5 relative" ref={dropdownRef}>
//                 <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
//                   Employee name <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative">
//                   <input
//                     type="text"
//                     placeholder="Search or select employee..."
//                     value={searchQuery}
//                     onChange={(e) => {
//                       setSearchQuery(e.target.value);
//                       setShowDropdown(true);
//                     }}
//                     onFocus={() => setShowDropdown(true)}
//                     className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border rounded-lg text-sm text-gray-800 dark:text-gray-200 transition-all focus:outline-none focus:ring-2 ${errors.employeeName
//                         ? "border-red-500 focus:ring-red-500/20"
//                         : "border-gray-200 dark:border-gray-700 focus:border-green-500 focus:ring-green-500/20"
//                       }`}
//                   />
//                   {searchQuery && (
//                     <button
//                       type="button"
//                       onClick={() => {
//                         setSearchQuery("");
//                         setValue("employeeName", "");
//                         setValue("employeeId", "");
//                         setValue("department", "");
//                         setValue("designation", "");
//                         setValue("reportingManager", "");
//                         setValue("nationality", "");
//                         setValue("visaSponsorship", "");
//                         setValue("email", "");
//                       }}
//                       className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
//                     >
//                       <X size={15} />
//                     </button>
//                   )}
//                 </div>

//                 {/* Dropdown suggestions list */}
//                 {showDropdown && (
//                   <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
//                     {employeesLoading ? (
//                       <div className="p-3 text-center text-xs text-gray-400">
//                         Loading employees...
//                       </div>
//                     ) : filteredEmployees.length > 0 ? (
//                       filteredEmployees.map((emp) => (
//                         <button
//                           key={emp.id}
//                           type="button"
//                           onClick={() => handleSelectEmployee(emp)}
//                           className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
//                         >
//                           <div className="flex items-center justify-between">
//                             <div>
//                               <p className="text-sm font-semibold text-gray-900 dark:text-white">
//                                 {emp.name}
//                               </p>
//                               <p className="text-xs text-gray-500 dark:text-gray-400">
//                                 {emp.designation} • {emp.department}
//                               </p>
//                             </div>
//                             <span className="text-xs text-gray-400 font-mono">{emp.id}</span>
//                           </div>
//                         </button>
//                       ))
//                     ) : (
//                       <div className="p-3 text-center text-xs text-gray-400">
//                         No employees found matching "{searchQuery}"
//                       </div>
//                     )}
//                   </div>
//                 )}
//                 {errors.employeeName && (
//                   <p className="text-xxs font-bold text-red-500 mt-1">{errors.employeeName.message}</p>
//                 )}
//               </div>

//               {/* Employee ID */}
//               <div className="space-y-1.5">
//                 <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
//                   Employee ID
//                 </label>
//                 <input
//                   type="text"
//                   placeholder="Auto-populated"
//                   {...register("employeeId")}
//                   className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border rounded-lg text-sm text-gray-800 dark:text-gray-200 font-semibold focus:outline-none ${errors.employeeId ? "border-red-500" : "border-gray-200 dark:border-gray-700"
//                     }`}
//                   readOnly
//                 />
//                 {errors.employeeId && (
//                   <p className="text-xxs font-bold text-red-500 mt-1">{errors.employeeId.message}</p>
//                 )}
//               </div>

//               {/* Department */}
//               <div className="space-y-1.5">
//                 <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
//                   Department
//                 </label>
//                 <input
//                   type="text"
//                   placeholder="Auto-populated"
//                   {...register("department")}
//                   className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-800 dark:text-gray-200 font-semibold focus:outline-none"
//                   readOnly
//                 />
//                 {errors.department && (
//                   <p className="text-xxs font-bold text-red-500 mt-1">{errors.department.message}</p>
//                 )}
//               </div>

//               {/* Designation */}
//               <div className="space-y-1.5">
//                 <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
//                   Designation
//                 </label>
//                 <input
//                   type="text"
//                   placeholder="Auto-populated"
//                   {...register("designation")}
//                   className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-800 dark:text-gray-200 font-semibold focus:outline-none"
//                   readOnly
//                 />
//                 {errors.designation && (
//                   <p className="text-xxs font-bold text-red-500 mt-1">{errors.designation.message}</p>
//                 )}
//               </div>

//               {/* Reporting Manager */}
//               <div className="space-y-1.5">
//                 <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
//                   Reporting manager
//                 </label>
//                 <input
//                   type="text"
//                   placeholder="Auto-populated"
//                   {...register("reportingManager")}
//                   className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-800 dark:text-gray-200 font-semibold focus:outline-none"
//                   readOnly
//                 />
//                 {errors.reportingManager && (
//                   <p className="text-xxs font-bold text-red-500 mt-1">{errors.reportingManager.message}</p>
//                 )}
//               </div>

//               {/* Email */}
//               <div className="space-y-1.5">
//                 <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
//                   Email
//                 </label>
//                 <input
//                   type="email"
//                   placeholder="Auto-populated"
//                   {...register("email")}
//                   className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-800 dark:text-gray-200 font-semibold focus:outline-none"
//                   readOnly
//                 />
//                 {errors.email && (
//                   <p className="text-xxs font-bold text-red-500 mt-1">{errors.email.message}</p>
//                 )}
//               </div>

//               {/* Last Working Day */}
//               <div className="space-y-1.5">
//                 <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
//                   Last working day <span className="text-red-500">*</span>
//                 </label>
//                 <Controller
//                   name="lastWorkingDay"
//                   control={control}
//                   render={({ field }) => (
//                     <DateInput
//                       {...field}
//                       placeholder="Select last working day"
//                       error={!!errors.lastWorkingDay}
//                       className="w-full bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700"
//                     />
//                   )}
//                 />
//                 {errors.lastWorkingDay && (
//                   <p className="text-xxs font-bold text-red-500 mt-1">{errors.lastWorkingDay.message}</p>
//                 )}
//               </div>

//               {/* Separation Type */}
//               <div className="space-y-1.5">
//                 <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
//                   Separation type <span className="text-red-500">*</span>
//                 </label>
//                 <select
//                   {...register("separationType")}
//                   className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-800 dark:text-gray-200 outline-none transition-all focus:border-green-500 focus:ring-2 focus:ring-green-500/20 font-semibold"
//                 >
//                   <option value="Resignation">Resignation</option>
//                   <option value="Termination">Termination</option>
//                   <option value="Retirement">Retirement</option>
//                   <option value="Contract End">Contract End</option>
//                 </select>
//                 {errors.separationType && (
//                   <p className="text-xxs font-bold text-red-500 mt-1">{errors.separationType.message}</p>
//                 )}
//               </div>

//               {/* Notice Period (Days) */}
//               <div className="space-y-1.5">
//                 <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
//                   Notice period (days)
//                 </label>
//                 <input
//                   type="number"
//                   placeholder="30"
//                   {...register("noticePeriodDays")}
//                   className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border rounded-lg text-sm text-gray-800 dark:text-gray-200 font-semibold focus:outline-none focus:ring-2 focus:ring-green-500/20 ${errors.noticePeriodDays ? "border-red-500" : "border-gray-200 dark:border-gray-700 focus:border-green-500"
//                     }`}
//                 />
//                 {errors.noticePeriodDays && (
//                   <p className="text-xxs font-bold text-red-500 mt-1">{errors.noticePeriodDays.message}</p>
//                 )}
//               </div>

//               {/* Notice Start Date */}
//               <div className="space-y-1.5">
//                 <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
//                   Notice start date
//                 </label>
//                 <Controller
//                   name="noticeStartDate"
//                   control={control}
//                   render={({ field }) => (
//                     <DateInput
//                       {...field}
//                       placeholder="Select notice start date"
//                       error={!!errors.noticeStartDate}
//                       className="w-full bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700"
//                     />
//                   )}
//                 />
//                 {errors.noticeStartDate && (
//                   <p className="text-xxs font-bold text-red-500 mt-1">{errors.noticeStartDate.message}</p>
//                 )}
//               </div>

//               {/* Visa Sponsorship */}
//               <div className="space-y-1.5">
//                 <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
//                   Visa sponsorship <span className="text-red-500">*</span>
//                 </label>
//                 <select
//                   {...register("visaSponsorship")}
//                   className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-800 dark:text-gray-200 outline-none transition-all focus:border-green-500 focus:ring-2 focus:ring-green-500/20 font-semibold"
//                 >
//                   <option value="">Select Sponsorship</option>
//                   <option value="Company sponsored">Company sponsored</option>
//                   <option value="Self sponsored">Self sponsored</option>
//                   <option value="Golden Visa">Golden Visa</option>
//                   <option value="Family sponsored">Family sponsored</option>
//                 </select>
//                 {errors.visaSponsorship && (
//                   <p className="text-xxs font-bold text-red-500 mt-1">{errors.visaSponsorship.message}</p>
//                 )}
//               </div>

//               {/* Nationality */}
//               <div className="space-y-1.5">
//                 <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
//                   Nationality
//                 </label>
//                 <input
//                   type="text"
//                   placeholder="e.g. Jordanian"
//                   {...register("nationality")}
//                   className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-800 dark:text-gray-200 font-semibold focus:outline-none"
//                 />
//                 {errors.nationality && (
//                   <p className="text-xxs font-bold text-red-500 mt-1">{errors.nationality.message}</p>
//                 )}
//               </div>

//               {/* Reason for Leaving - Full width spans both columns */}
//               <div className="space-y-1.5 md:col-span-2">
//                 <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
//                   Reason for leaving <span className="text-red-500">*</span>
//                 </label>
//                 <textarea
//                   rows={4}
//                   placeholder="Please provide the reason for employee's departure..."
//                   {...register("reasonForLeaving")}
//                   className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border rounded-lg text-sm text-gray-800 dark:text-gray-200 outline-none transition-all focus:ring-2 focus:ring-green-500/20 focus:border-green-500 font-semibold ${errors.reasonForLeaving ? "border-red-500" : "border-gray-200 dark:border-gray-700"
//                     }`}
//                 ></textarea>
//                 {errors.reasonForLeaving && (
//                   <p className="text-xxs font-bold text-red-500 mt-1">{errors.reasonForLeaving.message}</p>
//                 )}
//               </div>

//             </div>

//             {/* Form Actions */}
//             <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
//               <button
//                 type="button"
//                 onClick={handleSaveDraft}
//                 className="px-6 py-2.5 rounded-full font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all flex items-center justify-center gap-2"
//               >
//                 <Save size={16} />
//                 Save draft
//               </button>

//               <button
//                 type="submit"
//                 disabled={isSubmitting}
//                 className="px-6 py-2.5 rounded-full font-semibold bg-green-500 text-white hover:bg-green-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 {isSubmitting ? (
//                   <>
//                     <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                     Initiating...
//                   </>
//                 ) : (
//                   <>
//                     <ArrowRight size={16} />
//                     Initiate offboarding
//                   </>
//                 )}
//               </button>
//             </div>

//           </form>

//         </div>

//       </div>
//     </div>
//   );
// };

// export default OffboardingInitiation;