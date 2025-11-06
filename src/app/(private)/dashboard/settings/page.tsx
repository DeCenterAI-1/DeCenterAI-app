"use client";

import { getUserByWallet, updateUserProfile } from "@/actions/supabase/users";
import { imageFileToObjectUrl } from "@/utils/files";
import { validateEmail } from "@/utils/validation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useActiveAccount } from "thirdweb/react";
import { useSearchParams, useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";

export default function SettingsPage() {
  const { updateProfile } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const modalParam = searchParams.get("modal");
  const [showEditProfile, setShowEditProfile] = useState(
    modalParam === "profile"
  );

  const [formData, setFormData] = useState({
    firstname: null as string | null,
    lastname: null as string | null,
    username: null as string | null,
    email: null as string | null,
    bio: null as string | null,
    profile_image: null as string | File | null,
  });

  const [initialFormData, setInitialFormData] = useState(formData);
  const userAccount = useActiveAccount();

  useEffect(() => {
    setShowEditProfile(modalParam === "profile");
  }, [modalParam]);

  const fetchUserProfile = async () => {
    if (!userAccount) return;
    const userRes = await getUserByWallet(userAccount.address);
    if (userRes.success && userRes.data) {
      const { firstname, lastname, username, email, bio, profile_image } =
        userRes.data;
      setFormData({ firstname, lastname, username, email, bio, profile_image });
      setInitialFormData({
        firstname,
        lastname,
        username,
        email,
        bio,
        profile_image,
      });
    } else {
      toast.error(userRes.message || "Failed to fetch user profile");
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, [userAccount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAccount) return;

    if (formData.email && !validateEmail(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    const cleanedData = {
      firstname: formData.firstname || null,
      lastname: formData.lastname || null,
      username: formData.username || null,
      email: formData.email || null,
      bio: formData.bio || null,
      profile_image: formData.profile_image,
    };

    try {
      const result = await updateUserProfile(userAccount.address, cleanedData);
      if (result.success) {
        toast.success("Profile updated successfully");
        updateProfile({
          username: cleanedData.username || undefined,
          profile_image:
            cleanedData.profile_image instanceof File
              ? imageFileToObjectUrl(cleanedData.profile_image)
              : cleanedData.profile_image || undefined,
        });
        setShowEditProfile(false);
        router.replace("/dashboard/settings"); // clean up ?modal param
        await fetchUserProfile();
      } else {
        throw new Error(result.message || "Failed to update profile");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update profile"
      );
    }
  };

  const handleCancel = () => {
    setShowEditProfile(false);
    router.replace("/dashboard/settings"); // clean param
  };

  // RESPONSIVE MODAL VARIANT
  const modalClasses =
    "fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6";
  const modalInner =
    "relative w-full sm:max-w-lg bg-[#191919] border border-[#232323] rounded-2xl p-6 sm:p-8 shadow-lg overflow-auto max-h-[90vh]";

  return (
    <div className="flex-1 bg-[#050505] min-h-screen p-6 sm:p-8">
      <div className="space-y-6">
        <h1 className="text-[#F5F5F5] text-2xl font-bold mb-4">Settings</h1>

        <div className="flex flex-col gap-6">
          {/* Clickable cards */}
          <div
            className="flex items-center gap-4 p-5 bg-[#111111] border border-[#232323] rounded-2xl cursor-pointer hover:bg-[#191919] transition"
            onClick={() => router.push("/dashboard/settings?modal=profile")}
          >
            <svg
              width="22"
              height="22"
              fill="none"
              stroke="#5D5D5D"
              strokeWidth="1.5"
            >
              <circle cx="11" cy="7" r="4" />
              <path d="M3 19a9 9 0 0 1 18 0" />
            </svg>
            <span className="text-[#DADADA] font-medium text-lg">Profile</span>
          </div>

          <div className="flex items-center gap-4 p-5 bg-[#111111] border border-[#232323] rounded-2xl cursor-not-allowed hover:bg-[#191919] transition">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19.5 7.5H16.5V5.25C16.5 4.05653 16.0259 2.91193 15.182 2.06802C14.3381 1.22411 13.1935 0.75 12 0.75C10.8065 0.75 9.66193 1.22411 8.81802 2.06802C7.97411 2.91193 7.5 4.05653 7.5 5.25V7.5H4.5C4.10218 7.5 3.72064 7.65804 3.43934 7.93934C3.15804 8.22064 3 8.60218 3 9V19.5C3 19.8978 3.15804 20.2794 3.43934 20.5607C3.72064 20.842 4.10218 21 4.5 21H19.5C19.8978 21 20.2794 20.842 20.5607 20.5607C20.842 20.2794 21 19.8978 21 19.5V9C21 8.60218 20.842 8.22064 20.5607 7.93934C20.2794 7.65804 19.8978 7.5 19.5 7.5ZM9 5.25C9 4.45435 9.31607 3.69129 9.87868 3.12868C10.4413 2.56607 11.2044 2.25 12 2.25C12.7956 2.25 13.5587 2.56607 14.1213 3.12868C14.6839 3.69129 15 4.45435 15 5.25V7.5H9V5.25ZM19.5 19.5H4.5V9H19.5V19.5ZM13.125 14.25C13.125 14.4725 13.059 14.69 12.9354 14.875C12.8118 15.06 12.6361 15.2042 12.4305 15.2894C12.225 15.3745 11.9988 15.3968 11.7805 15.3534C11.5623 15.31 11.3618 15.2028 11.2045 15.0455C11.0472 14.8882 10.94 14.6877 10.8966 14.4695C10.8532 14.2512 10.8755 14.025 10.9606 13.8195C11.0458 13.6139 11.19 13.4382 11.375 13.3146C11.56 13.191 11.7775 13.125 12 13.125C12.2984 13.125 12.5845 13.2435 12.7955 13.4545C13.0065 13.6655 13.125 13.9516 13.125 14.25Z"
                fill="#5D5D5D"
              />
            </svg>
            <span className="text-[#DADADA] font-medium text-lg">Security - Coming Soon</span>
          </div>

          <div className="flex items-center gap-4 p-5 bg-[#111111] border border-[#232323] rounded-2xl cursor-not-allowed hover:bg-[#191919] transition">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20.7936 16.4944C20.2733 15.5981 19.4999 13.0622 19.4999 9.75C19.4999 7.76088 18.7097 5.85322 17.3032 4.4467C15.8967 3.04018 13.989 2.25 11.9999 2.25C10.0108 2.25 8.10311 3.04018 6.69659 4.4467C5.29007 5.85322 4.49989 7.76088 4.49989 9.75C4.49989 13.0631 3.72551 15.5981 3.2052 16.4944C3.07233 16.7222 3.00189 16.9811 3.00099 17.2449C3.00008 17.5086 3.06874 17.768 3.20005 17.9967C3.33135 18.2255 3.52065 18.4156 3.74886 18.5478C3.97708 18.6801 4.23613 18.7498 4.49989 18.75H8.32583C8.49886 19.5967 8.95904 20.3577 9.62851 20.9042C10.298 21.4507 11.1357 21.7492 11.9999 21.7492C12.8641 21.7492 13.7018 21.4507 14.3713 20.9042C15.0407 20.3577 15.5009 19.5967 15.674 18.75H19.4999C19.7636 18.7496 20.0225 18.6798 20.2506 18.5475C20.4787 18.4151 20.6678 18.225 20.799 17.9963C20.9302 17.7676 20.9988 17.5083 20.9979 17.2446C20.9969 16.9809 20.9265 16.7222 20.7936 16.4944ZM11.9999 20.25C11.5347 20.2499 11.081 20.1055 10.7013 19.8369C10.3215 19.5683 10.0343 19.1886 9.87926 18.75H14.1205C13.9655 19.1886 13.6783 19.5683 13.2985 19.8369C12.9187 20.1055 12.4651 20.2499 11.9999 20.25ZM4.49989 17.25C5.22176 16.0087 5.99989 13.1325 5.99989 9.75C5.99989 8.1587 6.63203 6.63258 7.75725 5.50736C8.88247 4.38214 10.4086 3.75 11.9999 3.75C13.5912 3.75 15.1173 4.38214 16.2425 5.50736C17.3677 6.63258 17.9999 8.1587 17.9999 9.75C17.9999 13.1297 18.7761 16.0059 19.4999 17.25H4.49989Z"
                fill="#5D5D5D"
              />
            </svg>
            <span className="text-[#DADADA] font-medium text-lg">
              Notifications - Coming Soon
            </span>
          </div>
        </div>
      </div>

      {/* Profile Modal */}
      {showEditProfile && (
        <div className={modalClasses}>
          <div className={modalInner}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl text-white font-bold">
                Edit Profile
              </h2>
              <button
                onClick={handleCancel}
                className="p-2 hover:bg-[#2B2B2B] rounded-lg transition"
              >
                ✕
              </button>
            </div>

            {/* Foem */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Picture */}
              <div className="flex justify-center">
                <div className="relative w-24 h-24 sm:w-28 sm:h-28">
                  <img
                    src={
                      formData.profile_image instanceof File
                        ? imageFileToObjectUrl(formData.profile_image)
                        : formData.profile_image || "/default-avatar.svg"
                    }
                    alt="Profile"
                    className="w-full h-full rounded-full border border-[#494949] object-cover"
                  />

                  <label className="absolute bottom-1 right-1 bg-[#2B2B2B] border border-[#191919] rounded-full p-1.5 cursor-pointer hover:bg-[#494949] transition">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setFormData({
                            ...formData,
                            profile_image: e.target.files[0],
                          });
                        }
                      }}
                    />
                    📷
                  </label>
                </div>
              </div>

              {/* Name Fields */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-[#5D5D5D] text-sm mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={formData.firstname || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, firstname: e.target.value })
                    }
                    placeholder="First name"
                    className="w-full rounded-xl bg-[#0F0F0F] border border-[#2B2B2B] p-3 text-sm text-[#C1C1C1] focus:border-[#494949] outline-none"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[#5D5D5D] text-sm mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={formData.lastname || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, lastname: e.target.value })
                    }
                    placeholder="Last name"
                    className="w-full rounded-xl bg-[#0F0F0F] border border-[#2B2B2B] p-3 text-sm text-[#C1C1C1] focus:border-[#494949] outline-none"
                  />
                </div>
              </div>

              {/* Username */}
              <div className="space-y-4">
                <div>
                  <label className="block text-[#5D5D5D] text-sm mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={formData.username || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    placeholder="Username"
                    className="w-full rounded-xl bg-[#0F0F0F] border border-[#2B2B2B] p-3 text-sm text-[#C1C1C1] focus:border-[#494949] outline-none"
                  />
                </div>

                {/* Email (read-only) */}
                <div>
                  <label className="block text-[#5D5D5D] text-sm mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email || ""}
                    readOnly
                    disabled
                    className="w-full rounded-xl bg-[#0F0F0F] border border-[#2B2B2B] p-3 text-sm text-[#C1C1C1] focus:border-[#494949] outline-none"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-[#5D5D5D] text-sm mb-1">
                    Bio
                  </label>
                  <textarea
                    rows={3}
                    value={formData.bio || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                    placeholder="Bio"
                    className="w-full rounded-xl bg-[#0F0F0F] border border-[#2B2B2B] p-3 text-sm text-[#C1C1C1] focus:border-[#494949] outline-none resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-5 py-2 rounded-xl border border-[#2B2B2B] text-[#C1C1C1] hover:bg-[#191919] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#232323] text-white hover:bg-[#2B2B2B] transition"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
