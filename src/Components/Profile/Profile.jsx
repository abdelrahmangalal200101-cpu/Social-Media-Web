import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Grid3X3, Bookmark, Calendar, Mail } from "lucide-react";
import PostCard from "../ReusableComponent/PostCard";
import { useContext } from "react";
import { AuthContext } from "../../Context/AuthContextProvider";
import AnimatedCover from "../ReusableComponent/AnimatedCover";
AnimatedCover;

const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("Token")}`,
});

const userBookMarks = () =>
  axios.get("https://route-posts.routemisr.com/users/bookmarks", {
    headers: authHeader(),
  });

const uploadProfilePic = (file) => {
  const formData = new FormData();
  formData.append("photo", file);
  return axios.put(
    "https://route-posts.routemisr.com/users/upload-photo",
    formData,
    { headers: authHeader() },
  );
};

export default function Profile() {
  const [activeTab, setActiveTab] = useState("posts");
  const query = useQueryClient();
  const { user, profileLoading } = useContext(AuthContext);

  const getProfilePosts = () =>
    axios.get(`https://route-posts.routemisr.com/users/${user.id}/posts`, {
      headers: authHeader(),
    });

  const { data: postsData } = useQuery({
    queryKey: ["profilePosts"],
    queryFn: getProfilePosts,
  });

  const { data: bookmarksData } = useQuery({
    queryKey: ["bookmarks"],
    queryFn: userBookMarks,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: uploadProfilePic,
    onSuccess: () => {
      query.invalidateQueries({ queryKey: ["profile"] });
      query.invalidateQueries({ queryKey: ["profilePosts"] });
    },
  });

  if (profileLoading || !user) return <LoadingState />;

  const posts = postsData?.data?.data?.posts ?? [];
  const bookmarks = bookmarksData?.data?.data?.bookmarks ?? [];

  const tabs = [
    {
      id: "posts",
      label: "Posts",
      icon: <Grid3X3 size={16} />,
      count: posts.length,
    },
    {
      id: "bookmarks",
      label: "Saved",
      icon: <Bookmark size={16} />,
      count: bookmarks.length,
    },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 via-white to-purple-100">
      <AnimatedCover title="ROUTE" subtitle="Abdelrahman Social Space" />

      <div className="relative w-full px-4 md:px-10 -mt-24 pb-20">
        <div className="grid grid-cols-12 gap-6">
          <div className="hidden lg:block col-span-3">
            <GlassCard>
              <h3 className="font-bold text-gray-800 mb-4">About</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <StatRow label="Followers" value={user.followersCount ?? 0} />
                <StatRow label="Following" value={user.followingCount ?? 0} />
                <StatRow label="Saved" value={bookmarks.length} />
              </div>
            </GlassCard>
          </div>

          <div className="col-span-12 lg:col-span-6 space-y-8">
            <GlassCard className="text-center">
              <div className="relative w-32 h-32 mx-auto mb-4">
                <img
                  src={user.photo}
                  alt=""
                  className="w-full h-full rounded-full object-cover ring-4 ring-white shadow-xl"
                />
                <label className="absolute bottom-1 right-1 bg-purple-600 p-2 rounded-full cursor-pointer hover:bg-purple-700 transition">
                  {isPending ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Camera size={14} className="text-white" />
                  )}
                  <input
                    type="file"
                    hidden
                    onChange={(e) =>
                      e.target.files?.[0] && mutate(e.target.files[0])
                    }
                  />
                </label>
              </div>

              <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-purple-500 font-medium">@{user.username}</p>

              <div className="flex justify-center flex-wrap gap-2 mt-4 text-xs text-gray-500">
                {user.email && (
                  <Meta icon={<Mail size={12} />} text={user.email} />
                )}
                {user.dateOfBirth && (
                  <Meta
                    icon={<Calendar size={12} />}
                    text={new Date(user.dateOfBirth).toLocaleDateString()}
                  />
                )}
              </div>
            </GlassCard>

            <GlassCard>
              <div className="flex justify-center gap-3">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-5 py-2 rounded-full text-sm font-semibold transition ${
                      activeTab === tab.id
                        ? "bg-purple-600 text-white shadow-md"
                        : "bg-purple-100 text-purple-600 hover:bg-purple-200"
                    }`}
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </div>
            </GlassCard>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col gap-6"
              >
                {activeTab === "posts" &&
                  (posts.length === 0 ? (
                    <EmptyState text="No Posts Yet" />
                  ) : (
                    posts.map((post) => (
                      <motion.div
                        key={post._id}
                        whileHover={{ y: -6 }}
                        transition={{ duration: 0.2 }}
                        className="relative group"
                      >
                        <div className="absolute inset-0 rounded-3xl bg-linear-to-r from-purple-500 to-fuchsia-500 opacity-0 group-hover:opacity-20 blur-xl transition duration-300" />
                        <div className="relative bg-white/70 backdrop-blur-xl border border-white/40 shadow-lg rounded-3xl overflow-hidden transition">
                          <PostCard posts={post} />
                        </div>
                      </motion.div>
                    ))
                  ))}

                {activeTab === "bookmarks" &&
                  (bookmarks.length === 0 ? (
                    <EmptyState text="No Saved Posts" />
                  ) : (
                    bookmarks.map((post) => (
                      <PostCard key={post._id} posts={post} />
                    ))
                  ))}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="hidden lg:block col-span-3 space-y-6">
            <GlassCard>
              <h3 className="font-bold text-gray-800 mb-2">Premium</h3>
              <p className="text-sm text-gray-500 mb-4">
                Unlock analytics & advanced features.
              </p>
              <button className="w-full bg-purple-600 text-white py-2 rounded-full hover:bg-purple-700 transition">
                Upgrade
              </button>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}

function GlassCard({ children, className = "" }) {
  return (
    <div
      className={`bg-white/60 backdrop-blur-xl border border-white/40 shadow-xl rounded-3xl p-6 ${className}`}
    >
      {children}
    </div>
  );
}

function StatRow({ label, value }) {
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <span className="font-semibold text-purple-600">{value}</span>
    </div>
  );
}

function Meta({ icon, text }) {
  return (
    <span className="flex items-center gap-1 bg-white/70 px-3 py-1 rounded-full border border-purple-100">
      <span className="text-purple-500">{icon}</span>
      {text}
    </span>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-purple-50 gap-4">
      <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="col-span-2 text-center py-16 text-purple-400 font-medium">
      {text}
    </div>
  );
}
