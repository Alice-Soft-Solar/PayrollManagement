"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

import { AuthUser } from "@/types/auth";

interface HeaderProps {
  user: AuthUser;
}

export const Header = ({ user }: HeaderProps) => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <header className="header">
      {!isOnline ? (
        <div className="offline-banner">
          <WifiOff size={16} /> You are offline
        </div>
      ) : null}
      <div className="header-row">
        <div>
          <h2>Welcome, {user.name}</h2>
          <p>{user.role.replace("_", " ")}</p>
        </div>
      </div>
    </header>
  );
};
