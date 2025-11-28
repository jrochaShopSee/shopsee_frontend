const isLocalhost = typeof window !== "undefined" && window.location.hostname === "localhost";

// Use environment variable if available, otherwise detect from hostname
const rootUrl = process.env.NEXT_PUBLIC_API_URL || (isLocalhost ? "https://localhost:7093" : typeof window !== "undefined" ? window.location.origin : "");
/**
 * Get the public base URL for the current environment
 * - localhost:3000 -> http://localhost:3000
 * - dev.myshopsee.com -> https://dev.myshopsee.com
 * - staging.myshopsee.com -> https://staging.myshopsee.com
 * - myshopsee.com -> https://myshopsee.com
 */
const getPublicBaseUrl = (): string => {
    if (typeof window === "undefined") return "";

    const hostname = window.location.hostname;
    const protocol = window.location.protocol;

    if (hostname === "localhost") {
        return `${protocol}//${hostname}:${window.location.port}`;
    }

    return `${protocol}//${hostname}`;
};

export { rootUrl, getPublicBaseUrl };
