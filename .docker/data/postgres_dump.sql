--
-- PostgreSQL database cluster dump
--

SET default_transaction_read_only = off;

SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;

--
-- Drop databases (except postgres and template1)
--






--
-- Drop roles
--




--
-- Roles
--

--CREATE ROLE "user";
--ALTER ROLE "user" WITH SUPERUSER INHERIT CREATEROLE CREATEDB LOGIN REPLICATION BYPASSRLS PASSWORD 'md5c41badb1d5bb89c8db4fa5f66a4611ea';






--
-- PostgreSQL database dump
--

-- Dumped from database version 11.7 (Debian 11.7-2.pgdg90+1)
-- Dumped by pg_dump version 11.7 (Debian 11.7-2.pgdg90+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

UPDATE pg_catalog.pg_database SET datistemplate = false WHERE datname = 'template1';
DROP DATABASE template1;
--
-- Name: template1; Type: DATABASE; Schema: -; Owner: user
--

CREATE DATABASE template1 WITH TEMPLATE = template0 ENCODING = 'UTF8' LC_COLLATE = 'en_US.utf8' LC_CTYPE = 'en_US.utf8';


ALTER DATABASE template1 OWNER TO "user";

\connect template1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: DATABASE template1; Type: COMMENT; Schema: -; Owner: user
--

COMMENT ON DATABASE template1 IS 'default template for new databases';


--
-- Name: template1; Type: DATABASE PROPERTIES; Schema: -; Owner: user
--

ALTER DATABASE template1 IS_TEMPLATE = true;


\connect template1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: DATABASE template1; Type: ACL; Schema: -; Owner: user
--

REVOKE CONNECT,TEMPORARY ON DATABASE template1 FROM PUBLIC;
GRANT CONNECT ON DATABASE template1 TO PUBLIC;


--
-- PostgreSQL database dump complete
--

--
-- PostgreSQL database dump
--

-- Dumped from database version 11.7 (Debian 11.7-2.pgdg90+1)
-- Dumped by pg_dump version 11.7 (Debian 11.7-2.pgdg90+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

DROP DATABASE postgres;
--
-- Name: postgres; Type: DATABASE; Schema: -; Owner: user
--

CREATE DATABASE postgres WITH TEMPLATE = template0 ENCODING = 'UTF8' LC_COLLATE = 'en_US.utf8' LC_CTYPE = 'en_US.utf8';


ALTER DATABASE postgres OWNER TO "user";

\connect postgres

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: DATABASE postgres; Type: COMMENT; Schema: -; Owner: user
--

COMMENT ON DATABASE postgres IS 'default administrative connection database';


--
-- PostgreSQL database dump complete
--

--
-- PostgreSQL database dump
--

-- Dumped from database version 11.7 (Debian 11.7-2.pgdg90+1)
-- Dumped by pg_dump version 11.7 (Debian 11.7-2.pgdg90+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: realworld; Type: DATABASE; Schema: -; Owner: user
--

CREATE DATABASE realworld WITH TEMPLATE = template0 ENCODING = 'UTF8' LC_COLLATE = 'en_US.utf8' LC_CTYPE = 'en_US.utf8';


ALTER DATABASE realworld OWNER TO "user";

\connect realworld

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: users; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.users (
    id integer NOT NULL UNIQUE,
    username character varying(50) NOT NULL,
    password character varying(50) NOT NULL,
    email character varying(355) NOT NULL,
    created_on timestamp without time zone,
    last_login timestamp without time zone
);


ALTER TABLE public.users OWNER TO "user";

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO "user";

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public.users (id, username, password, email, created_on, last_login) FROM stdin;
1	user1	user1	user1@hotmail.com	2020-05-14 20:03:56.025651	\N
2	user2	user2	user2@hotmail.com	2020-05-14 20:03:56.025651	\N
3	user3	user3	user3@hotmail.com	2020-05-14 20:03:56.025651	\N
4	user4	user4	user4@hotmail.com	2020-05-14 20:03:56.025651	\N
5	user5	user5	user5@hotmail.com	2020-05-14 20:03:56.025651	\N
6	user6	user6	user6@hotmail.com	2020-05-14 20:03:56.025651	\N
7	user7	user7	user7@hotmail.com	2020-05-14 20:03:56.025651	\N
8	user8	user8	user8@hotmail.com	2020-05-14 20:03:56.025651	\N
9	user9	user9	user9@hotmail.com	2020-05-14 20:03:56.025651	\N
10	user10	user10	user10@hotmail.com	2020-05-14 20:03:56.025651	\N
11	user11	user11	user11@hotmail.com	2020-05-14 20:03:56.025651	\N
12	user12	user12	user12@hotmail.com	2020-05-14 20:03:56.025651	\N
13	user13	user13	user13@hotmail.com	2020-05-14 20:03:56.025651	\N
14	user14	user14	user14@hotmail.com	2020-05-14 20:03:56.025651	\N
15	user15	user15	user15@hotmail.com	2020-05-14 20:03:56.025651	\N
16	user16	user16	user16@hotmail.com	2020-05-14 20:03:56.025651	\N
17	user17	user17	user17@hotmail.com	2020-05-14 20:03:56.025651	\N
18	user18	user18	user18@hotmail.com	2020-05-14 20:03:56.025651	\N
19	user19	user19	user19@hotmail.com	2020-05-14 20:03:56.025651	\N
20	user20	user20	user20@hotmail.com	2020-05-14 20:03:56.025651	\N
21	user21	user21	user21@hotmail.com	2020-05-14 20:03:56.025651	\N
22	user22	user22	user22@hotmail.com	2020-05-14 20:03:56.025651	\N
23	user23	user23	user23@hotmail.com	2020-05-14 20:03:56.025651	\N
24	user24	user24	user24@hotmail.com	2020-05-14 20:03:56.025651	\N
25	user25	user25	user25@hotmail.com	2020-05-14 20:03:56.025651	\N
26	user26	user26	user26@hotmail.com	2020-05-14 20:03:56.025651	\N
27	user27	user27	user27@hotmail.com	2020-05-14 20:03:56.025651	\N
28	user28	user28	user28@hotmail.com	2020-05-14 20:03:56.025651	\N
29	user29	user29	user29@hotmail.com	2020-05-14 20:03:56.025651	\N
30	user30	user30	user30@hotmail.com	2020-05-14 20:03:56.025651	\N
31	user31	user31	user31@hotmail.com	2020-05-14 20:03:56.025651	\N
32	user32	user32	user32@hotmail.com	2020-05-14 20:03:56.025651	\N
33	user33	user33	user33@hotmail.com	2020-05-14 20:03:56.025651	\N
34	user34	user34	user34@hotmail.com	2020-05-14 20:03:56.025651	\N
35	user35	user35	user35@hotmail.com	2020-05-14 20:03:56.025651	\N
36	user36	user36	user36@hotmail.com	2020-05-14 20:03:56.025651	\N
37	user37	user37	user37@hotmail.com	2020-05-14 20:03:56.025651	\N
38	user38	user38	user38@hotmail.com	2020-05-14 20:03:56.025651	\N
39	user39	user39	user39@hotmail.com	2020-05-14 20:03:56.025651	\N
40	user40	user40	user40@hotmail.com	2020-05-14 20:03:56.025651	\N
41	user41	user41	user41@hotmail.com	2020-05-14 20:03:56.025651	\N
42	user42	user42	user42@hotmail.com	2020-05-14 20:03:56.025651	\N
43	user43	user43	user43@hotmail.com	2020-05-14 20:03:56.025651	\N
44	user44	user44	user44@hotmail.com	2020-05-14 20:03:56.025651	\N
45	user45	user45	user45@hotmail.com	2020-05-14 20:03:56.025651	\N
46	user46	user46	user46@hotmail.com	2020-05-14 20:03:56.025651	\N
47	user47	user47	user47@hotmail.com	2020-05-14 20:03:56.025651	\N
48	user48	user48	user48@hotmail.com	2020-05-14 20:03:56.025651	\N
49	user49	user49	user49@hotmail.com	2020-05-14 20:03:56.025651	\N
50	user50	user50	user50@hotmail.com	2020-05-14 20:03:56.025651	\N
51	user51	user51	user51@hotmail.com	2020-05-14 20:03:56.025651	\N
52	user52	user52	user52@hotmail.com	2020-05-14 20:03:56.025651	\N
53	user53	user53	user53@hotmail.com	2020-05-14 20:03:56.025651	\N
54	user54	user54	user54@hotmail.com	2020-05-14 20:03:56.025651	\N
55	user55	user55	user55@hotmail.com	2020-05-14 20:03:56.025651	\N
56	user56	user56	user56@hotmail.com	2020-05-14 20:03:56.025651	\N
57	user57	user57	user57@hotmail.com	2020-05-14 20:03:56.025651	\N
58	user58	user58	user58@hotmail.com	2020-05-14 20:03:56.025651	\N
59	user59	user59	user59@hotmail.com	2020-05-14 20:03:56.025651	\N
60	user60	user60	user60@hotmail.com	2020-05-14 20:03:56.025651	\N
61	user61	user61	user61@hotmail.com	2020-05-14 20:03:56.025651	\N
62	user62	user62	user62@hotmail.com	2020-05-14 20:03:56.025651	\N
63	user63	user63	user63@hotmail.com	2020-05-14 20:03:56.025651	\N
64	user64	user64	user64@hotmail.com	2020-05-14 20:03:56.025651	\N
65	user65	user65	user65@hotmail.com	2020-05-14 20:03:56.025651	\N
66	user66	user66	user66@hotmail.com	2020-05-14 20:03:56.025651	\N
67	user67	user67	user67@hotmail.com	2020-05-14 20:03:56.025651	\N
68	user68	user68	user68@hotmail.com	2020-05-14 20:03:56.025651	\N
69	user69	user69	user69@hotmail.com	2020-05-14 20:03:56.025651	\N
70	user70	user70	user70@hotmail.com	2020-05-14 20:03:56.025651	\N
71	user71	user71	user71@hotmail.com	2020-05-14 20:03:56.025651	\N
72	user72	user72	user72@hotmail.com	2020-05-14 20:03:56.025651	\N
73	user73	user73	user73@hotmail.com	2020-05-14 20:03:56.025651	\N
74	user74	user74	user74@hotmail.com	2020-05-14 20:03:56.025651	\N
75	user75	user75	user75@hotmail.com	2020-05-14 20:03:56.025651	\N
76	user76	user76	user76@hotmail.com	2020-05-14 20:03:56.025651	\N
77	user77	user77	user77@hotmail.com	2020-05-14 20:03:56.025651	\N
78	user78	user78	user78@hotmail.com	2020-05-14 20:03:56.025651	\N
79	user79	user79	user79@hotmail.com	2020-05-14 20:03:56.025651	\N
80	user80	user80	user80@hotmail.com	2020-05-14 20:03:56.025651	\N
81	user81	user81	user81@hotmail.com	2020-05-14 20:03:56.025651	\N
82	user82	user82	user82@hotmail.com	2020-05-14 20:03:56.025651	\N
83	user83	user83	user83@hotmail.com	2020-05-14 20:03:56.025651	\N
84	user84	user84	user84@hotmail.com	2020-05-14 20:03:56.025651	\N
85	user85	user85	user85@hotmail.com	2020-05-14 20:03:56.025651	\N
86	user86	user86	user86@hotmail.com	2020-05-14 20:03:56.025651	\N
87	user87	user87	user87@hotmail.com	2020-05-14 20:03:56.025651	\N
88	user88	user88	user88@hotmail.com	2020-05-14 20:03:56.025651	\N
89	user89	user89	user89@hotmail.com	2020-05-14 20:03:56.025651	\N
90	user90	user90	user90@hotmail.com	2020-05-14 20:03:56.025651	\N
91	user91	user91	user91@hotmail.com	2020-05-14 20:03:56.025651	\N
92	user92	user92	user92@hotmail.com	2020-05-14 20:03:56.025651	\N
93	user93	user93	user93@hotmail.com	2020-05-14 20:03:56.025651	\N
94	user94	user94	user94@hotmail.com	2020-05-14 20:03:56.025651	\N
95	user95	user95	user95@hotmail.com	2020-05-14 20:03:56.025651	\N
96	user96	user96	user96@hotmail.com	2020-05-14 20:03:56.025651	\N
97	user97	user97	user97@hotmail.com	2020-05-14 20:03:56.025651	\N
98	user98	user98	user98@hotmail.com	2020-05-14 20:03:56.025651	\N
99	user99	user99	user99@hotmail.com	2020-05-14 20:03:56.025651	\N
100	user100	user100	user100@hotmail.com	2020-05-14 20:03:56.025651	\N
\.


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: user
--

SELECT pg_catalog.setval('public.users_id_seq', 1, false);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- PostgreSQL database dump complete
--

--
-- PostgreSQL database cluster dump complete
--

