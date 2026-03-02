import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  EyeOff,
  Lock,
  CheckCircle2,
  ShieldCheck,
  KeyRound,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { addToast } from "@heroui/react";
import { useContext } from "react";
import { AuthContext } from "../../Context/AuthContextProvider";

const schema = z.object({
  password: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "At least 8 characters")
    .regex(/[A-Z]/, "One uppercase letter required")
    .regex(/[0-9]/, "One number required")
    .regex(/[^A-Za-z0-9]/, "One special character required"),
});

function getStrength(pw = "") {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}

const STRENGTH_META = [
  {
    label: "",
    barClass: "bg-stone-100",
    textClass: "text-stone-400",
    dot: "bg-stone-300",
  },
  {
    label: "Weak",
    barClass: "bg-red-400",
    textClass: "text-red-400",
    dot: "bg-red-400",
  },
  {
    label: "Fair",
    barClass: "bg-amber-400",
    textClass: "text-amber-500",
    dot: "bg-amber-400",
  },
  {
    label: "Good",
    barClass: "bg-purple-400",
    textClass: "text-purple-500",
    dot: "bg-purple-400",
  },
  {
    label: "Strong",
    barClass: "bg-emerald-400",
    textClass: "text-emerald-500",
    dot: "bg-emerald-400",
  },
];

function PasswordField({
  label,
  registration,
  error,
  show,
  onToggle,
  placeholder,
  delay,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35, ease: "easeOut" }}
      className="flex flex-col gap-2"
    >
      <label className="text-xs font-semibold text-stone-500 tracking-wide ml-0.5">
        {label}
      </label>
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-300 group-focus-within:text-purple-500 transition-colors duration-200">
          <Lock size={15} strokeWidth={2} />
        </div>
        <input
          type={show ? "text" : "password"}
          placeholder={placeholder}
          {...registration}
          className={[
            "w-full pl-11 pr-12 py-3.5 rounded-2xl text-sm font-medium",
            "bg-stone-50 border-2 text-stone-700",
            "placeholder:text-stone-300 placeholder:font-normal",
            "focus:outline-none focus:bg-white focus:shadow-[0_0_0_4px_rgba(168,85,247,0.08)]",
            "transition-all duration-200",
            error
              ? "border-red-200 focus:border-red-300"
              : "border-stone-100 focus:border-purple-300",
          ].join(" ")}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-300 hover:text-purple-400 transition-colors duration-150 p-0.5"
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={show ? "off" : "on"}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
            >
              {show ? <EyeOff size={15} /> : <Eye size={15} />}
            </motion.span>
          </AnimatePresence>
        </button>
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="text-[11px] font-medium text-red-400 ml-1"
          >
            {error.message}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function Requirement({ met, label }) {
  return (
    <motion.div
      className="flex items-center gap-1.5"
      animate={{ opacity: met ? 1 : 0.45 }}
      transition={{ duration: 0.2 }}
    >
      <div
        className={
          "w-1.5 h-1.5 rounded-full transition-all duration-300 " +
          (met ? "bg-purple-400" : "bg-stone-200")
        }
      />
      <span
        className={
          "text-[11px] font-medium transition-colors duration-300 " +
          (met ? "text-purple-500" : "text-stone-400")
        }
      >
        {label}
      </span>
    </motion.div>
  );
}

function changePasswordApi(data) {
  return axios.patch(
    "https://route-posts.routemisr.com/users/change-password",
    data,
    {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("Token"),
      },
    },
  );
}

export default function ChangePassword() {
  const [shows, setShows] = useState({ current: false, newPw: false });
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { setLogin } = useContext(AuthContext);
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { password: "", newPassword: "" },
  });

  const newPwValue = watch("newPassword") || "";
  const strength = getStrength(newPwValue);
  const sm = STRENGTH_META[strength];

  const toggle = (f) => setShows((p) => ({ ...p, [f]: !p[f] }));

  const { mutate, isPending } = useMutation({
    mutationFn: changePasswordApi,
    onSuccess: () => {
      setSuccess(true);
      addToast({
        title: "Password Updated",
        description: "Your password has been changed successfully.",
        color: "success",
        timeout: 3000,
      });

      localStorage.removeItem("Token");
      setLogin(null);

      setTimeout(() => {
        navigate("/login");
      }, 3000);
    },
    onError: (err) => {
      addToast({
        title: "Something went wrong",
        description: err?.response?.data?.message || "Please try again.",
        color: "danger",
        timeout: 3000,
      });
    },
  });

  const onSubmit = (data) => mutate(data);

  const handleReset = () => {
    setSuccess(false);
    reset();
  };

  const reqs = [
    { met: newPwValue.length >= 8, label: "At least 8 characters" },
    { met: /[A-Z]/.test(newPwValue), label: "One uppercase letter" },
    { met: /[0-9]/.test(newPwValue), label: "One number" },
    { met: /[^A-Za-z0-9]/.test(newPwValue), label: "One special character" },
  ];

  const DOTS = [
    { x: "12%", y: "18%", size: 3.5, delay: 0 },
    { x: "88%", y: "14%", size: 2.5, delay: 0.8 },
    { x: "7%", y: "72%", size: 4, delay: 1.4 },
    { x: "91%", y: "68%", size: 3, delay: 0.4 },
    { x: "20%", y: "88%", size: 2, delay: 2 },
    { x: "78%", y: "84%", size: 3.5, delay: 1 },
    { x: "50%", y: "6%", size: 2.5, delay: 1.6 },
  ];

  const CORNERS = [
    { pos: "top-6 left-6", d: "M2 56 L2 2 L56 2", cx: 2, cy: 2 },
    { pos: "top-6 right-6", d: "M56 56 L56 2 L2 2", cx: 56, cy: 2 },
    { pos: "bottom-6 left-6", d: "M2 2 L2 56 L56 56", cx: 2, cy: 56 },
    { pos: "bottom-6 right-6", d: "M56 2 L56 56 L2 56", cx: 56, cy: 56 },
  ];

  return (
    <div className="min-h-screen bg-purple-50/40 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute -top-20 -left-16 w-72 h-72 bg-purple-100/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -right-10 w-64 h-64 bg-violet-100/40 rounded-full blur-3xl pointer-events-none" />

      {DOTS.map((dot, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-purple-300/35 pointer-events-none"
          style={{ left: dot.x, top: dot.y, width: dot.size, height: dot.size }}
          animate={{ y: [0, -10, 0], opacity: [0.35, 0.7, 0.35] }}
          transition={{
            duration: 4 + i * 0.6,
            delay: dot.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {CORNERS.map((o, i) => (
        <motion.div
          key={i}
          className={"absolute " + o.pos + " pointer-events-none"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 + i * 0.08, duration: 0.9 }}
        >
          <svg width="58" height="58" fill="none">
            <path
              d={o.d}
              stroke="#ddd6fe"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <circle cx={o.cx} cy={o.cy} r="2.5" fill="#c4b5fd" />
          </svg>
        </motion.div>
      ))}

      <motion.div
        className="absolute left-8 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center gap-3 pointer-events-none"
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6, duration: 0.7 }}
      >
        <div className="w-px h-16 bg-linear-to-b from-transparent via-purple-200 to-transparent" />
        <p
          className="text-[10px] font-semibold tracking-[0.3em] text-purple-300/60 uppercase select-none"
          style={{ writingMode: "vertical-lr", transform: "rotate(180deg)" }}
        >
          Security
        </p>
        <div className="w-px h-16 bg-linear-to-b from-transparent via-purple-200 to-transparent" />
      </motion.div>

      <motion.div
        className="absolute right-8 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center gap-3 pointer-events-none"
        initial={{ opacity: 0, x: 8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.7, duration: 0.7 }}
      >
        <div className="w-px h-16 bg-linear-to-b from-transparent via-purple-200 to-transparent" />
        <p
          className="text-[10px] font-semibold tracking-[0.3em] text-purple-300/60 uppercase select-none"
          style={{ writingMode: "vertical-lr" }}
        >
          Protected
        </p>
        <div className="w-px h-16 bg-linear-to-b from-transparent via-purple-200 to-transparent" />
      </motion.div>

      <AnimatePresence mode="wait">
        {success ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.94, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-sm bg-white rounded-3xl shadow-sm border border-stone-100 p-10 flex flex-col items-center gap-5 text-center"
          >
            <motion.div
              initial={{ scale: 0, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                delay: 0.1,
                type: "spring",
                stiffness: 300,
                damping: 20,
              }}
              className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center shadow-sm shadow-emerald-100"
            >
              <CheckCircle2 size={28} className="text-emerald-500" />
            </motion.div>
            <div>
              <p className="font-bold text-stone-800 text-lg">All done! 🎉</p>
              <p className="text-sm text-stone-400 mt-1.5 leading-relaxed">
                Your password has been updated successfully.
              </p>
            </div>
            <button
              onClick={handleReset}
              className="text-xs font-semibold text-purple-400 hover:text-purple-600 transition-colors duration-150 underline underline-offset-2"
            >
              Change again
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-sm bg-white rounded-3xl shadow-md shadow-purple-100/50 border border-stone-100 overflow-hidden"
          >
            <div className="h-1 bg-linear-to-r from-purple-300 via-purple-500 to-violet-400" />

            <div className="flex flex-col items-center gap-3 px-7 pt-7 pb-6">
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.08, type: "spring", stiffness: 280 }}
                className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center ring-4 ring-purple-50"
              >
                <ShieldCheck
                  size={24}
                  className="text-purple-500"
                  strokeWidth={2}
                />
              </motion.div>
              <div className="text-center">
                <p className="font-bold text-stone-800 text-lg tracking-tight">
                  Change Password
                </p>
                <p className="text-sm text-stone-400 mt-1">
                  Keep your account safe and secure
                </p>
              </div>
            </div>

            <div className="h-px bg-linear-to-r from-transparent via-stone-100 to-transparent mx-5" />

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="px-7 py-6 flex flex-col gap-5"
            >
              <PasswordField
                label="Current Password"
                registration={register("password")}
                error={errors.password}
                show={shows.current}
                onToggle={() => toggle("current")}
                placeholder="Enter current password"
                delay={0.06}
              />

              <PasswordField
                label="New Password"
                registration={register("newPassword")}
                error={errors.newPassword}
                show={shows.newPw}
                onToggle={() => toggle("newPw")}
                placeholder="Enter new password"
                delay={0.12}
              />

              <AnimatePresence>
                {newPwValue.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden -mt-1"
                  >
                    <div className="flex gap-1.5 mb-3">
                      {[1, 2, 3, 4].map((seg) => (
                        <motion.div
                          key={seg}
                          className={
                            "flex-1 h-1.5 rounded-full transition-all duration-300 " +
                            (strength >= seg ? sm.barClass : "bg-stone-100")
                          }
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ delay: seg * 0.05 }}
                        />
                      ))}
                    </div>
                    <div className="bg-stone-50 rounded-2xl px-4 py-3 grid grid-cols-2 gap-y-1.5 gap-x-2">
                      {reqs.map((r) => (
                        <Requirement
                          key={r.label}
                          met={r.met}
                          label={r.label}
                        />
                      ))}
                    </div>
                    {sm.label && (
                      <div className="flex items-center gap-1.5 mt-2 ml-0.5">
                        <div className={"w-1.5 h-1.5 rounded-full " + sm.dot} />
                        <p
                          className={
                            "text-[11px] font-semibold " + sm.textClass
                          }
                        >
                          {sm.label} password
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex-1 rounded-2xl bg-stone-100 text-stone-600 text-sm font-semibold py-3 hover:bg-stone-200 active:scale-[0.98] transition-all duration-150"
                >
                  Cancel
                </button>

                <motion.button
                  type="submit"
                  disabled={isPending}
                  whileTap={{ scale: !isPending ? 0.97 : 1 }}
                  className={
                    "flex-1 rounded-2xl cursor-pointer text-sm font-semibold py-3 flex items-center justify-center gap-2 transition-all duration-200 " +
                    (!isPending
                      ? "bg-purple-500 text-white shadow-md shadow-purple-200 hover:bg-purple-600 hover:shadow-purple-300"
                      : "bg-purple-100 text-purple-300 cursor-not-allowed")
                  }
                >
                  {isPending ? (
                    <>
                      <motion.div
                        className="w-4 h-4 border-2 border-purple-300/40 border-t-purple-400 rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 0.75,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound size={14} strokeWidth={2.5} />
                      <span>Update Password</span>
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
