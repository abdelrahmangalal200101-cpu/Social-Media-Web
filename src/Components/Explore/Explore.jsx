import axios from "axios";
import React, { useEffect, useState } from "react";
import PostCard from "../ReusableComponent/PostCard";
import { useQuery } from "@tanstack/react-query";
import CreatePost from "../ReusableComponent/CreatePost";

export default function Explore() {
  function getAllPosts() {
    return axios.get("https://route-posts.routemisr.com/posts", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("Token")}`,
      },
    });
  }

  const { isLoading, isError, data, error } = useQuery({
    queryKey: ["getAllPosts"],
    queryFn: getAllPosts,
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

  return (
    <>
      <CreatePost />
      {data.data.data.posts.map((post) => (
        <PostCard key={post.id} margin="mt-5" posts={post} />
      ))}
    </>
  );
}
