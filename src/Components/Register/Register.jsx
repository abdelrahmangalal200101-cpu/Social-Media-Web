import React, { useState } from "react";
import BgAnimation from "../SharedComponents/BgAnimation";
import { Link, useNavigate } from "react-router-dom";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, XCircle } from "lucide-react";
import axios from "axios";
import { addToast } from "@heroui/react";

const schema = z
  .object({
    name: z
      .string()
      .nonempty("Name Is Required")
      .min(3, "Min Length is 3")
      .max(20, "Max Length is 20"),
    username: z
      .string()
      .nonempty("Username Is Required")
      .regex(/^[a-z0-9_-]+$/, "UserName must contain only a-z, 0-9, _ or -")
      .min(3, "Min Length is 3")
      .max(15, "Max Length is 15"),
    email: z
      .string()
      .nonempty("Email Is Required")
      .email("Invalid email format")
      .regex(/^\S+@\S+\.\S+$/, "Email Must Have Name@domain.com"),
    password: z
      .string()
      .nonempty("Password Is Required")
      .regex(
        /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
        "Password must include uppercase, lowercase, number, and special character",
      ),
    rePassword: z.string().nonempty("Repassword is Required"),
    dateOfBirth: z.string().refine((date) => {
      const userDate = new Date(date);
      const currentDate = new Date();
      return (
        currentDate.getFullYear() - userDate.getFullYear() >= 18 &&
        currentDate.getFullYear() - userDate.getFullYear() <= 70
      );
    }, "Your age must be between 18 and 70"),
    gender: z.enum(["male", "female"], {
      errorMap: () => ({ message: "Please select your gender" }),
    }),
  })
  .refine((values) => values.password === values.rePassword, {
    message: "Password and Repassword must be the same",
    path: ["rePassword"],
  });

export default function Register() {
  const form = useForm({
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      rePassword: "",
      dateOfBirth: "",
      gender: "",
    },
    resolver: zodResolver(schema),
    mode: "onBlur",
  });

  const navigate = useNavigate();

  const [isloading, setloading] = useState(false);
  const { register, handleSubmit, formState, watch } = form;
  const { errors, touchedFields } = formState;

  const watchedFields = watch();

  function FormValidation(values) {
    setloading(true);
    console.log(values);
    axios
      .post("https://route-posts.routemisr.com/users/signup", values , {
        headers : {
          "Content-Type" : "application/json"
        }
      })
      .then((res) => {

        addToast({
          title: "Successfully Created",
          description: res.data.message,
          timeout: 2000,
          shouldShowTimeoutProgress: true,
          color: "success",
        });
        setloading(false);
        setTimeout(() => {
          navigate("/login");
        }, 2500);
      })
      .catch((err) => {

        addToast({
          title: "Something Went Wrong",
          description: err.response.data.message,
          color: "danger",
          timeout: 3000,
          shouldShowTimeoutProgress: true,
        });
        setloading(false);
      });
  }

  const isFieldValid = (fieldName) => {
    if (fieldName === "rePassword") {
      return (
        touchedFields[fieldName] &&
        !errors[fieldName] &&
        watchedFields[fieldName] &&
        watchedFields.password === watchedFields.rePassword &&
        watchedFields.password !== ""
      );
    }
    return (
      touchedFields[fieldName] && !errors[fieldName] && watchedFields[fieldName]
    );
  };

  const hasFieldError = (fieldName) => {
    if (fieldName === "rePassword") {
      return (
        (touchedFields[fieldName] && errors[fieldName]) ||
        (touchedFields[fieldName] &&
          watchedFields.password &&
          watchedFields.rePassword &&
          watchedFields.password !== watchedFields.rePassword)
      );
    }
    return touchedFields[fieldName] && errors[fieldName];
  };

  return (
    <section>
      <div className="flex flex-col lg:flex-row">
        <div className="w-full lg:w-1/2 h-125 lg:h-auto flex justify-center items-center">
          <BgAnimation />
        </div>
        <div className="w-full lg:w-1/2 flex px-6 md:px-12 lg:px-24 py-10 justify-center items-center bg-slate-50">
          <form
            onSubmit={handleSubmit(FormValidation)}
            className="p-6 md:p-10 w-full rounded-2xl bg-white border border-purple-400/30 flex flex-col items-center gap-3.5"
          >
            <h2 className="text-2xl md:text-4xl font-bold text-slate-900">
              Create account
            </h2>
            <p>
              Already Have Account ?{" "}
              <Link className="text-blue-600" to={"/login"}>
                Sign in
              </Link>{" "}
            </p>
            <div className="mt-4 w-full flex flex-col gap-6">
              <div className="relative">
                <input
                  type="text"
                  {...register("name")}
                  id="name"
                  className={`peer w-full rounded-xl p-3 pr-12 bg-slate-50 [:not(:placeholder-shown)]:bg-white focus:bg-white focus:outline-0 transition-all duration-300 border-2 placeholder-transparent ${
                    hasFieldError("name")
                      ? "border-red-400 focus:border-red-500"
                      : isFieldValid("name")
                        ? "border-green-400 focus:border-green-500"
                        : "border-slate-200 focus:border-purple-500"
                  }`}
                  placeholder="Enter Your Name"
                />
                <label
                  htmlFor="name"
                  className={`absolute left-3 -top-3 bg-slate-50 px-2 text-slate-600 transition-all duration-300 pointer-events-none text-xs
                    peer-placeholder-shown:top-3 peer-placeholder-shown:bg-transparent peer-placeholder-shown:text-base
                    peer-focus:-top-3 peer-focus:bg-white peer-focus:text-xs
                    peer-[:not(:placeholder-shown)]:-top-3 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:text-xs ${
                      hasFieldError("name")
                        ? "peer-focus:text-red-500"
                        : isFieldValid("name")
                          ? "peer-focus:text-green-500"
                          : "peer-focus:text-purple-500"
                    }`}
                >
                  Enter Your Name
                </label>

                <div className="absolute right-3 top-3.5">
                  {isFieldValid("name") && (
                    <div className="animate-[scale-in_0.3s_ease-out]">
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                    </div>
                  )}
                  {hasFieldError("name") && (
                    <div className="animate-[shake_0.5s_ease-in-out]">
                      <XCircle className="w-6 h-6 text-red-500" />
                    </div>
                  )}
                </div>

                {hasFieldError("name") && (
                  <p className="text-red-500 text-sm mt-1.5 ml-1 animate-[slide-down_0.3s_ease-out]">
                    {errors.name?.message}
                  </p>
                )}
              </div>
              <div className="relative">
                <input
                  type="text"
                  {...register("username")}
                  id="username"
                  className={`peer w-full rounded-xl p-3 pr-12 bg-slate-50 [:not(:placeholder-shown)]:bg-white focus:bg-white focus:outline-0 transition-all duration-300 border-2 placeholder-transparent ${
                    hasFieldError("username")
                      ? "border-red-400 focus:border-red-500"
                      : isFieldValid("username")
                        ? "border-green-400 focus:border-green-500"
                        : "border-slate-200 focus:border-purple-500"
                  }`}
                  placeholder="Enter Your username"
                />
                <label
                  htmlFor="username"
                  className={`absolute left-3 -top-3 bg-slate-50 px-2 text-slate-600 transition-all duration-300 pointer-events-none text-xs
                    peer-placeholder-shown:top-3 peer-placeholder-shown:bg-transparent peer-placeholder-shown:text-base
                    peer-focus:-top-3 peer-focus:bg-white peer-focus:text-xs
                    peer-[:not(:placeholder-shown)]:-top-3 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:text-xs ${
                      hasFieldError("username")
                        ? "peer-focus:text-red-500"
                        : isFieldValid("username")
                          ? "peer-focus:text-green-500"
                          : "peer-focus:text-purple-500"
                    }`}
                >
                  Enter Your Username
                </label>

                <div className="absolute right-3 top-3.5">
                  {isFieldValid("username") && (
                    <div className="animate-[scale-in_0.3s_ease-out]">
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                    </div>
                  )}
                  {hasFieldError("username") && (
                    <div className="animate-[shake_0.5s_ease-in-out]">
                      <XCircle className="w-6 h-6 text-red-500" />
                    </div>
                  )}
                </div>

                {hasFieldError("username") && (
                  <p className="text-red-500 text-sm mt-1.5 ml-1 animate-[slide-down_0.3s_ease-out]">
                    {errors.username?.message}
                  </p>
                )}
              </div>

              <div className="relative">
                <input
                  type="email"
                  {...register("email")}
                  id="email"
                  className={`peer w-full [:not(:placeholder-shown)]:bg-white rounded-xl p-3 pr-12 bg-slate-50 focus:bg-white focus:outline-0 transition-all duration-300 border-2 placeholder-transparent ${
                    hasFieldError("email")
                      ? "border-red-400 focus:border-red-500"
                      : isFieldValid("email")
                        ? "border-green-400 focus:border-green-500"
                        : "border-slate-200 focus:border-purple-500"
                  }`}
                  placeholder="Email@domain.com"
                />
                <label
                  htmlFor="email"
                  className={`absolute left-3 -top-3 bg-slate-50 px-2 text-slate-600 transition-all duration-300 pointer-events-none text-xs
                    peer-placeholder-shown:top-3 peer-placeholder-shown:bg-transparent peer-placeholder-shown:text-base
                    peer-focus:-top-3 peer-focus:bg-white peer-focus:text-xs
                    peer-[:not(:placeholder-shown)]:-top-3 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:text-xs ${
                      hasFieldError("email")
                        ? "peer-focus:text-red-500"
                        : isFieldValid("email")
                          ? "peer-focus:text-green-500"
                          : "peer-focus:text-purple-500"
                    }`}
                >
                  Email@domain.com
                </label>

                <div className="absolute right-3 top-3.5">
                  {isFieldValid("email") && (
                    <div className="animate-[scale-in_0.3s_ease-out]">
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                    </div>
                  )}
                  {hasFieldError("email") && (
                    <div className="animate-[shake_0.5s_ease-in-out]">
                      <XCircle className="w-6 h-6 text-red-500" />
                    </div>
                  )}
                </div>

                {hasFieldError("email") && (
                  <p className="text-red-500 text-sm mt-1.5 ml-1 animate-[slide-down_0.3s_ease-out]">
                    {errors.email?.message}
                  </p>
                )}
              </div>

              <div className="relative">
                <input
                  type="password"
                  {...register("password")}
                  id="password"
                  className={`peer w-full [:not(:placeholder-shown)]:bg-white rounded-xl p-3 pr-12 bg-slate-50 focus:bg-white focus:outline-0 transition-all duration-300 border-2 placeholder-transparent ${
                    hasFieldError("password")
                      ? "border-red-400 focus:border-red-500"
                      : isFieldValid("password")
                        ? "border-green-400 focus:border-green-500"
                        : "border-slate-200 focus:border-purple-500"
                  }`}
                  placeholder="Your Password"
                />
                <label
                  htmlFor="password"
                  className={`absolute left-3 -top-3 bg-slate-50 px-2 text-slate-600 transition-all duration-300 pointer-events-none text-xs
                    peer-placeholder-shown:top-3 peer-placeholder-shown:bg-transparent peer-placeholder-shown:text-base
                    peer-focus:-top-3 peer-focus:bg-white peer-focus:text-xs
                    peer-[:not(:placeholder-shown)]:-top-3 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:text-xs ${
                      hasFieldError("password")
                        ? "peer-focus:text-red-500"
                        : isFieldValid("password")
                          ? "peer-focus:text-green-500"
                          : "peer-focus:text-purple-500"
                    }`}
                >
                  Your Password
                </label>

                <div className="absolute right-3 top-3.5">
                  {isFieldValid("password") && (
                    <div className="animate-[scale-in_0.3s_ease-out]">
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                    </div>
                  )}
                  {hasFieldError("password") && (
                    <div className="animate-[shake_0.5s_ease-in-out]">
                      <XCircle className="w-6 h-6 text-red-500" />
                    </div>
                  )}
                </div>

                {hasFieldError("password") && (
                  <p className="text-red-500 text-sm mt-1.5 ml-1 animate-[slide-down_0.3s_ease-out]">
                    {errors.password?.message}
                  </p>
                )}
              </div>

              <div className="relative">
                <input
                  type="password"
                  {...register("rePassword")}
                  id="confirmPassword"
                  className={`peer w-full [:not(:placeholder-shown)]:bg-white rounded-xl p-3 pr-12 bg-slate-50 focus:bg-white focus:outline-0 transition-all duration-300 border-2 placeholder-transparent ${
                    hasFieldError("rePassword")
                      ? "border-red-400 focus:border-red-500"
                      : isFieldValid("rePassword")
                        ? "border-green-400 focus:border-green-500"
                        : "border-slate-200 focus:border-purple-500"
                  }`}
                  placeholder="Confirm Password"
                />
                <label
                  htmlFor="confirmPassword"
                  className={`absolute left-3 -top-3 bg-slate-50 px-2 text-slate-600 transition-all duration-300 pointer-events-none text-xs
                    peer-placeholder-shown:top-3 peer-placeholder-shown:bg-transparent peer-placeholder-shown:text-base
                    peer-focus:-top-3 peer-focus:bg-white peer-focus:text-xs
                    peer-[:not(:placeholder-shown)]:-top-3 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:text-xs ${
                      hasFieldError("rePassword")
                        ? "peer-focus:text-red-500"
                        : isFieldValid("rePassword")
                          ? "peer-focus:text-green-500"
                          : "peer-focus:text-purple-500"
                    }`}
                >
                  Confirm Password
                </label>

                <div className="absolute right-3 top-3.5">
                  {isFieldValid("rePassword") && (
                    <div className="animate-[scale-in_0.3s_ease-out]">
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                    </div>
                  )}
                  {hasFieldError("rePassword") && (
                    <div className="animate-[shake_0.5s_ease-in-out]">
                      <XCircle className="w-6 h-6 text-red-500" />
                    </div>
                  )}
                </div>

                {hasFieldError("rePassword") && (
                  <p className="text-red-500 text-sm mt-1.5 ml-1 animate-[slide-down_0.3s_ease-out]">
                    {errors.rePassword?.message ||
                      (watchedFields.password !== watchedFields.rePassword
                        ? "Password and Repassword must be the same"
                        : "")}
                  </p>
                )}
              </div>

              <div className="relative">
                <input
                  type="date"
                  {...register("dateOfBirth")}
                  id="birthdate"
                  className={`peer w-full [:not(:placeholder-shown)]:bg-white  rounded-xl p-3 pr-12 bg-slate-50 focus:bg-white focus:outline-0 transition-all duration-300 border-2 placeholder-transparent ${
                    hasFieldError("dateOfBirth")
                      ? "border-red-400 focus:border-red-500"
                      : isFieldValid("dateOfBirth")
                        ? "border-green-400 focus:border-green-500"
                        : "border-slate-200 focus:border-purple-500"
                  }`}
                  placeholder="Birthdate"
                />
                <label
                  htmlFor="birthdate"
                  className={`absolute left-3 -top-3 bg-slate-50 px-2 text-slate-600 transition-all duration-300 pointer-events-none text-xs
                    peer-placeholder-shown:top-3 peer-placeholder-shown:bg-transparent peer-placeholder-shown:text-base
                    peer-focus:-top-3 peer-focus:bg-white peer-focus:text-xs
                    peer-[:not(:placeholder-shown)]:-top-3 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:text-xs ${
                      hasFieldError("dateOfBirth")
                        ? "peer-focus:text-red-500"
                        : isFieldValid("dateOfBirth")
                          ? "peer-focus:text-green-500"
                          : "peer-focus:text-purple-500"
                    }`}
                >
                  Birthdate
                </label>

                <div className="absolute right-3 top-3.5">
                  {isFieldValid("dateOfBirth") && (
                    <div className="animate-[scale-in_0.3s_ease-out]">
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                    </div>
                  )}
                  {hasFieldError("dateOfBirth") && (
                    <div className="animate-[shake_0.5s_ease-in-out]">
                      <XCircle className="w-6 h-6 text-red-500" />
                    </div>
                  )}
                </div>

                {hasFieldError("dateOfBirth") && (
                  <p className="text-red-500 text-sm mt-1.5 ml-1 animate-[slide-down_0.3s_ease-out]">
                    {errors.dateOfBirth?.message}
                  </p>
                )}
              </div>

              <div className="relative">
                <div className="flex gap-6 justify-start">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      {...register("gender")}
                      id="male"
                      value="male"
                      className="w-5 h-5 accent-purple-500 cursor-pointer"
                    />
                    <label
                      htmlFor="male"
                      className="text-slate-700 cursor-pointer"
                    >
                      Male
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      {...register("gender")}
                      id="female"
                      value="female"
                      className="w-5 h-5 accent-purple-500 cursor-pointer"
                    />
                    <label
                      htmlFor="female"
                      className="text-slate-700 cursor-pointer"
                    >
                      Female
                    </label>
                  </div>
                </div>

                {hasFieldError("gender") && (
                  <p className="text-red-500 text-sm mt-1.5 ml-1 animate-[slide-down_0.3s_ease-out]">
                    {errors.gender?.message}
                  </p>
                )}
              </div>
            </div>

            <button
              disabled={isloading}
              className="w-full md:w-3/4 mt-4 flex items-center justify-center gap-2
             cursor-pointer disabled:bg-purple-300 
             disabled:cursor-not-allowed hover:bg-purple-500 
             transition-all duration-300 py-3 
             bg-purple-400 rounded-2xl 
             text-white font-bold"
            >
              {isloading ? (
                <>
                  <i className="fa-solid fa-circle-notch fa-spin"></i>
                  <span>Loading</span>
                </>
              ) : (
                "Sign Up"
              )}
            </button>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes scale-in {
          from {
            transform: scale(0);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-5px);
          }
          75% {
            transform: translateX(5px);
          }
        }

        @keyframes slide-down {
          from {
            transform: translateY(-10px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </section>
  );
}
