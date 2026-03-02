import React, { useContext, useState } from "react";
import BgAnimation from "../SharedComponents/BgAnimation";
import { Link, useNavigate } from "react-router-dom";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, XCircle } from "lucide-react";
import axios from "axios";
import { addToast } from "@heroui/react";
import { AuthContext } from "../../Context/AuthContextProvider";

const schema = z.object({
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
});

export default function Login() {
  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: zodResolver(schema),
    mode: "onBlur",
  });

  const { islogin, setLogin } = useContext(AuthContext);

  const navigate = useNavigate();

  const [isloading, setloading] = useState(false);
  const { register, handleSubmit, formState, watch } = form;
  const { errors, touchedFields } = formState;

  const watchedFields = watch();

  function FormValidation(values) {
    setloading(true);
    console.log(values);
    axios
      .post("https://route-posts.routemisr.com/users/signin", values, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((res) => {

        addToast({
          title: "Signed In Successfully",
          description: "welcome back friend ",
          timeout: 3000,
          shouldShowTimeoutProgress: true,
          color: "success",
        });
        setloading(false);
        localStorage.setItem("Token", res.data.data.token);
        console.log(res.data.data.token);

        setTimeout(() => {
          setLogin(res.data.data.token);
          navigate("/home");
        }, 3000);
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
    return (
      touchedFields[fieldName] && !errors[fieldName] && watchedFields[fieldName]
    );
  };

  const hasFieldError = (fieldName) => {
    return touchedFields[fieldName] && errors[fieldName];
  };

  return (
    <section>
      <div className="flex flex-col h-screen lg:flex-row">
        <div className="w-full lg:w-1/2 h-125 lg:h-auto flex justify-center items-center">
          <BgAnimation />
        </div>
        <div className="w-full h-full lg:w-1/2 flex px-6 md:px-12 lg:px-24 py-10 justify-center items-center bg-slate-50">
          <form
            onSubmit={handleSubmit(FormValidation)}
            className="p-6 md:p-10 w-full rounded-2xl bg-white border border-purple-400/50 flex flex-col items-center gap-3.5"
          >
            <h2 className="text-2xl md:text-4xl font-bold text-slate-900">
              Login
            </h2>
            <p>
              Dont Have An Account ?{" "}
              <Link className="text-blue-600" to={"/register"}>
                Sign Up
              </Link>{" "}
            </p>
            <div className="mt-4 w-full flex flex-col gap-6">
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
                "Sign In"
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
