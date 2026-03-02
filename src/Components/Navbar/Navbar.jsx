import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  DropdownItem,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  Avatar,
} from "@heroui/react";
import { useContext, useState } from "react";
import { AuthContext } from "../../Context/AuthContextProvider";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

export default function MyNavbar() {
  const { islogin, setLogin, user } = useContext(AuthContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  function Logout() {
    setLogin(null);
    localStorage.removeItem("Token");
    navigate("/login");
  }

  function getNotificationCounts() {
    return axios.get(
      "https://route-posts.routemisr.com/notifications/unread-count",
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("Token")}`,
        },
      },
    );
  }

  const { data } = useQuery({
    queryKey: ["notificationCount"],
    queryFn: getNotificationCounts,
    refetchInterval: 30000,
  });

  const unreadCount = data?.data?.data?.unreadCount ?? 0;

  if (!islogin) return null;

  const navLinks = [
    { to: "/home", icon: "fa-house", label: "Home" },
    { to: "/explore", icon: "fa-compass", label: "Explore" },
    {
      to: "/notifications",
      icon: "fa-bell",
      label: "Notifications",
      badge: unreadCount,
    },
  ];

  return (
    <>
      <Navbar
        maxWidth="full"
        height="4rem"
        className="bg-purple-50 border-b border-purple-100 shadow-sm shadow-purple-100"
        classNames={{ wrapper: "max-w-7xl mx-auto px-3 sm:px-6" }}
      >
        <NavbarBrand>
          <Link to="/home" className="flex items-center gap-1.5 sm:gap-2">
            <svg
              className="w-8 h-8 sm:w-10 sm:h-10 shrink-0"
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7c3aed" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
                <linearGradient
                  id="ringGrad"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#c4b5fd" />
                  <stop offset="100%" stopColor="#fbcfe8" />
                </linearGradient>
              </defs>
              <rect width="40" height="40" rx="12" fill="url(#bgGrad)" />
              <circle
                cx="20"
                cy="20"
                r="13"
                stroke="url(#ringGrad)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="22 5 30 5"
                fill="none"
                opacity="0.6"
              />
              <circle
                cx="20"
                cy="20"
                r="9"
                stroke="white"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeDasharray="10 4 18 4"
                fill="none"
                opacity="0.25"
              />
              <text
                x="20"
                y="25"
                textAnchor="middle"
                fill="white"
                fontSize="16"
                fontWeight="400"
                fontFamily="'Gveret Levin', serif"
              >
                R
              </text>
              <circle cx="20" cy="7" r="2.5" fill="white" opacity="0.95" />
              <circle cx="20" cy="7" r="1.2" fill="url(#bgGrad)" />
            </svg>
            <span className="text-xl sm:text-2xl font-extrabold bg-linear-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent tracking-wide">
              Route
            </span>
          </Link>
        </NavbarBrand>

        <NavbarContent className="hidden md:flex" justify="center">
          <div className="flex items-center gap-1 lg:gap-3 bg-purple-50 rounded-full px-2 lg:px-4 py-2">
            {navLinks.map(({ to, icon, label, badge }) => (
              <NavbarItem key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    `relative flex items-center gap-2 px-3 lg:px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200
                    ${
                      isActive
                        ? "bg-purple-600 text-white shadow-md shadow-purple-200"
                        : "text-slate-500 hover:bg-purple-100 hover:text-purple-600"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span className="relative">
                        <i className={`fa-solid ${icon} text-sm`} />
                        <AnimatePresence>
                          {badge > 0 && (
                            <motion.span
                              key="badge-wrap"
                              initial={{ scale: 0, opacity: 0, y: 4 }}
                              animate={{ scale: 1, opacity: 1, y: 0 }}
                              exit={{ scale: 0, opacity: 0, y: 4 }}
                              transition={{
                                type: "spring",
                                stiffness: 500,
                                damping: 22,
                              }}
                              className={`absolute -top-2.5 -right-3 min-w-4.5 h-4.5 px-1 rounded-full text-[10px] font-bold flex items-center justify-center shadow-lg ring-2
                                ${
                                  isActive
                                    ? "bg-white text-purple-600 ring-purple-600 shadow-white/50"
                                    : "bg-linear-to-br from-violet-500 to-fuchsia-500 text-white ring-purple-50 shadow-violet-400/50"
                                }`}
                            >
                              <AnimatePresence mode="popLayout">
                                <motion.span
                                  key={badge}
                                  initial={{ y: -8, opacity: 0 }}
                                  animate={{ y: 0, opacity: 1 }}
                                  exit={{ y: 8, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  {badge > 99 ? "99+" : badge}
                                </motion.span>
                              </AnimatePresence>
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </span>
                      <span className="hidden lg:block">{label}</span>
                    </>
                  )}
                </NavLink>
              </NavbarItem>
            ))}
          </div>
        </NavbarContent>

        <NavbarContent as="div" justify="end" className="gap-2 sm:gap-3">
          <button
            className="md:hidden text-purple-400 hover:text-purple-600 transition p-1"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <i
              className={`fa-solid ${mobileMenuOpen ? "fa-xmark" : "fa-bars"} text-lg`}
            />
          </button>

          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Avatar
                isBordered
                as="button"
                className="transition-transform hover:scale-105 shrink-0"
                color="secondary"
                name="User"
                size="sm"
                src={user?.photo}
              />
            </DropdownTrigger>
            <DropdownMenu aria-label="Profile Actions" variant="solid">
              <DropdownItem
                key="profile"
                color="primary"
                className="group"
                startContent={
                  <i className="fa-solid fa-user text-blue-400 group-hover:text-white transition-all duration-100" />
                }
              >
                <Link
                  to="/profile"
                  className="block font-bold font-cairo text-blue-400 group-hover:text-white transition-all duration-100"
                >
                  Profile
                </Link>
              </DropdownItem>
              <DropdownItem
                key="changePassword"
                color="secondary"
                className="group"
                startContent={
                  <i className="fa-solid fa-cog text-purple-400 group-hover:text-white transition-all duration-100" />
                }
              >
                <Link
                  to="/change"
                  className="block font-bold font-cairo text-purple-400 group-hover:text-white transition-all duration-100"
                >
                  Change Password
                </Link>
              </DropdownItem>
              <DropdownItem
                key="logout"
                color="danger"
                className="group"
                onClick={Logout}
                startContent={
                  <i className="fa-solid fa-right-from-bracket text-red-400 group-hover:text-white transition-all duration-100" />
                }
              >
                <Link
                  to="/login"
                  className="block font-bold font-cairo text-red-400 group-hover:text-white transition-all duration-100"
                >
                  Log Out
                </Link>
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </NavbarContent>
      </Navbar>

      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${mobileMenuOpen ? "max-h-72 opacity-100" : "max-h-0 opacity-0"}`}
      >
        <div className="bg-white border-b border-purple-100 px-3 sm:px-5 py-3 flex flex-col gap-1.5 shadow-md shadow-purple-50">
          {navLinks.map(({ to, icon, label, badge }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                ${
                  isActive
                    ? "bg-purple-600 text-white shadow-sm shadow-purple-200"
                    : "text-slate-500 hover:bg-purple-50 hover:text-purple-600"
                }`
              }
            >
              <span className="relative w-5 text-center">
                <i className={`fa-solid ${icon}`} />
                <AnimatePresence>
                  {badge > 0 && (
                    <motion.span
                      key="mobile-badge"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 22,
                      }}
                      className="absolute -top-2.5 -right-3 min-w-4.5 h-4.5 px-1 rounded-full bg-linear-to-br from-violet-500 to-fuchsia-500 text-white text-[10px] font-bold flex items-center justify-center shadow-md shadow-violet-300/50 ring-2 ring-white"
                    >
                      <AnimatePresence mode="popLayout">
                        <motion.span
                          key={badge}
                          initial={{ y: -8, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: 8, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          {badge > 99 ? "99+" : badge}
                        </motion.span>
                      </AnimatePresence>
                    </motion.span>
                  )}
                </AnimatePresence>
              </span>
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </>
  );
}
