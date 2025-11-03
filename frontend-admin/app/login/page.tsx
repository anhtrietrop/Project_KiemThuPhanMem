"use client";
import { CustomButton, SectionTitle } from "@/components";
import { isValidEmailAddressFormat } from "@/lib/utils";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

// A loading component to show while session status is being determined
const FullPageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-blue-900 text-white text-xl">
    Loading...
  </div>
);

const LoginPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const { data: session, status: sessionStatus } = useSession();

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam === 'unauthorized') {
      toast.error("Access denied. Admin account required.");
    }

    const expiredParam = searchParams.get('expired');
    if (expiredParam === 'true') {
      toast.error("Your session has expired. Please log in again.");
    }
  }, [searchParams]);

  useEffect(() => {
    // This effect handles redirection based on authentication status
    const userRole = (session?.user as any)?.role;
    if (sessionStatus === "authenticated" && userRole === "admin") {
      // If an admin is already logged in, redirect them to the dashboard.
      router.replace("/admin");
    } else if (sessionStatus === "authenticated") {
      // If a non-admin user is somehow authenticated on the admin portal,
      // they should be redirected away. The middleware should also handle this,
      // but this is a good client-side fallback.
      router.replace('/unauthorized'); // Or sign them out
    }
  }, [sessionStatus, session, router]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const email = e.target[0].value;
    const password = e.target[1].value;

    if (!isValidEmailAddressFormat(email)) {
      setError("Email is invalid");
      toast.error("Email is invalid");
      return;
    }

    if (!password || password.length < 8) {
      setError("Password is invalid");
      toast.error("Password is invalid");
      return;
    }

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setError("Invalid email or password");
      toast.error(res.error);
    } else {
      setError("");
      toast.success("Login successful! Redirecting...");
      // Use router.push for a smoother, client-side navigation
      // The middleware will ensure only admins can access the target page.
      router.push("/admin");
    }
  };

  if (sessionStatus === "loading") {
    // Show a loader while checking the session to prevent screen flicker
    return <FullPageLoader />;
  }
  return (
    <div className="bg-blue-900 min-h-screen">
      <SectionTitle title="Admin Login" path="Admin | Login" />
      <div className="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8 bg-blue-900">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-white">
            Admin Panel
          </h2>
          <p className="mt-2 text-center text-sm text-gray-300">
            Sign in with your admin account
          </p>
        </div>

        <div className="mt-5 sm:mx-auto sm:w-full sm:max-w-[480px]">
          <div className="bg-blue-800 px-6 py-12 shadow sm:rounded-lg sm:px-12">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium leading-6 text-white"
                >
                  Email address
                </label>
                <div className="mt-2">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium leading-6 text-white"
                >
                  Password
                </label>
                <div className="mt-2">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-3 block text-sm leading-6 text-white"
                  >
                    Remember me
                  </label>
                </div>

                <div className="text-sm leading-6">
                  <a
                    href="#"
                    className="font-semibold text-white hover:text-gray-300"
                  >
                    Forgot password?
                  </a>
                </div>
              </div>

              <div>
                <CustomButton
                  buttonType="submit"
                  text="Sign in"
                  paddingX={3}
                  paddingY={1.5}
                  customWidth="full"
                  textSize="sm"
                />
              </div>
            </form>

            <p className="text-red-600 text-center text-[16px] my-4">
              {error && error}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
