import React, { useState, useEffect } from "react";
import { FileText, CheckCircle, Clock, Check, Download, Loader, Plus, X, Upload } from "lucide-react";
import { showToast } from "../common/Toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import OffboardingHeader from "./OffboardingHeader";
import { fetchOffboardingById, generateLetters } from "../../store/slices/offboardingSlice";
import { fetchEmployeeById } from "../../store/slices/employeeSlice";

const LettersAndClearance = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const offboardingId = searchParams.get("id");
  
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [employeeName, setEmployeeName] = useState("");
  const [uploading, setUploading] = useState({});
  
  // Documents state - starts with resignation letter
  const [documents, setDocuments] = useState([
    {
      id: "resignation_letter",
      title: "Resignation Letter",
      document_type: "resignation_letter",
      status: "Pending",
      file: null,
      file_name: "",
      uploaded_at: null,
      required: true,
      canDelete: false
    }
  ]);

  // Redux state
  const { currentOffboarding, loading: offboardingLoading } = useSelector((state) => state.offboarding);
  const { currentEmployee } = useSelector((state) => state.employees);

  // Fetch offboarding details on component mount
  useEffect(() => {
    if (offboardingId) {
      dispatch(fetchOffboardingById(offboardingId));
    } else {
      const storedOffboardingId = localStorage.getItem("offboarding_id");
      if (storedOffboardingId) {
        dispatch(fetchOffboardingById(storedOffboardingId));
      } else {
        setLoading(false);
        showToast("No offboarding session found. Please start from initiation.", "warning");
      }
    }
  }, [dispatch, offboardingId]);

  // Load documents data from API
  useEffect(() => {
    if (currentOffboarding && !offboardingLoading) {
      // Load employee name
      if (currentOffboarding.employee_name) {
        setEmployeeName(currentOffboarding.employee_name);
      } else if (currentOffboarding.employee_id) {
        dispatch(fetchEmployeeById(currentOffboarding.employee_id));
      }
      
      // Load documents from API if available
      if (currentOffboarding.letters && currentOffboarding.letters.documents) {
        setDocuments(currentOffboarding.letters.documents);
      }
      
      setLoading(false);
    }
  }, [currentOffboarding, offboardingLoading, dispatch]);

  // Update employee name when fetched
  useEffect(() => {
    if (currentEmployee) {
      setEmployeeName(`${currentEmployee.first_name} ${currentEmployee.last_name}`);
    }
  }, [currentEmployee]);

  const pendingCount = documents.filter((doc) => doc.status === "Pending").length;

  // Add new document
  const handleAddDocument = () => {
    const newId = `doc_${Date.now()}`;
    setDocuments([
      ...documents,
      {
        id: newId,
        title: "",
        document_type: "custom",
        status: "Pending",
        file: null,
        file_name: "",
        uploaded_at: null,
        required: false,
        canDelete: true
      }
    ]);
  };

  // Remove document
  const handleRemoveDocument = (docId) => {
    setDocuments(documents.filter(doc => doc.id !== docId));
  };

  // Update document title
  const handleTitleChange = (docId, title) => {
    setDocuments(documents.map(doc => 
      doc.id === docId ? { ...doc, title } : doc
    ));
  };

  // Handle file upload
  const handleFileUpload = async (docId, file) => {
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast("File size should be less than 5MB", "error");
      return;
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      showToast("Only PDF, JPEG, PNG, DOC files are allowed", "error");
      return;
    }

    setUploading(prev => ({ ...prev, [docId]: true }));

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('document', file);
      formData.append('document_type', documents.find(d => d.id === docId)?.document_type || 'custom');
      formData.append('title', documents.find(d => d.id === docId)?.title || 'Document');

      // Upload file to temporary storage
      const uploadResponse = await fetch(`/admin/offboarding/${offboardingId}/upload-letter`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const uploadResult = await uploadResponse.json();

      if (uploadResult.status === 'success') {
        // Update local state
        setDocuments(documents.map(doc => 
          doc.id === docId ? { 
            ...doc, 
            file_name: file.name,
            file_path: uploadResult.data.file_path,
            status: "Ready",
            uploaded_at: new Date().toISOString()
          } : doc
        ));
        showToast(`${documents.find(d => d.id === docId)?.title || 'Document'} uploaded successfully`, "success");
      } else {
        showToast(uploadResult.message || "Upload failed", "error");
      }
    } catch (error) {
      console.error("Upload error:", error);
      showToast("Failed to upload document", "error");
    } finally {
      setUploading(prev => ({ ...prev, [docId]: false }));
    }
  };

  // Submit all documents
  const handleSubmitAll = async () => {
    // Validate all documents have titles and are uploaded
    const invalidDocs = documents.filter(doc => !doc.title || doc.status === "Pending");
    if (invalidDocs.length > 0) {
      showToast("Please upload all required documents and provide titles", "error");
      return;
    }

    setIsGenerating(true);
    
    try {
      // Prepare payload
      const lettersPayload = {
        documents: documents.map(doc => ({
          id: doc.id,
          title: doc.title,
          document_type: doc.document_type,
          file_path: doc.file_path,
          file_name: doc.file_name,
          uploaded_at: doc.uploaded_at,
          status: doc.status
        })),
        submitted_at: new Date().toISOString(),
        status: "completed"
      };

      // Submit all documents
      const result = await dispatch(generateLetters({ 
        id: offboardingId || localStorage.getItem("offboarding_id"), 
        lettersData: lettersPayload 
      })).unwrap();

      console.log("All documents submitted:", result);
      showToast("All documents submitted successfully", "success");
      
      setTimeout(() => {
        showToast("Offboarding process completed successfully!", "success");
        setTimeout(() => {
          navigate("/admin/employees/offboarding");
        }, 2000);
      }, 1000);
    } catch (error) {
      console.error("Submit documents error:", error);
      showToast(error || "Failed to submit documents. Please try again.", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadDocument = async (doc) => {
    if (doc.file_path) {
      window.open(doc.file_path, '_blank');
    } else {
      showToast("No file available for download", "info");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Loading state
  if (loading || offboardingLoading) {
    return (
      <div className="min-h-screen bg-gray-50/30 dark:bg-gray-900/40 p-4 sm:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <OffboardingHeader currentStep={7} />
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/80 rounded-2xl shadow-soft p-12">
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-500 dark:text-gray-400">Loading documents...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/30 dark:bg-gray-900/40 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* SaaS Offboarding Header */}
        <OffboardingHeader currentStep={7} />

        {/* Main Card */}
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/80 rounded-2xl shadow-soft p-6 sm:p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-700 pb-4 mb-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                Letters & Clearance
              </h1>
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mt-1">
                {employeeName || "Employee"}
              </p>
              {currentOffboarding && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  Offboarding ID: {currentOffboarding.id}
                </p>
              )}
            </div>
            {pendingCount > 0 && (
              <span className="px-3 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/60 rounded text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                {pendingCount} pending
              </span>
            )}
          </div>

          {/* Document List */}
          <div className="space-y-3 mb-8">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50 p-4"
              >
                <div className="flex items-center gap-3">
                  {/* Document Title Input - Takes remaining space */}
                  <div className="flex-1">
                    <input
                      type="text"
                      value={doc.title}
                      onChange={(e) => handleTitleChange(doc.id, e.target.value)}
                      placeholder="Enter document/certificate name"
                      className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                      disabled={doc.required && doc.id === "resignation_letter"}
                    />
                  </div>

                  {/* File Upload Button - Compact, right-aligned */}
                  <div className="flex items-center gap-2">
                    <label className={`cursor-pointer ${doc.status === "Ready" ? 'opacity-50' : ''}`}>
                      <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-green-500 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all">
                        {uploading[doc.id] ? (
                          <Loader size={16} className="animate-spin text-green-500" />
                        ) : (
                          <Upload size={16} className="text-gray-500" />
                        )}
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {doc.file_name ? "Change" : "Upload"}
                        </span>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            handleFileUpload(doc.id, e.target.files[0]);
                          }
                        }}
                        disabled={doc.status === "Ready" && !uploading[doc.id]}
                      />
                    </label>

                    {/* Status Badge - Compact */}
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold ${
                        doc.status === "Ready"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {doc.status === "Ready" ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : uploading[doc.id] ? (
                        <Loader className="w-3 h-3 animate-spin" />
                      ) : (
                        <Clock className="w-3 h-3" />
                      )}
                    </span>

                    {/* Download Button */}
                    {doc.status === "Ready" && doc.file_path && (
                      <button
                        onClick={() => handleDownloadDocument(doc)}
                        className="p-1.5 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                        title="Download document"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    )}

                    {/* Delete Button */}
                    {doc.canDelete && (
                      <button
                        onClick={() => handleRemoveDocument(doc.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Remove document"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>

                {/* File name and upload info - Below */}
                {doc.file_name && (
                  <div className="mt-2 pl-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {doc.file_name}
                    </p>
                    {doc.uploaded_at && (
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                        Uploaded: {formatDate(doc.uploaded_at)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add More Button */}
          <div className="mb-6">
            <button
              onClick={handleAddDocument}
              className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-gray-500 hover:border-green-500 hover:text-green-500 transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={18} />
              Add More Document / Certificate
            </button>
          </div>

          {/* Completion Progress */}
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
            <div className="flex justify-between text-xs font-bold mb-2">
              <span className="text-gray-500 dark:text-gray-400 uppercase tracking-wide">Documents Completion</span>
              <span className="text-green-600 dark:text-green-400">
                {Math.round(((documents.length - pendingCount) / documents.length) * 100)}%
              </span>
            </div>
            <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 dark:bg-green-600 transition-all duration-500 ease-out" 
                style={{ width: `${((documents.length - pendingCount) / documents.length) * 100}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {pendingCount === 0 
                ? "All documents uploaded. Ready to complete offboarding!" 
                : `${pendingCount} document(s) pending upload`}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button
              onClick={() => navigate("/admin/employees/offboarding")}
              className="px-6 py-2.5 rounded-full font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
            >
              Back to Dashboard
            </button>
            <button
              onClick={handleSubmitAll}
              disabled={isGenerating || pendingCount > 0}
              className={`px-6 py-2.5 rounded-full font-semibold transition-all flex items-center justify-center gap-2 ${
                pendingCount > 0
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-500"
                  : "bg-green-500 text-white hover:bg-green-600 shadow-sm hover:shadow-md"
              }`}
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Submitting...
                </>
              ) : pendingCount > 0 ? (
                <>
                  <Clock className="w-4 h-4" />
                  Complete Uploads First
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Complete Offboarding
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LettersAndClearance;