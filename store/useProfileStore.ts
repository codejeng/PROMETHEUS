import { create } from "zustand";
import { Profile } from "@/types";
import { nowISO } from "@/utils/date";
import { createId } from "@/utils/id";
import { useSyncStore } from "./useSyncStore";
import { supabase } from "@/lib/supabase/client";
import { toRow, fromRow } from "@/utils/caseConvert";
import toast from "react-hot-toast";

interface ProfileState {
  profile: Profile;
  hydrated: boolean;
  loading: boolean;
  uploading: boolean;
  fetch: () => Promise<void>;
  update: (patch: Partial<Pick<Profile, "prefix" | "name">>) => void;
  uploadAvatar: (file: File) => Promise<void>;
  removeAvatar: () => void;
}

const emptyProfile: Profile = { prefix: "", name: "", avatarUrl: "", updatedAt: nowISO() };

// `profile` is a singleton row (id = true) — see supabase/schema.sql. The
// seed migration inserts that row once, so the app only ever UPDATEs it.
// Avatar files go to the public "avatars" Storage bucket; only the URL is
// stored on the row.
export const useProfileStore = create<ProfileState>()((set, get) => ({
  profile: emptyProfile,
  hydrated: false,
  loading: false,
  uploading: false,

  fetch: async () => {
    if (get().hydrated || get().loading) return;
    set({ loading: true });
    const { data, error } = await supabase.from("profile").select("*").eq("id", true).single();
    if (error) {
      set({ loading: false });
      toast.error(`Couldn't load profile: ${error.message}`);
      return;
    }
    const { id: _ignored, ...rest } = data;
    void _ignored;
    set({ profile: fromRow<Profile>(rest), hydrated: true, loading: false });
  },

  update: (patch) => {
    const previous = get().profile;
    const next = { ...previous, ...patch, updatedAt: nowISO() };
    set({ profile: next });
    useSyncStore.getState().pulse();

    supabase
      .from("profile")
      .update({ ...toRow(patch), updated_at: next.updatedAt })
      .eq("id", true)
      .then(({ error }) => {
        if (error) {
          set({ profile: previous });
          toast.error(`Couldn't save profile: ${error.message}`);
        }
      });
  },

  uploadAvatar: async (file) => {
    const previous = get().profile;
    set({ uploading: true });

    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${createId()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, {
      upsert: true,
      cacheControl: "3600",
    });
    if (uploadError) {
      set({ uploading: false });
      toast.error(`Couldn't upload photo: ${uploadError.message}`);
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    const avatarUrl = data.publicUrl;
    const next = { ...previous, avatarUrl, updatedAt: nowISO() };
    set({ profile: next, uploading: false });
    useSyncStore.getState().pulse();

    const { error: updateError } = await supabase
      .from("profile")
      .update({ avatar_url: avatarUrl })
      .eq("id", true);
    if (updateError) {
      set({ profile: previous });
      toast.error(`Couldn't save photo: ${updateError.message}`);
    }
  },

  removeAvatar: () => {
    const previous = get().profile;
    const next = { ...previous, avatarUrl: "", updatedAt: nowISO() };
    set({ profile: next });
    useSyncStore.getState().pulse();

    supabase
      .from("profile")
      .update({ avatar_url: "" })
      .eq("id", true)
      .then(({ error }) => {
        if (error) {
          set({ profile: previous });
          toast.error(`Couldn't remove photo: ${error.message}`);
        }
      });
  },
}));
