-- Add drive_file_id to banners table for cleanup when deleting
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS drive_file_id text;