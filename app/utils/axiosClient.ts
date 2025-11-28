import axios from "axios";
import { rootUrl } from "./host";
const axiosClient = axios.create({
    baseURL: rootUrl,
    timeout: 20000,
});

const getCookie = (name: string): string | null => {
    if (typeof document === "undefined") return null;

    const nameEQ = name + "=";
    const ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === " ") c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
};

axiosClient.interceptors.request.use(
    (config) => {
        const token = getCookie("access_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        config.headers["ngrok-skip-browser-warning"] = "true";

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        }
        return Promise.reject(error);
    }
);

export default axiosClient;
