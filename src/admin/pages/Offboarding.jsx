import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { 
  ClipboardList, Package, UserPlus, ArrowRight, 
  CheckCircle2, Clock, AlertCircle, TrendingUp,
  Users, Laptop, FileText, ShieldCheck, Briefcase,
  Calendar, UserCheck, Timer, DollarSign
} from "lucide-react";
import { showToast } from "../../components/common/Toast";
import { fetchEmployees } from "../store/slices/employeeSlice";

const OffboardingDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // State for statistics (to be replaced with real API data)
  const [stats, setStats] = useState({
    activeOffboarding: 0,
    pendingTasks: 0,
    completedThisMonth: 0,
    assetsToCollect: 0
  });

  const [recentOffboarding, setRecentOffboarding] = useState([]);
  const [loading, setLoading] = useState(true);

  // Redux state
  const { employees, loading: employeesLoading } = useSelector((state) => state.employees);

  useEffect(() => {
    // Fetch employees and calculate stats
    dispatch(fetchEmployees());
  }, [dispatch]);

  useEffect(() => {
    if (!employeesLoading && employees) {
      // Calculate real stats based on employee data
      // This is mock logic - replace with actual offboarding data from API
      const activeCount = employees.filter(emp => emp.status === "Inactive" || emp.status === "inactive").length;
      const completedCount = employees.filter(emp => emp.status === "Completed").length;
      
      setStats({
        activeOffboarding: activeCount || 3,
        pendingTasks: 12,
        completedThisMonth: completedCount || 8,
        assetsToCollect: 5
      });

      // Mock recent offboarding data - replace with real API data
      setRecentOffboarding([
        { id: 1, name: "Khalid Al Mansouri", employeeId: "EMP-0088", department: "Operations", lastDay: "2026-06-30", status: "in-progress", step: "Visa Cancellation" },
        { id: 2, name: "Aisha bint Fahad", employeeId: "EMP-0102", department: "Human Resources", lastDay: "2026-07-15", status: "initiated", step: "Initiation" },
        { id: 3, name: "Rahul Sharma", employeeId: "EMP-0145", department: "IT", lastDay: "2026-06-20", status: "in-progress", step: "Checklist" }
      ]);
      
      setLoading(false);
    }
  }, [employees, employeesLoading]);

  const offboardingCards = [
    {
      id: "initiate",
      title: "Initiate Offboarding",
      description: "Start the offboarding process for an employee. Fill in employee details, last working day, and separation type.",
      icon: <UserPlus size={28} />,
      path: "/admin/employees/offboarding-initiation",
      color: "blue",
      bgClass: "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400",
      buttonClass: "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50",
      stats: "Start new process",
      buttonText: "Initiate Now"
    },
    {
      id: "checklist",
      title: "Offboarding Checklist",
      description: "Create and manage offboarding checklists. Assign tasks to departments like HR, IT, Finance, and PRO.",
      icon: <ClipboardList size={28} />,
      path: "/admin/employees/offboarding-checklist-manager",
      color: "green",
      bgClass: "bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400",
      buttonClass: "bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/50",
      stats: `${stats.pendingTasks} pending tasks`,
      buttonText: "Manage Checklist"
    },
  ];

  const quickStats = [
    { 
      label: "Active Offboarding", 
      value: stats.activeOffboarding, 
      icon: <Briefcase size={20} />, 
      color: "blue",
      bgClass: "bg-blue-100 dark:bg-blue-900/30",
      textClass: "text-blue-600 dark:text-blue-400"
    },
    { 
      label: "Pending Tasks", 
      value: stats.pendingTasks, 
      icon: <Clock size={20} />, 
      color: "orange",
      bgClass: "bg-orange-100 dark:bg-orange-900/30",
      textClass: "text-orange-600 dark:text-orange-400"
    },
    { 
      label: "Completed (Month)", 
      value: stats.completedThisMonth, 
      icon: <CheckCircle2 size={20} />, 
      color: "green",
      bgClass: "bg-green-100 dark:bg-green-900/30",
      textClass: "text-green-600 dark:text-green-400"
    },
    { 
      label: "Assets Pending", 
      value: stats.assetsToCollect, 
      icon: <Laptop size={20} />, 
      color: "purple",
      bgClass: "bg-purple-100 dark:bg-purple-900/30",
      textClass: "text-purple-600 dark:text-purple-400"
    }
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case "initiated": return "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400";
      case "in-progress": return "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400";
      case "completed": return "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400";
      default: return "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400";
    }
  };

  const getStepIcon = (step) => {
    switch(step) {
      case "Initiation": return <UserPlus size={14} />;
      case "Visa Cancellation": return <ShieldCheck size={14} />;
      case "Checklist": return <ClipboardList size={14} />;
      default: return <Timer size={14} />;
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Not set';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="w-full overflow-x-hidden">
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-hidden">

        
      {/* Stats Cards */}
      <div className="stats-grid grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-5 mb-6">
        {quickStats.map((stat, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl p-3 md:p-5 border border-gray-200 dark:border-gray-700 transition-all hover:-translate-y-0.5 hover:shadow-soft"
          >
            <div className="flex justify-between items-start mb-2 md:mb-3">
              <div className={`w-10 h-10 md:w-12 md:h-12 ${stat.bgClass} rounded-xl flex items-center justify-center`}>
                {stat.icon}
              </div>
              <span className={`text-2xl md:text-3xl font-extrabold ${stat.textClass}`}>
                {stat.value}
              </span>
            </div>
            <div className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 font-medium mt-1">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
      {/* Page Header */}
      <div className="mb-6">
        <h2 className="text-lg md:text-2xl font-bold gradient-heading bg-clip-text text-transparent">
          Offboarding
        </h2>
      </div>


      {/* Main Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-8">
        {offboardingCards.map((card) => (
          <div
            key={card.id}
            className="group relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-soft transition-all duration-300 hover:-translate-y-1 cursor-pointer"
            onClick={() => navigate(card.path)}
          >
            <div className="p-4 md:p-6">
              {/* Icon */}
              <div className={`w-12 h-12 md:w-14 md:h-14 ${card.bgClass} rounded-xl flex items-center justify-center mb-3 md:mb-4`}>
                {card.icon}
              </div>
              
              {/* Title & Description */}
              <h3 className="text-base md:text-xl font-bold text-gray-900 dark:text-white mb-1 md:mb-2">
                {card.title}
              </h3>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-3 md:mb-4">
                {card.description}
              </p>
              
              {/* Stats Badge */}
              <div className="flex items-center justify-between mt-3 md:mt-4 pt-3 md:pt-4 border-t border-gray-100 dark:border-gray-700">
                <span className="text-[10px] md:text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  {card.stats}
                </span>
                <button 
                  className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg ${card.buttonClass} font-semibold text-xs md:text-sm flex items-center gap-1 md:gap-2 transition-all group-hover:gap-2 md:group-hover:gap-3`}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(card.path);
                  }}
                >
                  {card.buttonText}
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Offboarding Section */}
      {/* <div className="mt-6 md:mt-8">
        <div className="flex flex-wrap justify-between items-center mb-4 md:mb-5">
          <h2 className="text-sm md:text-base font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <FileText size={18} className="text-gray-500" />
            Recent Offboarding Requests
          </h2>
          <button 
            onClick={() => navigate("/admin/employees/offboarding-initiation")}
            className="text-xs md:text-sm font-semibold text-green-600 dark:text-green-400 hover:text-green-700 flex items-center gap-1"
          >
            View all
            <ArrowRight size={12} />
          </button>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto shadow-soft">
          <div className="min-w-[800px] md:min-w-0">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                  <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Sl.No.</th>
                  <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Employee</th>
                  <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Department</th>
                  <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Last Working Day</th>
                  <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Current Step</th>
                  <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Status</th>
                  <th className="px-3 md:px-4 py-2 md:py-3 text-right text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400">Action</th>
                </tr>
              </thead>
              <tbody>
                {recentOffboarding.length > 0 ? (
                  recentOffboarding.map((item, idx) => (
                    <tr key={item.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 text-center">
                        {idx + 1}
                      </td>
                      <td className="px-3 md:px-4 py-2 md:py-3">
                        <div>
                          <p className="text-xs md:text-sm font-semibold text-gray-800 dark:text-gray-200">{item.name}</p>
                          <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400">{item.employeeId}</p>
                        </div>
                      </td>
                      <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 dark:text-gray-400">
                        {item.department}
                      </td>
                      <td className="px-3 md:px-4 py-2 md:py-3">
                        <div className="flex items-center gap-1 md:gap-2">
                          <Calendar size={12} className="text-gray-400" />
                          <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                            {formatDate(item.lastDay)}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 md:px-4 py-2 md:py-3">
                        <div className="flex items-center gap-1 md:gap-2">
                          {getStepIcon(item.step)}
                          <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                            {item.step}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 md:px-4 py-2 md:py-3">
                        <span className={`inline-flex px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-semibold ${getStatusColor(item.status)} whitespace-nowrap`}>
                          {item.status === "initiated" ? "Initiated" : "In Progress"}
                        </span>
                      </td>
                      <td className="px-3 md:px-4 py-2 md:py-3 text-right">
                        <button
                          onClick={() => {
                            if (item.step === "Initiation") {
                              navigate("/admin/employees/offboarding-initiation");
                            } else if (item.step === "Visa Cancellation") {
                              navigate("/admin/employees/visa-cancellation");
                            } else if (item.step === "Checklist") {
                              navigate("/admin/employees/offboarding-checklist");
                            }
                          }}
                          className="text-xs md:text-sm font-semibold text-green-600 dark:text-green-400 hover:text-green-700 flex items-center gap-1 ml-auto"
                        >
                          Continue
                          <ArrowRight size={12} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      No offboarding requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div> */}

      {/* Quick Tips Section */}
      <div className="mt-6 p-3 md:p-4 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-100 dark:border-blue-900/50">
        <div className="flex items-start gap-2 md:gap-3">
          <ShieldCheck size={18} className="text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h4 className="text-xs md:text-sm font-bold text-blue-900 dark:text-blue-300">Offboarding Best Practices</h4>
            <p className="text-[10px] md:text-xs text-blue-700 dark:text-blue-400 mt-1">
              Ensure all checklists are completed before final settlement. Assets must be returned and visa cancelled within 30 days of last working day as per UAE labor law.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OffboardingDashboard;