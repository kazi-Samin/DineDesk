"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

interface AvatarContextType {
    avatarUrl: string;
    setAvatarUrl: (url: string) => void;
}

const AvatarContext = createContext<AvatarContextType>({
    avatarUrl: "",
    setAvatarUrl: () => { },
});

export const AvatarProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();
    const [avatarUrl, setAvatarUrlState] = useState<string>("");

    const fetchStorageAvatar = (): string => {
        if (typeof window === "undefined") return "";
        try {
            const storedProfile = JSON.parse(localStorage.getItem("dinedesk_customer_profile") || "{}");
            const directAvatar = localStorage.getItem("dinedesk_user_avatar");
            const authUser = JSON.parse(localStorage.getItem("dinedesk_auth_user") || "{}");

            const candidate =
                directAvatar ||
                storedProfile.avatarUrl ||
                authUser.avatarUrl ||
                user?.avatarUrl ||
                (user as any)?.image ||
                (user as any)?.avatar ||
                "";

            if (candidate && typeof candidate === "string" && candidate.trim().startsWith("http")) {
                return candidate.trim();
            }
        } catch (e) { }
        return "";
    };

    useEffect(() => {
        const found = fetchStorageAvatar();
        if (found) setAvatarUrlState(found);
    }, [user]);

    useEffect(() => {
        const handleSync = (e?: any) => {
            if (e?.detail?.avatarUrl) {
                const clean = e.detail.avatarUrl.trim();
                setAvatarUrlState(clean);
                return;
            }
            const found = fetchStorageAvatar();
            if (found) setAvatarUrlState(found);
        };

        window.addEventListener("profile-updated", handleSync);
        window.addEventListener("external-profile-updated", handleSync);
        window.addEventListener("storage", handleSync);

        return () => {
            window.removeEventListener("profile-updated", handleSync);
            window.removeEventListener("external-profile-updated", handleSync);
            window.removeEventListener("storage", handleSync);
        };
    }, []);

    const setAvatarUrl = (url: string) => {
        if (url && typeof url === "string" && url.trim().startsWith("http")) {
            const clean = url.trim();
            setAvatarUrlState(clean);
            if (typeof window !== "undefined") {
                localStorage.setItem("dinedesk_user_avatar", clean);
                try {
                    const profile = JSON.parse(localStorage.getItem("dinedesk_customer_profile") || "{}");
                    profile.avatarUrl = clean;
                    localStorage.setItem("dinedesk_customer_profile", JSON.stringify(profile));
                } catch (e) { }
            }
        } else {
            setAvatarUrlState("");
        }
    };

    return (
        <AvatarContext.Provider value={{ avatarUrl, setAvatarUrl }}>
            {children}
        </AvatarContext.Provider>
    );
};

export const useAvatar = () => useContext(AvatarContext);