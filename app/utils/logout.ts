import axiosClient from "./axiosClient";

const deleteCookie = (name: string) => {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

export const logout = async () => {
    try {
        // Clear client-side JWT cookie if it exists
        deleteCookie("access_token");

        // Call backend to clear server-side session and cookies
        await axiosClient.post("/api/members/logout");

        // Redirect to home page
        window.location.href = "/";
    } catch (error) {
        console.error("Logout error:", error);
        // Even if the API call fails, clear cookies and redirect
        deleteCookie("access_token");
        window.location.href = "/";
    }
};
