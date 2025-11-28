"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { Label } from "@/app/components/ui/Label";
import { LoadingSpinner } from "@/app/components/shared/LoadingSpinner";
import { toast } from "react-toastify";
import { adminUsersApi, CreateAdminUserRequest } from "@/app/services/adminUsersApi";
import { ArrowLeft, UserPlus, Save, Eye, EyeOff } from "lucide-react";
import axiosClient from "@/app/utils/axiosClient";

interface Role {
    id: number;
    name: string;
    description?: string;
}

interface Country {
    id: number;
    name: string;
    abbreviation?: string;
    countryCallingCode?: string;
}

interface SecurityQuestion {
    id: number;
    question: string;
}

interface State {
    id: number;
    name: string;
    abbreviation?: string;
}

const AddUserPage: React.FC = () => {
    const router = useRouter();
    const { isAdmin, isLoading: authLoading } = useAuth();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Dropdown data state
    const [roles, setRoles] = useState<Role[]>([]);
    const [countries, setCountries] = useState<Country[]>([]);
    const [securityQuestions, setSecurityQuestions] = useState<SecurityQuestion[]>([]);
    const [companyStates, setCompanyStates] = useState<State[]>([]);
    const [dataLoading, setDataLoading] = useState(true);

    const [formData, setFormData] = useState<CreateAdminUserRequest>({
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
        subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 30 days from now
        company: {
            name: "",
            website: "",
            address: {
                firstName: "",
                lastName: "",
                company: "",
                streetAddress: "",
                streetAddress2: "",
                city: "",
                state: "",
                zip: "",
                country: "",
                phone: "",
                email: "",
            },
        },
        currency: 1,
        country: 0,
        phone: "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Determine which sections to show based on role
    const selectedRole = formData.role;
    const showCompanySection = selectedRole !== "Customer" && selectedRole !== "";
    const showSubscriptionSection = selectedRole === "Company";

    // Fetch dropdown data on mount
    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                setDataLoading(true);
                const [rolesRes, countriesRes, questionsRes] = await Promise.all([
                    axiosClient.get<{ status: string; data: Role[] }>("/api/AdminUsers/roles"),
                    axiosClient.get<{ status: string; data: Country[] }>("/api/AdminUsers/countries"),
                    axiosClient.get<{ status: string; data: SecurityQuestion[] }>("/api/AdminUsers/security-questions"),
                ]);

                setRoles(rolesRes.data.data || []);
                setCountries(countriesRes.data.data || []);
                setSecurityQuestions(questionsRes.data.data || []);

                // Set default role if available
                if (rolesRes.data.data && rolesRes.data.data.length > 0) {
                    const customerRole = rolesRes.data.data.find((r) => r.name === "Customer");
                    if (customerRole) {
                        setFormData((prev) => ({ ...prev, role: customerRole.name }));
                    }
                }
            } catch (error) {
                console.error("Failed to fetch dropdown data:", error);
                toast.error("Failed to load form data");
            } finally {
                setDataLoading(false);
            }
        };

        fetchDropdownData();
    }, []);

    // Fetch company states when company country changes
    useEffect(() => {
        const fetchCompanyStates = async () => {
            const countryId = formData.company.address.country ? parseInt(formData.company.address.country) : 0;
            if (countryId > 0) {
                try {
                    const response = await axiosClient.get<{ status: string; data: State[] }>(`/api/AdminUsers/states/${countryId}`);
                    setCompanyStates(response.data.data || []);
                } catch (error) {
                    console.error("Failed to fetch states:", error);
                    setCompanyStates([]);
                }
            } else {
                setCompanyStates([]);
            }
        };

        fetchCompanyStates();
    }, [formData.company.address.country]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        if (name.startsWith("company.address.")) {
            const addressField = name.split(".")[2];
            setFormData((prev) => ({
                ...prev,
                company: {
                    ...prev.company,
                    address: {
                        ...prev.company.address,
                        [addressField]: value,
                    },
                },
            }));
        } else if (name.startsWith("company.")) {
            const companyField = name.split(".")[1];
            setFormData((prev) => ({
                ...prev,
                company: {
                    ...prev.company,
                    [companyField]: value,
                },
            }));
        } else {
            let processedValue: string | number = value;
            if (name === "country" || name === "currency") {
                processedValue = parseInt(value) || 0;
            }

            setFormData((prev) => ({
                ...prev,
                [name]: processedValue,
            }));
        }

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }
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

        if (!formData.password) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 6 || formData.password.length > 100) {
            newErrors.password = "Password must be between 6 and 100 characters";
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = "Confirm password is required";
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        if (!formData.question) {
            newErrors.question = "Security question is required";
        }

        if (!formData.response.trim()) {
            newErrors.response = "Security question response is required";
        } else if (formData.response.length < 3 || formData.response.length > 40) {
            newErrors.response = "Response must be between 3 and 40 characters";
        }

        if (!formData.dateOfBirth) {
            newErrors.dateOfBirth = "Date of birth is required";
        }

        // Subscription validation - only required for Company role
        if (selectedRole === "Company") {
            if (!formData.subscriptionEndDate) {
                newErrors.subscriptionEndDate = "Subscription end date is required";
            }

            if (!formData.country || formData.country === 0) {
                newErrors.country = "Country is required";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error("Please fix the errors below");
            return;
        }

        setLoading(true);
        try {
            // Populate address firstName/lastName from user info if not set
            const payload = {
                ...formData,
                company: {
                    ...formData.company,
                    address: {
                        ...formData.company.address,
                        firstName: formData.company.address.firstName || formData.firstName,
                        lastName: formData.company.address.lastName || formData.lastName,
                        company: formData.company.address.company || formData.company.name,
                    }
                }
            };

            await adminUsersApi.create(payload);
            toast.success("User created successfully");
            router.push("/cms/admin/users");
        } catch (err) {
            if (err instanceof Error) {
                toast.error(err.message);
            } else {
                toast.error("Failed to create user");
            }
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || dataLoading) {
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
                    <UserPlus className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
                    <p className="text-gray-500">You don't have permission to access this page.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center mb-4">
                    <Button variant="outline" onClick={() => router.push("/cms/admin/users")} className="mr-4">
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                            <UserPlus className="w-8 h-8 mr-3 text-purple-500" />
                            Add New User
                        </h1>
                        <p className="text-gray-600 mt-2">Create a new user account</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                    {/* Basic Information */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-5 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900">Basic Information</h2>
                        </div>
                        <div className="px-6 py-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <Label htmlFor="email">Email *</Label>
                                    <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} className={errors.email ? "border-red-500" : ""} placeholder="user@example.com" />
                                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="displayName">Display Name *</Label>
                                    <Input id="displayName" name="displayName" value={formData.displayName} onChange={handleInputChange} className={errors.displayName ? "border-red-500" : ""} placeholder="John Doe" />
                                    {errors.displayName && <p className="text-red-500 text-sm mt-1">{errors.displayName}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="userName">Username *</Label>
                                    <Input id="userName" name="userName" value={formData.userName} onChange={handleInputChange} className={errors.userName ? "border-red-500" : ""} placeholder="johndoe" />
                                    {errors.userName && <p className="text-red-500 text-sm mt-1">{errors.userName}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="role">Role</Label>
                                    <select id="role" name="role" value={formData.role} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                                        {roles.length === 0 ? (
                                            <option value="">Loading roles...</option>
                                        ) : (
                                            roles.map((role) => (
                                                <option key={role.id} value={role.name}>
                                                    {role.name}
                                                </option>
                                            ))
                                        )}
                                    </select>
                                </div>
                                <div>
                                    <Label htmlFor="firstName">First Name *</Label>
                                    <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} className={errors.firstName ? "border-red-500" : ""} placeholder="John" />
                                    {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="lastName">Last Name *</Label>
                                    <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} className={errors.lastName ? "border-red-500" : ""} placeholder="Doe" />
                                    {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} placeholder="+1 (555) 123-4567" />
                                </div>
                                <div>
                                    <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                                    <Input id="dateOfBirth" name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleInputChange} className={errors.dateOfBirth ? "border-red-500" : ""} />
                                    {errors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Password */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-orange-50 to-amber-50 px-6 py-5 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900">Password</h2>
                        </div>
                        <div className="px-6 py-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <Label htmlFor="password">Password *</Label>
                                    <div className="relative">
                                        <Input id="password" name="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={handleInputChange} className={errors.password ? "border-red-500 pr-10" : "pr-10"} placeholder="Enter password" />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700">
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                                    <div className="relative">
                                        <Input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? "text" : "password"} value={formData.confirmPassword} onChange={handleInputChange} className={errors.confirmPassword ? "border-red-500 pr-10" : "pr-10"} placeholder="Confirm password" />
                                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700">
                                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <Label htmlFor="question">Security Question *</Label>
                                    <select id="question" name="question" value={formData.question} onChange={handleInputChange} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${errors.question ? "border-red-500" : "border-gray-300"}`}>
                                        <option value="">Select a security question</option>
                                        {securityQuestions.map((question) => (
                                            <option key={question.id} value={question.question}>
                                                {question.question}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.question && <p className="text-red-500 text-sm mt-1">{errors.question}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="response">Response *</Label>
                                    <Input id="response" name="response" value={formData.response} onChange={handleInputChange} className={errors.response ? "border-red-500" : ""} placeholder="Your answer" />
                                    {errors.response && <p className="text-red-500 text-sm mt-1">{errors.response}</p>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Subscription - Only for Company role */}
                    {showSubscriptionSection && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-emerald-50 to-green-50 px-6 py-5 border-b border-gray-100">
                                <h2 className="text-xl font-bold text-gray-900">Subscription</h2>
                            </div>
                            <div className="px-6 py-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <Label htmlFor="subscriptionEndDate">Subscription End Date *</Label>
                                        <Input id="subscriptionEndDate" name="subscriptionEndDate" type="date" value={formData.subscriptionEndDate} onChange={handleInputChange} className={errors.subscriptionEndDate ? "border-red-500" : ""} />
                                        {errors.subscriptionEndDate && <p className="text-red-500 text-sm mt-1">{errors.subscriptionEndDate}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="country">Country *</Label>
                                        <select id="country" name="country" value={formData.country} onChange={handleInputChange} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${errors.country ? "border-red-500" : "border-gray-300"}`}>
                                            <option value={0}>Select a country</option>
                                            {countries.map((country) => (
                                                <option key={country.id} value={country.id}>
                                                    {country.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Company Information - Show for all roles except Customer */}
                    {showCompanySection && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-teal-50 to-cyan-50 px-6 py-5 border-b border-gray-100">
                                <h2 className="text-xl font-bold text-gray-900">Company Information</h2>
                            </div>
                        <div className="px-6 py-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <Label htmlFor="company.name">Company Name</Label>
                                    <Input id="company.name" name="company.name" value={formData.company.name} onChange={handleInputChange} placeholder="Acme Inc." />
                                </div>
                                <div>
                                    <Label htmlFor="company.website">Website</Label>
                                    <Input id="company.website" name="company.website" type="url" value={formData.company.website} onChange={handleInputChange} placeholder="https://www.acme.com" />
                                </div>
                                <div className="md:col-span-2">
                                    <Label htmlFor="company.address.streetAddress">Street Address</Label>
                                    <Input id="company.address.streetAddress" name="company.address.streetAddress" value={formData.company.address.streetAddress} onChange={handleInputChange} placeholder="123 Main St" />
                                </div>
                                <div className="md:col-span-2">
                                    <Label htmlFor="company.address.streetAddress2">Suite/Apt/Unit (Optional)</Label>
                                    <Input id="company.address.streetAddress2" name="company.address.streetAddress2" value={formData.company.address.streetAddress2} onChange={handleInputChange} placeholder="Suite 100" />
                                </div>
                                <div>
                                    <Label htmlFor="company.address.city">City</Label>
                                    <Input id="company.address.city" name="company.address.city" value={formData.company.address.city} onChange={handleInputChange} placeholder="New York" />
                                </div>
                                <div>
                                    <Label htmlFor="company.address.country">Country</Label>
                                    <select id="company.address.country" name="company.address.country" value={formData.company.address.country} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                                        <option value="">Select a country</option>
                                        {countries.map((country) => (
                                            <option key={country.id} value={country.id}>
                                                {country.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <Label htmlFor="company.address.state">State/Province</Label>
                                    {companyStates.length > 0 ? (
                                        <select id="company.address.state" name="company.address.state" value={formData.company.address.state} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                                            <option value="">Select a state</option>
                                            {companyStates.map((state) => (
                                                <option key={state.id} value={state.abbreviation || state.name}>
                                                    {state.name}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <Input id="company.address.state" name="company.address.state" value={formData.company.address.state} onChange={handleInputChange} placeholder={formData.company.address.country ? "No states available" : "Select country first"} disabled={!formData.company.address.country} />
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="company.address.zip">Postal Code</Label>
                                    <Input id="company.address.zip" name="company.address.zip" value={formData.company.address.zip} onChange={handleInputChange} placeholder="10001" />
                                </div>
                                <div>
                                    <Label htmlFor="company.address.phone">Company Phone</Label>
                                    <Input id="company.address.phone" name="company.address.phone" type="tel" value={formData.company.address.phone} onChange={handleInputChange} placeholder="+1 (555) 123-4567" />
                                </div>
                                <div>
                                    <Label htmlFor="company.address.email">Company Email</Label>
                                    <Input id="company.address.email" name="company.address.email" type="email" value={formData.company.address.email} onChange={handleInputChange} placeholder="info@acme.com" />
                                </div>
                            </div>
                        </div>
                    </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end space-x-4">
                        <Button type="button" variant="outline" onClick={() => router.push("/cms/admin/users")} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading} className="flex items-center space-x-2">
                            {loading ? (
                                <>
                                    <LoadingSpinner />
                                    <span>Creating...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    <span>Create User</span>
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default AddUserPage;
