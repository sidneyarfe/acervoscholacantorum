-- Add show_text column to banners table
ALTER TABLE public.banners ADD COLUMN show_text boolean NOT NULL DEFAULT true;