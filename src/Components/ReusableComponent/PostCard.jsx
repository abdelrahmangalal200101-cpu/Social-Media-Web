import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
  Image,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Button,
} from "@heroui/react";
import { addToast } from "@heroui/react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import picture from "../../assets/Gemini_Generated_Image_hoh3vphoh3vphoh3.png";
import Comment from "./Comment";
import CreateComment from "./CreateComment";
import { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../../Context/AuthContextProvider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
};

export default function CardPost({
  posts,
  showAllComments = false,
  comments = [],
  margin = "",
}) {
  const { loggedId, user } = useContext(AuthContext);
  const userId = posts.user._id;
  const location = useLocation();
  const navigate = useNavigate();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();

  const [isLiked, setLiked] = useState(false);
  const [isBookmarked, setBookmarked] = useState(posts.bookmarked || false);
  const [isShared, setIsShared] = useState(posts.isShare || false);
  const [editBody, setEditBody] = useState(posts?.body || "");
  const [editImagePreview, setEditImagePreview] = useState(
    posts?.image || null,
  );
  const fileInputRef = useRef(null);
  const textInputRef = useRef(null);

  useEffect(() => {
    if (posts.bookmarked === true) setBookmarked(true);
  }, [posts.bookmarked]);

  useEffect(() => {
    if (posts.sharesCount > 0) setIsShared(true);
  }, [posts.sharesCount]);
  
  useEffect(() => {
    if (posts.likes !== undefined) {
      setLiked(posts.likes?.includes(loggedId) || false);
    }
  }, [posts.likes, loggedId]);
  function deletePost() {
    return axios.delete(
      `https://route-posts.routemisr.com/posts/${posts._id}`,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("Token")}` },
      },
    );
  }

  function prepareUpdatePost() {
    const formData = new FormData();
    if (textInputRef.current.value)
      formData.append("body", textInputRef.current.value);
    if (fileInputRef.current.files[0])
      formData.append("image", fileInputRef.current.files[0]);
    return formData;
  }

  function updatePost() {
    return axios.put(
      `https://route-posts.routemisr.com/posts/${posts._id}`,
      prepareUpdatePost(),
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("Token")}` },
      },
    );
  }

  function likePost() {
    return axios.put(
      `https://route-posts.routemisr.com/posts/${posts._id}/like`,
      {},
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("Token")}` },
      },
    );
  }

  function sharePost() {
    return axios.post(
      `https://route-posts.routemisr.com/posts/${posts._id}/share`,
      { body: `Sharing this great post @${posts.user.username}` },
      { headers: { Authorization: `Bearer ${localStorage.getItem("Token")}` } },
    );
  }

  function bookMarkPost() {
    return axios.put(
      `https://route-posts.routemisr.com/posts/${posts._id}/bookmark`,
      {},
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("Token")}` },
      },
    );
  }

  const query_A = useQueryClient();

  const { isPending: delPending, mutate: delMutate } = useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      query_A.invalidateQueries({ queryKey: ["getAllPosts"] });
      query_A.invalidateQueries({ queryKey: ["profilePosts"] });
      query_A.invalidateQueries({ queryKey: ["getHomePosts"] });
      onClose();
      addToast({
        title: "Post deleted",
        description: "Removed successfully",
        color: "success",
        timeout: 3000,
      });
      if (location.pathname.includes("/postdetails")) navigate("/explore");
    },
    onError: () =>
      addToast({
        title: "Failed to delete",
        description: "Something went wrong, try again",
        color: "danger",
        timeout: 3000,
      }),
  });

  const { isPending: editPending, mutate: editMutate } = useMutation({
    mutationFn: updatePost,
    onSuccess: () => {
      query_A.invalidateQueries({ queryKey: ["getAllPosts"] });
      query_A.invalidateQueries({ queryKey: ["profilePosts"] });
      query_A.invalidateQueries({ queryKey: ["getHomePosts"] });
      onEditClose();
      addToast({
        title: "Post Updated",
        description: "Updated successfully",
        color: "success",
        timeout: 3000,
      });
    },
    onError: () =>
      addToast({
        title: "Failed to Update",
        description: "Something went wrong, try again",
        color: "danger",
        timeout: 3000,
      }),
  });

  const { mutate: likeMutate } = useMutation({
    mutationFn: likePost,
    onSuccess: (response) => {
      setLiked(response.data.data.liked);
      query_A.invalidateQueries({ queryKey: ["getAllPosts"] });
      query_A.invalidateQueries({ queryKey: [`getOnePost${posts.id}`] });
      query_A.invalidateQueries({ queryKey: ["getHomePosts"] });
      query_A.invalidateQueries({ queryKey: ["profilePosts"] });
      query_A.invalidateQueries({ queryKey: ["userPosts", userId] });
    },
    onError: (e) => console.log(e),
  });

  const { mutate: bookMutate } = useMutation({
    mutationFn: bookMarkPost,
    onSuccess: (res) => {
      setBookmarked(res.data.data.bookmarked);
      query_A.invalidateQueries({ queryKey: ["bookmarks"] });
    },
    onError: (err) => console.log(err),
  });

  const { mutate: shareMutate } = useMutation({
    mutationFn: sharePost,
    onSuccess: () => {
      setIsShared(true);
      query_A.invalidateQueries({ queryKey: ["getAllPosts"] });
      query_A.invalidateQueries({ queryKey: [`getOnePost${posts.id}`] });
      query_A.invalidateQueries({ queryKey: ["getHomePosts"] });
      query_A.invalidateQueries({ queryKey: ["profilePosts"] });
      query_A.invalidateQueries({ queryKey: ["userPosts", userId] });
    },
    onError: () =>
      addToast({
        title: "Failed to Share",
        description: "Something went wrong, try again",
        color: "danger",
        timeout: 3000,
      }),
  });

  if (!posts.body && !posts.image) return null;

  return (
    <>
      {/* Edit Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={onEditClose}
        placement="center"
        backdrop="blur"
        size="lg"
        classNames={{
          base: "rounded-3xl border border-purple-100 shadow-2xl mx-2 sm:mx-auto sm:max-w-lg",
          header: "border-b-0 pb-0 pt-6",
          body: "py-3 px-4 sm:px-5",
          footer: "border-t-0 pt-2 pb-5 px-4 sm:px-5 gap-2",
        }}
      >
        <ModalContent>
          <ModalBody>
            <div className="flex items-center gap-2 mb-2">
              <Image
                src={user?.photo}
                width={32}
                height={32}
                radius="full"
                className="ring-2 ring-purple-200 shrink-0"
              />
              <p className="text-sm font-medium text-stone-700 truncate">
                {user?.name}
              </p>
            </div>

            <textarea
              value={editBody}
              ref={textInputRef}
              onChange={(e) => setEditBody(e.target.value)}
              rows={4}
              placeholder="What's on your mind?"
              className="w-full resize-none rounded-2xl border border-purple-100 bg-purple-50/40 px-4 py-3 text-sm text-stone-700 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-300 transition-all duration-200"
            />

            <div className="mt-3">
              <AnimatePresence mode="wait">
                {editImagePreview ? (
                  <motion.div
                    key="preview"
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="relative rounded-2xl overflow-hidden group"
                  >
                    <img
                      src={editImagePreview}
                      alt="preview"
                      className="w-full max-h-48 sm:max-h-56 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-white/90 text-purple-600 font-medium text-xs px-3 py-2 rounded-xl shadow-md hover:bg-white transition"
                      >
                        Change
                      </button>
                      <button
                        onClick={() => {
                          setEditImagePreview(null);
                          if (fileInputRef.current)
                            fileInputRef.current.value = "";
                        }}
                        className="bg-white/90 text-red-400 font-medium text-xs px-3 py-2 rounded-xl shadow-md hover:bg-white transition"
                      >
                        Remove
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.button
                    key="upload"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-purple-200 rounded-2xl py-6 sm:py-7 flex flex-col items-center gap-2 hover:border-purple-400 hover:bg-purple-50 transition-all duration-200"
                  >
                    <i className="fa-regular fa-image text-purple-300 text-lg" />
                    <p className="text-sm text-purple-400 font-medium">
                      Add a photo
                    </p>
                  </motion.button>
                )}
              </AnimatePresence>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) =>
                  setEditImagePreview(URL.createObjectURL(e.target.files[0]))
                }
              />
            </div>
          </ModalBody>

          <ModalFooter>
            <Button
              variant="flat"
              onPress={onEditClose}
              className="flex-1 rounded-xl bg-stone-100 text-stone-600 hover:bg-stone-200"
            >
              Cancel
            </Button>
            <Button
              onPress={editMutate}
              isLoading={editPending}
              isDisabled={editPending}
              spinner={
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  />
                </svg>
              }
              className="flex-1 rounded-xl bg-purple-500 text-white hover:bg-purple-600 disabled:opacity-60"
            >
              {editPending ? "Saving..." : "Save Changes"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        placement="center"
        backdrop="blur"
        classNames={{
          base: "rounded-3xl border border-stone-100 shadow-2xl mx-2 sm:mx-auto",
          header: "border-b-0 pb-0 pt-6",
          body: "py-4",
          footer: "border-t-0 pt-0 pb-5 px-4 sm:px-5 gap-2",
        }}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col items-center gap-3 px-4 sm:px-5">
            <span className="w-14 h-14 flex items-center justify-center rounded-2xl bg-red-50">
              <i className="fa-regular fa-trash-can text-red-500 text-xl" />
            </span>
            <div className="text-center">
              <p className="text-base font-semibold text-stone-800">
                Delete Post?
              </p>
              <p className="text-sm text-stone-400 font-normal mt-1">
                This action can't be undone.
              </p>
            </div>
          </ModalHeader>
          <ModalBody />
          <ModalFooter>
            <Button
              variant="flat"
              onPress={onClose}
              isDisabled={delPending}
              className="flex-1 rounded-xl bg-stone-100 text-stone-600 font-medium hover:bg-stone-200"
            >
              Cancel
            </Button>
            <Button
              color="danger"
              onPress={() => delMutate()}
              isLoading={delPending}
              className="flex-1 rounded-xl font-medium"
            >
              {delPending ? "Deleting..." : "Delete"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Card
        className={`w-full mx-auto max-w-185 ${margin} rounded-2xl shadow-sm border border-stone-100 bg-white hover:shadow-md transition-shadow duration-300`}
      >
        <CardHeader className="flex gap-2 sm:gap-3 px-3 sm:px-5 pt-4 sm:pt-5 pb-3">
          <div className="relative shrink-0">
            <Link to={`/userprofile/${posts.user._id}`}>
              <Image
                height={40}
                width={40}
                radius="full"
                src={posts.user.photo || picture}
                className="ring-2 ring-purple-100 hover:scale-105 transition-transform duration-300 sm:w-11.5 sm:h-11.5"
              />
            </Link>
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <p className="font-semibold text-stone-800 text-sm truncate">
              {posts.user.name}
            </p>
            <p className="text-xs text-stone-400">
              {formatDate(posts.createdAt)}
            </p>
          </div>

          <Dropdown>
            <DropdownTrigger>
              <i className="fa-solid fa-ellipsis text-stone-300 cursor-pointer hover:text-stone-500 transition p-1 shrink-0" />
            </DropdownTrigger>
            <DropdownMenu aria-label="Post Actions" className="min-w-36">
              {loggedId === userId ? (
                <>
                  <DropdownItem
                    key="edit"
                    onPress={onEditOpen}
                    startContent={
                      <i className="fa-regular fa-pen-to-square text-blue-400 w-4" />
                    }
                    className="text-stone-600 hover:text-blue-500"
                  >
                    Edit
                  </DropdownItem>
                  <DropdownItem
                    onPress={onOpen}
                    key="delete"
                    startContent={
                      <i className="fa-regular fa-trash-can text-red-400 w-4" />
                    }
                    className="text-danger"
                    color="danger"
                  >
                    Delete
                  </DropdownItem>
                </>
              ) : (
                <DropdownItem
                  key="bookmark"
                  onPress={() => bookMutate()}
                  startContent={
                    <motion.i
                      key={isBookmarked ? "bookmarked" : "unbookmarked"}
                      className={`${isBookmarked ? "fa-solid" : "fa-regular"} fa-bookmark w-4`}
                      style={{ color: isBookmarked ? "#a855f7" : "#c084fc" }}
                      initial={{ scale: 0.5, rotate: -15 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 10,
                      }}
                    />
                  }
                  className={`transition-all duration-200 ${isBookmarked ? "text-purple-500 bg-purple-50" : "text-stone-600 hover:text-purple-500"}`}
                >
                  <span className="font-medium">
                    {isBookmarked ? "Saved!" : "Bookmark"}
                  </span>
                </DropdownItem>
              )}
            </DropdownMenu>
          </Dropdown>
        </CardHeader>

        <CardBody className="px-3 sm:px-5 py-2 gap-3">
          {posts.body && (
            <p className="text-stone-700 text-sm leading-relaxed wrap-break-words">
              {posts.body}
            </p>
          )}
          {posts.image && (
            <div className="rounded-xl overflow-hidden">
              <img
                src={posts.image}
                className="w-full max-h-72 sm:max-h-96 object-cover hover:scale-105 transition-transform duration-500"
                alt=""
              />
            </div>
          )}

          {/* Counts row */}
          <div className="flex flex-wrap gap-3 sm:gap-4 text-xs text-stone-400 pt-1">
            {posts.likesCount > 0 && (
              <span className="flex items-center gap-1">
                <i className="fa-solid fa-thumbs-up text-blue-300" />
                {posts.likesCount} Likes
              </span>
            )}
            {posts.commentsCount > 0 && (
              <span className="flex items-center gap-1">
                <i className="fa-solid fa-comment text-purple-300" />
                {posts.commentsCount} Comments
              </span>
            )}
            {posts.sharesCount > 0 && !posts.isShare && (
              <span className="flex items-center gap-1">
                <i className="fa-solid fa-share text-purple-300" />
                {posts.sharesCount} Shares
              </span>
            )}
          </div>
        </CardBody>

        <Divider className="bg-stone-50" />

        {/* Footer actions */}
        <CardFooter className="flex-col gap-3 px-2 sm:px-5 pb-3 sm:pb-4 pt-2">
          <div className="w-full flex justify-around gap-1">
            {/* Like */}
            <motion.button
              onClick={() => likeMutate()}
              whileTap={{ scale: 0.85, rotate: -5 }}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className={`relative cursor-pointer flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold px-3 sm:px-5 py-2 rounded-xl overflow-hidden transition-colors duration-300 ${
                isLiked
                  ? "bg-blue-500 text-white shadow-md shadow-blue-200"
                  : "bg-stone-100 text-stone-500 hover:bg-blue-50 hover:text-blue-500"
              }`}
            >
              {isLiked &&
                ["🎉", "✨", "💙", "⭐", "🎊"].map((emoji, i) => (
                  <motion.span
                    key={i}
                    className="absolute text-xs pointer-events-none"
                    style={{ left: "50%", top: "50%" }}
                    initial={{ x: 0, y: 0, opacity: 1, scale: 0.5 }}
                    animate={{
                      x: (i % 2 === 0 ? 1 : -1) * (20 + i * 14),
                      y: -(30 + i * 10),
                      opacity: 0,
                      scale: 1.3,
                      rotate: i * 45,
                    }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  >
                    {emoji}
                  </motion.span>
                ))}
              <motion.i
                key={isLiked ? "liked" : "unliked"}
                className={
                  isLiked ? "fa-solid fa-thumbs-up" : "fa-regular fa-thumbs-up"
                }
                animate={
                  isLiked
                    ? {
                        rotate: [0, -20, 15, -10, 8, 0],
                        scale: [1, 1.4, 1.1, 1.3, 1],
                      }
                    : { rotate: 0, scale: 1 }
                }
                transition={{ duration: 0.5, ease: "easeInOut" }}
              />
              <motion.span
                key={isLiked ? "yes" : "no"}
                initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                {isLiked ? "Liked!" : "Like"}
              </motion.span>
            </motion.button>

            <motion.div
              whileTap={{ scale: 0.85, rotate: -5 }}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Link
                to={`/postdetails/${posts._id}`}
                className="flex items-center cursor-pointer gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium px-3 sm:px-4 py-2 rounded-xl text-stone-400 hover:bg-purple-50 hover:text-purple-400 transition-all duration-200"
              >
                <i className="fa-regular fa-comment" />
                Comment
              </Link>
            </motion.div>

            {loggedId === userId ? (
              <div className="flex items-center gap-1.5 text-xs text-stone-300 px-3 sm:px-4 py-2">
                <i className="fa-solid fa-lock text-stone-200" />
                <span className="hidden sm:inline">Your post</span>
              </div>
            ) : (
              <motion.button
                onClick={() => !isShared && shareMutate()}
                disabled={isShared}
                whileTap={!isShared ? { scale: 0.85, rotate: -5 } : {}}
                whileHover={!isShared ? { scale: 1.05 } : {}}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                className={`relative cursor-pointer flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold px-3 sm:px-5 py-2 rounded-xl overflow-hidden transition-colors duration-300 ${
                  isShared
                    ? "bg-purple-500 text-white shadow-md shadow-purple-200"
                    : "bg-stone-100 text-stone-500 hover:bg-purple-50 hover:text-purple-500"
                }`}
              >
                {isShared &&
                  ["🔁", "✨", "💜", "⭐", "🎊"].map((emoji, i) => (
                    <motion.span
                      key={i}
                      className="absolute text-xs pointer-events-none"
                      style={{ left: "50%", top: "50%" }}
                      initial={{ x: 0, y: 0, opacity: 1, scale: 0.5 }}
                      animate={{
                        x: (i % 2 === 0 ? 1 : -1) * (20 + i * 14),
                        y: -(30 + i * 10),
                        opacity: 0,
                        scale: 1.3,
                        rotate: i * 45,
                      }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    >
                      {emoji}
                    </motion.span>
                  ))}
                <motion.i
                  key={isShared ? "shared" : "unshared"}
                  className="fa-solid fa-share"
                  animate={
                    isShared
                      ? {
                          rotate: [0, -20, 15, -10, 8, 0],
                          scale: [1, 1.4, 1.1, 1.3, 1],
                        }
                      : { rotate: 0, scale: 1 }
                  }
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                />
                <motion.span
                  key={isShared ? "yes" : "no"}
                  initial={{ y: 8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {isShared ? "Shared!" : "Share"}
                </motion.span>
              </motion.button>
            )}
          </div>

          {showAllComments
            ? comments.map((comment) => (
                <Comment
                  key={comment._id}
                  postId={posts.id}
                  comment={comment}
                />
              ))
            : posts.topComment?.content && (
                <Comment comment={posts.topComment} postId={posts.id} />
              )}
        </CardFooter>

        <CreateComment
          id={posts._id}
          userId={userId}
          queryKey={
            showAllComments ? [`getPostComment${posts.id}`] : ["getAllPosts"]
          }
        />
      </Card>
    </>
  );
}
