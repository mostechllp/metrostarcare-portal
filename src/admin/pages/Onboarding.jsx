import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { 
  UserPlus, FileText, CheckCircle2, Clock, AlertCircle, 
  Users, Briefcase, Calendar, ShieldCheck, ArrowRight,
  PlusCircle, UserCheck, Upload, Award, Building2
} from "lucide-react";
import { showToast } from "../../components/common/Toast";
import { fetchEmployees } from "../store/slices/employeeSlice";

const OnboardingDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // State for statistics
  const [stats, setStats] = useState({
    activeOnboarding: 0,
    pendingTasks: 0,
    completedThisMonth: 0,
    pendingDocuments: 0
  });

  const [recentOnboarding, setRecentOnboarding] = useState([]);
  const [loading, setLoading] = useState(true);

  // Redux state
  const { employees, loading: employeesLoading } = useSelector((state) => state.employees);

  useEffect(() => {
    dispatch(fetchEmployees());
  }, [dispatch]);

  useEffect(() => {
    if (!employeesLoading && employees) {
      // Calculate real stats based on employee data
      const onboardingCount = employees.filter(emp => 
        emp.status === "Onboarding" || emp.status === "onboarding"
      ).length;
      
      const completedCount = employees.filter(emp => 
        emp.status === "Active" || emp.status === "active"
      ).length;
      
      setStats({
        activeOnboarding: onboardingCount || 2,
        pendingTasks: 8,
        completedThisMonth: completedCount || 5,
        pendingDocuments: 3
      });

      // Mock recent onboarding data - replace with real API data
      setRecentOnboarding([
        { id: 1, name: "Ahmed Al Qasimi", employeeId: "EMP-0105", department: "Sales", joiningDate: "2026-07-01", status: "in-progress", step: "Document Upload" },
        { id: 2, name: "Fatima Al Zaabi", employeeId: "EMP-0106", department: "Marketing", joiningDate: "2026-07-05", status: "initiated", step: "Initiation" },
        { id: 3, name: "David Chen", employeeId: "EMP-0107", department: "Product", joiningDate: "2026-06-28", status: "in-progress", step: "Visa Processing" },
        { id: 4, name: "Sarah Johnson", employeeId: "EMP-0108", department: "Finance", joiningDate: "2026-07-10", status: "initiated", step: "Initiation" }
      ]);
      
      setLoading(false);
    }
  }, [employees, employeesLoading]);

  const onboardingCards = [
    {
      id: "initiate",
      title: "Initiate Onboarding",
      description: "Start the onboarding process for a new employee. Fill in personal details, job information, and visa requirements.",
      icon: <UserPlus size={28} />,
      path: "/admin/employees/onboarding-initiation",
      color: "blue",
      bgClass: "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400",
      buttonClass: "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50",
      stats: "Start new process",
      buttonText: "Initiate Now"
    },
    {
      id: "addEmployee",
      title: "Add Employee",
      description: "Manually add employee details including personal information, contact details, and employment terms.",
      icon: <PlusCircle size={28} />,
      path: "/admin/employees/add-employee",
      color: "purple",
      bgClass: "bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400",
      buttonClass: "bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/50",
      stats: "Manual entry",
      buttonText: "Add Employee"
    }
  ];

  const quickStats = [
    { 
      label: "Active Onboarding", 
      value: stats.activeOnboarding, 
      icon: <Users size={20} />, 
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
      label: "Documents Pending", 
      value: stats.pendingDocuments, 
      icon: <FileText size={20} />, 
      color: "red",
      bgClass: "bg-red-100 dark:bg-red-900/30",
      textClass: "text-red-600 dark:text-red-400"
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
      case "Document Upload": return <FileText size={14} />;
      case "Visa Processing": return <ShieldCheck size={14} />;
      case "IT Setup": return <Award size={14} />;
      default: return <Clock size={14} />;
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
          Onboarding
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage employee onboarding process, document collection, and orientation
        </p>
      </div>

      {/* Main Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-8">
        {onboardingCards.map((card) => (
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


      {/* Quick Tips Section */}
      <div className="mt-6 p-3 md:p-4 bg-green-50 dark:bg-green-950/30 rounded-xl border border-green-100 dark:border-green-900/50">
        <div className="flex items-start gap-2 md:gap-3">
          <Building2 size={18} className="text-green-600 dark:text-green-400 mt-0.5" />
          <div>
            <h4 className="text-xs md:text-sm font-bold text-green-900 dark:text-green-300">Onboarding Best Practices</h4>
            <p className="text-[10px] md:text-xs text-green-700 dark:text-green-400 mt-1">
              Ensure all documents are collected before joining date. Complete visa processing at least 2 weeks prior to start date. Schedule orientation and IT setup in advance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingDashboard;