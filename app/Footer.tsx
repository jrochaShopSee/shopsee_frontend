import Link from "next/link";
import React from "react";

export const Footer = () => {
  const newDate = new Date();

  return (
    <footer className="mt-auto bg-gray-800 text-white py-4">
      <div className="container mx-auto text-center text-sm">
        <p>
          © {newDate.getFullYear()} ShopSee, Inc. |{" "}
          <Link
            href="/terms"
            className="text-white-400 hover:text-blue-500 underline"
          >
            Terms of Use
          </Link>{" "}
          |{" "}
          <Link
            href="/privacy"
            className="text-white-400 hover:text-blue-500 underline"
          >
            Privacy Policy
          </Link>
        </p>
      </div>
    </footer>
  );
};
