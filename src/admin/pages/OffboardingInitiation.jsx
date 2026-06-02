import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Search, X, Calendar, ArrowRight, Save, Info, Check } from "lucide-react";
import DateInput from "../components/common/DateInput";
import { showToast } from "../components/common/Toast";

// ----------------------------------------------------
// DUMMY DATA FOR UAE EMPLOYEES (INCLUDING KHALID AL MANSOURI FROM PHOTO)
// ----------------------------------------------------
const UAE_EMPLOYEES = [
  {
    id: "EMP-0088",
    name: "Khalid Al Mansouri",
    department: "Operations",
    manager: "Sara Al Hashmi",
    nationality: "Jordanian",
    visaSponsorship: "Company sponsored"
  },
  {
    id: "EMP-0102",
    name: "Aisha bin Fahad",
    department: "Human Resources",
    manager: "Elena Rostova",
    nationality: "Emirati",
    visaSponsorship: "Self sponsored"
  },
  {
    id: "EMP-0145",
    name: "Rahul Sharma",
    department: "IT Department",
    manager: "Marcus Aurelius",
    nationality: "Indian",
    visaSponsorship: "Company sponsored"
  },
  {
    id: "EMP-0199",
    name: "Sarah Jenkins",
    department: "Finance",
    manager: "John Doe",
    nationality: "British",
    visaSponsorship: "Company sponsored"
  }
];

// ----------------------------------------------------
// ZOD RESOLVER SCHEMA Matching precise photo details
// ----------------------------------------------------
const offboardingSchema = z.object({
  employeeId: z.string().min(1, "Employee ID is required"),
  employeeName: z.string().min(1, "Employee name is required"),
  department: z.string().min(1, "Department is required"),
  reportingManager: z.string().min(1, "Reporting manager is required"),
  lastWorkingDay: z.string().min(1, "Last working day is required"),
  separationType: z.string().min(1, "Separation type is required"),
  noticePeriodDays: z.coerce.number().min(0, "Notice period must be 0 or more"),
  noticeStartDate: z.string().min(1, "Notice start date is required"),
  visaSponsorship: z.string().min(1, "Visa sponsorship is required"),
  nationality: z.string().min(1, "Nationality is required"),
  reasonForLeaving: z.string().min(5, "Please enter a reason for leaving (min 5 chars)")
});

import OffboardingHeader from "../components/offboarding/OffboardingHeader";

const OffboardingInitiation = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(offboardingSchema),
    defaultValues: {
      employeeId: "",
      employeeName: "",
      department: "",
      reportingManager: "",
      lastWorkingDay: "",
      separationType: "Resignation",
      noticePeriodDays: 30,
      noticeStartDate: "",
      visaSponsorship: "",
      nationality: "",
      reasonForLeaving: ""
    }
  });

  // Watch notice start date and last working day to auto-calculate notice period
  const watchedNoticeStartDate = watch("noticeStartDate");
  const watchedLastWorkingDay = watch("lastWorkingDay");

  // Calculate notice duration in days when dates change
  useEffect(() => {
    if (watchedNoticeStartDate && watchedLastWorkingDay) {
      const start = new Date(watchedNoticeStartDate);
      const end = new Date(watchedLastWorkingDay);
      const diffTime = end - start;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (!isNaN(diffDays)) {
        setValue("noticePeriodDays", diffDays >= 0 ? diffDays : 0, { shouldValidate: true });
      }
    }
  }, [watchedNoticeStartDate, watchedLastWorkingDay, setValue]);

  // Filter employees based on search query
  const filteredEmployees = UAE_EMPLOYEES.filter(emp =>
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle employee selection and auto-populate all form fields
  const handleSelectEmployee = (emp) => {
    setSearchQuery(emp.name);
    setShowDropdown(false);

    // Set form fields
    setValue("employeeId", emp.id, { shouldValidate: true });
    setValue("employeeName", emp.name, { shouldValidate: true });
    setValue("department", emp.department, { shouldValidate: true });
    setValue("reportingManager", emp.manager, { shouldValidate: true });
    setValue("nationality", emp.nationality, { shouldValidate: true });
    setValue("visaSponsorship", emp.visaSponsorship, { shouldValidate: true });

    // Mock date population for demonstration to mimic screenshot
    if (emp.id === "EMP-0088") {
      setValue("noticeStartDate", "2026-06-01", { shouldValidate: true });
      setValue("lastWorkingDay", "2026-06-30", { shouldValidate: true });
      setValue("separationType", "Resignation", { shouldValidate: true });
      setValue("reasonForLeaving", "Better career opportunity abroad.", { shouldValidate: true });
    }

    showToast(`Employee ${emp.name} loaded successfully!`, "success");
  };

  const onSubmit = (data) => {
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      console.log("Offboarding initiated with data:", data);

      showToast(
        <div className="text-sm">
          <span className="font-bold block text-green-800 dark:text-green-300">Offboarding Initiated</span>
          <span>Successfully triggered offboarding workflows for {data.employeeName}.</span>
        </div>,
        "success"
      );

      // Reset form
      reset();
      setSearchQuery("");
      
      // Navigate to Screen 2
      navigate("/admin/employees/visa-cancellation");
    }, 1500);
  };

  const handleSaveDraft = () => {
    showToast("Offboarding details saved as draft.", "success");
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
              <div className="space-y-1.5 relative">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Employee name
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
                    className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border rounded-lg text-sm text-gray-800 dark:text-gray-200 transition-all focus:outline-none focus:ring-2 ${errors.employeeName
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
                        setValue("department", "");
                        setValue("reportingManager", "");
                        setValue("nationality", "");
                        setValue("visaSponsorship", "");
                      }}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>

                {/* Dropdown suggestions list */}
                {showDropdown && (
                  <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
                    {filteredEmployees.length > 0 ? (
                      filteredEmployees.map((emp) => (
                        <button
                          key={emp.id}
                          type="button"
                          onClick={() => handleSelectEmployee(emp)}
                          className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center justify-between text-sm font-semibold transition-colors"
                        >
                          <span className="text-gray-900 dark:text-white">{emp.name}</span>
                          <span className="text-xs text-gray-400 font-mono">{emp.id}</span>
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
                  <p className="text-xxs font-bold text-red-500 mt-1">{errors.employeeName.message}</p>
                )}
              </div>

              {/* Employee ID */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Employee ID
                </label>
                <input
                  type="text"
                  placeholder="Auto-populated"
                  {...register("employeeId")}
                  className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border rounded-lg text-sm text-gray-800 dark:text-gray-200 font-semibold focus:outline-none ${errors.employeeId ? "border-red-500" : "border-gray-200 dark:border-gray-700"
                    }`}
                  readOnly
                />
                {errors.employeeId && (
                  <p className="text-xxs font-bold text-red-500 mt-1">{errors.employeeId.message}</p>
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
                  className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border rounded-lg text-sm text-gray-800 dark:text-gray-200 font-semibold focus:outline-none ${errors.department ? "border-red-500" : "border-gray-200 dark:border-gray-700"
                    }`}
                  readOnly
                />
                {errors.department && (
                  <p className="text-xxs font-bold text-red-500 mt-1">{errors.department.message}</p>
                )}
              </div>

              {/* Reporting Manager */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Reporting manager
                </label>
                <input
                  type="text"
                  placeholder="Auto-populated"
                  {...register("reportingManager")}
                  className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border rounded-lg text-sm text-gray-800 dark:text-gray-200 font-semibold focus:outline-none ${errors.reportingManager ? "border-red-500" : "border-gray-200 dark:border-gray-700"
                    }`}
                  readOnly
                />
                {errors.reportingManager && (
                  <p className="text-xxs font-bold text-red-500 mt-1">{errors.reportingManager.message}</p>
                )}
              </div>

              {/* Last Working Day */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Last working day
                </label>
                <Controller
                  name="lastWorkingDay"
                  control={control}
                  render={({ field }) => (
                    <DateInput
                      {...field}
                      placeholder="Select last working day"
                      error={!!errors.lastWorkingDay}
                      className="w-full bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                    />
                  )}
                />
                {errors.lastWorkingDay && (
                  <p className="text-xxs font-bold text-red-500 mt-1">{errors.lastWorkingDay.message}</p>
                )}
              </div>

              {/* Separation Type */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Separation type
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
                  <p className="text-xxs font-bold text-red-500 mt-1">{errors.separationType.message}</p>
                )}
              </div>

              {/* Notice Period (Days) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Notice period (days)
                </label>
                <input
                  type="number"
                  placeholder="30"
                  {...register("noticePeriodDays")}
                  className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border rounded-lg text-sm text-gray-800 dark:text-gray-200 font-semibold focus:outline-none focus:ring-2 focus:ring-green-500/20 ${errors.noticePeriodDays ? "border-red-500" : "border-gray-200 dark:border-gray-700 focus:border-green-500"
                    }`}
                />
                {errors.noticePeriodDays && (
                  <p className="text-xxs font-bold text-red-500 mt-1">{errors.noticePeriodDays.message}</p>
                )}
              </div>

              {/* Notice Start Date */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Notice start date
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
                  <p className="text-xxs font-bold text-red-500 mt-1">{errors.noticeStartDate.message}</p>
                )}
              </div>

              {/* Visa Sponsorship */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Visa sponsorship
                </label>
                <select
                  {...register("visaSponsorship")}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-800 dark:text-gray-200 outline-none transition-all focus:border-green-500 focus:ring-2 focus:ring-green-500/20 font-semibold"
                >
                  <option value="">Select Sponsorship</option>
                  <option value="Company sponsored">Company sponsored</option>
                  <option value="Self sponsored">Self sponsored</option>
                  <option value="Golden Visa">Golden Visa</option>
                </select>
                {errors.visaSponsorship && (
                  <p className="text-xxs font-bold text-red-500 mt-1">{errors.visaSponsorship.message}</p>
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
                  className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border rounded-lg text-sm text-gray-800 dark:text-gray-200 font-semibold focus:outline-none focus:ring-2 focus:ring-green-500/20 ${errors.nationality ? "border-red-500" : "border-gray-200 dark:border-gray-700 focus:border-green-500"
                    }`}
                />
                {errors.nationality && (
                  <p className="text-xxs font-bold text-red-500 mt-1">{errors.nationality.message}</p>
                )}
              </div>

              {/* Reason for Leaving - Full width spans both columns */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Reason for leaving
                </label>
                <textarea
                  rows={4}
                  placeholder="Reason..."
                  {...register("reasonForLeaving")}
                  className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border rounded-lg text-sm text-gray-800 dark:text-gray-200 outline-none transition-all focus:ring-2 focus:ring-green-500/20 focus:border-green-500 font-semibold ${errors.reasonForLeaving ? "border-red-500" : "border-gray-200 dark:border-gray-700"
                    }`}
                ></textarea>
                {errors.reasonForLeaving && (
                  <p className="text-xxs font-bold text-red-500 mt-1">{errors.reasonForLeaving.message}</p>
                )}
              </div>

            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="px-6 py-2.5 rounded-full font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
              >
                Save draft
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-full font-semibold bg-green-500 text-white hover:bg-green-600 transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Initiating...
                  </>
                ) : (
                  "Initiate offboarding"
                )}
              </button>

            </div>

          </form>

        </div>

      </div>
    </div>
  );
};

export default OffboardingInitiation;
