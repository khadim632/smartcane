-- Migration : gestion du cycle de vie des cannes
-- A executer dans le SQL Editor de Neon

-- 1. Ajoute le statut de la canne (disponible = en stock, vendue = assignée à un porteur)
ALTER TABLE cannes
ADD COLUMN IF NOT EXISTS statut VARCHAR(20) NOT NULL DEFAULT 'disponible'
  CHECK (statut IN ('disponible', 'vendue'));

-- 2. Quand une canne a déjà un porteur, elle est forcément vendue
UPDATE cannes SET statut = 'vendue' WHERE porteur_id IS NOT NULL;

-- 3. Table pour les tokens QR (chaque canne génère un token unique pour être réclamée)
CREATE TABLE IF NOT EXISTS qr_tokens (
  id               SERIAL PRIMARY KEY,
  canne_id         INTEGER NOT NULL REFERENCES cannes(id) ON DELETE CASCADE,
  token            VARCHAR(100) NOT NULL UNIQUE,
  utilise          BOOLEAN NOT NULL DEFAULT FALSE,
  date_expiration  TIMESTAMP,
  date_creation    TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_qr_tokens_canne ON qr_tokens(canne_id);
CREATE INDEX IF NOT EXISTS idx_qr_tokens_token ON qr_tokens(token);
