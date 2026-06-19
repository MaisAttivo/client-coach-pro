UPDATE public.wc26_stickers
SET label = team || ' ' || (((number - 21) % 20) + 1)::text,
    is_special = false
WHERE number >= 21 AND number <= 980 AND team IS NOT NULL;