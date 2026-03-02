import axios from "axios";
import React, { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Pic from "../../assets/Gemini_Generated_Image_hoh3vphoh3vphoh3.png";
import { useContext } from "react";
import { AuthContext } from "../../Context/AuthContextProvider";

export default function CreateComment({ id, queryKey, userId }) {
  const [imagePreview, setImagePreview] = useState(null);
  const [isSuccess, SetIsSuccess] = useState(false);
  const { user } = useContext(AuthContext);

  const fileInputRef = useRef(null);

  const form = useForm({ defaultValues: { body: "" } });
  const { register, handleSubmit, watch, reset } = form;
  const bodyValue = watch("body");

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (file) setImagePreview(URL.createObjectURL(file));
  }

  function removeImage() {
    setImagePreview(null);
    fileInputRef.current.value = "";
  }

  const formData = new FormData();

  function prepareComment(value) {
    if (!value.body && !fileInputRef.current?.files[0]) return;
    if (value.body) formData.append("content", value.body);
    if (fileInputRef.current?.files[0]) formData.append("image", fileInputRef.current.files[0]);
    mutate();
  }

  function createComment() {
    return axios.post(
      `https://route-posts.routemisr.com/posts/${id}/comments`,
      formData,
      { headers: { Authorization: `Bearer ${localStorage.getItem("Token")} ` } },
    );
  }

  const query = useQueryClient();

  const { isPending, mutate, isError } = useMutation({
    mutationFn: createComment,
    onSuccess: () => {
      SetIsSuccess(true);
      setTimeout(() => {
        reset();
        setImagePreview(null);
        fileInputRef.current.value = "";
        SetIsSuccess(false);
      }, 2000);
      query.invalidateQueries({ queryKey });
      query.invalidateQueries({ queryKey: [`getOnePost${id}`] });
      query.invalidateQueries({ queryKey: ["getHomePosts"] });
      query.invalidateQueries({ queryKey: ["profilePosts"] });
      query.invalidateQueries({ queryKey: ["userProfile", userId] });
    },
    onError: (error) => console.log(error),
  });

  return (
    <div className="px-3 sm:px-5 pb-4 pt-1">
      <div className="h-px bg-stone-50 mb-3" />

      <div className="flex items-start gap-2 sm:gap-3">
        {/* Avatar */}
        <img
          src={user?.photo || Pic}
          alt="User avatar"
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover ring-2 ring-purple-100 shrink-0 mt-1"
        />

        <form
          onSubmit={handleSubmit(prepareComment)}
          className="flex-1 flex flex-col gap-2 min-w-0"
        >
          {/* Input bar */}
          <div
            className={`flex items-center gap-2 bg-stone-50 border rounded-full px-3 sm:px-4 py-2 transition-all duration-300 shadow-sm hover:shadow
              focus-within:bg-white focus-within:ring-2 focus-within:border-transparent
              ${isError ? "border-red-400 focus-within:ring-red-500" : "border-stone-100 focus-within:ring-purple-200"}`}
          >
            <input
              type="text"
              {...register("body")}
              placeholder="Comment as you..."
              disabled={isPending}
              className="flex-1 bg-transparent outline-none text-sm text-stone-700 placeholder:text-stone-400 disabled:opacity-50 min-w-0"
            />

            <label className={`text-stone-300 hover:text-purple-400 cursor-pointer transition-colors duration-200 shrink-0 ${isPending ? "pointer-events-none opacity-40" : ""}`}>
              <i className="fa-regular fa-image text-base" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleImageChange}
                disabled={isPending}
              />
            </label>

            <button
              type="submit"
              disabled={isPending}
              className={`flex items-center justify-center transition-all duration-300 shrink-0
                ${bodyValue || imagePreview ? "opacity-100 scale-100" : "opacity-0 scale-75 pointer-events-none"}
                ${isPending ? "cursor-not-allowed" : "cursor-pointer"}
                ${isSuccess ? "text-green-500" : isError ? "text-red-400" : "text-purple-500"}`}
            >
              {isPending ? (
                <div className="w-4 h-4 border-2 border-purple-200 border-t-purple-500 rounded-full animate-spin" />
              ) : isSuccess ? (
                <i className="fa-solid fa-check text-sm" />
              ) : (
                <i className="fa-solid fa-paper-plane text-sm" />
              )}
            </button>
          </div>

          {isError && (
            <p className="text-xs text-red-400 flex items-center gap-1 px-2">
              <i className="fa-solid fa-circle-exclamation text-xs" />
              Something went wrong, please try again.
            </p>
          )}

          {/* Image preview */}
          {imagePreview && (
            <div className="relative w-fit ml-1">
              <img
                src={imagePreview}
                alt="preview"
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover ring-2 ring-purple-100 shadow-sm"
              />
              <button
                type="button"
                onClick={removeImage}
                disabled={isPending}
                className="absolute -top-1.5 -right-1.5 bg-white border border-stone-200 text-stone-400 hover:text-red-400 hover:border-red-200 rounded-full w-5 h-5 flex items-center justify-center shadow-sm transition-colors duration-200 cursor-pointer disabled:opacity-40"
              >
                <i className="fa-solid fa-xmark text-xs" />
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}