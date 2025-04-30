--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

-- Désactiver les contraintes
SET session_replication_role = 'replica';

-- Vider les tables existantes
TRUNCATE TABLE "User" CASCADE;
TRUNCATE TABLE "Player" CASCADE;
TRUNCATE TABLE "Team" CASCADE;
TRUNCATE TABLE "News" CASCADE;
TRUNCATE TABLE "SocialPost" CASCADE;

-- Réactiver les contraintes
SET session_replication_role = 'origin';

-- Insertion des utilisateurs
INSERT INTO "User" (id, username, password, role, "createdAt", "updatedAt") VALUES
(2, 'admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ADMIN', '2025-04-30 21:03:27.642', '2025-04-30 21:03:27.642'),
(3, 'user', '$2a$10$K8L1J9K9K9K9K9K9K9K9K.9K9K9K9K9K9K9K9K9K9K9K9K9K9K9K9K', 'USER', '2025-04-30 21:03:27.645', '2025-04-30 21:03:27.645'),
(4, 'admin2', '$2a$10$3euPcmQFCiblsJlEBv6Y7.pBV4KhU9wMTKEw9Qr1E/jh/KWqdACie', 'ADMIN', '2025-04-30 21:03:27.645', '2025-04-30 21:03:27.645');

-- Insertion des équipes
INSERT INTO "Team" (id, name, category, "createdAt", "updatedAt") VALUES
('team1', 'Équipe 1', 'SENIOR', '2025-04-30 21:03:27.627', '2025-04-30 21:03:27.627'),
('team2', 'Équipe 2', 'SENIOR', '2025-04-30 21:03:27.64', '2025-04-30 21:03:27.64'),
('team3', 'Équipe 3', 'SENIOR', '2025-04-30 21:03:27.641', '2025-04-30 21:03:27.641'),
('team4', 'Équipe 4', 'SENIOR', '2025-04-30 21:03:27.641', '2025-04-30 21:03:27.641');

-- Insertion des joueurs
INSERT INTO "Player" (id, "firstName", "lastName", "phoneNumber", goals, "teamId", "createdAt", "updatedAt") VALUES
(8, 'John', 'Doe', '0612345678', 5, 'team1', '2025-04-30 21:03:27.646', '2025-04-30 21:03:27.646'),
(9, 'Jane', 'Smith', '0623456789', 3, 'team2', '2025-04-30 21:03:27.651', '2025-04-30 21:03:27.651');

-- Réinitialisation des séquences
SELECT setval('"User_id_seq"', 4, true);
SELECT setval('"Player_id_seq"', 9, true);

--
-- Data for Name: News; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."News" (id, title, content, "imageUrl", "authorId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: SocialPost; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."SocialPost" (id, content, platform, "authorId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
9de3a925-79e5-4550-9d59-1e518bebf67c	ffc6fab196f92630ec75d16b7a48df67acb92b356ba8c9cde799f20a7128360d	2025-04-16 21:53:18.9641+02	20250416194850_init	\N	\N	2025-04-16 21:53:18.942418+02	1
86563fbc-77c6-4401-af0f-ba5ecc42ac4d	e5f76396a2defba721d8284049b7fb4cf13c041841b4cd76bf56cd75984e17c8	2025-04-16 21:53:25.057957+02	20250416195325_init	\N	\N	2025-04-16 21:53:25.053854+02	1
ed0040a5-756b-443e-9c47-b4c7398f4d31	12a3e71a9f6f5de66ff228ba0e6c808f59bc57ee194baa708a609fc61e052aa6	2025-04-16 22:16:39.569128+02	20250416201639_update_player_model	\N	\N	2025-04-16 22:16:39.559983+02	1
578b1aa5-4ae4-4292-8a07-8e1badffe5ef	17952810b5e86f0d54bdf8dceecbaf2e760b74c54e4fa2ce8a0a2accfdf1e320	2025-04-26 22:23:39.503529+02	20250426202339_make_phone_number_optional	\N	\N	2025-04-26 22:23:39.499626+02	1
\.


--
-- PostgreSQL database dump complete
--

