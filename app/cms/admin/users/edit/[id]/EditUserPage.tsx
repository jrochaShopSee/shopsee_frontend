"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { Label } from "@/app/components/ui/Label";
import { LoadingSpinner } from "@/app/components/shared/LoadingSpinner";
import { toast } from "react-toastify";
import { adminUsersApi, UpdateAdminUserRequest, AdminUserDetails, UpdateUserCapabilitiesRequest } from "@/app/services/adminUsersApi";
import { ArrowLeft, UserPen, Save, Eye, EyeOff } from "lucide-react";

interface EditUserPageProps {
    id: string;
}

const EditUserPage: React.FC<EditUserPageProps> = ({ id }) => {
    const router = useRouter();
    const { isAdmin, isLoading: authLoading } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [savingCapabilities, setSavingCapabilities] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [user, setUser] = useState<AdminUserDetails | null>(null);
    const [formData, setFormData] = useState<UpdateAdminUserRequest>({
        id: parseInt(id),
        email: "",
        displayName: "",
        userName: "",
        firstName: "",
        lastName: "",
        password: "",
        confirmPassword: "",
        role: "",
        question: "",
        response: "",
        dateOfBirth: "",
        country: 0,
        phone: ""
    });
    const [capabilities, setCapabilities] = useState<number[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [countries, setCountries] = useState<Array<{ id: number; name: string; abbreviation: string; countryCallingCode: string }>>([]);

    const securityQuestions = [
        "What was the name of your first pet?",
        "What is the name of the town where you were born?",
        "What was your first car?",
        "What is your mother's maiden name?",
        "What was the name of your elementary school?",
        "What is the name of your favorite childhood friend?",
        "In what city or town did your parents meet?",
        "What was your favorite food as a child?",
        "What is the first name of the boy or girl that you first kissed?",
        "What was the make and model of your first car?"
    ];

    const roles = ["Customer", "Admin", "Sales", "Support"];
    const availableCapabilities = [
        { id: 1, name: "Can Create Videos" },
        { id: 2, name: "Can Edit Videos" },
        { id: 3, name: "Can Delete Videos" },
        { id: 4, name: "Can Manage Products" },
        { id: 5, name: "Can View Analytics" },
        { id: 6, name: "Can Export Data" },
        { id: 7, name: "Can Manage Users" },
        { id: 8, name: "Can Manage Settings" },
    ];

    // Load countries
    useEffect(() => {
        const loadCountries = async () => {
            try {
                const countriesData = await adminUsersApi.getCountries();
                setCountries(countriesData);
            } catch (err) {
                console.error("Failed to load countries:", err);
            }
        };

        loadCountries();
    }, []);

    // Load user data
    useEffect(() => {
        const loadUser = async () => {
            try {
                const userData = await adminUsersApi.getById(parseInt(id));
                setUser(userData);
                setFormData({
                    id: userData.id,
                    email: userData.email,
                    displayName: userData.displayName,
                    userName: userData.userName,
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    password: "",
                    confirmPassword: "",
                    role: userData.role,
                    question: "",  // Don't load existing question since we don't return the response for security
                    response: "",  // Response is never returned for security reasons
                    dateOfBirth: userData.dateOfBirth ? (userData.dateOfBirth.includes('T') ? userData.dateOfBirth.split('T')[0] : userData.dateOfBirth) : "",
                    country: userData.country,
                    phone: userData.phone
                });
                setCapabilities(userData.capabilities);
            } catch (err) {
                if (err instanceof Error) {
                    toast.error(err.message);
                } else {
                    toast.error("Failed to load user");
                }
                router.push("/cms/admin/users");
            } finally {
                setLoading(false);
            }
        };

        if (!authLoading && isAdmin) {
            loadUser();
        }
    }, [id, router, authLoading, isAdmin]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        
        let processedValue: string | number = value;
        if (name === "country") {
            processedValue = parseInt(value) || 0;
        }
        
        setFormData(prev => ({
            ...prev,
            [name]: processedValue
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ""
            }));
        }
    };

    const handleCapabilityChange = (capabilityId: number) => {
        setCapabilities(prev => 
            prev.includes(capabilityId)
                ? prev.filter(id => id !== capabilityId)
                : [...prev, capabilityId]
        );
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        // Required fields validation
        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Email is invalid";
        }

        if (!formData.displayName.trim()) {
            newErrors.displayName = "Display name is required";
        }

        if (!formData.userName.trim()) {
            newErrors.userName = "Username is required";
        } else if (formData.userName.length < 3 || formData.userName.length > 40) {
            newErrors.userName = "Username must be between 3 and 40 characters";
        }

        if (!formData.firstName.trim()) {
            newErrors.firstName = "First name is required";
        }

        if (!formData.lastName.trim()) {
            newErrors.lastName = "Last name is required";
        }

        // Password validation (only if password field has content)
        if (formData.password?.trim()) {
            if (formData.password.length < 6 || formData.password.length > 100) {
                newErrors.password = "Password must be between 6 and 100 characters";
            }
            if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = "Passwords do not match";
            }
        }

        // Security question and response validation (only if user is actively changing them)
        // Only validate if the user has entered something in either field
        const hasQuestionInput = formData.question && formData.question.trim() !== "";
        const hasResponseInput = formData.response && formData.response.trim() !== "";

        if (hasQuestionInput && !hasResponseInput) {
            newErrors.response = "Response is required when security question is provided";
        }
        if (hasResponseInput && !hasQuestionInput) {
            newErrors.question = "Security question is required when response is provided";
        }
        if (hasResponseInput && formData.response && (formData.response.length < 3 || formData.response.length > 40)) {
            newErrors.response = "Response must be between 3 and 40 characters";
        }

        // Date of birth is optional during edit (should already exist)

        if (!formData.country || formData.country === 0) {
            newErrors.country = "Country is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleCapabilitiesUpdate = async () => {
        setSavingCapabilities(true);
        try {
            const capabilitiesRequest: UpdateUserCapabilitiesRequest = {
                userId: parseInt(id),
                capabilities: capabilities
            };
            await adminUsersApi.updateCapabilities(parseInt(id), capabilitiesRequest);
            toast.success("User capabilities updated successfully");
        } catch (err) {
            if (err instanceof Error) {
                toast.error(err.message);
            } else {
                toast.error("Failed to update user capabilities");
            }
        } finally {
            setSavingCapabilities(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            toast.error("Please fix the errors below");
            return;
        }

        setSaving(true);
        try {
            // Prepare payload - only include password and security fields if they have values
            const payload: any = {
                id: formData.id,
                email: formData.email,
                displayName: formData.displayName,
                userName: formData.userName,
                firstName: formData.firstName,
                lastName: formData.lastName,
                role: formData.role,
                country: formData.country,
                phone: formData.phone
            };

            // Only add password fields if password is being changed
            if (formData.password?.trim()) {
                payload.password = formData.password;
                payload.confirmPassword = formData.confirmPassword;
            }

            // Only add security question fields if they are being changed
            if (formData.question?.trim() && formData.response?.trim()) {
                payload.question = formData.question;
                payload.response = formData.response;
            }

            // Only add dateOfBirth if it has a value
            if (formData.dateOfBirth && formData.dateOfBirth.trim()) {
                payload.dateOfBirth = formData.dateOfBirth;
            }

            // Update user basic info only
            await adminUsersApi.update(parseInt(id), payload);

            toast.success("User information updated successfully");
            router.push("/cms/admin/users");
        } catch (err: any) {
            // Handle backend validation errors
            if (err.response && err.response.data && err.response.data.errors) {
                const backendErrors = err.response.data.errors;
                const newErrors: Record<string, string> = {};

                // Map backend field names to frontend field names (PascalCase to camelCase)
                Object.keys(backendErrors).forEach((key) => {
                    const camelCaseKey = key.charAt(0).toLowerCase() + key.slice(1);
                    const errorMessages = backendErrors[key];
                    if (Array.isArray(errorMessages) && errorMessages.length > 0) {
                        newErrors[camelCaseKey] = errorMessages[0];
                    }
                });

                setErrors(newErrors);
                toast.error("Please fix the validation errors below");
            } else if (err instanceof Error) {
                toast.error(err.message);
            } else {
                toast.error("Failed to update user");
            }
        } finally {
            setSaving(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner />
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="p-6 max-w-4xl mx-auto">
                <div className="text-center py-12">
                    <UserPen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
                    <p className="text-gray-500">You don't have permission to access this page.</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="p-6 max-w-4xl mx-auto">
                <div className="text-center py-12">
                    <UserPen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">User not found</h3>
                    <p className="text-gray-500 mb-6">The user you're looking for doesn't exist.</p>
                    <Button onClick={() => router.push("/cms/admin/users")}>
                        Back to Users
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center mb-4">
                    <Button
                        variant="outline"
                        onClick={() => router.push("/cms/admin/users")}
                        className="mr-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                            <UserPen className="w-8 h-8 mr-3 text-purple-500" />
                            Edit User
                        </h1>
                        <p className="text-gray-600 mt-2">Update user account information and capabilities</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                    {/* General Information */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-5 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900">General Information</h2>
                        </div>
                        <div className="px-6 py-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label htmlFor="email">Email *</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className={errors.email ? "border-red-500" : ""}
                                />
                                {errors.email && (
                                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="displayName">Display Name *</Label>
                                <Input
                                    id="displayName"
                                    name="displayName"
                                    value={formData.displayName}
                                    onChange={handleInputChange}
                                    className={errors.displayName ? "border-red-500" : ""}
                                />
                                {errors.displayName && (
                                    <p className="text-red-500 text-sm mt-1">{errors.displayName}</p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="userName">Username *</Label>
                                <Input
                                    id="userName"
                                    name="userName"
                                    value={formData.userName}
                                    onChange={handleInputChange}
                                    className={errors.userName ? "border-red-500" : ""}
                                />
                                {errors.userName && (
                                    <p className="text-red-500 text-sm mt-1">{errors.userName}</p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="role">Role</Label>
                                <select
                                    id="role"
                                    name="role"
                                    value={formData.role}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                >
                                    {roles.map(role => (
                                        <option key={role} value={role}>{role}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <Label htmlFor="firstName">First Name *</Label>
                                <Input
                                    id="firstName"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    className={errors.firstName ? "border-red-500" : ""}
                                />
                                {errors.firstName && (
                                    <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="lastName">Last Name *</Label>
                                <Input
                                    id="lastName"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    className={errors.lastName ? "border-red-500" : ""}
                                />
                                {errors.lastName && (
                                    <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div>
                                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                                <Input
                                    id="dateOfBirth"
                                    name="dateOfBirth"
                                    type="date"
                                    value={formData.dateOfBirth}
                                    onChange={handleInputChange}
                                    className={errors.dateOfBirth ? "border-red-500" : ""}
                                />
                                {errors.dateOfBirth && (
                                    <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="country">Country *</Label>
                                <select
                                    id="country"
                                    name="country"
                                    value={formData.country}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                                        errors.country ? "border-red-500" : "border-gray-300"
                                    }`}
                                >
                                    <option value={0}>Select a country</option>
                                    {countries.map((country) => (
                                        <option key={country.id} value={country.id}>
                                            {country.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.country && (
                                    <p className="text-red-500 text-sm mt-1">{errors.country}</p>
                                )}
                            </div>
                        </div>
                        </div>
                    </div>

                    {/* Password (Optional) */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-orange-50 to-amber-50 px-6 py-5 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900">Change Password</h2>
                        </div>
                        <div className="px-6 py-6">
                            <p className="text-sm text-gray-600 mb-4">Leave blank to keep current password</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label htmlFor="password">New Password</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className={errors.password ? "border-red-500 pr-10" : "pr-10"}
                                        placeholder="Enter new password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                <div className="relative">
                                    <Input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        className={errors.confirmPassword ? "border-red-500 pr-10" : "pr-10"}
                                        placeholder="Confirm new password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {errors.confirmPassword && (
                                    <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                                )}
                            </div>
                        </div>
                        </div>
                    </div>

                    {/* Security */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-purple-50 to-violet-50 px-6 py-5 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900">Security Question</h2>
                        </div>
                        <div className="px-6 py-6">
                            <p className="text-sm text-gray-600 mb-4">Leave blank to keep current security question</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label htmlFor="question">Security Question</Label>
                                <select
                                    id="question"
                                    name="question"
                                    value={formData.question}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                                        errors.question ? "border-red-500" : "border-gray-300"
                                    }`}
                                >
                                    <option value="">Select a security question</option>
                                    {securityQuestions.map((question, index) => (
                                        <option key={index} value={question}>{question}</option>
                                    ))}
                                </select>
                                {errors.question && (
                                    <p className="text-red-500 text-sm mt-1">{errors.question}</p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="response">Response</Label>
                                <Input
                                    id="response"
                                    name="response"
                                    value={formData.response}
                                    onChange={handleInputChange}
                                    className={errors.response ? "border-red-500" : ""}
                                />
                                {errors.response && (
                                    <p className="text-red-500 text-sm mt-1">{errors.response}</p>
                                )}
                            </div>
                        </div>
                        </div>
                    </div>

                    {/* User Capabilities - Only show for Company and Sales roles */}
                    {(formData.role === "Company" || formData.role === "Sales") && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-5 border-b border-gray-100">
                                <h2 className="text-xl font-bold text-gray-900">User Capabilities</h2>
                            </div>
                            <div className="px-6 py-6">
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {availableCapabilities.map((capability) => (
                                        <div key={capability.id} className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                id={`capability-${capability.id}`}
                                                checked={capabilities.includes(capability.id)}
                                                onChange={() => handleCapabilityChange(capability.id)}
                                                className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                            />
                                            <Label htmlFor={`capability-${capability.id}`} className="text-sm">
                                                {capability.name}
                                            </Label>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex justify-end">
                                    <Button
                                        type="button"
                                        onClick={handleCapabilitiesUpdate}
                                        disabled={savingCapabilities}
                                        className="flex items-center space-x-2"
                                        variant="outline"
                                    >
                                        {savingCapabilities ? (
                                            <>
                                                <LoadingSpinner />
                                                <span>Saving...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4" />
                                                <span>Save Capabilities</span>
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                            </div>
                        </div>
                    )}

                    {/* Metadata */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-teal-50 to-cyan-50 px-6 py-5 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900">Account Information</h2>
                        </div>
                        <div className="px-6 py-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600">
                            <div>
                                <Label>Created</Label>
                                <p>{new Date(user.dateCreated).toLocaleString()}</p>
                            </div>
                            {user.dateModified && (
                                <div>
                                    <Label>Last Modified</Label>
                                    <p>{new Date(user.dateModified).toLocaleString()}</p>
                                </div>
                            )}
                            {user.subscriptionEndDate && (
                                <div>
                                    <Label>Subscription End Date</Label>
                                    <p>{new Date(user.subscriptionEndDate).toLocaleDateString()}</p>
                                </div>
                            )}
                        </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.push("/cms/admin/users")}
                            disabled={saving}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={saving}
                            className="flex items-center space-x-2"
                        >
                            {saving ? (
                                <>
                                    <LoadingSpinner />
                                    <span>Updating...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    <span>Update User</span>
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default EditUserPage;