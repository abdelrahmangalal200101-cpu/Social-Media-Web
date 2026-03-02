import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Divider, Image } from "@heroui/react";
import picture from "../../assets/Gemini_Generated_Image_hoh3vphoh3vphoh3.png";
import Comment from "../ReusableComponent/Comment";
import PostCard from "../ReusableComponent/PostCard";

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
};

function StatCard({ icon, iconColor, bgColor, value, label }) {
  return (
    <div className={`flex items-center gap-3 ${bgColor} rounded-2xl px-4 py-3`}>
      <div className="flex flex-col items-center justify-center w-10 h-10 rounded-xl bg-white shadow-sm">
        <i className={`${icon} ${iconColor} text-base`} />
      </div>
      <div>
        <p className="text-xl font-bold text-stone-800 leading-none">
          {value ?? 0}
        </p>
        <p className="text-xs text-stone-400 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

export default function PostDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  function getOnePost() {
    return axios.get(`https://route-posts.routemisr.com/posts/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("Token")} ` },
    });
  }

  function getPostComments() {
    return axios.get(
      `https://route-posts.routemisr.com/posts/${id}/comments?page=1&limit=10`,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("Token")} ` },
      },
    );
  }

  const {
    data: comments,
    isLoading: isLoadingComments,
    error: errorComments,
    isError: isErrorComments,
  } = useQuery({
    queryKey: [`getPostComment${id}`],
    queryFn: getPostComments,
  });

  const {
    isLoading: loadingPosts,
    isError: errorPosts,
    error: errorPtext,
    data: posts,
  } = useQuery({
    queryKey: [`getOnePost${id}`],
    queryFn: getOnePost,
  });

  if (loadingPosts)
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
          <p className="text-stone-400 text-sm">Loading post...</p>
        </div>
      </div>
    );

  if (errorPosts)
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="flex flex-col items-center gap-3">
          <i className="fa-solid fa-circle-exclamation text-purple-400 text-4xl" />
          <p className="text-purple-500 text-sm">{errorPtext}</p>
        </div>
      </div>
    );

  if (isLoadingComments)
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
          <p className="text-stone-400 text-sm">Loading comments...</p>
        </div>
      </div>
    );

  if (errorComments)
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="flex flex-col items-center gap-3">
          <i className="fa-solid fa-circle-exclamation text-purple-400 text-4xl" />
          <p className="text-purple-500 text-sm">{isErrorComments}</p>
        </div>
      </div>
    );

  const post = posts?.data?.data?.post;
  const postComments = comments?.data?.data?.comments;

  if (!post.body && !post.image) return null;

  return (
    <div className="min-h-screen rounded-2xl bg-stone-50 py-6 px-4">
      <div className="max-w-5xl mx-auto mb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center cursor-pointer gap-2 text-sm font-medium px-4 py-2 rounded-full border border-stone-200 bg-white text-stone-500 hover:border-purple-300 hover:bg-purple-50 hover:text-purple-500 shadow-sm transition-all duration-200 group"
        >
          <i className="fa-solid fa-arrow-left group-hover:-translate-x-1 transition-transform duration-200" />
          Back to Feed
        </button>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <PostCard
            showAllComments={true}
            posts={post}
            comments={postComments}
          />
        </div>

        <div className="flex flex-col gap-4 sticky top-10 self-start">
          <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-5">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-4">
              Author
            </p>
            <div className="flex items-center gap-3">
              <Image
                height={54}
                width={54}
                radius="full"
                src={post?.user?.photo || picture}
                className="ring-2 ring-purple-100 shrink-0"
              />
              <div>
                <p className="font-semibold text-stone-800">
                  {post?.user?.name}
                </p>
                <p className="text-xs text-stone-400">{post?.user?.username}</p>
              </div>
            </div>
            <Divider className="bg-stone-50 my-4" />
            <p className="text-xs text-stone-400 leading-relaxed">
              Member since{" "}
              {post?.user?.createdAt
                ? formatDate(post.user.createdAt)
                : "a while ago"}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-5">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-4">
              Post Stats
            </p>
            <div className="flex flex-col gap-3">
              <StatCard
                icon="fa-solid fa-thumbs-up"
                iconColor="text-blue-400"
                bgColor="bg-blue-50"
                value={post?.likesCount}
                label="Likes"
              />
              <StatCard
                icon="fa-solid fa-comment"
                iconColor="text-purple-400"
                bgColor="bg-purple-50"
                value={post?.commentsCount}
                label="Comments"
              />
              <StatCard
                icon="fa-solid fa-share"
                iconColor="text-indigo-400"
                bgColor="bg-indigo-50"
                value={post?.sharesCount}
                label="Shares"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-5">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-3">
              Posted On
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center shrink-0">
                <i className="fa-regular fa-calendar text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-stone-700">
                  {formatDate(post?.createdAt)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
