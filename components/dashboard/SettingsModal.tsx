"use client";

import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Settings, Upload, User as UserIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function SettingsModal({ currentName, currentImage, hasPassword, onClose, onSaved }: {
  currentName: string;
  currentImage?: string | null;
  /** Social-only accounts have nothing to change, so the section is hidden. */
  hasPassword: boolean;
  onClose: () => void;
  onSaved: (updated: { name: string; image?: string }) => void;
}) {
  const [name, setName] = useState(currentName);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const trimmed = name.trim();
  const nameInvalid = trimmed.length < 2 || trimmed.length > 50;
  const changingPassword = newPassword.length > 0;
  const isDirty = trimmed !== currentName || !!avatar || changingPassword;

  const pickAvatar = (file: File | null) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("Avatar must be 5MB or smaller.");
      return;
    }
    setError("");
    setAvatar(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError("");

    const body = new FormData();
    if (trimmed !== currentName) body.set("name", trimmed);
    if (avatar) body.set("avatar", avatar);
    if (changingPassword) {
      body.set("currentPassword", currentPassword);
      body.set("newPassword", newPassword);
    }

    try {
      const res = await fetch("/api/user/profile", { method: "PATCH", body });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not save changes.");
        setIsSaving(false);
        return;
      }
      onSaved(data.user);
    } catch {
      setError("An unexpected error occurred.");
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-[#0d0d0f] border-2 border-white/10 my-8"
      >
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
          <Settings size={16} className="text-sky shrink-0" />
          <h3 className="text-[11px] font-pixel uppercase tracking-widest text-white">Settings</h3>
        </div>

        <div className="px-6 py-6 space-y-8">
          {error && (
            <div className="bg-lava/10 border border-lava/20 p-3 text-[10px] uppercase font-pixel tracking-tighter text-lava">
              {error}
            </div>
          )}

          {/* Avatar */}
          <div className="space-y-3">
            <label className="block text-[10px] font-pixel uppercase tracking-widest text-text-secondary">
              Avatar
            </label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-stone border-2 border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                {preview || currentImage ? (
                  // Plain img: the local preview is a blob: URL, which next/image rejects.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={preview || currentImage || ""}
                    alt="Avatar preview"
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserIcon size={28} className="text-white/20" />
                )}
              </div>
              <div className="space-y-2">
                <input
                  ref={fileInput}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={(e) => pickAvatar(e.target.files?.[0] ?? null)}
                  className="hidden"
                />
                <Button variant="stone" size="sm" onClick={() => fileInput.current?.click()}>
                  <Upload size={12} className="mr-2" /> Upload Avatar
                </Button>
                <p className="text-[10px] text-text-secondary">JPEG, PNG, WebP or GIF. Max 5MB.</p>
              </div>
            </div>
          </div>

          {/* Display name */}
          <div className="space-y-3">
            <label className="block text-[10px] font-pixel uppercase tracking-widest text-text-secondary">
              Display Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
              className={`w-full h-11 bg-black/40 border-2 px-4 text-xs text-white outline-none transition-colors ${
                nameInvalid ? "border-lava" : "border-white/10 focus:border-sky"
              }`}
            />
            {nameInvalid && <p className="text-[10px] text-lava">Name must be 2-50 characters.</p>}
          </div>

          {/* Password */}
          {hasPassword && (
            <div className="space-y-3">
              <label className="block text-[10px] font-pixel uppercase tracking-widest text-text-secondary">
                Change Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Current password"
                autoComplete="current-password"
                className="w-full h-11 bg-black/40 border-2 border-white/10 px-4 text-xs text-white focus:border-sky outline-none placeholder:text-stone/60"
              />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password (8+ chars, letter and number)"
                autoComplete="new-password"
                className="w-full h-11 bg-black/40 border-2 border-white/10 px-4 text-xs text-white focus:border-sky outline-none placeholder:text-stone/60"
              />
              <p className="text-[10px] text-text-secondary">Leave blank to keep your current password.</p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 px-6 py-5 border-t border-white/10 bg-white/[0.02]">
          <Button variant="stone" size="sm" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            variant="sky"
            size="sm"
            onClick={handleSave}
            disabled={!isDirty || nameInvalid || isSaving}
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin" /> Saving...
              </span>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
