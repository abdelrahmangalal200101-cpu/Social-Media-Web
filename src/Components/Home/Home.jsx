import axios from "axios";
import React from "react";
import PostCard from "../ReusableComponent/PostCard";
import { useQuery } from "@tanstack/react-query";
import CreatePost from "../ReusableComponent/CreatePost";
import { motion } from "framer-motion";
import { Users, Sparkles } from "lucide-react";

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center justify-center py-20 px-6 text-center"
    >
      <div className="relative mb-6">
        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 rounded-full bg-purple-200 blur-xl"
        />

        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="relative w-24 h-24 rounded-full bg-linear-to-br from-purple-100 to-violet-100 border border-purple-200/60 flex items-center justify-center shadow-lg shadow-purple-100"
        >
          <Users className="w-10 h-10 text-purple-400" strokeWidth={1.5} />
        </motion.div>

        {/* Sparkle top-right */}
        <motion.div
          animate={{ opacity: [0, 1, 0], scale: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          className="absolute -top-1 -right-1"
        >
          <Sparkles className="w-5 h-5 text-purple-300" />
        </motion.div>

        {/* Sparkle bottom-left */}
        <motion.div
          animate={{ opacity: [0, 1, 0], scale: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, delay: 1.2 }}
          className="absolute -bottom-1 -left-1"
        >
          <Sparkles className="w-4 h-4 text-violet-300" />
        </motion.div>
      </div>

      {/* Text */}
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="text-xl font-bold text-slate-800 mb-2"
      >
        Your feed is empty
      </motion.h3>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="text-slate-400 text-sm max-w-xs leading-relaxed"
      >
        Follow people you're interested in and their posts will show up right here.
      </motion.p>

      {/* Decorative dots */}
      <div className="flex gap-1.5 mt-8">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
            className="w-1.5 h-1.5 rounded-full bg-purple-300"
          />
        ))}
      </div>
    </motion.div>
  );
}

// ── Home Page ─────────────────────────────────────────────────────────────────
export default function Home() {
  function getHomePosts() {
    return axios.get(
      "https://route-posts.routemisr.com/posts/feed?only=following&limit=10",
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("Token")}`,
        },
      }
    );
  }

  const { isLoading, isError, data, error } = useQuery({
    queryKey: ["getHomePosts"],
    queryFn: getHomePosts,
  });

  if (isLoading)
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
          <p className="text-stone-400 text-sm">Loading posts...</p>
        </div>
      </div>
    );

  if (isError)
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="flex flex-col items-center gap-3">
          <i className="fa-solid fa-circle-exclamation text-purple-400 text-4xl" />
          <p className="text-purple-500 text-sm">{error.message}</p>
        </div>
      </div>
    );

  const posts = data?.data?.data?.posts ?? [];

  return (
    <>
      <CreatePost />
      {posts.length === 0 ? (
        <EmptyState />
      ) : (
        posts.map((post) => (
          <PostCard key={post._id} margin="mt-5" posts={post} />
        ))
      )}
    </>
  );
}