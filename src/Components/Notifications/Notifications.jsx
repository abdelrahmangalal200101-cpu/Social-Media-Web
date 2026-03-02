import axios from "axios";
import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  Heart,
  UserPlus,
  AtSign,
  Repeat2,
  BellOff,
  CheckCheck,
} from "lucide-react";

function timeAgo(dateString) {
  const diff = Math.floor((Date.now() - new Date(dateString)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const TYPE_CONFIG = {
  comment_post: {
    icon: MessageCircle,
    gradient: "from-violet-500 to-purple-600",
    shadow: "shadow-violet-200",
    label: (n) => (
      <>
        commented on your post
        {n.entity?.content && (
          <span className="italic text-purple-400">
            {" "}
            &ldquo;{n.entity.content}&rdquo;
          </span>
        )}
      </>
    ),
  },
  like_post: {
    icon: Heart,
    gradient: "from-pink-500 to-rose-500",
    shadow: "shadow-pink-200",
    label: () => "liked your post",
  },
  follow: {
    icon: UserPlus,
    gradient: "from-emerald-500 to-teal-500",
    shadow: "shadow-emerald-200",
    label: () => "started following you",
  },
  mention: {
    icon: AtSign,
    gradient: "from-violet-400 to-indigo-500",
    shadow: "shadow-indigo-200",
    label: () => "mentioned you in a post",
  },
  repost: {
    icon: Repeat2,
    gradient: "from-amber-400 to-orange-500",
    shadow: "shadow-amber-200",
    label: () => "reposted your post",
  },
};

function getConfig(type) {
  return (
    TYPE_CONFIG[type] ?? {
      icon: MessageCircle,
      gradient: "from-purple-400 to-violet-500",
      shadow: "shadow-purple-200",
      label: () => "sent you a notification",
    }
  );
}

function getAllNotifications() {
  return axios.get(
    `https://route-posts.routemisr.com/notifications?unread=false&page=1&limit=10`,
    { headers: { Authorization: `Bearer ${localStorage.getItem("Token")}` } },
  );
}

function markOneAsRead(notificationId) {
  return axios.patch(
    `https://route-posts.routemisr.com/notifications/${notificationId}/read`,
    {},
    { headers: { Authorization: `Bearer ${localStorage.getItem("Token")}` } },
  );
}

function markAllAsRead() {
  return axios.patch(
    `https://route-posts.routemisr.com/notifications/read-all`,
    {},
    { headers: { Authorization: `Bearer ${localStorage.getItem("Token")}` } },
  );
}

function Avatar({ src, name }) {
  return src ? (
    <img
      src={src}
      alt={name}
      className="h-12 w-12 rounded-full object-cover ring-2 ring-purple-200 shrink-0"
    />
  ) : (
    <div className="h-12 w-12 rounded-full bg-linear-to-br from-violet-400 to-purple-500 flex items-center justify-center font-bold text-white text-sm shrink-0 ring-2 ring-purple-200">
      {name?.[0]?.toUpperCase() ?? "?"}
    </div>
  );
}

function SkeletonCard({ index }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.06 }}
      className="flex items-center gap-4 px-6 py-4 rounded-2xl bg-white border border-purple-100"
    >
      <div className="h-12 w-12 rounded-full bg-purple-100 animate-pulse shrink-0" />
      <div className="flex-1 space-y-2.5">
        <div className="h-3 w-2/3 rounded-full bg-purple-100 animate-pulse" />
        <div className="h-2.5 w-1/4 rounded-full bg-purple-50 animate-pulse" />
      </div>
    </motion.div>
  );
}

function NotificationCard({ notification, index, onRead }) {
  const cfg = getConfig(notification.type);
  const Icon = cfg.icon;
  const actor = notification.actor;
  const [isLeaving, setIsLeaving] = React.useState(false);

  function handleClick() {
    if (!notification.isRead && !isLeaving) {
      setIsLeaving(true);
      // استنى الـ animation يخلص الأول (400ms) وبعدين اعمل patch
      setTimeout(() => onRead(notification._id), 400);
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={
        isLeaving
          ? { x: "110%", opacity: 0, scale: 0.95 }
          : { x: 0, opacity: 1, y: 0 }
      }
      exit={{
        opacity: 0,
        height: 0,
        marginBottom: 0,
        transition: { duration: 0.3 },
      }}
      transition={
        isLeaving
          ? { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
          : {
              duration: 0.3,
              delay: index * 0.05,
              ease: [0.25, 0.46, 0.45, 0.94],
            }
      }
      whileHover={
        !isLeaving ? { scale: 1.008, transition: { duration: 0.15 } } : {}
      }
      onClick={handleClick}
      className={`relative flex items-center gap-4 px-6 py-4 rounded-2xl border cursor-pointer transition-colors duration-200 overflow-hidden
        ${
          notification.isRead
            ? "bg-white border-purple-100 hover:border-purple-200 hover:bg-purple-50/40"
            : "bg-violet-50 border-violet-200 hover:bg-violet-100/60"
        }`}
    >
      {/* Unread left bar */}
      <AnimatePresence>
        {!notification.isRead && !isLeaving && (
          <motion.span
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            exit={{ scaleY: 0 }}
            className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-r-full bg-violet-500"
          />
        )}
      </AnimatePresence>

      {/* Avatar + type badge */}
      <div className="relative shrink-0">
        <Avatar src={actor?.photo} name={actor?.name} />
        <span
          className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center bg-linear-to-br ${cfg.gradient} shadow-md ${cfg.shadow}`}
        >
          <Icon className="h-2.5 w-2.5 text-white" strokeWidth={2.5} />
        </span>
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-700 leading-snug">
          <span className="font-semibold text-gray-900">
            {actor?.name ?? "Someone"}
          </span>{" "}
          {cfg.label(notification)}
        </p>
        <p className="mt-1 text-xs text-purple-400 font-medium">
          {timeAgo(notification.createdAt)}
        </p>
      </div>

      {/* Unread dot right */}
      <AnimatePresence>
        {!notification.isRead && !isLeaving && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="h-2 w-2 rounded-full bg-violet-500 shrink-0"
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-28 gap-4"
    >
      <div className="h-20 w-20 rounded-3xl bg-purple-100 border border-purple-200 flex items-center justify-center">
        <BellOff className="h-9 w-9 text-purple-300" />
      </div>
      <p className="text-gray-400 text-sm font-medium">You're all caught up!</p>
      <p className="text-gray-300 text-xs">No notifications yet</p>
    </motion.div>
  );
}

export default function Notifications() {
  const [activeTab, setActiveTab] = React.useState("All");
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryFn: getAllNotifications,
    queryKey: ["Notifications"],
  });

  const { mutate: mutateOne } = useMutation({
    mutationFn: (notificationId) => markOneAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries(["notificationCount"]);
      queryClient.invalidateQueries(["Notifications"]);
    },
  });

  const { mutate: mutateAll, isPending: isMarkingAll } = useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries(["notificationCount"]);
      queryClient.invalidateQueries(["Notifications"]);
    },
  });

  const allNotifications = data?.data?.data?.notifications ?? [];
  const unreadCount = allNotifications.filter((n) => !n.isRead).length;
  const notifications =
    activeTab === "Unread"
      ? allNotifications.filter((n) => !n.isRead)
      : allNotifications;

  return (
    <div className="w-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mb-6 flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-sm text-purple-400 mt-0.5">
            {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.button
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onClick={() => mutateAll()}
                disabled={isMarkingAll}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-violet-500 border border-violet-200 hover:bg-violet-50 transition-colors duration-150 disabled:opacity-50"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                {isMarkingAll ? "Marking..." : "Mark all read"}
              </motion.button>
            )}
          </AnimatePresence>

          <div className="flex gap-2">
            {["All", "Unread"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors duration-150 ${
                  activeTab === tab
                    ? "bg-violet-500 text-white border-violet-500"
                    : "bg-white text-gray-500 border-purple-200 hover:border-violet-300"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="h-px w-full bg-purple-100 mb-6" />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} index={i} />
          ))}
        </div>
      ) : isError ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20 text-red-400 text-sm"
        >
          Failed to load notifications. Please try again.
        </motion.div>
      ) : notifications.length === 0 ? (
        <EmptyState />
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="space-y-2.5">
            {notifications.map((notif, i) => (
              <NotificationCard
                key={notif._id}
                notification={notif}
                index={i}
                onRead={mutateOne}
              />
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}
