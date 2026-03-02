import { Outlet } from "react-router-dom";
import FriendSuggestions from "../FriendSuggestions/FriendSuggestions";

export default function SocialLayout() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="col-span-1 lg:col-span-3">
        <Outlet />
      </div>
      <aside className="hidden lg:block">
        <FriendSuggestions />
      </aside>
    </div>
  );
}