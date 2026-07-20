-- Migration : ajout du support "mot de passe oublie"
-- A executer dans le SQL Editor de Neon (la table utilisateurs existe deja)

ALTER TABLE utilisateurs
ADD COLUMN IF NOT EXISTS reset_password_token VARCHAR(255),
ADD COLUMN IF NOT EXISTS reset_password_expire TIMESTAMP;
