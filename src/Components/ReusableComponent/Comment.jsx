import React, { useContext, useState, useRef } from "react";
import {
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
  Button,
  useDisclosure,
  addToast,
  Textarea,
} from "@heroui/react";
import picture from "../../assets/Gemini_Generated_Image_hoh3vphoh3vphoh3.png";
import { AuthContext } from "../../Context/AuthContextProvider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
};

export default function Comment({ comment, postId }) {
  const userId = comment?.commentCreator?._id;
  const { loggedId } = useContext(AuthContext);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment?.content || "");
  const [editImage, setEditImage] = useState(comment?.image || null);
  const [editImageFile, setEditImageFile] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(comment?.image || null);
  const imageInputRef = useRef();

  const hasChanges =
    editContent.trim() !== (comment?.content || "").trim() ||
    editImagePreview !== (comment?.image || null);

  const hasContent = editContent.trim() !== "" || editImagePreview !== null;
  const canSave = hasChanges && hasContent;

  const query = useQueryClient();

  const invalidateAll = () => {
    query.invalidateQueries({ queryKey: ["getAllPosts"] });
    query.invalidateQueries({ queryKey: ["profilePosts"] });
    query.invalidateQueries({ queryKey: ["getHomePosts"] });
    query.invalidateQueries({ queryKey: ["userProfile", userId] });
    query.invalidateQueries({ queryKey: [`getOnePost${postId}`] });
    query.invalidateQueries({ queryKey: [`getPostComment${postId}`] });
  };

  function deleteComment() {
    return axios.delete(
      `https://route-posts.routemisr.com/posts/${postId}/comments/${comment._id}`,
      { headers: { Authorization: `Bearer ${localStorage.getItem("Token")}` } }
    );
  }

  const { mutate: delMutate, isPending: delPending } = useMutation({
    mutationFn: deleteComment,
    onSuccess: () => {
      invalidateAll();
      onClose();
      addToast({ title: "Comment deleted", description: "Your comment has been removed successfully.", color: "danger" });
    },
    onError: () => {
      addToast({ title: "Something went wrong", description: "Couldn't delete the comment. Please try again.", color: "warning" });
    },
  });

  function updateComment() {
    const formData = new FormData();
    formData.append("content", editContent);
    if (editImageFile) {
      formData.append("image", editImageFile);
    } else if (!editImage && comment?.image) {
      formData.append("image", "");
    }
    return axios.put(
      `https://route-posts.routemisr.com/posts/${postId}/comments/${comment._id}`,
      formData,
      { headers: { Authorization: `Bearer ${localStorage.getItem("Token")}` } }
    );
  }

  const { mutate: upMutate, isPending: upPending } = useMutation({
    mutationFn: updateComment,
    onSuccess: () => {
      invalidateAll();
      setIsEditing(false);
      setEditImageFile(null);
      addToast({ title: "Comment updated", description: "Your comment has been edited successfully.", color: "success" });
    },
    onError: () => {
      addToast({ title: "Something went wrong", description: "Couldn't update the comment. Please try again.", color: "warning" });
    },
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setEditImageFile(file);
    setEditImagePreview(URL.createObjectURL(file));
    setEditImage(file);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(comment?.content || "");
    setEditImage(comment?.image || null);
    setEditImageFile(null);
    setEditImagePreview(comment?.image || null);
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="sm" placement="center">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <i className="fa-regular fa-trash-can text-red-500 text-sm" />
              </div>
              <span className="text-stone-700 text-base font-semibold">Delete Comment</span>
            </div>
          </ModalHeader>
          <ModalBody>
            <p className="text-stone-500 text-sm">
              Are you sure you want to delete this comment? This action{" "}
              <span className="text-red-500 font-medium">cannot be undone</span>.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose} className="text-stone-500">Cancel</Button>
            <Button color="danger" onPress={() => delMutate()} isLoading={delPending} className="font-medium">Delete</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <div className="flex items-start w-full gap-2 sm:gap-3 px-1 sm:px-2 py-2">
        <Image
          height={30}
          width={30}
          radius="full"
          src={comment?.commentCreator?.photo || picture}
          className="ring-2 ring-purple-100 shrink-0 mt-0.5 sm:w-8.5 sm:h-8.5"
        />

        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <div className="bg-stone-100 rounded-2xl rounded-tl-sm px-3 sm:px-4 py-2">
            <div className="flex items-center justify-between mb-0.5 gap-2">
              <p className="text-xs font-semibold text-purple-800 truncate">
                {comment?.commentCreator?.name}
              </p>

              {loggedId === userId && !isEditing && (
                <Dropdown>
                  <DropdownTrigger>
                    <i className="fa-solid fa-ellipsis text-stone-300 cursor-pointer hover:text-stone-500 transition text-xs px-1 shrink-0" />
                  </DropdownTrigger>
                  <DropdownMenu aria-label="Comment Actions" className="min-w-36">
                    <DropdownItem
                      key="edit"
                      onPress={() => setIsEditing(true)}
                      startContent={<i className="fa-regular fa-pen-to-square text-blue-400 w-4" />}
                      className="text-stone-600 hover:text-blue-500"
                    >
                      Edit
                    </DropdownItem>
                    <DropdownItem
                      key="delete"
                      onPress={onOpen}
                      startContent={<i className="fa-regular fa-trash-can text-red-400 w-4" />}
                      className="text-danger"
                      color="danger"
                    >
                      Delete
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              )}
            </div>

            {/* Content or Edit form */}
            {!isEditing ? (
              <>
                {comment?.content && (
                  <p className="text-sm text-stone-600 leading-relaxed wrap-break-words">
                    {comment.content}
                  </p>
                )}
                {comment?.image && (
                  <div className="mt-3 rounded-xl overflow-hidden">
                    <img
                      src={comment.image}
                      alt="comment attachment"
                      className="max-h-48 w-full sm:w-auto object-cover rounded-xl"
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col gap-2 mt-1">
                <Textarea
                  value={editContent}
                  onValueChange={setEditContent}
                  minRows={2}
                  maxRows={6}
                  classNames={{
                    input: "text-sm text-stone-600",
                    inputWrapper: "bg-white shadow-none border border-purple-200 hover:border-purple-400",
                  }}
                />

                {editImagePreview && (
                  <div className="relative w-fit max-w-full">
                    <img
                      src={editImagePreview}
                      alt="preview"
                      className="max-h-36 max-w-full rounded-xl object-cover"
                    />
                    <button
                      onClick={() => {
                        setEditImage(null);
                        setEditImageFile(null);
                        setEditImagePreview(null);
                        imageInputRef.current.value = "";
                      }}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition"
                    >
                      <i className="fa-solid fa-xmark text-white text-[10px]" />
                    </button>
                  </div>
                )}

                {/* Edit actions row */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <button
                    onClick={() => imageInputRef.current.click()}
                    className="text-xs text-purple-400 hover:text-purple-600 transition flex items-center gap-1"
                  >
                    <i className="fa-regular fa-image" />
                    <span>{editImagePreview ? "Change image" : "Add image"}</span>
                  </button>
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="light"
                      onPress={handleCancelEdit}
                      className="text-stone-400 text-xs h-7 min-w-0 px-3"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      color="secondary"
                      onPress={() => upMutate()}
                      isLoading={upPending}
                      isDisabled={!canSave}
                      className="text-xs h-7 min-w-0 px-3 bg-purple-500 text-white disabled:opacity-40"
                    >
                      Save
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {comment?.createdAt && !isEditing && (
            <p className="text-xs text-stone-400 px-1">{formatDate(comment?.createdAt)}</p>
          )}
        </div>
      </div>
    </>
  );
}