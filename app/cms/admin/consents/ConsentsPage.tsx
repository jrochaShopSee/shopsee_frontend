"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { LoadingSpinner } from "@/app/components/shared/LoadingSpinner";
import { toast } from "react-toastify";
import { AdminConsentsApi } from "@/app/services/adminConsentsApi";
import { Consent } from "@/app/types/Consent";
import ConfirmationModal from "@/app/components/shared/ConfirmationModal";
import { useAuth } from "@/app/hooks/useAuth";
import {
  FileText,
  Download,
  Send,
  Trash2,
  AlertTriangle,
  X,
} from "lucide-react";

const ConsentsPage: React.FC = () => {
  const router = useRouter();
  const { canAddConsentVideo, isAdmin, isLoading: authLoading } = useAuth();
  const [consents, setConsents] = useState<Consent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Resend modal state
  const [showResendModal, setShowResendModal] = useState(false);
  const [selectedEnvelopeId, setSelectedEnvelopeId] = useState<string>("");
  const [emailInput, setEmailInput] = useState("");
  const [emailError, setEmailError] = useState("");
  const [resending, setResending] = useState(false);

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "warning" | "danger" | "info" | "success";
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "warning",
    onConfirm: () => {},
  });

  // Check capability and redirect if needed
  useEffect(() => {
    if (authLoading) return;

    // Redirect if user doesn't have consent capability and is not admin
    if (!isAdmin && !canAddConsentVideo) {
      toast.error("You don't have permission to access this page");
      router.push("/cms/home");
      return;
    }
  }, [authLoading, canAddConsentVideo, isAdmin, router]);

  // Load consents
  const loadConsents = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await AdminConsentsApi.getAll();
      setConsents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load consents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!isAdmin && !canAddConsentVideo) return; // Don't load if unauthorized

    loadConsents();
  }, [authLoading, canAddConsentVideo, isAdmin]);

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  };

  // Handle download
  const handleDownload = async (
    envelopeId: string,
    videoName: string,
    signature: string
  ) => {
    setProcessingId(envelopeId);
    try {
      const blob = await AdminConsentsApi.download({ envelopeId });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${videoName}-${signature}.pdf`;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      toast.success("PDF downloaded successfully");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to download PDF"
      );
    } finally {
      setProcessingId(null);
    }
  };

  // Handle resend modal
  const openResendModal = (envelopeId: string) => {
    setSelectedEnvelopeId(envelopeId);
    setEmailInput("");
    setEmailError("");
    setShowResendModal(true);
  };

  const closeResendModal = () => {
    setShowResendModal(false);
    setSelectedEnvelopeId("");
    setEmailInput("");
    setEmailError("");
  };

  // Validate and send emails
  const handleResendSubmit = async () => {
    setEmailError("");

    if (!emailInput.trim()) {
      setEmailError("Please enter at least one email address");
      return;
    }

    // Split by comma and validate emails
    const emailArray = emailInput.split(",").map((email) => email.trim());
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validEmails = emailArray.filter((email) => emailRegex.test(email));

    if (validEmails.length === 0) {
      setEmailError("There is no valid email address informed.");
      return;
    }

    setResending(true);
    try {
      await AdminConsentsApi.resendEmail({
        envelopeId: selectedEnvelopeId,
        emails: validEmails,
      });
      toast.success(
        "You have successfully sent this document to all specified emails."
      );
      closeResendModal();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to send document"
      );
    } finally {
      setResending(false);
    }
  };

  // Handle delete
  const handleDelete = async (envelopeId: string) => {
    setProcessingId(envelopeId);
    try {
      await AdminConsentsApi.delete(envelopeId);
      toast.success("Consent deleted successfully");
      await loadConsents();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete consent");
    } finally {
      setProcessingId(null);
    }
  };

  const showDeleteConfirmation = (envelopeId: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Consent",
      message:
        "Are you sure you want to remove this consent? You will not be able to access it again, requiring the user sign this document again.",
      type: "danger",
      onConfirm: () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        handleDelete(envelopeId);
      },
    });
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-600">
          <p>{error}</p>
          <Button
            variant="outline"
            onClick={() => loadConsents()}
            className="mt-4"
          >
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Consents</h1>
        <p className="text-gray-600 mt-1">Manage signed consent documents</p>
      </div>

      {/* Consents Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Video
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Signed By
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Email
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Signature Date
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {consents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No consents found</p>
                  </td>
                </tr>
              ) : (
                consents.map((consent) => (
                  <tr
                    key={consent.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {consent.videoName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {consent.consentName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {consent.signatureEmail}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(consent.createdDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleDownload(
                            consent.consentEnvelopeId,
                            consent.videoName,
                            consent.signature
                          )
                        }
                        disabled={processingId === consent.consentEnvelopeId}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download PDF
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openResendModal(consent.consentEnvelopeId)}
                        disabled={processingId === consent.consentEnvelopeId}
                      >
                        <Send className="h-4 w-4 mr-1" />
                        Resend
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          showDeleteConfirmation(consent.consentEnvelopeId)
                        }
                        disabled={processingId === consent.consentEnvelopeId}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Resend Email Modal */}
      {showResendModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold">Send Consent PDF</h3>
              <button
                onClick={closeResendModal}
                className="text-gray-400 hover:text-gray-600"
                disabled={resending}
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Please enter at least one email or more emails to send this
                  document, if there is more than one, separate them with a
                  comma ","
                </label>
                <input
                  type="text"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="email1@example.com, email2@example.com"
                  disabled={resending}
                />
                {emailError && (
                  <p className="text-red-600 text-sm flex items-center gap-1 mt-2">
                    <AlertTriangle className="h-3 w-3" />
                    {emailError}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={closeResendModal}
                  disabled={resending}
                >
                  Cancel
                </Button>
                <Button onClick={handleResendSubmit} disabled={resending}>
                  {resending ? (
                    <>
                      <div className="inline-block h-4 w-4 mr-2 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        loading={processingId !== null}
        confirmText="Delete"
      />
    </div>
  );
};

export default ConsentsPage;