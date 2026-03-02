import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import React, { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import { Grid3X3, Mail, Calendar, LogIn } from "lucide-react";
import PostCard from "../ReusableComponent/PostCard";
import { useParams } from "react-router-dom";
import AnimatedCover from "../ReusableComponent/AnimatedCover";
import { AuthContext } from "../../Context/AuthContextProvider";

const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("Token")}`,
});

const getUserProfile = (id) =>
  axios.get(`https://route-posts.routemisr.com/users/${id}/profile`, {
    headers: authHeader(),
  });

const getUserPosts = (id) =>
  axios.get(`https://route-posts.routemisr.com/users/${id}/posts`, {
    headers: authHeader(),
  });

const followUser = (id) =>
  axios.put(
    `https://route-posts.routemisr.com/users/${id}/follow`,
    {},
    { headers: authHeader() },
  );

export default function UserProfile() {
  const { id: userId } = useParams();
  const queryClient = useQueryClient();
  const [isFollowing, setIsFollowing] = useState(null);
  const { loggedId } = useContext(AuthContext);

  const { isLoading, data } = useQuery({
    queryKey: ["userProfile", userId],
    queryFn: () => getUserProfile(userId),
  });

  const { data: postsData } = useQuery({
    queryKey: ["userPosts", userId],
    queryFn: () => getUserPosts(userId),
  });

  const { isPending: followPending, mutate: followMutate } = useMutation({
    mutationFn: () => followUser(userId),
    onSuccess: (res) => {
      const newState = res?.data?.data?.following;
      console.log(newState);

      setIsFollowing(newState);
      queryClient.invalidateQueries({ queryKey: ["userProfile", userId] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });

  const user = data?.data?.data?.user ?? {};
  const posts = postsData?.data?.data?.posts ?? [];


  useEffect(() => {
    if (!user?.followers || !loggedId) return;

    const isUserFollowing = user.followers.some(
      (follower) => follower._id.toString() === loggedId.toString(),
    );

    setIsFollowing(isUserFollowing);
  }, [user, loggedId]);

  const following = isFollowing ?? false;

  if (isLoading) return <LoadingState />;

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 via-white to-purple-100">
      <AnimatedCover subtitle="Abdelrahman Social App" />

      <div className="relative w-full px-4 md:px-10 -mt-24 pb-20">
        <div className="grid grid-cols-12 gap-6">
          <div className="hidden lg:block col-span-3">
            <GlassCard>
              <h3 className="font-bold text-gray-800 mb-4">About</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <StatRow label="Followers" value={user.followersCount ?? 0} />
                <StatRow label="Following" value={user.followingCount ?? 0} />
              </div>
            </GlassCard>
          </div>

          <div className="col-span-12 lg:col-span-6 space-y-8">
            <GlassCard className="text-center">
              <div className="w-32 h-32 mx-auto mb-4">
                <img
                  src={user.photo}
                  alt=""
                  className="w-full h-full rounded-full object-cover ring-4 ring-white shadow-xl"
                />
              </div>

              <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-purple-500 font-medium mb-4">
                @{user.username}
              </p>

              <FollowButton
                following={following}
                pending={followPending}
                onClick={followMutate}
              />

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

            <div className="flex flex-col gap-6">
              {posts.length === 0 ? (
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
              )}
            </div>
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

function FollowButton({ following, pending, onClick }) {
  return (
    <motion.button
      onClick={onClick}
      disabled={pending}
      whileTap={{ scale: 0.94 }}
      whileHover={{ scale: 1.04 }}
      transition={{ type: "spring", stiffness: 350, damping: 18 }}
      className={`relative inline-flex items-center gap-2 px-8 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 overflow-hidden
        ${
          following
            ? "bg-white text-purple-600 border-2 border-purple-400 hover:border-purple-600 hover:bg-purple-50 shadow-sm"
            : "bg-purple-600 text-white border-2 border-purple-600 hover:bg-purple-700 shadow-md shadow-purple-200"
        }`}
    >
      {pending ? (
        <>
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>Loading…</span>
        </>
      ) : following ? (
        <>
          <motion.svg
            key="check"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
          >
            <path
              d="M3 8l3.5 3.5L13 5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.svg>
          <motion.span
            key="following-text"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Following
          </motion.span>
        </>
      ) : (
        <>
          <motion.svg
            key="plus"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
          >
            <path
              d="M8 3v10M3 8h10"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </motion.svg>
          <motion.span
            key="follow-text"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Follow
          </motion.span>
        </>
      )}
    </motion.button>
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
    <div className="min-h-screen flex items-center justify-center bg-purple-50">
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
