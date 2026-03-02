import React, { useRef, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Card,
  CardBody,
  Image,
  addToast,
} from "@heroui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useContext } from "react";
import { AuthContext } from "../../Context/AuthContextProvider";

export default function CreatePost() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [isUploaded, setIsUploaded] = useState(false);
  const { user } = useContext(AuthContext);

  const textInput = useRef(null);
  const imageInput = useRef(null);

  function handleImgChanger(e) {
    const file = e.target.files[0];
    setIsUploaded(URL.createObjectURL(file));
  }

  function removeImage() {
    setIsUploaded(false);
    imageInput.current.value = "";
  }

  function preparePost() {
    const formData = new FormData();
    if (textInput.current.value) formData.append("body", textInput.current.value);
    if (imageInput.current.files[0]) formData.append("image", imageInput.current.files[0]);
    return formData;
  }

  function createPost() {
    return axios.post(`https://route-posts.routemisr.com/posts`, preparePost(), {
      headers: { Authorization: `Bearer ${localStorage.getItem("Token")}` },
    });
  }

  const query = useQueryClient();

  const { isPending, mutateAsync } = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      query.invalidateQueries({ queryKey: ["getAllPosts"] });
      query.invalidateQueries({ queryKey: ["getHomePosts"] });
      query.invalidateQueries({ queryKey: ["profilePosts"] });
      addToast({ title: "Post Created!", description: "Your post has been shared successfully.", color: "success", timeout: 3000 });
      textInput.current.value = "";
      setIsUploaded(false);
      imageInput.current.value = "";
    },
    onError: (error) => {
      console.log(error);
      addToast({ title: "Something went wrong", description: "Failed to create post, please try again.", color: "danger", timeout: 3000 });
    },
  });

  return (
    <div className="w-full max-w-185 mx-auto mt-4 sm:mt-6 px-2 sm:px-0">
      <Card className="rounded-2xl shadow-sm border border-stone-100 bg-white hover:shadow-md transition-shadow duration-300">
        <CardBody className="px-3 sm:px-5 py-3 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <Image
              height={40}
              width={40}
              radius="full"
              src={user?.photo}
              className="ring-2 ring-purple-100 shrink-0 sm:w-11.5 sm:h-11.5"
            />

            <button
              onClick={onOpen}
              className="flex-1 text-left text-sm text-stone-400 bg-stone-50 border border-stone-100 rounded-full px-3 sm:px-4 py-2 hover:bg-purple-50 hover:border-purple-200 hover:text-purple-400 transition-all duration-300 shadow-sm hover:shadow cursor-pointer truncate"
            >
              What's on your mind...
            </button>

            <span className="text-stone-300 hover:text-purple-600 transition-colors duration-200 p-1 sm:p-2 shrink-0">
              <i className="fa-solid fa-blog" />
            </span>
          </div>
        </CardBody>

        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg" placement="center"
          classNames={{ base: "mx-2 sm:mx-auto" }}>
          <ModalContent className="rounded-2xl">
            {(onClose) => (
              <>
                <ModalHeader className="flex items-center gap-3 px-4 sm:px-5 pt-5 pb-3 border-b border-stone-100">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Image
                      height={40}
                      width={40}
                      radius="full"
                      src={user?.photo}
                      className="ring-2 ring-purple-100 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-semibold text-stone-800 text-sm truncate">{user?.name || "Your Name"}</p>
                      <p className="text-xs text-stone-400">Posting publicly</p>
                    </div>
                  </div>
                </ModalHeader>

                <ModalBody className="px-4 sm:px-5 py-4 gap-4">
                  <textarea
                    placeholder="What's on your mind..."
                    ref={textInput}
                    rows={4}
                    className="w-full bg-transparent outline-none text-sm text-stone-700 placeholder:text-stone-400 resize-none"
                  />

                  {isUploaded && (
                    <div className="rounded-xl overflow-hidden relative">
                      <img
                        className="w-full max-h-52 sm:max-h-64 object-cover"
                        src={isUploaded}
                        alt="upload preview"
                      />
                      <button
                        onClick={removeImage}
                        className="absolute top-3 right-3 bg-white border border-stone-200 text-stone-400 hover:text-purple-500 hover:border-red-200 rounded-full w-7 h-7 flex items-center justify-center shadow-sm transition-colors duration-200 cursor-pointer"
                      >
                        <i className="fa-solid fa-xmark text-sm" />
                      </button>
                    </div>
                  )}
                </ModalBody>

                <ModalFooter className="flex items-center justify-between px-4 sm:px-5 pb-4 pt-2 border-t border-stone-100 flex-wrap gap-2">
                  <label className="flex items-center gap-2 text-sm text-stone-400 hover:text-purple-500 cursor-pointer transition-colors duration-200">
                    <i className="fa-regular fa-image text-base" />
                    <span>Photo</span>
                    <input type="file" onChange={handleImgChanger} ref={imageInput} className="hidden" />
                  </label>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="light"
                      onPress={onClose}
                      className="text-stone-400 hover:text-stone-600 rounded-xl"
                    >
                      Cancel
                    </Button>
                    <button
                      onClick={() => mutateAsync().then(() => onClose())}
                      disabled={isPending}
                      className={`px-4 sm:px-5 py-2 rounded-xl text-sm font-medium text-white transition-all duration-200 cursor-pointer shadow-sm flex items-center gap-2
                        ${isPending ? "bg-purple-300 cursor-not-allowed" : "bg-purple-500 hover:bg-purple-600"}`}
                    >
                      {isPending ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          Posting...
                        </>
                      ) : (
                        "Post"
                      )}
                    </button>
                  </div>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </Card>
    </div>
  );
}