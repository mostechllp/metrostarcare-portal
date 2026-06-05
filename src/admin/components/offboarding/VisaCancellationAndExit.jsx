import React, { useState, useEffect } from "react";
import { AlertCircle, CheckCircle2, Circle, ShieldAlert, ArrowRight, Save, Info, AlertTriangle } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { showToast } from "../common/Toast";
import OffboardingHeader from "./OffboardingHeader";
import { fetchEmployeeById } from "../../store/slices/employeeSlice";
import { fetchOffboardingById, updateVisaStatus } from "../../store/slices/offboardingSlice";

const VisaCancellationAndExit = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const offboardingId = searchParams.get("id");
  
  const [loading, setLoading] = useState(true);
  const [employeeData, setEmployeeData] = useState(null);
  const [offboardingData, setOffboardingData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Redux state
  const { currentEmployee, loading: employeeLoading } = useSelector((state) => state.employees);
  const { currentOffboarding, loading: offboardingLoading } = useSelector((state) => state.offboarding);
  
  const [tasks, setTasks] = useState([
    { id: "task-1", label: "Submit visa cancellation to GDRFA/ICP", assignee: "PRO", checked: false, apiField: "visa_cancellation_submitted" },
    { id: "task-2", label: "Cancel labour card at MOHRE", assignee: "PRO", checked: false, apiField: "labour_card_cancelled" },
    { id: "task-3", label: "Issue exit permit (if applicable)", assignee: "PRO", checked: false, apiField: "exit_permit_issued" },
    { id: "task-4", label: "Return Emirates ID to ICP (or report lost)", assignee: "HR", checked: false, apiField: "emirates_id_returned" },
    { id: "task-5", label: "Cancel WPS (payroll) registration", assignee: "Finance", checked: false, apiField: "wps_cancelled" },
    { id: "task-6", label: "ILOE (unemployment insurance) closure", assignee: "HR", checked: false, apiField: "iloe_closed" },
  ]);

  // Fetch offboarding details on component mount
  useEffect(() => {
    if (offboardingId) {
      dispatch(fetchOffboardingById(offboardingId));
    } else {
      // Fallback to localStorage if no ID in URL
      const storedOffboardingId = localStorage.getItem("offboarding_id");
      if (storedOffboardingId) {
        dispatch(fetchOffboardingById(storedOffboardingId));
      } else {
        setLoading(false);
        showToast("No offboarding session found. Please start from initiation.", "warning");
      }
    }
  }, [dispatch, offboardingId]);

  // Load employee and offboarding data
  useEffect(() => {
    if (currentOffboarding && !offboardingLoading) {
      setOffboardingData(currentOffboarding);
      
      // Load tasks from API if available
      if (currentOffboarding.visa_tasks) {
        const updatedTasks = tasks.map(task => ({
          ...task,
          checked: currentOffboarding.visa_tasks[task.apiField] || false
        }));
        setTasks(updatedTasks);
      }
      
      // Fetch employee details if employee_id exists
      const employeeId = currentOffboarding.employee_id || localStorage.getItem("offboarding_employee_id");
      if (employeeId) {
        dispatch(fetchEmployeeById(employeeId));
      } else {
        setLoading(false);
      }
    }
  }, [currentOffboarding, offboardingLoading, dispatch]);

  // Update local state when employee data is loaded
  useEffect(() => {
    if (currentEmployee && !employeeLoading) {
      setEmployeeData(currentEmployee);
      setLoading(false);
    } else if (!employeeLoading && !currentEmployee && !offboardingLoading) {
      setLoading(false);
    }
  }, [currentEmployee, employeeLoading, offboardingLoading]);

  const toggleTask = (taskId) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, checked: !task.checked } : task
    ));
  };

  const handleUpdateStatus = async () => {
    setIsSubmitting(true);
    
    try {
      // Prepare visa status payload
      const visaStatusData = {
        visa_tasks: tasks.reduce((acc, task) => {
          acc[task.apiField] = task.checked;
          return acc;
        }, {}),
        visa_status: tasks.every(t => t.checked) ? "completed" : "in_progress",
        updated_at: new Date().toISOString()
      };

      // Update visa status via API
      const result = await dispatch(updateVisaStatus({ 
        id: offboardingId || localStorage.getItem("offboarding_id"), 
        visaData: visaStatusData 
      })).unwrap();

      console.log("Visa status updated:", result);

      // Save task completion status to localStorage as backup
      localStorage.setItem("visa_tasks_completed", JSON.stringify(tasks));

      showToast("Visa status updated successfully", "success");
      
      setTimeout(() => {
        navigate(`/admin/employees/offboarding-checklist?id=${offboardingId || localStorage.getItem("offboarding_id")}`);
      }, 1000);
    } catch (error) {
      console.error("Update visa status error:", error);
      showToast(error || "Failed to update visa status. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format date to display nicely
  const formatDate = (dateString) => {
    if (!dateString) return "Not available";
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Check if visa/EID details are available
  const hasVisaDetails = employeeData?.visa_number || employeeData?.visa_expiry_date;
  const hasEidDetails = employeeData?.eid_number || employeeData?.eid_expiry_date;

  // Calculate progress percentage
  const completedTasks = tasks.filter(t => t.checked).length;
  const progressPercentage = Math.round((completedTasks / tasks.length) * 100);

  return (
    <div className="min-h-screen bg-gray-50/30 dark:bg-gray-900/40 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* SaaS Offboarding Header */}
        <OffboardingHeader currentStep={2} />

        {/* Warning Banner */}
        <div className="bg-amber-50 dark:bg-amber-950/30 border-l-4 border-amber-500 p-4 rounded-r-lg flex items-start gap-3 shadow-sm">
          <AlertTriangle className="text-amber-500 mt-0.5 flex-shrink-0" size={20} />
          <div>
            <h3 className="text-sm font-bold text-amber-800 dark:text-amber-400">Important Legal Notice</h3>
            <p className="text-sm text-amber-700 dark:text-amber-500 mt-1 font-medium">
              UAE law requires employer to cancel the work visa within 30 days of last working day. Failure may result in fines.
            </p>
          </div>
        </div>

        {/* Loading State */}
        {(loading || offboardingLoading || employeeLoading) ? (
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/80 rounded-2xl shadow-soft p-12">
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-500 dark:text-gray-400">Loading employee visa details...</p>
            </div>
          </div>
        ) : (
          /* Main Content Card */
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/80 rounded-2xl shadow-soft p-6 sm:p-8 space-y-8">
            
            {/* Header Title with Action Required Badge */}
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                  Visa cancellation & exit
                </h1>
                {employeeData && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Employee: {employeeData.first_name} {employeeData.last_name} ({employeeData.employee_id})
                  </p>
                )}
                {offboardingData && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    Offboarding ID: {offboardingData.id}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3">
                {/* Progress Badge */}
                <div className="px-3 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/60 rounded text-xs font-bold">
                  {progressPercentage}% Complete
                </div>
                <span className="px-3 py-1 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200/60 dark:border-red-900/60 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                  Action required
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-gray-500 dark:text-gray-400 uppercase tracking-wide">Visa cancellation progress</span>
                <span className="text-green-600 dark:text-green-400">{progressPercentage}%</span>
              </div>
              <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 dark:bg-green-600 transition-all duration-500 ease-out" 
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>

            {/* Missing Documents Warning */}
            {(!hasVisaDetails || !hasEidDetails) && (
              <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="text-yellow-600 dark:text-yellow-500 mt-0.5 flex-shrink-0" size={20} />
                <div>
                  <h4 className="text-sm font-bold text-yellow-800 dark:text-yellow-400">Missing Document Information</h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-500 mt-1">
                    Visa or Emirates ID details are missing for this employee. Please update the employee's document information before proceeding with cancellation.
                  </p>
                </div>
              </div>
            )}

            {/* VISA & RESIDENCY STATUS Section */}
            <section className="space-y-4">
              <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert size={16} />
                Visa & Residency Status
              </h2>
              
              <div className="bg-gray-50/50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700/50 rounded-xl p-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                  
                  {/* Emirates ID Number */}
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Emirates ID number</span>
                    <div className="text-sm font-bold text-gray-900 dark:text-gray-100 font-mono">
                      {employeeData?.eid_number || <span className="text-red-500">Not provided</span>}
                    </div>
                  </div>

                  {/* Emirates ID Expiry */}
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Emirates ID expiry</span>
                    <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
                      {employeeData?.eid_expiry_date ? formatDate(employeeData.eid_expiry_date) : <span className="text-red-500">Not provided</span>}
                    </div>
                  </div>

                  {/* Visa Number */}
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Visa number</span>
                    <div className="text-sm font-bold text-gray-900 dark:text-gray-100 font-mono">
                      {employeeData?.visa_number || <span className="text-red-500">Not provided</span>}
                    </div>
                  </div>

                  {/* Visa Expiry */}
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Visa expiry</span>
                    <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
                      {employeeData?.visa_expiry_date ? formatDate(employeeData.visa_expiry_date) : <span className="text-red-500">Not provided</span>}
                    </div>
                  </div>

                  {/* Labour Card Number */}
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Labour card number</span>
                    <div className="text-sm font-bold text-gray-900 dark:text-gray-100 font-mono">
                      {employeeData?.labor_number || <span className="text-red-500">Not provided</span>}
                    </div>
                  </div>

                  {/* Visa Type */}
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Visa type</span>
                    <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
                      {employeeData?.visa_type || "Employment visa"}
                    </div>
                  </div>

                  {/* Visa Issue Date */}
                  {employeeData?.visa_issued_date && (
                    <div className="space-y-1">
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Visa issued date</span>
                      <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
                        {formatDate(employeeData.visa_issued_date)}
                      </div>
                    </div>
                  )}

                  {/* EID Issue Date */}
                  {employeeData?.eid_issued_date && (
                    <div className="space-y-1">
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Emirates ID issued date</span>
                      <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
                        {formatDate(employeeData.eid_issued_date)}
                      </div>
                    </div>
                  )}
                  
                </div>
              </div>
            </section>

            {/* CANCELLATION TASKS Section */}
            <section className="space-y-4">
              <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 size={16} />
                Cancellation Tasks
              </h2>
              
              <div className="border border-gray-100 dark:border-gray-700/50 rounded-xl divide-y divide-gray-100 dark:divide-gray-700/50 bg-white dark:bg-gray-800">
                {tasks.map((task) => (
                  <div 
                    key={task.id} 
                    className={`flex items-center justify-between p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/80 cursor-pointer ${task.checked ? 'bg-gray-50/50 dark:bg-gray-800/40' : ''}`}
                    onClick={() => toggleTask(task.id)}
                  >
                    <div className="flex items-center gap-3">
                      <button 
                        type="button" 
                        className={`flex-shrink-0 transition-colors ${task.checked ? 'text-green-500' : 'text-gray-300 dark:text-gray-600 hover:text-green-500/50'}`}
                      >
                        {task.checked ? <CheckCircle2 size={20} className="fill-green-50 dark:fill-green-950/20" /> : <Circle size={20} />}
                      </button>
                      <span className={`text-sm font-medium transition-colors ${task.checked ? 'text-gray-500 dark:text-gray-400 line-through decoration-gray-300 dark:decoration-gray-600' : 'text-gray-900 dark:text-gray-100'}`}>
                        {task.label}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 pl-4">
                      <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs font-bold tracking-wide">
                        {task.assignee}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Footer Action */}
            <div className="pt-6 border-t border-gray-100 dark:border-gray-700 flex justify-end">
              <button
                onClick={handleUpdateStatus}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-full font-semibold bg-green-500 text-white hover:bg-green-600 transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    Update visa status
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default VisaCancellationAndExit;