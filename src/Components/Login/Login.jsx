import React, { useState } from "react";
import BgAnimation from "../SharedComponents/BgAnimation";
import { Link, useNavigate } from "react-router-dom";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CheckCircle2,
  XCircle,
  User,
  AtSign,
  Mail,
  Lock,
  Calendar,
  UserPlus,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import axios from "axios";
import { addToast } from "@heroui/react";
import { motion, AnimatePresence } from "framer-motion";

// --- Validation Schema ---
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
      .regex(/^[a-z0-9_-]+$/, "Invalid Format")
      .min(3)
      .max(15),
    email: z
      .string()
      .nonempty("Email Is Required")
      .email("Invalid email format"),
    password: z
      .string()
      .nonempty("Password Is Required")
      .regex(
        /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
        "Weak password",
      ),
    rePassword: z.string().nonempty("Required"),
    dateOfBirth: z.string().refine((date) => {
      const age = new Date().getFullYear() - new Date(date).getFullYear();
      return age >= 18 && age <= 70;
    }, "Age 18-70"),
    gender: z.enum(["male", "female"], {
      errorMap: () => ({ message: "Select gender" }),
    }),
  })
  .refine((values) => values.password === values.rePassword, {
    message: "Passwords mismatch",
    path: ["rePassword"],
  });

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

function FloatingField({
  id,
  label,
  type = "text",
  registration,
  isValid,
  hasError,
  errorMessage,
  icon: Icon,
  rightSlot,
}) {
  return (
    <motion.div variants={fadeUp} className="relative w-full">
      <span
        className={`absolute left-3.5 top-4.25 z-10 ${hasError ? "text-red-400" : isValid ? "text-green-500" : "text-slate-400"}`}
      >
        <Icon size={17} />
      </span>
      <input
        id={id}
        type={type}
        {...registration}
        placeholder=" "
        className={`peer w-full rounded-xl pl-10 pr-10 pt-5 pb-2 bg-slate-50 focus:bg-white focus:outline-none transition-all border-2 text-sm
        ${hasError ? "border-red-400 focus:border-red-500" : isValid ? "border-green-400 focus:border-green-500" : "border-slate-200 focus:border-purple-500"}`}
      />
      <label
        htmlFor={id}
        className={`absolute left-10 top-4 text-sm pointer-events-none transition-all origin-left peer-focus:-translate-y-3 peer-focus:scale-[0.78] peer-not-placeholder-shown:-translate-y-3 peer-not-placeholder-shown:scale-[0.78]
        ${hasError ? "text-red-400" : isValid ? "text-green-500" : "text-slate-400"}`}
      >
        {label}
      </label>
      <div className="absolute right-3 top-4 flex items-center gap-1">
        {rightSlot}
        <AnimatePresence mode="wait">
          {isValid && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <CheckCircle2 size={18} className="text-green-500" />
            </motion.span>
          )}
          {hasError && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <XCircle size={18} className="text-red-500" />
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      {hasError && (
        <p className="text-red-500 text-[10px] mt-1 ml-1">{errorMessage}</p>
      )}
    </motion.div>
  );
}

export default function Register() {
  const navigate = useNavigate();
  const [isloading, setloading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showRePass, setShowRePass] = useState(false);

  const { register, handleSubmit, formState, watch } = useForm({
    resolver: zodResolver(schema),
    mode: "onBlur",
  });

  const { errors, touchedFields } = formState;
  const watchedFields = watch();
  const isFieldValid = (f) =>
    touchedFields[f] && !errors[f] && watchedFields[f];
  const hasFieldError = (f) => touchedFields[f] && errors[f];

  function FormValidation(values) {
    setloading(true);
    axios
      .post("https://route-posts.routemisr.com/users/signup", values)
      .then(() => {
        addToast({ title: "Account Created!", color: "success" });
        setTimeout(() => navigate("/login"), 2000);
      })
      .catch((err) => {
        addToast({
          title: "Error",
          description: err.response?.data?.message,
          color: "danger",
        });
        setloading(false);
      });
  }

  return (
    <section className="min-h-screen flex flex-col lg:flex-row bg-slate-50">
      {/* Left Side: Animation (Matched with Login) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7 }}
        className="w-full lg:w-1/2 h-56 sm:h-72 lg:h-screen shrink-0"
      >
        <BgAnimation />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full lg:w-1/2 flex items-center justify-center px-5 py-8"
      >
        <div className="w-full max-w-xl bg-white rounded-3xl border border-purple-100 shadow-xl p-6 sm:p-10">
          <div className="flex flex-col gap-4">
            <div className="text-center">
              <div className="h-12 w-12 rounded-2xl bg-linear-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg mx-auto mb-3">
                <UserPlus size={22} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">
                Create account
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Already have an account?{" "}
                <Link className="text-purple-500 font-bold" to="/login">
                  Sign In
                </Link>
              </p>
            </div>

            <form
              onSubmit={handleSubmit(FormValidation)}
              className="grid grid-cols-2 gap-3"
            >
              <div className="col-span-2 md:col-span-1">
                <FloatingField
                  id="name"
                  label="Full Name"
                  registration={register("name")}
                  icon={User}
                  isValid={isFieldValid("name")}
                  hasError={hasFieldError("name")}
                  errorMessage={errors.name?.message}
                />
              </div>
              <div className="col-span-2 md:col-span-1">
                <FloatingField
                  id="username"
                  label="Username"
                  registration={register("username")}
                  icon={AtSign}
                  isValid={isFieldValid("username")}
                  hasError={hasFieldError("username")}
                  errorMessage={errors.username?.message}
                />
              </div>

              <div className="col-span-2">
                <FloatingField
                  id="email"
                  label="Email Address"
                  type="email"
                  registration={register("email")}
                  icon={Mail}
                  isValid={isFieldValid("email")}
                  hasError={hasFieldError("email")}
                  errorMessage={errors.email?.message}
                />
              </div>

              <div className="col-span-2 md:col-span-1">
                <FloatingField
                  id="password"
                  label="Password"
                  type={showPass ? "text" : "password"}
                  registration={register("password")}
                  icon={Lock}
                  isValid={isFieldValid("password")}
                  hasError={hasFieldError("password")}
                  errorMessage={errors.password?.message}
                  rightSlot={
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                    >
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  }
                />
              </div>
              <div className="col-span-2 md:col-span-1">
                <FloatingField
                  id="rePassword"
                  label="Confirm"
                  type={showRePass ? "text" : "password"}
                  registration={register("rePassword")}
                  icon={Lock}
                  isValid={isFieldValid("rePassword")}
                  hasError={hasFieldError("rePassword")}
                  errorMessage={errors.rePassword?.message}
                  rightSlot={
                    <button
                      type="button"
                      onClick={() => setShowRePass(!showRePass)}
                    >
                      {showRePass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  }
                />
              </div>

              {/* Birthdate & Gender (Side by side on all screens) */}
              <div className="col-span-1">
                <FloatingField
                  id="dateOfBirth"
                  label="Birthdate"
                  type="date"
                  registration={register("dateOfBirth")}
                  icon={Calendar}
                  isValid={isFieldValid("dateOfBirth")}
                  hasError={hasFieldError("dateOfBirth")}
                  errorMessage={errors.dateOfBirth?.message}
                />
              </div>
              <div
                className={`col-span-1 flex items-center justify-around px-2 rounded-xl border-2 transition-all bg-slate-50 ${hasFieldError("gender") ? "border-red-400" : isFieldValid("gender") ? "border-green-400" : "border-slate-200"}`}
              >
                {["male", "female"].map((g) => (
                  <label
                    key={g}
                    className="flex items-center gap-1 cursor-pointer"
                  >
                    <input
                      type="radio"
                      value={g}
                      {...register("gender")}
                      className="w-3.5 h-3.5 accent-purple-500"
                    />
                    <span className="text-[12px] text-slate-600 capitalize">
                      {g === "male" ? "M" : "F"}
                    </span>
                  </label>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                disabled={isloading}
                className="col-span-2 w-full mt-2 py-3.5 bg-linear-to-r from-purple-500 to-violet-600 text-white font-bold rounded-2xl shadow-lg disabled:opacity-70 flex justify-center items-center gap-2"
              >
                {isloading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  "Sign Up"
                )}
              </motion.button>
            </form>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
