import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import React from "react";
import { Link } from "react-router-dom";
import { is } from "zod/locales";

const picture = "https://i.pravatar.cc/150?img=1";

export default function FriendSuggestions() {
  const query = useQueryClient();
  function getSuggestion() {
    return axios.get(
      "https://route-posts.routemisr.com/users/suggestions?limit=10",
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("Token")}`,
        },
      },
    );
  }

  function followUsers(id) {
    return axios.put(
      `https://route-posts.routemisr.com/users/${id}/follow`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("Token")}`,
        },
      },
    );
  }
  const { isPending, mutate, variables } = useMutation({
    mutationFn: followUsers,
    onSuccess: (response) => {
      query.invalidateQueries({ queryKey: ["getSuggestion"] });
    },
    onError: (e) => {
      console.log(e.response);
    },
  });

  const { isError, isLoading, data, error } = useQuery({
    queryKey: ["getSuggestion"],
    queryFn: getSuggestion,
  });

  if (isLoading)
    return (
      <div className="bg-white border border-stone-100 rounded-2xl shadow-sm p-5 mt-6 max-w-xs w-full">
        <div className="flex flex-col items-center justify-center py-10 gap-3">
          <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin" />
          <p className="text-stone-400 text-xs">Loading suggestions...</p>
        </div>
      </div>
    );

  if (isError)
    return (
      <div className="bg-white border border-stone-100 rounded-2xl shadow-sm p-5 mt-6 max-w-xs w-full">
        <div className="flex flex-col items-center justify-center py-10 gap-2">
          <i className="fa-solid fa-circle-exclamation text-purple-300 text-3xl" />
          <p className="text-stone-400 text-xs text-center">{error.message}</p>
        </div>
      </div>
    );

  const suggestions = data?.data?.data.suggestions || [];

  function formatCount(n) {
    if (n >= 1_000_000)
      return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
    if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
    return n;
  }

  return (
    <div className="bg-white border border-stone-100 rounded-2xl shadow-sm p-5 mt-6 max-w-xs w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-stone-800">
          People You May Know
        </h3>
        <button className="text-xs font-medium text-purple-400 hover:text-purple-600 transition-colors">
          See all
        </button>
      </div>

      {suggestions.length === 0 ? (
        <div className="flex flex-col items-center py-8 gap-2">
          <i className="fa-solid fa-user-slash text-stone-200 text-3xl" />
          <p className="text-stone-400 text-xs">No suggestions right now</p>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-stone-50">
          {suggestions.map((user) => (
            <div
              key={user._id}
              className="flex items-center gap-3 py-3 hover:bg-stone-50 -mx-2 px-2 rounded-xl transition-colors duration-200"
            >
              <Link to={`/userprofile/${user._id}`}>
                <div className="relative shrink-0">
                  <img
                    src={user.photo || picture}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-100"
                  />
                  {user.followersCount > 0 && (
                    <span className="absolute -bottom-1 -right-1 bg-purple-500 text-white text-[8px] font-bold px-1 min-w-4.5 h-3.5 rounded-full border-2 border-white flex items-center justify-center leading-none whitespace-nowrap">
                      {formatCount(user.followersCount)}
                    </span>
                  )}
                </div>
              </Link>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-stone-800 truncate leading-tight">
                  {user.name}
                </p>
                <p className="text-[11px] text-stone-400 truncate mt-0.5">
                  @{user.username}
                </p>
                {user.followersCount > 0 && (
                  <p className="text-[10px] text-purple-400 mt-0.5">
                    {formatCount(user.followersCount)} followers
                  </p>
                )}
              </div>

              <button
                onClick={() => mutate(user._id)}
                disabled={isPending && variables === user._id}
                className="shrink-0 text-[11px] font-semibold cursor-pointer
  bg-purple-50 hover:bg-purple-500 
  text-purple-500 hover:text-white 
  border border-purple-200 hover:border-purple-500 
  px-3 py-1.5 rounded-lg transition-all duration-200
  disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isPending && variables === user._id
                  ? "Following..."
                  : "Follow"}
              </button>
            </div>
          ))}
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="mt-4 pt-3 border-t border-stone-50 flex items-center justify-center gap-1.5 text-[11px] text-stone-300">
          <i className="fa-solid fa-users text-[10px]" />
          Suggested based on your network
        </div>
      )}
    </div>
  );
}
