"use client";
import React, { useEffect, useState, use } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { isValidEmailAddressFormat } from "@/lib/utils";
import apiClient from "@/lib/api";

interface DashboardUserDetailsProps {
  params: Promise<{ id: string }>;
}

const DashboardSingleUserPage = ({
  params,
}: DashboardUserDetailsProps) => {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [userInput, setUserInput] = useState<{
    email: string;
    newPassword: string;
    role: string;
  }>({
    email: "",
    newPassword: "",
    role: "",
  });
  const router = useRouter();

  const [userStatus, setUserStatus] = useState<string>('active');

  const deleteUser = async () => {
    if (!confirm("Bạn có chắc chắn muốn xóa user này?")) return;

    try {
      const response = await apiClient.delete(`/api/users/${id}`);
      if (response.ok) {
        toast.success("User deleted successfully");
        router.push("/admin/users");
      } else {
        const data = await response.json();
        throw Error(data.error || "There was an error while deleting user");
      }
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "There was an error while deleting user");
    }
  };

  const toggleBlockUser = async () => {
    const newStatus = userStatus === 'active' ? 'blocked' : 'active';
    const action = newStatus === 'blocked' ? 'chặn' : 'mở chặn';

    if (!confirm(`Bạn có chắc chắn muốn ${action} user này?`)) return;

    try {
      const response = await apiClient.put(`/api/users/${id}`, { status: newStatus });
      if (response.ok) {
        setUserStatus(newStatus);
        toast.success(`Đã ${action} user thành công`);
      } else {
        const data = await response.json();
        throw Error(data.error || `Có lỗi khi ${action} user`);
      }
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Có lỗi xảy ra");
    }
  };

  const updateUser = async () => {
    if (
      userInput.email.length > 3 &&
      userInput.role.length > 0 &&
      userInput.newPassword.length > 0
    ) {
      if (!isValidEmailAddressFormat(userInput.email)) {
        toast.error("You entered invalid email address format");
        return;
      }

      if (userInput.newPassword.length > 7) {
        const requestOptions = {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: userInput.email,
            password: userInput.newPassword,
            role: userInput.role,
          }),
        };
        apiClient.put(`/api/users/${id}`, requestOptions)
          .then((response) => {
            if (response.status === 200) {
              return response.json();
            } else {
              throw Error("Error while updating user");
            }
          })
          .then((data) => toast.success("User successfully updated"))
          .catch((error) => {
            toast.error("There was an error while updating user");
          });
      } else {
        toast.error("Password must be longer than 7 characters");
        return;
      }
    } else {
      toast.error("For updating a user you must enter all values");
      return;
    }
  };

  useEffect(() => {
    // sending API request for a single user
    apiClient.get(`/api/users/${id}`)
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        setUserInput({
          email: data?.email,
          newPassword: "",
          role: data?.role,
        });
        setUserStatus(data?.status || 'active');
      });
  }, [id]);

  return (
    <div className="bg-white p-8 max-w-screen-2xl mx-auto">
      <div className="flex flex-col gap-y-7 w-full">
        <h1 className="text-3xl font-semibold">User details</h1>
        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Email:</span>
            </div>
            <input
              type="email"
              className="input input-bordered w-full max-w-xs"
              value={userInput.email || ""}
              onChange={(e) =>
                setUserInput({ ...userInput, email: e.target.value })
              }
            />
          </label>
        </div>

        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">New password:</span>
            </div>
            <input
              type="password"
              className="input input-bordered w-full max-w-xs"
              onChange={(e) =>
                setUserInput({ ...userInput, newPassword: e.target.value })
              }
              value={userInput.newPassword || ""}
            />
          </label>
        </div>

        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">User role: </span>
            </div>
            <select
              className="select select-bordered"
              value={userInput.role || "user"}
              onChange={(e) =>
                setUserInput({ ...userInput, role: e.target.value })
              }
            >
              <option value="admin">admin</option>
              <option value="user">user</option>
            </select>
          </label>
        </div>
        {/* User Status Badge */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Trạng thái:</span>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${userStatus === 'blocked'
            ? 'bg-red-100 text-red-800'
            : userStatus === 'DELETED'
              ? 'bg-gray-100 text-gray-800'
              : 'bg-green-100 text-green-800'
            }`}>
            {userStatus === 'blocked' ? '🚫 Đã chặn' : userStatus === 'DELETED' ? '🗑️ Đã xóa' : '✓ Hoạt động'}
          </span>
        </div>

        <div className="flex gap-x-2 max-sm:flex-col flex-wrap">
          <button
            type="button"
            className="uppercase bg-blue-500 px-10 py-5 text-lg border border-gray-300 font-bold text-white shadow-sm hover:bg-blue-600 hover:text-white focus:outline-none focus:ring-2"
            onClick={updateUser}
          >
            Update user
          </button>
          <button
            type="button"
            className={`uppercase px-10 py-5 text-lg border border-gray-300 font-bold text-white shadow-sm focus:outline-none focus:ring-2 ${userStatus === 'blocked'
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-yellow-600 hover:bg-yellow-700'
              }`}
            onClick={toggleBlockUser}
          >
            {userStatus === 'blocked' ? 'Mở chặn user' : 'Chặn user'}
          </button>
          <button
            type="button"
            className="uppercase bg-red-600 px-10 py-5 text-lg border border-gray-300 font-bold text-white shadow-sm hover:bg-red-700 hover:text-white focus:outline-none focus:ring-2"
            onClick={deleteUser}
          >
            Delete user
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardSingleUserPage;
