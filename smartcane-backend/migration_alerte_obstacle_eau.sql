-- Migration : ajout des types d'alerte "obstacle" et "eau" (détection canne)
-- A executer dans le SQL Editor de Neon

-- Le type de la colonne "type" de la table "alertes" est un ENUM Postgres
-- nomme par convention enum_alertes_type (cree automatiquement par Sequelize).
-- On y ajoute les deux nouvelles valeurs sans rien casser d'existant.

ALTER TYPE enum_alertes_type ADD VALUE IF NOT EXISTS 'obstacle';
ALTER TYPE enum_alertes_type ADD VALUE IF NOT EXISTS 'eau';

-- Verification : liste toutes les valeurs possibles de l'enum apres migration
-- SELECT unnest(enum_range(NULL::enum_alertes_type));

-- Si la commande ci-dessus renvoie une erreur "type enum_alertes_type does not exist",
-- c'est que la colonne "type" n'est pas un ENUM natif chez toi (VARCHAR + CHECK).
-- Dans ce cas, utilise plutot :
--
-- ALTER TABLE alertes DROP CONSTRAINT IF EXISTS alertes_type_check;
-- ALTER TABLE alertes ADD CONSTRAINT alertes_type_check
--   CHECK (type IN ('sos','chute','immobilite','batterie_faible','deconnexion_bluetooth','obstacle','eau'));
