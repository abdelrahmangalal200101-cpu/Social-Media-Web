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
  ChevronRight,
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
        "Password too weak",
      ),
    rePassword: z.string().nonempty("Repassword is Required"),
    dateOfBirth: z.string().refine((date) => {
      const userDate = new Date(date);
      const currentDate = new Date();
      const age = currentDate.getFullYear() - userDate.getFullYear();
      return age >= 18 && age <= 70;
    }, "Your age must be between 18 and 70"),
    gender: z.enum(["male", "female"], {
      errorMap: () => ({ message: "Please select your gender" }),
    }),
  })
  .refine((values) => values.password === values.rePassword, {
    message: "Passwords must match",
    path: ["rePassword"],
  });

// --- Animation Variants ---
const pageVariants = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.55, ease: "easeOut" },
  },
};
const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6 } },
};
const stagger = {
  visible: { transition: { staggerChildren: 0.05, delayChildren: 0.2 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// --- Reusable Floating Field Component ---
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
        className={`absolute left-3.5 top-4.25 z-10 transition-colors duration-200 
        ${hasError ? "text-red-400" : isValid ? "text-green-500" : "text-slate-400"}`}
      >
        <Icon size={17} />
      </span>

      <input
        id={id}
        type={type}
        {...registration}
        placeholder=" "
        className={`peer w-full rounded-xl pl-10 pr-12 pt-5 pb-2 bg-slate-50 focus:bg-white 
          focus:outline-none transition-all duration-300 border-2 text-sm text-slate-800
          ${hasError ? "border-red-400 focus:border-red-500" : isValid ? "border-green-400 focus:border-green-500" : "border-slate-200 focus:border-purple-500"}`}
      />

      <label
        htmlFor={id}
        className={`absolute left-10 top-4 text-sm pointer-events-none transition-all duration-200 origin-left
          peer-focus:-translate-y-3 peer-focus:scale-[0.78] peer-not-placeholder-shown:-translate-y-3 peer-not-placeholder-shown:scale-[0.78]
          ${hasError ? "text-red-400" : isValid ? "text-green-500" : "text-slate-400"}`}
      >
        {label}
      </label>

      <div className="absolute right-3.5 top-4 flex items-center gap-1">
        {rightSlot}
        <AnimatePresence mode="wait">
          {isValid && (
            <motion.span
              key="ok"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <CheckCircle2 size={18} className="text-green-500" />
            </motion.span>
          )}
          {hasError && (
            <motion.span
              key="err"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <XCircle size={18} className="text-red-500" />
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {hasError && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-red-500 text-[11px] mt-1 ml-1"
          >
            {errorMessage}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function Register() {
  const navigate = useNavigate();
  const [isloading, setloading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);

  const { register, handleSubmit, formState, watch } = useForm({
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

  const { errors, touchedFields } = formState;
  const watchedFields = watch();

  const isFieldValid = (f) =>
    touchedFields[f] && !errors[f] && watchedFields[f];
  const hasFieldError = (f) => touchedFields[f] && errors[f];

  function FormValidation(values) {
    setloading(true);
    axios
      .post("https://route-posts.routemisr.com/users/signup", values)
      .then((res) => {
        addToast({
          title: "Account Created!",
          description: "Welcome to our community 🚀",
          color: "success",
          timeout: 2500,
        });
        setTimeout(() => navigate("/login"), 2500);
      })
      .catch((err) => {
        addToast({
          title: "Registration Failed",
          description: err.response?.data?.message || "Something went wrong",
          color: "danger",
          timeout: 3000,
        });
        setloading(false);
      });
  }

  return (
    <section className="min-h-screen flex flex-col lg:flex-row bg-slate-50">
      {/* Left Side: Animation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="w-full lg:w-1/2 h-56 sm:h-72 lg:h-screen shrink-0"
      >
        <BgAnimation />
      </motion.div>

      <motion.div
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        className="w-full lg:w-1/2 flex items-center justify-center px-5 sm:px-12 py-10"
      >
        <motion.div
          variants={cardVariants}
          className="w-full max-w-xl bg-white rounded-3xl border border-purple-200/60 shadow-xl shadow-purple-100/40 p-7 sm:p-10"
        >
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-5"
          >
            <motion.div
              variants={fadeUp}
              className="flex flex-col items-center gap-1 mb-2"
            >
              <div className="h-12 w-12 rounded-2xl bg-linear-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg shadow-purple-200 mb-3">
                <UserPlus size={22} className="text-white" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                Create account
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Already have an account?{" "}
                <Link
                  className="text-purple-500 font-semibold hover:underline"
                  to="/login"
                >
                  Sign In
                </Link>
              </p>
            </motion.div>

            <form
              onSubmit={handleSubmit(FormValidation)}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <FloatingField
                id="name"
                label="Full Name"
                registration={register("name")}
                icon={User}
                isValid={isFieldValid("name")}
                hasError={hasFieldError("name")}
                errorMessage={errors.name?.message}
              />

              <FloatingField
                id="username"
                label="Username"
                registration={register("username")}
                icon={AtSign}
                isValid={isFieldValid("username")}
                hasError={hasFieldError("username")}
                errorMessage={errors.username?.message}
              />

              <div className="md:col-span-2">
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

              <FloatingField
                id="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                registration={register("password")}
                icon={Lock}
                isValid={isFieldValid("password")}
                hasError={hasFieldError("password")}
                errorMessage={errors.password?.message}
                rightSlot={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-purple-500 transition-colors"
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                }
              />

              <FloatingField
                id="rePassword"
                label="Confirm Password"
                type={showRePassword ? "text" : "password"}
                registration={register("rePassword")}
                icon={Lock}
                isValid={isFieldValid("rePassword")}
                hasError={hasFieldError("rePassword")}
                errorMessage={errors.rePassword?.message}
                rightSlot={
                  <button
                    type="button"
                    onClick={() => setShowRePassword(!showRePassword)}
                    className="text-slate-400 hover:text-purple-500 transition-colors"
                  >
                    {showRePassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                }
              />

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

              <motion.div
                variants={fadeUp}
                className={`flex items-center gap-6 px-4 py-3 rounded-xl border-2 transition-all duration-300 bg-slate-50
                ${hasFieldError("gender") ? "border-red-400" : isFieldValid("gender") ? "border-green-400" : "border-slate-200"}`}
              >
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Gender:
                </span>
                <div className="flex items-center gap-6 md:gap-4">
                  {["male", "female"].map((g) => (
                    <label
                      key={g}
                      className="flex items-center gap-2 cursor-pointer group"
                    >
                      <input
                        type="radio"
                        value={g}
                        {...register("gender")}
                        className="w-4 h-4 accent-purple-500 cursor-pointer"
                      />
                      <span className="text-sm text-slate-600 group-hover:text-purple-600 capitalize">
                        {g}
                      </span>
                    </label>
                  ))}
                </div>
              </motion.div>

              {/* Submit Button */}
              <motion.button
                variants={fadeUp}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                disabled={isloading}
                className="md:col-span-2 w-full mt-2 cursor-pointer flex items-center justify-center gap-2 py-3.5 bg-linear-to-r from-purple-500 to-violet-600 text-white font-bold rounded-2xl shadow-lg shadow-purple-200 disabled:from-purple-300 transition-all"
              >
                {isloading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />{" "}
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <UserPlus size={18} /> <span>Sign Up</span>
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
