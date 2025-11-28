import React, { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { CountrySignUp } from "../types/getSignUpInfoProps";

import Label from "../components/shared/Label";
import { InputMask } from "@react-input/mask";
import { AccountInfoValues } from "./SignUpForm";

const AccountInfoStep = ({ countries }: { countries: CountrySignUp[] }) => {
    const [phoneMask, setPhoneMask] = useState("");
    const {
        register,
        formState: { errors },
        getValues,
    } = useFormContext<AccountInfoValues>();

    const getCountry = (selectedCountry: string): CountrySignUp | undefined => {
        return countries.find((s) => s.Id.toString() === selectedCountry);
    };

    const handleCountryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedCountry = event.target.value;
        const country = getCountry(selectedCountry);
        if (country) {
            setPhoneMask(country.PhoneMask);
            return;
        }
        setPhoneMask("");
    };

    useEffect(() => {
        const country = getValues("country");
        const selectedCountry = getCountry(country);

        if (selectedCountry) {
            setPhoneMask(selectedCountry.PhoneMask);
        }
    }, []);

    return (
        <div className="mt-4">
            <h2 className="text-xl font-bold mb-5 text-center">Account Information</h2>
            <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="firstName" label="First Name" />
                        <input {...register("firstName")} id="firstName" className={`w-full px-4 py-2 border ${errors.firstName?.message ? "border-red-500" : "border-gray-300"} rounded focus:outline-none focus:border-blue-500`} />
                        <p className="text-red-500">{errors.firstName?.message as string}</p>
                    </div>
                    <div>
                        <Label htmlFor="lastName" label="Last Name" />
                        <input {...register("lastName")} id="lastName" className={`w-full px-4 py-2 border ${errors.lastName?.message ? "border-red-500" : "border-gray-300"} rounded focus:outline-none focus:border-blue-500`} />
                        <p className="text-red-500">{errors.lastName?.message as string}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="email" label="Email" />
                        <input {...register("email")} id="email" type="email" className={`w-full px-4 py-2 border ${errors.email?.message ? "border-red-500" : "border-gray-300"} rounded focus:outline-none focus:border-blue-500`} />
                        <p className="text-red-500">{errors.email?.message as string}</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="country" label="Country" />
                        <select {...register("country")} className={`w-full px-4 py-2 border ${errors.country?.message ? "border-red-500" : "border-gray-300"} rounded focus:outline-none focus:border-blue-500`} id="country" onChange={handleCountryChange}>
                            <option value="">Select Country</option>
                            {countries.map((country) => (
                                <option key={country.Id} value={country.Id}>
                                    {country.Name}
                                </option>
                            ))}
                        </select>
                        <p className="text-red-500">{errors.country?.message as string}</p>
                    </div>
                    {phoneMask ? (
                        <div>
                            <Label htmlFor="phoneNumber" label="Phone Number" />
                            <InputMask
                                {...register("phoneNumber")}
                                id="phoneNumber"
                                mask={phoneMask}
                                replacement={{ X: /\d/ }} // Default mask
                                className={`w-full px-4 py-2 border ${errors.phoneNumber?.message ? "border-red-500" : "border-gray-300"} rounded focus:outline-none focus:border-blue-500`}
                                placeholder={phoneMask || "(XXX) XXX-XXXX"}
                            />
                            <p className="text-red-500">{errors.phoneNumber?.message as string}</p>
                        </div>
                    ) : (
                        <></>
                    )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="birthday" label="Birthday" />
                        <input {...register("birthday")} type="date" id="birthday" className={`w-full px-4 py-2 border ${errors.birthday?.message ? "border-red-500" : "border-gray-300"} rounded focus:outline-none focus:border-blue-500`} />
                        <p className="text-red-500">{errors.birthday?.message as string}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccountInfoStep;
