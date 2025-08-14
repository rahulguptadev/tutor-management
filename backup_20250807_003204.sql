--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5 (Homebrew)

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

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: neondb_owner
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO neondb_owner;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: neondb_owner
--

COMMENT ON SCHEMA public IS '';


--
-- Name: ActivityType; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."ActivityType" AS ENUM (
    'CLASS_CREATED',
    'CLASS_UPDATED',
    'LEAD_CREATED',
    'LEAD_UPDATED',
    'FEE_CREATED',
    'FEE_PAID',
    'PAYOUT_CREATED',
    'PAYOUT_PAID',
    'CALENDAR_EVENT_CREATED',
    'CALENDAR_EVENT_UPDATED',
    'CALENDAR_EVENT_DELETED',
    'SUBJECT_CREATED',
    'SUBJECT_UPDATED',
    'SUBJECT_DELETED',
    'TEACHER_SUBJECT_ADDED',
    'TEACHER_SUBJECT_REMOVED',
    'DEMO_CLASS_CREATED',
    'DEMO_CLASS_UPDATED',
    'DEMO_CLASS_CANCELLED'
);


ALTER TYPE public."ActivityType" OWNER TO neondb_owner;

--
-- Name: EventType; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."EventType" AS ENUM (
    'CLASS',
    'HOLIDAY',
    'BREAK',
    'AVAILABILITY',
    'OTHER'
);


ALTER TYPE public."EventType" OWNER TO neondb_owner;

--
-- Name: FeeStatus; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."FeeStatus" AS ENUM (
    'PENDING',
    'PARTIALLY_PAID',
    'PAID',
    'OVERDUE'
);


ALTER TYPE public."FeeStatus" OWNER TO neondb_owner;

--
-- Name: LeadStatus; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."LeadStatus" AS ENUM (
    'NEW',
    'CONTACTED',
    'QUALIFIED',
    'CONVERTED',
    'LOST'
);


ALTER TYPE public."LeadStatus" OWNER TO neondb_owner;

--
-- Name: PaymentStatus; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."PaymentStatus" AS ENUM (
    'PENDING',
    'PAID',
    'PARTIALLY_PAID',
    'OVERDUE'
);


ALTER TYPE public."PaymentStatus" OWNER TO neondb_owner;

--
-- Name: PayoutStatus; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."PayoutStatus" AS ENUM (
    'PENDING',
    'PAID',
    'PROCESSING'
);


ALTER TYPE public."PayoutStatus" OWNER TO neondb_owner;

--
-- Name: RecurrenceType; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."RecurrenceType" AS ENUM (
    'DAILY',
    'WEEKLY',
    'BIWEEKLY',
    'MONTHLY',
    'NONE'
);


ALTER TYPE public."RecurrenceType" OWNER TO neondb_owner;

--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."UserRole" AS ENUM (
    'ADMIN',
    'TEACHER',
    'STUDENT'
);


ALTER TYPE public."UserRole" OWNER TO neondb_owner;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Activity; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Activity" (
    id text NOT NULL,
    type public."ActivityType" NOT NULL,
    description text NOT NULL,
    "userId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Activity" OWNER TO neondb_owner;

--
-- Name: CalendarEvent; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."CalendarEvent" (
    id text NOT NULL,
    type public."EventType" NOT NULL,
    title text NOT NULL,
    description text,
    "startTime" timestamp(3) without time zone NOT NULL,
    "endTime" timestamp(3) without time zone NOT NULL,
    "isRecurring" boolean DEFAULT false NOT NULL,
    recurrence public."RecurrenceType",
    "recurrenceEnd" timestamp(3) without time zone,
    "teacherId" text,
    "classId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."CalendarEvent" OWNER TO neondb_owner;

--
-- Name: Class; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Class" (
    id text NOT NULL,
    "teacherId" text NOT NULL,
    "startTime" timestamp(3) without time zone NOT NULL,
    "endTime" timestamp(3) without time zone NOT NULL,
    status text NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "isRecurring" boolean DEFAULT false NOT NULL,
    recurrence public."RecurrenceType",
    "recurrenceEnd" timestamp(3) without time zone,
    "subjectId" text NOT NULL,
    fee double precision DEFAULT 0 NOT NULL
);


ALTER TABLE public."Class" OWNER TO neondb_owner;

--
-- Name: ClassStudent; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."ClassStudent" (
    id text NOT NULL,
    "classId" text NOT NULL,
    "studentId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ClassStudent" OWNER TO neondb_owner;

--
-- Name: DemoClass; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."DemoClass" (
    id text NOT NULL,
    "teacherId" text NOT NULL,
    "subjectId" text NOT NULL,
    "studentName" text NOT NULL,
    "studentEmail" text NOT NULL,
    "studentPhone" text,
    "scheduledDate" timestamp(3) without time zone NOT NULL,
    "scheduledTime" text NOT NULL,
    status text DEFAULT 'SCHEDULED'::text NOT NULL,
    notes text,
    "createdBy" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."DemoClass" OWNER TO neondb_owner;

--
-- Name: Grade; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Grade" (
    id text NOT NULL,
    name text NOT NULL,
    level integer NOT NULL,
    curriculum text NOT NULL,
    description text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Grade" OWNER TO neondb_owner;

--
-- Name: GradeSubject; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."GradeSubject" (
    id text NOT NULL,
    "gradeId" text NOT NULL,
    "subjectId" text NOT NULL,
    "isCore" boolean DEFAULT true NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."GradeSubject" OWNER TO neondb_owner;

--
-- Name: Lead; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Lead" (
    id text NOT NULL,
    "userId" text NOT NULL,
    status public."LeadStatus" DEFAULT 'NEW'::public."LeadStatus" NOT NULL,
    source text,
    notes text,
    "convertedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Lead" OWNER TO neondb_owner;

--
-- Name: Student; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Student" (
    id text NOT NULL,
    "userId" text NOT NULL,
    school text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "mobileNumber" text,
    "fatherContact" text,
    "fatherName" text,
    "gradeId" text,
    "motherContact" text,
    "motherName" text
);


ALTER TABLE public."Student" OWNER TO neondb_owner;

--
-- Name: StudentEnrolledSubject; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."StudentEnrolledSubject" (
    id text NOT NULL,
    "studentId" text NOT NULL,
    "subjectId" text NOT NULL,
    sessions integer NOT NULL,
    fee double precision NOT NULL
);


ALTER TABLE public."StudentEnrolledSubject" OWNER TO neondb_owner;

--
-- Name: StudentFee; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."StudentFee" (
    id text NOT NULL,
    "studentId" text NOT NULL,
    month timestamp(3) without time zone NOT NULL,
    "totalAmount" double precision NOT NULL,
    outstanding double precision NOT NULL,
    status public."FeeStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."StudentFee" OWNER TO neondb_owner;

--
-- Name: StudentPayment; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."StudentPayment" (
    id text NOT NULL,
    "studentFeeId" text NOT NULL,
    amount double precision NOT NULL,
    "paidAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    method text,
    notes text
);


ALTER TABLE public."StudentPayment" OWNER TO neondb_owner;

--
-- Name: Subject; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Subject" (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Subject" OWNER TO neondb_owner;

--
-- Name: Teacher; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Teacher" (
    id text NOT NULL,
    "userId" text NOT NULL,
    bio text,
    availability jsonb NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "phoneNumber" text,
    education text,
    qualification text
);


ALTER TABLE public."Teacher" OWNER TO neondb_owner;

--
-- Name: TeacherAvailability; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."TeacherAvailability" (
    id text NOT NULL,
    "teacherId" text NOT NULL,
    "dayOfWeek" integer NOT NULL,
    "startTime" text NOT NULL,
    "endTime" text NOT NULL,
    "isAvailable" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."TeacherAvailability" OWNER TO neondb_owner;

--
-- Name: TeacherPayout; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."TeacherPayout" (
    id text NOT NULL,
    "teacherId" text NOT NULL,
    month timestamp(3) without time zone NOT NULL,
    "totalAmount" double precision NOT NULL,
    status public."PayoutStatus" NOT NULL,
    "paidAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."TeacherPayout" OWNER TO neondb_owner;

--
-- Name: TeacherSubject; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."TeacherSubject" (
    id text NOT NULL,
    "teacherId" text NOT NULL,
    "subjectId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."TeacherSubject" OWNER TO neondb_owner;

--
-- Name: User; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."User" (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    role public."UserRole" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."User" OWNER TO neondb_owner;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO neondb_owner;

--
-- Data for Name: Activity; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Activity" (id, type, description, "userId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: CalendarEvent; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."CalendarEvent" (id, type, title, description, "startTime", "endTime", "isRecurring", recurrence, "recurrenceEnd", "teacherId", "classId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Class; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Class" (id, "teacherId", "startTime", "endTime", status, notes, "createdAt", "updatedAt", "isRecurring", recurrence, "recurrenceEnd", "subjectId", fee) FROM stdin;
cmd6uaotl0001ye8kbjpq6ng9	cmd6t78cz0005yezhq1giwsuh	2025-07-17 03:37:00	2025-07-29 03:37:00	SCHEDULED	\N	2025-07-17 03:37:44.746	2025-07-17 03:37:44.746	f	\N	\N	cmcifnh7n0006li04di43zjd7	0
cmd6y9kpk0001l704t56ql469	cmd6t78cz0005yezhq1giwsuh	2025-07-17 05:28:00	2025-07-29 05:28:00	SCHEDULED	\N	2025-07-17 05:28:51.225	2025-07-17 05:28:51.225	f	\N	\N	cmcifnh7n0006li04di43zjd7	0
cmd6zwyt20001jx04kie17sdc	cmcifp3n4000eli047rx8as2t	2025-07-01 06:13:00	2026-05-31 05:30:00	SCHEDULED	\N	2025-07-17 06:15:02.198	2025-07-17 06:15:02.198	f	\N	\N	cmcifn2tj0003li04u1b0q2hl	0
cmd701uuy0001jl04dupdtj29	cmcifp3n4000eli047rx8as2t	2025-07-01 06:17:00	2026-05-31 06:17:00	SCHEDULED	\N	2025-07-17 06:18:50.362	2025-07-17 06:18:50.362	f	\N	\N	cmcifn2tj0003li04u1b0q2hl	0
cmdlbjqh10001l404ekd2mzhg	cmcifp3n4000eli047rx8as2t	2025-07-01 06:44:00	2026-06-30 06:44:00	SCHEDULED	\N	2025-07-27 06:49:26.725	2025-07-27 06:49:26.725	f	\N	\N	cmcifn2tj0003li04u1b0q2hl	0
cmdlbq1a20007l404qzz7r819	cmcifp3n4000eli047rx8as2t	2025-07-01 06:50:00	2026-03-31 06:50:00	SCHEDULED	\N	2025-07-27 06:54:20.667	2025-07-27 06:54:20.667	f	\N	\N	cmcifn2tj0003li04u1b0q2hl	0
cmdlc6umz0001jr044gz1ddx8	cmcifp3n4000eli047rx8as2t	2025-07-01 07:01:00	2026-03-31 07:01:00	SCHEDULED	\N	2025-07-27 07:07:25.211	2025-07-27 07:07:25.211	f	\N	\N	cmcifn2tj0003li04u1b0q2hl	0
cmdlcdb600007jr04pebwztry	cmcifp3n4000eli047rx8as2t	2025-07-01 07:09:00	2026-02-28 07:09:00	SCHEDULED	\N	2025-07-27 07:12:26.569	2025-07-27 07:12:26.569	f	\N	\N	cmcifn2tj0003li04u1b0q2hl	0
cmdlcgv350001jy04focng5yx	cmcifp3n4000eli047rx8as2t	2025-07-01 07:13:00	2026-03-31 07:13:00	SCHEDULED	\N	2025-07-27 07:15:12.353	2025-07-27 07:15:12.353	f	\N	\N	cmcifn2tj0003li04u1b0q2hl	0
cmdlckrmz000dl704krpnjzan	cmcifp3n4000eli047rx8as2t	2025-08-01 07:16:00	2026-03-31 07:16:00	SCHEDULED	\N	2025-07-27 07:18:14.507	2025-07-27 07:18:14.507	f	\N	\N	cmcifn2tj0003li04u1b0q2hl	0
cmdlcokrv000ll704irsr2sbr	cmcifp3n4000eli047rx8as2t	2025-08-01 07:18:00	2026-03-31 07:19:00	SCHEDULED	\N	2025-07-27 07:21:12.236	2025-07-27 07:21:12.236	f	\N	\N	cmcifn2tj0003li04u1b0q2hl	0
cmdlcr6ix0009jy04acexyjia	cmcifp3n4000eli047rx8as2t	2025-08-01 07:21:00	2026-03-31 07:22:00	SCHEDULED	\N	2025-07-27 07:23:13.737	2025-07-27 07:23:13.737	f	\N	\N	cmcifn2tj0003li04u1b0q2hl	0
cmdlcv75q000djr043m28h2ma	cmcifp3n4000eli047rx8as2t	2025-08-01 07:24:00	2026-03-15 07:24:00	SCHEDULED	\N	2025-07-27 07:26:21.183	2025-07-27 07:26:21.183	f	\N	\N	cmcifn2tj0003li04u1b0q2hl	0
cmdlcyktx000tl704e4lpzr1s	cmcifp3n4000eli047rx8as2t	2025-08-01 07:27:00	2026-04-30 07:27:00	SCHEDULED	\N	2025-07-27 07:28:58.87	2025-07-27 07:28:58.87	f	\N	\N	cmcifn2tj0003li04u1b0q2hl	0
cmdld5xjz000zl704xvb90ixx	cmdld2bx2000kjy047oxna1pg	2025-08-01 07:32:00	2026-05-31 07:32:00	SCHEDULED	\N	2025-07-27 07:34:41.952	2025-07-27 07:34:41.952	f	\N	\N	cmdlczm27000ejy049luw6wqf	0
cmdlda4wn0015l704av3gdx8w	cmdld2bx2000kjy047oxna1pg	2025-08-01 07:35:00	2026-06-30 07:35:00	SCHEDULED	\N	2025-07-27 07:37:58.103	2025-07-27 07:37:58.103	f	\N	\N	cmd7lihb80006l5047r3fbag3	0
cmdlde5kp000wjy04l6z9b8kj	cmdld2bx2000kjy047oxna1pg	2025-08-01 07:38:00	2026-06-30 07:38:00	SCHEDULED	\N	2025-07-27 07:41:05.593	2025-07-27 07:41:05.593	f	\N	\N	cmd7lihb80006l5047r3fbag3	0
\.


--
-- Data for Name: ClassStudent; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."ClassStudent" (id, "classId", "studentId", "createdAt", "updatedAt") FROM stdin;
cmd6uap850003ye8kdodsfq4s	cmd6uaotl0001ye8kbjpq6ng9	cmd6t6isd0002yezhw8x1o3a8	2025-07-17 03:37:45.269	2025-07-17 03:37:45.269
cmd6y9kq80003l704yonvy13l	cmd6y9kpk0001l704t56ql469	cmd6t6isd0002yezhw8x1o3a8	2025-07-17 05:28:51.248	2025-07-17 05:28:51.248
cmd6zwyug0003jx04de2wsge8	cmd6zwyt20001jx04kie17sdc	cmcigf26d0002lg046r0x4bff	2025-07-17 06:15:02.248	2025-07-17 06:15:02.248
cmd701uvc0003jl04hckfvhq5	cmd701uuy0001jl04dupdtj29	cmcigijls0002k104xzqu0xz8	2025-07-17 06:18:50.377	2025-07-17 06:18:50.377
cmdlbjqih0003l404jmoz50wc	cmdlbjqh10001l404ekd2mzhg	cmdcy9dqc0002kw04fzbfbm09	2025-07-27 06:49:26.777	2025-07-27 06:49:26.777
cmdlbq1ac0009l404rf8uv1mt	cmdlbq1a20007l404qzz7r819	cmdcy43e10002kz04ake9nod3	2025-07-27 06:54:20.677	2025-07-27 06:54:20.677
cmdlc6ung0003jr04m35txpy6	cmdlc6umz0001jr044gz1ddx8	cmdcydgq40007kz045v3lkt6q	2025-07-27 07:07:25.229	2025-07-27 07:07:25.229
cmdlcdb6f0009jr0444tsj0g9	cmdlcdb600007jr04pebwztry	cmdd03a7v0006i204cstx5eop	2025-07-27 07:12:26.584	2025-07-27 07:12:26.584
cmdlcgv3l0003jy04klhi6hxp	cmdlcgv350001jy04focng5yx	cmdcyg870000dkz04wviy0hbx	2025-07-27 07:15:12.369	2025-07-27 07:15:12.369
cmdlcgv3l0005jy04wydgouks	cmdlcgv350001jy04focng5yx	cmdcyitpc0007kw04gd11iv1o	2025-07-27 07:15:12.369	2025-07-27 07:15:12.369
cmdlckrne000fl7047tuu548o	cmdlckrmz000dl704krpnjzan	cmdcylj0z000ikz04uw89bppr	2025-07-27 07:18:14.523	2025-07-27 07:18:14.523
cmdlckrnf000hl704bx32linz	cmdlckrmz000dl704krpnjzan	cmdcyu8jw000dkw04gwgd9bo7	2025-07-27 07:18:14.523	2025-07-27 07:18:14.523
cmdlcoksa000nl704oa3p72ap	cmdlcokrv000ll704irsr2sbr	cmdczeybn0006jn04so3abvlx	2025-07-27 07:21:12.25	2025-07-27 07:21:12.25
cmdlcoksa000pl704hlpe5fj3	cmdlcokrv000ll704irsr2sbr	cmdcz2vga000mkw04fn85ei2m	2025-07-27 07:21:12.25	2025-07-27 07:21:12.25
cmdlcr6jc000bjy04ahq0jfeb	cmdlcr6ix0009jy04acexyjia	cmdd1rg990002jp04g5lbww6s	2025-07-27 07:23:13.753	2025-07-27 07:23:13.753
cmdlcv76f000fjr04wd6pti07	cmdlcv75q000djr043m28h2ma	cmdczkdsm000bjn04ffv4ccjd	2025-07-27 07:26:21.208	2025-07-27 07:26:21.208
cmdlcv76f000hjr04qlt3pleh	cmdlcv75q000djr043m28h2ma	cmdczho14000tkw04tofv799e	2025-07-27 07:26:21.208	2025-07-27 07:26:21.208
cmdlcv76g000jjr04mrkoll0r	cmdlcv75q000djr043m28h2ma	cmdczzve40002i204gm5aks3q	2025-07-27 07:26:21.208	2025-07-27 07:26:21.208
cmdlcykud000vl7043v6asa9r	cmdlcyktx000tl704e4lpzr1s	cmdd0dzeb0005l504eny8zj8y	2025-07-27 07:28:58.885	2025-07-27 07:28:58.885
cmdld5xkf0011l704ynzwi85v	cmdld5xjz000zl704xvb90ixx	cmdlax3nn000rjv04py62w30v	2025-07-27 07:34:41.967	2025-07-27 07:34:41.967
cmdlda4x20017l7046hsmodae	cmdlda4wn0015l704av3gdx8w	cmdd07lpf0002l504n75p4shq	2025-07-27 07:37:58.118	2025-07-27 07:37:58.118
cmdlde5l5000yjy04gg7hfyif	cmdlde5kp000wjy04l6z9b8kj	cmdd097aa000di204ydmt0xpr	2025-07-27 07:41:05.609	2025-07-27 07:41:05.609
\.


--
-- Data for Name: DemoClass; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."DemoClass" (id, "teacherId", "subjectId", "studentName", "studentEmail", "studentPhone", "scheduledDate", "scheduledTime", status, notes, "createdBy", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Grade; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Grade" (id, name, level, curriculum, description, "isActive", "createdAt", "updatedAt") FROM stdin;
cmcifvt4c001bli04vlw7i0v6	10th	1	CBSE		t	2025-06-30 01:47:47.628	2025-06-30 01:47:47.628
cmcifkzcg0000li04f61a2s0n	11th	11	CBSE		t	2025-06-30 01:39:22.48	2025-06-30 01:48:50.252
cmcifyfbb002cli04ye9hggq3	9th	1	CBSE		t	2025-06-30 01:49:49.703	2025-06-30 01:49:49.703
cmcig05ch002wli041at1y7x4	8th	1	CBSE		t	2025-06-30 01:51:10.098	2025-06-30 01:51:10.098
cmcig0zjw0039li04s2q3gqsa	7th	1	IB		t	2025-06-30 01:51:49.245	2025-06-30 01:51:49.245
cmcig1p3c003gli04fbqdbfpz	7th	1	CBSE		t	2025-06-30 01:52:22.345	2025-06-30 01:52:22.345
cmcij6t7x0000jv04oafg39yo	6th	1	CBSE		t	2025-06-30 03:20:19.821	2025-06-30 03:20:19.821
cmcij8gy8000ljv04cakumw3k	5th	1	CBSE		t	2025-06-30 03:21:37.233	2025-06-30 03:21:37.233
cmcifzhsj002pli04bkp85bal	8th	1	IB		t	2025-06-30 01:50:39.572	2025-07-17 06:06:56.854
cmd8bms2e0000l204csd0ayvc	12th	1	CBSE		t	2025-07-18 04:30:48.47	2025-07-18 04:30:48.47
cmd8bnwtl0009l204a02d91sx	10th	1	IB		t	2025-07-18 04:31:41.29	2025-07-18 04:31:41.29
cmd8bp2n1000ol2049nsd1vv3	4th	1	CBSE		t	2025-07-18 04:32:35.485	2025-07-18 04:32:35.485
cmd8bqh1h0011l2045awcf7ub	3rd	1	CBSE		t	2025-07-18 04:33:40.805	2025-07-18 04:33:40.805
cmd8bs78l001gl204nfgteu5a	2nd	1	CBSE		t	2025-07-18 04:35:01.413	2025-07-18 04:35:01.413
cmd8btlzq001vl204qxwgq5c5	1st	1	CBSE		t	2025-07-18 04:36:07.191	2025-07-18 04:36:07.191
cmdd23tzx0009jp04ecy24g4c	4th	1	Other	Australian Curriculam	t	2025-07-21 12:02:58.845	2025-07-21 12:02:58.845
cmddylpap0001ju059suph7d2	10th	1	IGCSE		t	2025-07-22 03:12:40.273	2025-07-22 03:12:40.273
cmde6fi4o0000ju04fxwzhajm	6th	1	Other	UK curriculam	t	2025-07-22 06:51:47.976	2025-07-22 06:51:47.976
cmde74b37000ol4046xtws94c	6th	1	IGCSE		t	2025-07-22 07:11:05.251	2025-07-22 07:11:05.251
cmde7c47w000bl5040kp509km	3rd	1	Other	Victorian Standard Syllabus	t	2025-07-22 07:17:09.596	2025-07-22 07:17:09.596
cmde7nhcd0006lb04olqvkzpl	P6	1	Other	UK 	t	2025-07-22 07:25:59.821	2025-07-22 07:25:59.821
cmdebsweh000ejl04l3w02rpz	5th	1	Other	UK	t	2025-07-22 09:22:11.081	2025-07-22 09:22:11.081
cmdec1anj000ujl0417vkynw2	9th	1	ICSE		t	2025-07-22 09:28:42.8	2025-07-22 09:28:42.8
cmdfacmsb000kl504motpypzi	5th	1	ICSE		t	2025-07-23 01:29:18.684	2025-07-23 01:29:18.684
cmdfrnulj0004l804bv9w7mpd	10th	1	ICSE		t	2025-07-23 09:33:55.495	2025-07-23 09:33:55.495
cmdla98l60004jv04kbzxqz6b	2nd	1	ICSE		t	2025-07-27 06:13:17.371	2025-07-27 06:13:17.371
cmde7b3pl0000l504ghdtuw9z	10th	1	Other	Victorian standard Syllabus	t	2025-07-22 07:16:22.281	2025-07-27 06:59:31.823
\.


--
-- Data for Name: GradeSubject; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."GradeSubject" (id, "gradeId", "subjectId", "isCore", "order", "createdAt", "updatedAt") FROM stdin;
cmcifvt4t001dli048bcc2ti6	cmcifvt4c001bli04vlw7i0v6	cmcifn2tj0003li04u1b0q2hl	t	1	2025-06-30 01:47:47.645	2025-06-30 01:47:47.645
cmcifvt4t001fli04cdvcseie	cmcifvt4c001bli04vlw7i0v6	cmcifnpb50009li04sei1hpj3	t	2	2025-06-30 01:47:47.645	2025-06-30 01:47:47.645
cmcifvt4t001hli04ggvg32td	cmcifvt4c001bli04vlw7i0v6	cmcifqith000hli04ugifo4f3	t	3	2025-06-30 01:47:47.645	2025-06-30 01:47:47.645
cmcifvt4t001jli044o4rsrec	cmcifvt4c001bli04vlw7i0v6	cmcifnh7n0006li04di43zjd7	t	4	2025-06-30 01:47:47.645	2025-06-30 01:47:47.645
cmcifvt4t001lli045hapam94	cmcifvt4c001bli04vlw7i0v6	cmcifqt5f000kli049l61n4qw	t	5	2025-06-30 01:47:47.645	2025-06-30 01:47:47.645
cmcifx5gc0021li04q59dz74d	cmcifkzcg0000li04f61a2s0n	cmcifnh7n0006li04di43zjd7	t	1	2025-06-30 01:48:50.269	2025-06-30 01:48:50.269
cmcifx5gc0023li04a0z2x60z	cmcifkzcg0000li04f61a2s0n	cmcifn2tj0003li04u1b0q2hl	t	2	2025-06-30 01:48:50.269	2025-06-30 01:48:50.269
cmcifx5gc0025li04jr79jdcp	cmcifkzcg0000li04f61a2s0n	cmcifr6fn000nli04tternemu	t	3	2025-06-30 01:48:50.269	2025-06-30 01:48:50.269
cmcifx5gc0027li042ffvkhlo	cmcifkzcg0000li04f61a2s0n	cmcifrdsn000qli042fbtlv2a	t	4	2025-06-30 01:48:50.269	2025-06-30 01:48:50.269
cmcifx5gd0029li046age5sop	cmcifkzcg0000li04f61a2s0n	cmcifrlrp000tli0491ffkm1z	t	5	2025-06-30 01:48:50.269	2025-06-30 01:48:50.269
cmcifyfbj002eli047j0giigv	cmcifyfbb002cli04ye9hggq3	cmcifnh7n0006li04di43zjd7	t	1	2025-06-30 01:49:49.711	2025-06-30 01:49:49.711
cmcifyfbj002gli04fngp55qn	cmcifyfbb002cli04ye9hggq3	cmcifqith000hli04ugifo4f3	t	2	2025-06-30 01:49:49.711	2025-06-30 01:49:49.711
cmcifyfbj002ili04pkgatljp	cmcifyfbb002cli04ye9hggq3	cmcifn2tj0003li04u1b0q2hl	t	3	2025-06-30 01:49:49.711	2025-06-30 01:49:49.711
cmcifyfbj002kli04kkvxr6vv	cmcifyfbb002cli04ye9hggq3	cmcifqt5f000kli049l61n4qw	t	4	2025-06-30 01:49:49.711	2025-06-30 01:49:49.711
cmcifyfbj002mli042l888ec0	cmcifyfbb002cli04ye9hggq3	cmcifnpb50009li04sei1hpj3	t	5	2025-06-30 01:49:49.711	2025-06-30 01:49:49.711
cmcig05cq002yli04v63epltw	cmcig05ch002wli041at1y7x4	cmcifnh7n0006li04di43zjd7	t	1	2025-06-30 01:51:10.106	2025-06-30 01:51:10.106
cmcig05cq0030li0489iewjf0	cmcig05ch002wli041at1y7x4	cmcifqith000hli04ugifo4f3	t	2	2025-06-30 01:51:10.106	2025-06-30 01:51:10.106
cmcig05cq0032li04c3w069ly	cmcig05ch002wli041at1y7x4	cmcifn2tj0003li04u1b0q2hl	t	3	2025-06-30 01:51:10.106	2025-06-30 01:51:10.106
cmcig05cq0034li04pixjtp17	cmcig05ch002wli041at1y7x4	cmcifqt5f000kli049l61n4qw	t	4	2025-06-30 01:51:10.106	2025-06-30 01:51:10.106
cmcig05cq0036li04wxg6sx5d	cmcig05ch002wli041at1y7x4	cmcifnpb50009li04sei1hpj3	t	5	2025-06-30 01:51:10.106	2025-06-30 01:51:10.106
cmcig0zk4003bli04oxewyd4b	cmcig0zjw0039li04s2q3gqsa	cmcifnh7n0006li04di43zjd7	t	1	2025-06-30 01:51:49.253	2025-06-30 01:51:49.253
cmcig0zk4003dli04ihc8p6bp	cmcig0zjw0039li04s2q3gqsa	cmcifn2tj0003li04u1b0q2hl	t	2	2025-06-30 01:51:49.253	2025-06-30 01:51:49.253
cmcig1p3k003ili047gfcx9gb	cmcig1p3c003gli04fbqdbfpz	cmcifnh7n0006li04di43zjd7	t	1	2025-06-30 01:52:22.352	2025-06-30 01:52:22.352
cmcig1p3k003kli04sr6a8b4y	cmcig1p3c003gli04fbqdbfpz	cmcifqith000hli04ugifo4f3	t	2	2025-06-30 01:52:22.352	2025-06-30 01:52:22.352
cmcig1p3k003mli04qfbdg6z8	cmcig1p3c003gli04fbqdbfpz	cmcifn2tj0003li04u1b0q2hl	t	3	2025-06-30 01:52:22.352	2025-06-30 01:52:22.352
cmcig1p3k003oli04ejm7qy0t	cmcig1p3c003gli04fbqdbfpz	cmcifqt5f000kli049l61n4qw	t	4	2025-06-30 01:52:22.352	2025-06-30 01:52:22.352
cmcig1p3k003qli04atadnm4e	cmcig1p3c003gli04fbqdbfpz	cmcifnpb50009li04sei1hpj3	t	5	2025-06-30 01:52:22.352	2025-06-30 01:52:22.352
cmcij6t8s0002jv045po3gpe9	cmcij6t7x0000jv04oafg39yo	cmcih8h950000l40435060nod	t	1	2025-06-30 03:20:19.852	2025-06-30 03:20:19.852
cmcij6t8s0004jv04ztv5bhgy	cmcij6t7x0000jv04oafg39yo	cmcifnh7n0006li04di43zjd7	t	2	2025-06-30 03:20:19.852	2025-06-30 03:20:19.852
cmcij6t8s0006jv04xbub8iel	cmcij6t7x0000jv04oafg39yo	cmcifrumc000wli04qyv2x162	t	3	2025-06-30 03:20:19.852	2025-06-30 03:20:19.852
cmcij6t8s0008jv04smdk2hyi	cmcij6t7x0000jv04oafg39yo	cmcifqith000hli04ugifo4f3	t	4	2025-06-30 03:20:19.852	2025-06-30 03:20:19.852
cmcij6t8s000ajv041gnrft1g	cmcij6t7x0000jv04oafg39yo	cmcifn2tj0003li04u1b0q2hl	t	5	2025-06-30 03:20:19.852	2025-06-30 03:20:19.852
cmcij6t8s000cjv04rgt6lp4t	cmcij6t7x0000jv04oafg39yo	cmcifnpb50009li04sei1hpj3	t	6	2025-06-30 03:20:19.852	2025-06-30 03:20:19.852
cmcij6t8s000ejv04ml24bynp	cmcij6t7x0000jv04oafg39yo	cmcifqt5f000kli049l61n4qw	t	7	2025-06-30 03:20:19.852	2025-06-30 03:20:19.852
cmcij6t8s000gjv04w3kvlxml	cmcij6t7x0000jv04oafg39yo	cmcih93ai0006l404cu03619k	t	8	2025-06-30 03:20:19.852	2025-06-30 03:20:19.852
cmcij6t8s000ijv04ba8fvue0	cmcij6t7x0000jv04oafg39yo	cmcih8sou0003l404feix35az	t	9	2025-06-30 03:20:19.852	2025-06-30 03:20:19.852
cmcij8gyh000njv04xhhqggat	cmcij8gy8000ljv04cakumw3k	cmcih8h950000l40435060nod	t	1	2025-06-30 03:21:37.241	2025-06-30 03:21:37.241
cmcij8gyh000pjv04f4ih0tz5	cmcij8gy8000ljv04cakumw3k	cmcifnh7n0006li04di43zjd7	t	2	2025-06-30 03:21:37.241	2025-06-30 03:21:37.241
cmcij8gyh000rjv04tt5uwvng	cmcij8gy8000ljv04cakumw3k	cmcifqith000hli04ugifo4f3	t	3	2025-06-30 03:21:37.241	2025-06-30 03:21:37.241
cmcij8gyh000tjv0486f5ot4q	cmcij8gy8000ljv04cakumw3k	cmcifn2tj0003li04u1b0q2hl	t	4	2025-06-30 03:21:37.241	2025-06-30 03:21:37.241
cmd6zmkcb0001lf049o7tidim	cmcifzhsj002pli04bkp85bal	cmcifnh7n0006li04di43zjd7	t	1	2025-07-17 06:06:56.891	2025-07-17 06:06:56.891
cmd6zmkcb0003lf04e41ofe7d	cmcifzhsj002pli04bkp85bal	cmcifn2tj0003li04u1b0q2hl	t	2	2025-07-17 06:06:56.891	2025-07-17 06:06:56.891
cmd6zmkcb0005lf04c6778ew4	cmcifzhsj002pli04bkp85bal	cmcifnpb50009li04sei1hpj3	t	3	2025-07-17 06:06:56.891	2025-07-17 06:06:56.891
cmd8bms300002l204vp27j1v6	cmd8bms2e0000l204csd0ayvc	cmcifn2tj0003li04u1b0q2hl	t	1	2025-07-18 04:30:48.492	2025-07-18 04:30:48.492
cmd8bms300004l204sfr5yflz	cmd8bms2e0000l204csd0ayvc	cmcifr6fn000nli04tternemu	t	2	2025-07-18 04:30:48.492	2025-07-18 04:30:48.492
cmd8bms300006l2044so4108i	cmd8bms2e0000l204csd0ayvc	cmcifrdsn000qli042fbtlv2a	t	3	2025-07-18 04:30:48.492	2025-07-18 04:30:48.492
cmd8bnwtu000bl204u1al4j7h	cmd8bnwtl0009l204a02d91sx	cmd7lihb80006l5047r3fbag3	t	1	2025-07-18 04:31:41.299	2025-07-18 04:31:41.299
cmd8bnwtu000dl2045nw3ppeh	cmd8bnwtl0009l204a02d91sx	cmd7li1lr0003l504k5j9m7h4	t	2	2025-07-18 04:31:41.299	2025-07-18 04:31:41.299
cmd8bnwtu000fl2040ukvxo0z	cmd8bnwtl0009l204a02d91sx	cmd7lho750000l504iz361tcd	t	3	2025-07-18 04:31:41.299	2025-07-18 04:31:41.299
cmd8bnwtv000hl204tuuky2cp	cmd8bnwtl0009l204a02d91sx	cmd7ljf6f000cl5043a4k8ccp	t	4	2025-07-18 04:31:41.299	2025-07-18 04:31:41.299
cmd8bnwtv000jl204cmnmvy4w	cmd8bnwtl0009l204a02d91sx	cmd7lj0ta0009l504jvohxbpi	t	5	2025-07-18 04:31:41.299	2025-07-18 04:31:41.299
cmd8bnwtv000ll204zny25js0	cmd8bnwtl0009l204a02d91sx	cmcifnpb50009li04sei1hpj3	t	6	2025-07-18 04:31:41.299	2025-07-18 04:31:41.299
cmd8bp2n9000ql204bp9e8u4k	cmd8bp2n1000ol2049nsd1vv3	cmcih8h950000l40435060nod	t	1	2025-07-18 04:32:35.494	2025-07-18 04:32:35.494
cmd8bp2na000sl204k3ycrzpl	cmd8bp2n1000ol2049nsd1vv3	cmcifnh7n0006li04di43zjd7	t	2	2025-07-18 04:32:35.494	2025-07-18 04:32:35.494
cmd8bp2na000ul204igpz2ym7	cmd8bp2n1000ol2049nsd1vv3	cmcifqith000hli04ugifo4f3	t	3	2025-07-18 04:32:35.494	2025-07-18 04:32:35.494
cmd8bp2na000wl2041a284o1r	cmd8bp2n1000ol2049nsd1vv3	cmcifn2tj0003li04u1b0q2hl	t	4	2025-07-18 04:32:35.494	2025-07-18 04:32:35.494
cmd8bp2na000yl204zk0rxxdk	cmd8bp2n1000ol2049nsd1vv3	cmcifnpb50009li04sei1hpj3	t	5	2025-07-18 04:32:35.494	2025-07-18 04:32:35.494
cmd8bqh1p0013l2048usm0wmp	cmd8bqh1h0011l2045awcf7ub	cmcih8h950000l40435060nod	t	1	2025-07-18 04:33:40.813	2025-07-18 04:33:40.813
cmd8bqh1p0015l204wqkl0v5x	cmd8bqh1h0011l2045awcf7ub	cmcifnh7n0006li04di43zjd7	t	2	2025-07-18 04:33:40.813	2025-07-18 04:33:40.813
cmd8bqh1p0017l204wwxg1u5b	cmd8bqh1h0011l2045awcf7ub	cmcifqith000hli04ugifo4f3	t	3	2025-07-18 04:33:40.813	2025-07-18 04:33:40.813
cmd8bqh1p0019l204pzpdle9p	cmd8bqh1h0011l2045awcf7ub	cmcifn2tj0003li04u1b0q2hl	t	4	2025-07-18 04:33:40.813	2025-07-18 04:33:40.813
cmd8bqh1p001bl204adlekyfl	cmd8bqh1h0011l2045awcf7ub	cmcifshh20012li04zzqqaxby	t	5	2025-07-18 04:33:40.813	2025-07-18 04:33:40.813
cmd8bqh1p001dl2041wpd6yc2	cmd8bqh1h0011l2045awcf7ub	cmcifnpb50009li04sei1hpj3	t	6	2025-07-18 04:33:40.813	2025-07-18 04:33:40.813
cmd8bs790001il204osnqv8l6	cmd8bs78l001gl204nfgteu5a	cmcih8h950000l40435060nod	t	1	2025-07-18 04:35:01.429	2025-07-18 04:35:01.429
cmd8bs790001kl204tssyxwkc	cmd8bs78l001gl204nfgteu5a	cmcifnh7n0006li04di43zjd7	t	2	2025-07-18 04:35:01.429	2025-07-18 04:35:01.429
cmd8bs790001ml2042fjk13kb	cmd8bs78l001gl204nfgteu5a	cmcifqith000hli04ugifo4f3	t	3	2025-07-18 04:35:01.429	2025-07-18 04:35:01.429
cmd8bs790001ol2040n7vovcd	cmd8bs78l001gl204nfgteu5a	cmcifn2tj0003li04u1b0q2hl	t	4	2025-07-18 04:35:01.429	2025-07-18 04:35:01.429
cmd8bs791001ql204fqyg7or0	cmd8bs78l001gl204nfgteu5a	cmciftbdg0018li04n7fpuzny	t	5	2025-07-18 04:35:01.429	2025-07-18 04:35:01.429
cmd8bs791001sl204608zf1xf	cmd8bs78l001gl204nfgteu5a	cmcifs5vk000zli04d6farvfv	t	6	2025-07-18 04:35:01.429	2025-07-18 04:35:01.429
cmd8btlzz001xl204cwnh2da3	cmd8btlzq001vl204qxwgq5c5	cmcifs5vk000zli04d6farvfv	t	1	2025-07-18 04:36:07.199	2025-07-18 04:36:07.199
cmd8btlzz001zl204bwsfl9mr	cmd8btlzq001vl204qxwgq5c5	cmcih8h950000l40435060nod	t	2	2025-07-18 04:36:07.199	2025-07-18 04:36:07.199
cmd8btlzz0021l2047kuu85d6	cmd8btlzq001vl204qxwgq5c5	cmcifnh7n0006li04di43zjd7	t	3	2025-07-18 04:36:07.199	2025-07-18 04:36:07.199
cmd8btlzz0023l204ce2xr4nk	cmd8btlzq001vl204qxwgq5c5	cmcifn2tj0003li04u1b0q2hl	t	4	2025-07-18 04:36:07.199	2025-07-18 04:36:07.199
cmd8btlzz0025l204jih1r2sf	cmd8btlzq001vl204qxwgq5c5	cmcifsxjc0015li04vl5zd9q7	t	5	2025-07-18 04:36:07.199	2025-07-18 04:36:07.199
cmd8btlzz0027l204ph9p5isj	cmd8btlzq001vl204qxwgq5c5	cmcih93ai0006l404cu03619k	t	6	2025-07-18 04:36:07.199	2025-07-18 04:36:07.199
cmd8btlzz0029l204lqdkzr2l	cmd8btlzq001vl204qxwgq5c5	cmcifshh20012li04zzqqaxby	t	7	2025-07-18 04:36:07.199	2025-07-18 04:36:07.199
cmdd23u12000bjp04peuap6f5	cmdd23tzx0009jp04ecy24g4c	cmcih8h950000l40435060nod	t	1	2025-07-21 12:02:58.886	2025-07-21 12:02:58.886
cmdd23u12000djp04c6q4ymjh	cmdd23tzx0009jp04ecy24g4c	cmcifnh7n0006li04di43zjd7	t	2	2025-07-21 12:02:58.886	2025-07-21 12:02:58.886
cmdd23u12000fjp04pgb16urq	cmdd23tzx0009jp04ecy24g4c	cmcifn2tj0003li04u1b0q2hl	t	3	2025-07-21 12:02:58.886	2025-07-21 12:02:58.886
cmddylpba0003ju05tzz9mafe	cmddylpap0001ju059suph7d2	cmcifnh7n0006li04di43zjd7	t	1	2025-07-22 03:12:40.294	2025-07-22 03:12:40.294
cmddylpba0005ju05ibhczgv0	cmddylpap0001ju059suph7d2	cmcifrdsn000qli042fbtlv2a	t	2	2025-07-22 03:12:40.294	2025-07-22 03:12:40.294
cmddylpba0007ju05tapr3ndc	cmddylpap0001ju059suph7d2	cmcifn2tj0003li04u1b0q2hl	t	3	2025-07-22 03:12:40.294	2025-07-22 03:12:40.294
cmddylpba0009ju05xjas6hcg	cmddylpap0001ju059suph7d2	cmd7lihb80006l5047r3fbag3	t	4	2025-07-22 03:12:40.294	2025-07-22 03:12:40.294
cmddylpba000bju05f28sscde	cmddylpap0001ju059suph7d2	cmcifr6fn000nli04tternemu	t	5	2025-07-22 03:12:40.294	2025-07-22 03:12:40.294
cmde6fi550002ju04mljqwqn2	cmde6fi4o0000ju04fxwzhajm	cmcifnh7n0006li04di43zjd7	t	1	2025-07-22 06:51:47.994	2025-07-22 06:51:47.994
cmde6fi550004ju048aoghvle	cmde6fi4o0000ju04fxwzhajm	cmcifnpb50009li04sei1hpj3	t	2	2025-07-22 06:51:47.994	2025-07-22 06:51:47.994
cmde74b3m000ql4045ge6vjrj	cmde74b37000ol4046xtws94c	cmcifnh7n0006li04di43zjd7	t	1	2025-07-22 07:11:05.266	2025-07-22 07:11:05.266
cmde74b3m000sl404gi5vgp7s	cmde74b37000ol4046xtws94c	cmcifn2tj0003li04u1b0q2hl	t	2	2025-07-22 07:11:05.266	2025-07-22 07:11:05.266
cmde7c484000dl5045vf4z9lp	cmde7c47w000bl5040kp509km	cmcih8h950000l40435060nod	t	1	2025-07-22 07:17:09.605	2025-07-22 07:17:09.605
cmde7c484000fl504ji40f3ao	cmde7c47w000bl5040kp509km	cmcifnh7n0006li04di43zjd7	t	2	2025-07-22 07:17:09.605	2025-07-22 07:17:09.605
cmde7c484000hl50402xs2yqo	cmde7c47w000bl5040kp509km	cmcifn2tj0003li04u1b0q2hl	t	3	2025-07-22 07:17:09.605	2025-07-22 07:17:09.605
cmde7nhct0008lb04st44z215	cmde7nhcd0006lb04olqvkzpl	cmcifshh20012li04zzqqaxby	t	1	2025-07-22 07:25:59.838	2025-07-22 07:25:59.838
cmdebswf1000gjl04tweai0sp	cmdebsweh000ejl04l3w02rpz	cmcih8h950000l40435060nod	t	1	2025-07-22 09:22:11.102	2025-07-22 09:22:11.102
cmdebswf1000ijl04simvgm5v	cmdebsweh000ejl04l3w02rpz	cmcifnh7n0006li04di43zjd7	t	2	2025-07-22 09:22:11.102	2025-07-22 09:22:11.102
cmdebswf1000kjl04cp29j6po	cmdebsweh000ejl04l3w02rpz	cmcifn2tj0003li04u1b0q2hl	t	3	2025-07-22 09:22:11.102	2025-07-22 09:22:11.102
cmdebswf1000mjl04qg1xigge	cmdebsweh000ejl04l3w02rpz	cmcih8sou0003l404feix35az	t	4	2025-07-22 09:22:11.102	2025-07-22 09:22:11.102
cmdebswf1000ojl04ia1q6bc9	cmdebsweh000ejl04l3w02rpz	cmcifnpb50009li04sei1hpj3	t	5	2025-07-22 09:22:11.102	2025-07-22 09:22:11.102
cmdec1anz000wjl04bc7whm55	cmdec1anj000ujl0417vkynw2	cmcifnh7n0006li04di43zjd7	t	1	2025-07-22 09:28:42.815	2025-07-22 09:28:42.815
cmdec1anz000yjl047bd9qb37	cmdec1anj000ujl0417vkynw2	cmcifn2tj0003li04u1b0q2hl	t	2	2025-07-22 09:28:42.815	2025-07-22 09:28:42.815
cmdec1anz0010jl04f5jcb01w	cmdec1anj000ujl0417vkynw2	cmcifr6fn000nli04tternemu	t	3	2025-07-22 09:28:42.815	2025-07-22 09:28:42.815
cmdec1anz0012jl04usnmyssd	cmdec1anj000ujl0417vkynw2	cmcifrdsn000qli042fbtlv2a	t	4	2025-07-22 09:28:42.815	2025-07-22 09:28:42.815
cmdec1anz0014jl04kudo7483	cmdec1anj000ujl0417vkynw2	cmcifrlrp000tli0491ffkm1z	t	5	2025-07-22 09:28:42.815	2025-07-22 09:28:42.815
cmdfacmts000ml504gjh1ljc5	cmdfacmsb000kl504motpypzi	cmcifnh7n0006li04di43zjd7	t	1	2025-07-23 01:29:18.736	2025-07-23 01:29:18.736
cmdfacmts000ol5047l4i8j4l	cmdfacmsb000kl504motpypzi	cmcih8h950000l40435060nod	t	2	2025-07-23 01:29:18.736	2025-07-23 01:29:18.736
cmdfacmts000ql504xyrxvxoq	cmdfacmsb000kl504motpypzi	cmcifn2tj0003li04u1b0q2hl	t	3	2025-07-23 01:29:18.736	2025-07-23 01:29:18.736
cmdfacmts000sl5045ilagewf	cmdfacmsb000kl504motpypzi	cmcih8sou0003l404feix35az	t	4	2025-07-23 01:29:18.736	2025-07-23 01:29:18.736
cmdfrnum40006l804hxpgyhpi	cmdfrnulj0004l804bv9w7mpd	cmcifrdsn000qli042fbtlv2a	t	1	2025-07-23 09:33:55.517	2025-07-23 09:33:55.517
cmdfrnum40008l804dwyb67pm	cmdfrnulj0004l804bv9w7mpd	cmcifnh7n0006li04di43zjd7	t	2	2025-07-23 09:33:55.517	2025-07-23 09:33:55.517
cmdfrnum4000al8040ccrgk1n	cmdfrnulj0004l804bv9w7mpd	cmcifn2tj0003li04u1b0q2hl	t	3	2025-07-23 09:33:55.517	2025-07-23 09:33:55.517
cmdfrnum4000cl804br3suznq	cmdfrnulj0004l804bv9w7mpd	cmcifr6fn000nli04tternemu	t	4	2025-07-23 09:33:55.517	2025-07-23 09:33:55.517
cmdfrnum4000el8044082etvs	cmdfrnulj0004l804bv9w7mpd	cmcifnpb50009li04sei1hpj3	t	5	2025-07-23 09:33:55.517	2025-07-23 09:33:55.517
cmdla98lq0006jv04z8gwd5uz	cmdla98l60004jv04kbzxqz6b	cmcifs5vk000zli04d6farvfv	t	1	2025-07-27 06:13:17.39	2025-07-27 06:13:17.39
cmdla98lq0008jv04sxiva9t4	cmdla98l60004jv04kbzxqz6b	cmcih8h950000l40435060nod	t	2	2025-07-27 06:13:17.39	2025-07-27 06:13:17.39
cmdla98lq000ajv04bakipioe	cmdla98l60004jv04kbzxqz6b	cmcifnh7n0006li04di43zjd7	t	3	2025-07-27 06:13:17.39	2025-07-27 06:13:17.39
cmdla98lq000cjv04m958n7z7	cmdla98l60004jv04kbzxqz6b	cmcifqith000hli04ugifo4f3	t	4	2025-07-27 06:13:17.39	2025-07-27 06:13:17.39
cmdla98lq000ejv04o6fo471v	cmdla98l60004jv04kbzxqz6b	cmcifn2tj0003li04u1b0q2hl	t	5	2025-07-27 06:13:17.39	2025-07-27 06:13:17.39
cmdla98lq000gjv04zbgc864l	cmdla98l60004jv04kbzxqz6b	cmcifshh20012li04zzqqaxby	t	6	2025-07-27 06:13:17.39	2025-07-27 06:13:17.39
cmdlbwpe60003l704salt9jw4	cmde7b3pl0000l504ghdtuw9z	cmcifnh7n0006li04di43zjd7	t	1	2025-07-27 06:59:31.855	2025-07-27 06:59:31.855
cmdlbwpe60005l7044dwjvsk1	cmde7b3pl0000l504ghdtuw9z	cmcifrdsn000qli042fbtlv2a	t	2	2025-07-27 06:59:31.855	2025-07-27 06:59:31.855
cmdlbwpe60007l7044k86tiuo	cmde7b3pl0000l504ghdtuw9z	cmd7lihb80006l5047r3fbag3	t	3	2025-07-27 06:59:31.855	2025-07-27 06:59:31.855
cmdlbwpe60009l704nab2ggf6	cmde7b3pl0000l504ghdtuw9z	cmcifn2tj0003li04u1b0q2hl	t	4	2025-07-27 06:59:31.855	2025-07-27 06:59:31.855
\.


--
-- Data for Name: Lead; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Lead" (id, "userId", status, source, notes, "convertedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Student; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Student" (id, "userId", school, "createdAt", "updatedAt", "mobileNumber", "fatherContact", "fatherName", "gradeId", "motherContact", "motherName") FROM stdin;
cmcigf26d0002lg046r0x4bff	cmcigf25k0000lg04iopsaluo		2025-06-30 02:02:45.83	2025-06-30 02:02:45.83		+1(612)222-9307	Tharun	cmcifzhsj002pli04bkp85bal	+1(980)298-2588	Sirisha 
cmcigijls0002k104xzqu0xz8	cmcigijlc0000k104lx8gtxkw		2025-06-30 02:05:28.384	2025-06-30 02:05:28.384		+1(510)565-2133	Uday Kumar	cmcig0zjw0039li04s2q3gqsa	+1(302)442-2547	Suneetha Duddu
cmdcyxjgp000hkw04en1ekgyh	cmdcyxjgf000fkw04lryrcie2	Oakridge International School Hyderabad	2025-07-21 10:34:06.409	2025-07-21 12:45:53.276	6281171827			cmcifzhsj002pli04bkp85bal	9533824933	Vibha Pipalia
cmdcorlox0002yeypqvne17sb	cmdcorlbc0000yeypaywmapz8	Amity	2025-07-21 05:49:33.202	2025-07-21 05:57:13.436	876543210			cmcifvt4c001bli04vlw7i0v6		
cmdcy43e10002kz04ake9nod3	cmdcy43da0000kz04eu7j5jkw		2025-07-21 10:11:12.554	2025-07-21 10:11:12.554				cmcifyfbb002cli04ye9hggq3	+1(778)883-2604	Pushpa
cmdcy9dqc0002kw04fzbfbm09	cmdcy9dpu0000kw04py24rmm0		2025-07-21 10:15:19.236	2025-07-21 10:15:19.236		+1(972)787-1499	Santhosh Nalla	cmcig0zjw0039li04s2q3gqsa	+1(469)313-4305	Prasanna Bhargavi
cmdcyitpc0007kw04gd11iv1o	cmdcyitoy0005kw04284ouqb3		2025-07-21 10:22:39.84	2025-07-21 10:22:39.84				cmcig1p3c003gli04fbqdbfpz	9582906916	Sakshi
cmdcylj0z000ikz04uw89bppr	cmdcylj0r000gkz04rcjnr0uq		2025-07-21 10:24:45.972	2025-07-21 10:24:45.972				cmcig05ch002wli041at1y7x4	9324767979	Shubhra  Sharma
cmdcz2vga000mkw04fn85ei2m	cmdcz2vfw000kkw04i2xus5j3	Ryan International, Sec-11, Rohini	2025-07-21 10:38:15.226	2025-07-21 10:41:22.844				cmcifyfbb002cli04ye9hggq3	9810458650	Minakshi Rana
cmdczkdsm000bjn04ffv4ccjd	cmdczkds70009jn04stvs4o1u	Amity International	2025-07-21 10:51:52.151	2025-07-21 10:51:52.151		9811163894	Sandeep Aggarwal	cmcifkzcg0000li04f61a2s0n	8383963951	Sakshi aggarwal
cmdczho14000tkw04tofv799e	cmdczho0q000rkw04d7bvi1fx	Cambridge International	2025-07-21 10:49:45.449	2025-07-21 10:57:26.233		9811700923	Tanuj Aggarwal	cmcifkzcg0000li04f61a2s0n	9999629971	Monika Aggarwal
cmdd03a7v0006i204cstx5eop	cmdd03a7l0004i20431fils80	Cambridge International	2025-07-21 11:06:33.979	2025-07-21 11:07:14.242		9811700923	Tanuj Aggarwal	cmd8bms2e0000l204csd0ayvc	9999629971	Monika Aggarwal
cmdcydgq40007kz045v3lkt6q	cmdcydgpp0005kz04utdz1j9q	springdales School Dubai	2025-07-21 10:18:29.74	2025-07-22 03:24:58.319	+971558742671			cmcifvt4c001bli04vlw7i0v6	+971 509405561	Richa Prashar
cmdczeybn0006jn04so3abvlx	cmdczeyb60004jn04xdxryipi	Gyanshree	2025-07-21 10:47:38.82	2025-07-21 11:46:22.669				cmcifyfbb002cli04ye9hggq3	9891840063	Tanika Gupta
cmdd1rg990002jp04g5lbww6s	cmdd1rg8f0000jp048mmof3ym	Manav Rachna	2025-07-21 11:53:21.166	2025-07-21 11:53:21.166				cmcifvt4c001bli04vlw7i0v6	9311603350	shweta Aggarwal
cmdd1vcxh0002l7041iayv0lh	cmdd1vcx00000l704o7l77yhe		2025-07-21 11:56:23.477	2025-07-21 11:56:23.477				cmcig0zjw0039li04s2q3gqsa	+85255900973	Archana
cmdd2dvb9000al704fbw6t4pt	cmdd2dva20008l704hivdf7t3		2025-07-21 12:10:47.109	2025-07-21 12:10:47.109				cmdd23tzx0009jp04ecy24g4c	9717778381	Divya sharma
cmde8orzh0002jo04xyzr4eby	cmde8orxw0000jo04oz7zk4d7	Indian School Al Ghubra	2025-07-22 07:54:59.885	2025-07-27 06:16:27.803	+96895789548			cmddylpap0001ju059suph7d2	+96895789548	Zeena
cmdczzve40002i204gm5aks3q	cmdczzvd60000i204fl2nrkk7	National Public School Bangalore	2025-07-21 11:03:54.796	2025-07-21 12:34:11.316				cmcifkzcg0000li04f61a2s0n	9916115157	Manisha Vaidya
cmdcz0h8z0002jn04hafvuytc	cmdcz0h8i0000jn047sofdqeq	Chirec International School	2025-07-21 10:36:23.508	2025-07-21 12:39:05.78		9392467557	Minu di	cmcifzhsj002pli04bkp85bal	934808160	Puja aggarwal
cmdcyg870000dkz04wviy0hbx	cmdcyg86l000bkz04lovq0ufa	Heritage Xperimental Learning School	2025-07-21 10:20:38.653	2025-07-27 06:26:30.314				cmcig1p3c003gli04fbqdbfpz	9953764059	Deepdhikha Arora
cmdcw7wkb0002l404h6bnesmw	cmdcw7wji0000l4045rgz51m1	DPS	2025-07-21 09:18:11.099	2025-07-21 12:57:49.931	+919870367348			cmd8bms2e0000l204csd0ayvc		
cmdd07lpf0002l504n75p4shq	cmdd07lp00000l5043aq05pg6	Vista del lago high school Foisom CA	2025-07-21 11:09:55.492	2025-07-22 02:42:36.242	+1(203)4461914			cmd8bnwtl0009l204a02d91sx	+1(203)5009929	Priti Soin
cmdd097aa000di204ydmt0xpr	cmdd0979u000bi204oropp13s	Vista del lago high school Foisom CA	2025-07-21 11:11:10.114	2025-07-22 02:52:35.704				cmd8bnwtl0009l204a02d91sx	+1(916)6943387	Jaya
cmde32wsc0002l4048ovre75c	cmde32wrk0000l4049xmjjjur	DPS	2025-07-22 05:18:01.596	2025-07-22 06:49:34.731	+61424696191	+61424696191	Shatadip Mishra	cmdd23tzx0009jp04ecy24g4c	+61426984691	Anjali Mishra
cmdd0dzeb0005l504eny8zj8y	cmdd0dzdw0003l504tsvtzglo	OWIS Singapore	2025-07-21 11:14:53.171	2025-07-22 03:13:23.947		+65 91692845	Amit aggarwal	cmddylpap0001ju059suph7d2		
cmdd1zobs0006l704mmumsara	cmdd1zobd0004l704bsghiun5	GIIS SINGAPORE	2025-07-21 11:59:44.872	2025-07-22 03:15:42.269		9973208303	Ashish anand	cmcij6t7x0000jv04oafg39yo	+6581416451	Anamika
cmdcyu8jw000dkw04gwgd9bo7	cmdcyu8j0000bkw04dwwycb29	G.D.Goenka Public School	2025-07-21 10:31:32.3	2025-07-22 03:20:12.796		9599710138	Sanjay Kumar sharma	cmcig05ch002wli041at1y7x4	9990037179	sweta Sharma
cmde6jcnk0009ju04a4w2iq99	cmde6jcn10007ju04n4gxrcc2		2025-07-22 06:54:47.504	2025-07-22 06:54:47.504	+447958712161	+447958712161	Alok Singh	cmde6fi4o0000ju04fxwzhajm	+447943789090	Namita
cmde6txql000cl4048ztrbtqi	cmde6txq7000al404wfjs7npc	Chirec International School	2025-07-22 07:03:01.39	2025-07-22 07:13:19.733	9885433555			cmd8bms2e0000l204csd0ayvc	9885433555	Sridevi Ready
cmdd22c4m0007jp0457xxay67	cmdd22c450005jp040a9gbem8	Riverwalk Primary School	2025-07-21 12:01:49.03	2025-07-22 07:18:49.152	+61469959151			cmde7c47w000bl5040kp509km	+61469959151	Vijaya 
cmde6rl9p000eju04bra1bfyx	cmde6rl95000cju04a5nwqoka	Trivandrum International School	2025-07-22 07:01:11.918	2025-07-22 07:12:05.186	9538243331			cmde74b37000ol4046xtws94c	9538243331	Radha Devi
cmde7j5ig0002lb04qzi3ft0e	cmde7j5hz0000lb04t5s715da	Our Lady And St.Francis	2025-07-22 07:22:37.864	2025-07-22 07:26:39.428	+447503319670	+447435754502	Manish Chirania	cmde7nhcd0006lb04olqvkzpl	+447503319670	Neha Chirania
cmde7ujir000elb04kkjbi866	cmde7ujib000clb04sdyplgb6		2025-07-22 07:31:29.235	2025-07-22 07:31:29.235				cmcig05ch002wli041at1y7x4	+971585724886	Ziii
cmde715hp000kl404o3xy93bn	cmde715hb000il404mtx14ycg	OIS	2025-07-22 07:08:38.029	2025-07-23 09:29:27		9833352130	Jyoti Parkash Nayak	cmcifzhsj002pli04bkp85bal		
cmcmckzyo0002yeua7b6v5chw	cmcmckzky0000yeuazqolf1z7	GIIS	2025-07-02 19:26:29.136	2025-07-27 04:20:42.657				cmcig05ch002wli041at1y7x4	9871509996	Pooja singhal
cmde68j740002l404zp2e981j	cmde68j6e0000l404dr0d8uuo	Amity International	2025-07-22 06:46:22.768	2025-07-27 06:19:12.852	9560553306			cmcig1p3c003gli04fbqdbfpz	9560553306	Khushboo Gupta
cmdd2gjgi000fl704zv6ltbiy	cmdd2gjg8000dl7041u9q70ga	The Heritage School, Rohini	2025-07-21 12:12:51.715	2025-07-27 06:24:14.284				cmcig05ch002wli041at1y7x4	9810377441	Manisha  Aggarwal
cmde7zy4q000rl5047bqdybhk	cmde7zy4b000pl50450ij7hbm	jAMES mONROEELEMENTRYSCHOOL	2025-07-22 07:35:41.45	2025-07-28 05:54:18.737	+1(848)3912647	+1(646)2207721	Ayas	cmdd23tzx0009jp04ecy24g4c	+1(848)3912647	Mitali
cmde6wntu000gl404xcdb1ybh	cmde6wntm000el404bay5iqdb	Vidya Niketan Bangalore	2025-07-22 07:05:08.514	2025-07-28 05:56:35.133	9900622337	9900622337	Mallesh B.M.M	cmdec1anj000ujl0417vkynw2		
cmd6t6isd0002yezhw8x1o3a8	cmd6t6idu0000yezhutta6n0d	Amity International	2025-07-17 03:06:30.685	2025-07-28 06:01:04.11				cmcij6t7x0000jv04oafg39yo	9910522447	Sarika Verma
cmde8rl2a0002l80488rq9uw5	cmde8rl1u0000l8047kc7e57z	hyderabad	2025-07-22 07:57:10.882	2025-07-22 07:57:10.882				cmcifvt4c001bli04vlw7i0v6	8826677802	Sheetal Bajaj
cmde8x6do000ajo044ybvsfki	cmde8x6d90008jo04obc6u9j4		2025-07-22 08:01:31.789	2025-07-22 08:01:31.789				cmcij6t7x0000jv04oafg39yo	9999085011	Rashmi
cmde914tg0006l804z66cwmwu	cmde914t10004l804wkdubkr3		2025-07-22 08:04:36.388	2025-07-22 08:04:36.388	9441776542	9908376542		cmcig05ch002wli041at1y7x4	9441776542	Bhavya
cmde958g9000ejo04zsn0mm4d	cmde958fu000cjo04gg389gfh		2025-07-22 08:07:47.721	2025-07-22 08:07:47.721		+1(510)5652133	Uday 	cmde7c47w000bl5040kp509km	+1(302)4422547	Suneetha Duddu
cmde9css8000ijo0470112m8b	cmde9csru000gjo04jxhqwnem	MackillopCollege	2025-07-22 08:13:40.665	2025-07-22 08:13:40.665				cmde7b3pl0000l504ghdtuw9z	+61469959151	Vijaya
cmde9io12000mjo04j36plqdl	cmde9io0o000kjo04aw8qolp3		2025-07-22 08:18:14.438	2025-07-22 08:18:14.438				cmd8bp2n1000ol2049nsd1vv3	9582906916	Sakshi
cmdfa9teq000kkz04nr8cuj3t	cmdfa9teb000ikz04922ujsjj		2025-07-23 01:27:07.298	2025-07-23 01:27:07.298		+1(408)6439457	Jaynesh Doshi	cmd8bs78l001gl204nfgteu5a		Apurva Doshi
cmde9g36h000el804wvwr5zev	cmde9g360000cl804mrxlzsjh	GIIS Dubai	2025-07-22 08:16:14.105	2025-07-22 08:30:41.173	+971522275324			cmcij6t7x0000jv04oafg39yo	+971522275324	sharen Joseph
cmdeaejos0002k0043a7ar6wk	cmdeaejnu0000k004007ao45a	Amity International	2025-07-22 08:43:01.804	2025-07-22 08:43:01.804		7042318885	Navneet Kumar	cmcig1p3c003gli04fbqdbfpz	8527123762	Preeti Garg
cmdeb81mk0002jl043hu4xzea	cmdeb81lp0000jl04c5cjpnj9		2025-07-22 09:05:58.076	2025-07-22 09:05:58.076				cmde74b37000ol4046xtws94c	+971585724886	Ziii
cmdebpj08000ajl04sipaqzpt	cmdebpizs0008jl04s0jsufz6		2025-07-22 09:19:33.752	2025-07-22 09:19:33.752				cmcig1p3c003gli04fbqdbfpz	+971525990836	Minakshi
cmdeavyem0007kz04rw87vrda	cmdeavye50005kz04rybdl8cr	The Winchester School	2025-07-22 08:56:34.03	2025-07-22 09:22:41.142		85548348000	Johnson William	cmdebsweh000ejl04l3w02rpz	+971504006225	Nasreen
cmdfalkw00011l504hvrr09za	cmdfalkvm000zl5044cp5qt94		2025-07-23 01:36:16.129	2025-07-23 01:36:16.129				cmdd23tzx0009jp04ecy24g4c	+1(347)8603568	Mya
cmdebf4pz000hkz04nogdtx5g	cmdebf4pk000fkz04jsbd080r	Greenwood high	2025-07-22 09:11:28.679	2025-07-22 09:30:44.044				cmdec1anj000ujl0417vkynw2	9739011213	Rizwana Nazeer
cmdebc7bz000ckz04h7hzrv6m	cmdebc7bl000akz046q6bq89w	DPS, Miyapur, Hyderabad	2025-07-22 09:09:12.096	2025-07-23 00:57:54.112				cmcij6t7x0000jv04oafg39yo	7337556446	Rumki Basak
cmde6na2j0007l404la5s3l5b	cmde6na240005l404sggyjh41	Grms Own Own Indian School	2025-07-22 06:57:50.779	2025-07-23 00:59:47.725	+971563251314			cmcig05ch002wli041at1y7x4	+971 563251314	Nithyamolj
cmde8ume10006jo04pdtaka45	cmde8umdu0004jo04gszu5i7v	HDFC School	2025-07-22 07:59:32.57	2025-07-23 01:01:15.255	9003096077			cmcig05ch002wli041at1y7x4	9003096077	Megha
cmdf9f5j60002l50470zxi8v9	cmdf9f5ik0000l504tao1a0fk	Gyan Bharti School	2025-07-23 01:03:16.674	2025-07-23 01:04:04.346				cmcij8gy8000ljv04cakumw3k		
cmdedavwb0002l504kiveq6rs	cmdedavva0000l504qitlkuy3	springdales School Dubai	2025-07-22 10:04:09.851	2025-07-23 01:06:41.377				cmdebsweh000ejl04l3w02rpz	+971509405561	Richa Parasher
cmdfa29i2000el504wscniksk	cmdfa29hn000cl504w59fb1oj	ELPRO International	2025-07-23 01:21:14.906	2025-07-23 01:41:34.417	8700363341			cmcifkzcg0000li04f61a2s0n	9871196842	Romi Tiku
cmdf9qsqr000bkz04taijmzyg	cmdf9qsqi0009kz04xhllv58f		2025-07-23 01:12:19.971	2025-07-23 01:12:19.971				cmd8btlzq001vl204qxwgq5c5	8464867759	Naga Lakshami Pothuraja
cmdf9xw5z000fkz049txn8gg5	cmdf9xw5k000dkz0411wq23o3		2025-07-23 01:17:51	2025-07-23 01:18:43.007				cmcij6t7x0000jv04oafg39yo	9731678916	Susmita Basak
cmdebn60i000lkz04b487qfyy	cmdebn603000jkz044wgx33kq	emirates Future International Academy	2025-07-22 09:17:43.602	2025-07-23 01:49:39.866				cmcifvt4c001bli04vlw7i0v6	8464867759	Naga Laxmi Puthuraja
cmdf9ti6v000al504zk2f9bac	cmdf9ti6h0008l504l08ydpt0	springdales School Dubai	2025-07-23 01:14:26.263	2025-07-23 09:31:16.507				cmd8bs78l001gl204nfgteu5a	+971558836835	Kirti Singhal
cmdfaebet000xl504l5g6f0ip	cmdfaebef000vl5040vy587pl	Bishop cotton Girls School	2025-07-23 01:30:37.253	2025-07-23 09:41:55.069				cmdfacmsb000kl504motpypzi	9742416607	Vani
cmdfapgdx000skz04657c50w4	cmdfapgdi000qkz047o1i6m4b	Gitanjali Devshala	2025-07-23 01:39:16.917	2025-07-23 09:34:30.511				cmdfrnulj0004l804bv9w7mpd	9885129878	Shilpa
cmdfajktz000okz04hzm64wcj	cmdfajktl000mkz047p2wz4yp	Stoneridge	2025-07-23 01:34:42.743	2025-07-23 09:35:53.914		+1(313)4011514	Vinay Kumar Samudarala	cmdd23tzx0009jp04ecy24g4c	+1(816)2892764	Kavitha
cmdebkq4h0006jl044l46m7fi	cmdebkq420004jl047ktnjtyg	New middle East International School	2025-07-22 09:15:49.697	2025-07-23 09:37:31.82	+966566418786			cmcifvt4c001bli04vlw7i0v6	+966566418786	Divya Shahri
cmdf9oeqv0007kz04ed0q3881	cmdf9oeqf0005kz04vyt0pmza	Riddle elementary School Plano(TX)-75024	2025-07-23 01:10:28.519	2025-07-23 09:40:08.014	+1(425)4999115			cmde7c47w000bl5040kp509km	+1(425)4999115	Neelam Pandey
cmdfa5lnx000il504yckc2jxh	cmdfa5lnp000gl504zdkwbk1z	Cambridge International	2025-07-23 01:23:50.638	2025-07-27 06:00:10.165			Jitender Rana	cmdd23tzx0009jp04ecy24g4c	+971525859172	Khushboo
cmdearqse0002kz04vvplhdyo	cmdearqrh0000kz04hrk7jnle	Khaitan Public School	2025-07-22 08:53:17.534	2025-07-27 06:06:10.336	9873001093			cmcig1p3c003gli04fbqdbfpz	9873001093	Dhanakshee
cmde99riq000al804hbtr8xzb	cmde99ria0008l804uzpmor0d	Lake Carolina	2025-07-22 08:11:19.059	2025-07-27 06:08:08.19	+1(405)7621648	+1(572)2088690	HariPriya	cmdd23tzx0009jp04ecy24g4c	+1(405)7621648	Lakshami Sunkara
cmde7s86f000nl504amooneg8	cmde7s85z000ll504ljhm05yf	JSS International	2025-07-22 07:29:41.223	2025-07-27 06:14:32.914	+971524166768			cmdla98l60004jv04kbzxqz6b	+971524166768	Namrathakande
cmdlax3nn000rjv04py62w30v	cmdlax3mt000pjv04z53eg0he		2025-07-27 06:31:50.724	2025-07-27 07:30:25.547		8217590541	Sourav Dutta	cmcifkzcg0000li04f61a2s0n	8217597308	Amrita Dutta
cmdfb0e370015l504xo3iahn9	cmdfb0e2s0013l5041q9xhzmt	Folsom middle School	2025-07-23 01:47:47.156	2025-07-27 07:45:09.396	+1(203)4466926			cmcifzhsj002pli04bkp85bal	+1(203)5009929	Priti Soin
cmdse4fua0002i9042qxws11h	cmdse4ftb0000i904lbs7rjx8	Amity International	2025-08-01 05:35:55.186	2025-08-01 05:35:55.186		9998804262	Subhash Aggarwal	cmcig1p3c003gli04fbqdbfpz	9717104054	Ritu aggarwal
\.


--
-- Data for Name: StudentEnrolledSubject; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."StudentEnrolledSubject" (id, "studentId", "subjectId", sessions, fee) FROM stdin;
cmdcp1gzn0005yeyp9vr8hxlh	cmdcorlox0002yeypqvne17sb	cmcifrlrp000tli0491ffkm1z	46	9875.99
cmdcy43e20004kz04ijdkxf93	cmdcy43e10002kz04ake9nod3	cmcifnpb50009li04sei1hpj3	8	4000.01
cmdcy43e10003kz04kc5ouejl	cmdcy43e10002kz04ake9nod3	cmcifn2tj0003li04u1b0q2hl	12	4800
cmdcy9dqc0004kw04ec9bnmdl	cmdcy9dqc0002kw04fzbfbm09	cmcifnh7n0006li04di43zjd7	20	10000
cmdcy9dqc0003kw04mp7d18ug	cmdcy9dqc0002kw04fzbfbm09	cmcifn2tj0003li04u1b0q2hl	20	10000
cmdcyitpc000akw04io5u6l52	cmdcyitpc0007kw04gd11iv1o	cmcifnpb50009li04sei1hpj3	8	2000
cmdcyitpc0009kw04nkt7dv65	cmdcyitpc0007kw04gd11iv1o	cmcifnh7n0006li04di43zjd7	12	2000
cmdcyitpc0008kw0441ad5r12	cmdcyitpc0007kw04gd11iv1o	cmcifn2tj0003li04u1b0q2hl	12	2000
cmdcylj0z000kkz04sr5h3mtv	cmdcylj0z000ikz04uw89bppr	cmcifnpb50009li04sei1hpj3	12	2500
cmdcylj0z000jkz0427uhk2os	cmdcylj0z000ikz04uw89bppr	cmcifn2tj0003li04u1b0q2hl	12	2500
cmdcz6w82000qkw04da10toqy	cmdcz2vga000mkw04fn85ei2m	cmcifn2tj0003li04u1b0q2hl	12	3500
cmdcz6w82000pkw04xpkikjm7	cmdcz2vga000mkw04fn85ei2m	cmcifnpb50009li04sei1hpj3	12	3500
cmdczkdsm000cjn04aui654rp	cmdczkdsm000bjn04ffv4ccjd	cmcifn2tj0003li04u1b0q2hl	12	1500
cmdczrjkq0001la04df390f4h	cmdczho14000tkw04tofv799e	cmcifr6fn000nli04tternemu	12	6000
cmdczrjkq0000la04pxaizt55	cmdczho14000tkw04tofv799e	cmcifn2tj0003li04u1b0q2hl	12	2500
cmdd045ah000ai2041vns3ubk	cmdd03a7v0006i204cstx5eop	cmcifr6fn000nli04tternemu	12	6000
cmdd045ah0009i204l94wrseb	cmdd03a7v0006i204cstx5eop	cmcifn2tj0003li04u1b0q2hl	12	3000
cmdd1ihce0001l804ua22odka	cmdczeybn0006jn04so3abvlx	cmcifn2tj0003li04u1b0q2hl	12	3500
cmdd1ihce0000l804uxh5w8cx	cmdczeybn0006jn04so3abvlx	cmcifnpb50009li04sei1hpj3	12	3500
cmdd1rg9a0004jp04zv0iqtid	cmdd1rg990002jp04g5lbww6s	cmcifnpb50009li04sei1hpj3	12	3500
cmdd1rg9a0003jp047axburkz	cmdd1rg990002jp04g5lbww6s	cmcifn2tj0003li04u1b0q2hl	12	3500
cmdd1vcxh0003l704lxrtd8rx	cmdd1vcxh0002l7041iayv0lh	cmcifn2tj0003li04u1b0q2hl	12	4500
cmdd2dvb9000cl704byvzym7n	cmdd2dvb9000al704fbw6t4pt	cmcifnpb50009li04sei1hpj3	8	3200
cmdd2dvb9000bl7047bh9dl7x	cmdd2dvb9000al704fbw6t4pt	cmcifnh7n0006li04di43zjd7	20	6500
cmdd37yt70001l804y4jdy7yz	cmdczzve40002i204gm5aks3q	cmcifn2tj0003li04u1b0q2hl	12	4500
cmdd3ea280002l80406r2zqiz	cmdcz0h8z0002jn04hafvuytc	cmcifn2tj0003li04u1b0q2hl	12	3500
cmdd3n0hm0006l8045l3aywqa	cmdcyxjgp000hkw04en1ekgyh	cmcifnpb50009li04sei1hpj3	12	3500
cmdd3n0hm0005l804gdqoynzr	cmdcyxjgp000hkw04en1ekgyh	cmcifn2tj0003li04u1b0q2hl	12	3000
cmdd42dez0000ye5kpipxn8zr	cmdcw7wkb0002l404h6bnesmw	cmcih8h950000l40435060nod	4	894
cmddxj1as0000jr04lnx66mjy	cmdd07lpf0002l504n75p4shq	cmd7lihb80006l5047r3fbag3	8	8000
cmddxvvuh0002jm04y2rf4z15	cmdd097aa000di204ydmt0xpr	cmd7ljf6f000cl5043a4k8ccp	4	3600
cmddxvvuh0001jm0454pvu16y	cmdd097aa000di204ydmt0xpr	cmd7lj0ta0009l504jvohxbpi	8	7200
cmddxvvuh0000jm04ndfhbhcm	cmdd097aa000di204ydmt0xpr	cmd7lihb80006l5047r3fbag3	8	7200
cmddymn02000eju05p0sg4zpk	cmdd0dzeb0005l504eny8zj8y	cmcifn2tj0003li04u1b0q2hl	8	6400
cmddyplqc000fju057anob8ta	cmdd1zobs0006l704mmumsara	cmcih8h950000l40435060nod	20	7000
cmddyveig000gju05jkpld601	cmdcyu8jw000dkw04gwgd9bo7	cmcifn2tj0003li04u1b0q2hl	12	2500
cmddz1is6000jju05027whekn	cmdcydgq40007kz045v3lkt6q	cmcifn2tj0003li04u1b0q2hl	20	7000
cmddz1is6000iju054n4vg3k4	cmdcydgq40007kz045v3lkt6q	cmcifnpb50009li04sei1hpj3	12	4500
cmddz1is6000hju05n5pzwf9i	cmdcydgq40007kz045v3lkt6q	cmcifnh7n0006li04di43zjd7	20	8000
cmde6cnbm0004l404j2kw792r	cmde32wsc0002l4048ovre75c	cmcifn2tj0003li04u1b0q2hl	8	3500
cmde6jcnk000bju0431u36gv6	cmde6jcnk0009ju04a4w2iq99	cmcifnpb50009li04sei1hpj3	4	3600
cmde6jcnk000aju04gp9eq27d	cmde6jcnk0009ju04a4w2iq99	cmcifnh7n0006li04di43zjd7	8	6800
cmde75lc9000wl40439kp3ahi	cmde6rl9p000eju04bra1bfyx	cmcifnh7n0006li04di43zjd7	10	4000
cmde776uz000xl404lgoq9ty5	cmde6txql000cl4048ztrbtqi	cmcifnh7n0006li04di43zjd7	12	7200
cmde7e91j000kl5049q6yt7ts	cmdd22c4m0007jp0457xxay67	cmcifn2tj0003li04u1b0q2hl	8	3500
cmde7obwr000blb04dhl4dl5i	cmde7j5ig0002lb04qzi3ft0e	cmcifshh20012li04zzqqaxby	8	5500
cmde7ujir000flb04mbd9fskz	cmde7ujir000elb04kkjbi866	cmcifn2tj0003li04u1b0q2hl	12	4000
cmde8rl2a0003l804n73ribmh	cmde8rl2a0002l80488rq9uw5	cmcifnh7n0006li04di43zjd7	16	4500
cmde8x6do000bjo049uuz307t	cmde8x6do000ajo044ybvsfki	cmcifn2tj0003li04u1b0q2hl	12	3000
cmde914tg0007l804f60vdcxe	cmde914tg0006l804z66cwmwu	cmcifn2tj0003li04u1b0q2hl	12	3500
cmde958g9000fjo04mskbtuwd	cmde958g9000ejo04zsn0mm4d	cmcifn2tj0003li04u1b0q2hl	20	7000
cmde9css9000jjo04umouc47u	cmde9css8000ijo0470112m8b	cmcifn2tj0003li04u1b0q2hl	8	8000
cmde9io12000njo047ozfhky8	cmde9io12000mjo04j36plqdl	cmcih8h950000l40435060nod	20	5000
cmde9yo7x000qjo04nqo4wd7l	cmde9g36h000el804wvwr5zev	cmcifn2tj0003li04u1b0q2hl	12	3000
cmdeaejos0003k004gk4cqgwl	cmdeaejos0002k0043a7ar6wk	cmcifnh7n0006li04di43zjd7	12	2500
cmdeb81mk0003jl04ff34yt1j	cmdeb81mk0002jl043hu4xzea	cmcifn2tj0003li04u1b0q2hl	12	4000
cmdebpj08000bjl04tqhevojp	cmdebpj08000ajl04sipaqzpt	cmcih8sou0003l404feix35az	12	4800
cmdebtjlp000sjl041dq5pvj6	cmdeavyem0007kz04rw87vrda	cmcifnpb50009li04sei1hpj3	8	3000
cmdebtjlp000rjl04lph1pi9m	cmdeavyem0007kz04rw87vrda	cmcifn2tj0003li04u1b0q2hl	12	3500
cmdec3w7n0018jl04r5rxv3gr	cmdebf4pz000hkz04nogdtx5g	cmcifnh7n0006li04di43zjd7	12	5000
cmdf988n50001kz04l3vqy6s6	cmdebc7bz000ckz04h7hzrv6m	cmcifn2tj0003li04u1b0q2hl	8	2500
cmdf988n50000kz049r778fbn	cmdebc7bz000ckz04h7hzrv6m	cmcifnpb50009li04sei1hpj3	8	3000
cmdf9aobb0003kz04oah6n94a	cmde6na2j0007l404la5s3l5b	cmcifnh7n0006li04di43zjd7	8	4000
cmdf9aobb0002kz04k7rm5raq	cmde6na2j0007l404la5s3l5b	cmcifqith000hli04ugifo4f3	8	3500
cmdf9cjwa0004kz047fu29c5q	cmde8ume10006jo04pdtaka45	cmcifn2tj0003li04u1b0q2hl	12	3500
cmdf9g6bk0004l504wd9mjx7z	cmdf9f5j60002l50470zxi8v9	cmcifs5vk000zli04d6farvfv	8	1800
cmdf9jjhl0006l5040q5e2bpq	cmdedavwb0002l504kiveq6rs	cmcih8h950000l40435060nod	20	6000
cmdf9qsqr000ckz04aoi0hg6m	cmdf9qsqr000bkz04taijmzyg	cmcifs5vk000zli04d6farvfv	8	1800
cmdf9z0c6000hkz04bk17bjjo	cmdf9xw5z000fkz049txn8gg5	cmcifnh7n0006li04di43zjd7	8	3000
cmdfa9teq000lkz04hxqo9d9i	cmdfa9teq000kkz04nr8cuj3t	cmcifnh7n0006li04di43zjd7	20	8000
cmdfalkw10012l504s8q5rw8z	cmdfalkw00011l504hvrr09za	cmcifnpb50009li04sei1hpj3	8	3500
cmdfasehk000ukz04ppudmeji	cmdfa29i2000el504wscniksk	cmcifrdsn000qli042fbtlv2a	12	6000
cmdfb2t3n0017l504m4z3nyjg	cmdebn60i000lkz04b487qfyy	cmcifnpb50009li04sei1hpj3	12	3500
cmdfri3fd0001l804hx2np0b5	cmde715hp000kl404o3xy93bn	cmcifnh7n0006li04di43zjd7	12	4800
cmdfri3fd0000l804olxgoody	cmde715hp000kl404o3xy93bn	cmcifnpb50009li04sei1hpj3	12	3500
cmdfrkfxk0002l804ybd6te58	cmdf9ti6v000al504zk2f9bac	cmcifs5vk000zli04d6farvfv	8	1800
cmdfrolnr000hl804hxug7sed	cmdfapgdx000skz04657c50w4	cmcifrdsn000qli042fbtlv2a	5	2500
cmdfrqdz5000il804islu4z21	cmdfajktz000okz04hzm64wcj	cmcifnpb50009li04sei1hpj3	8	3500
cmdfrshir000jl804yy4flq26	cmdebkq4h0006jl044l46m7fi	cmcifnpb50009li04sei1hpj3	12	3500
cmdfrvu2v000kl804xtkv0xu6	cmdf9oeqv0007kz04ed0q3881	cmcifs5vk000zli04d6farvfv	8	3000
cmdfry4n8000ll804j2bbw7gy	cmdfaebet000xl504l5g6f0ip	cmcifn2tj0003li04u1b0q2hl	12	3500
cmdl68gma0000l40488sm42y2	cmcmckzyo0002yeua7b6v5chw	cmcifqt5f000kli049l61n4qw	8	2500
cmdl9sd6e0000k10475c7a20j	cmdfa5lnx000il504yckc2jxh	cmcifs5vk000zli04d6farvfv	8	1500
cmdla03360001jv04lpby42x0	cmdearqse0002kz04vvplhdyo	cmcifn2tj0003li04u1b0q2hl	12	2500
cmdla03350000jv04hatadm4w	cmdearqse0002kz04vvplhdyo	cmcifnpb50009li04sei1hpj3	8	2000
cmdla2m180002jv043txhtiwt	cmde99riq000al804hbtr8xzb	cmcifn2tj0003li04u1b0q2hl	8	7000
cmdlaauvt000jjv04gj7xvxzf	cmde7s86f000nl504amooneg8	cmcifshh20012li04zzqqaxby	8	2500
cmdladbj6000kjv04j5a6xr7f	cmde8orzh0002jo04xyzr4eby	cmcifnpb50009li04sei1hpj3	8	3200
cmdlaguxp000ljv04ce5kmewi	cmde68j740002l404zp2e981j	cmcifqt5f000kli049l61n4qw	8	2500
cmdlanbim000mjv04y1xsphpz	cmdd2gjgi000fl704zv6ltbiy	cmcifqt5f000kli049l61n4qw	12	3500
cmdlaq8fq000ojv04nuhxzef4	cmdcyg870000dkz04wviy0hbx	cmcifn2tj0003li04u1b0q2hl	12	2500
cmdlaq8fq000njv040c10ml9r	cmdcyg870000dkz04wviy0hbx	cmcifnpb50009li04sei1hpj3	8	2000
cmdld0fpu000hjy04m2tzlza2	cmdlax3nn000rjv04py62w30v	cmdlczm27000ejy049luw6wqf	12	7200
cmdldjdp00015jy04lichatwq	cmdfb0e370015l504xo3iahn9	cmdldewmh0011jy043i1lyj3k	12	12000
cmdmp0ooj0000l704y7qo9n7b	cmde7zy4q000rl5047bqdybhk	cmcih8sou0003l404feix35az	16	7000
cmdmp3lxl0001l70498itdj3w	cmde6wntu000gl404xcdb1ybh	cmcifnh7n0006li04di43zjd7	12	5500
cmdmp9dj40002l704d98ivh63	cmd6t6isd0002yezhw8x1o3a8	cmcih9muj0009l404hicbfkoh	12	4200
cmdse4fua0005i904tntxzloi	cmdse4fua0002i9042qxws11h	cmcifnpb50009li04sei1hpj3	8	2000
cmdse4fua0004i904xf3sjljh	cmdse4fua0002i9042qxws11h	cmcifnh7n0006li04di43zjd7	12	2500
cmdse4fua0003i904zplbqq63	cmdse4fua0002i9042qxws11h	cmcifn2tj0003li04u1b0q2hl	12	2500
\.


--
-- Data for Name: StudentFee; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."StudentFee" (id, "studentId", month, "totalAmount", outstanding, status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: StudentPayment; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."StudentPayment" (id, "studentFeeId", amount, "paidAt", method, notes) FROM stdin;
\.


--
-- Data for Name: Subject; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Subject" (id, name, description, "createdAt", "updatedAt") FROM stdin;
cmcifn2tj0003li04u1b0q2hl	Maths 		2025-06-30 01:41:00.296	2025-06-30 01:41:00.296
cmcifnh7n0006li04di43zjd7	English 		2025-06-30 01:41:18.947	2025-06-30 01:41:18.947
cmcifnpb50009li04sei1hpj3	Science 		2025-06-30 01:41:29.441	2025-06-30 01:41:29.441
cmcifqith000hli04ugifo4f3	Hindi		2025-06-30 01:43:40.997	2025-06-30 01:43:40.997
cmcifqt5f000kli049l61n4qw	Sanskrit 		2025-06-30 01:43:54.387	2025-06-30 01:43:54.387
cmcifr6fn000nli04tternemu	Physics 		2025-06-30 01:44:11.603	2025-06-30 01:44:11.603
cmcifrdsn000qli042fbtlv2a	Chemistry 		2025-06-30 01:44:21.144	2025-06-30 01:44:21.144
cmcifrlrp000tli0491ffkm1z	Biology 		2025-06-30 01:44:31.477	2025-06-30 01:44:31.477
cmcifrumc000wli04qyv2x162	German 		2025-06-30 01:44:42.949	2025-06-30 01:44:42.949
cmcifshh20012li04zzqqaxby	Mental maths 		2025-06-30 01:45:12.567	2025-06-30 01:45:12.567
cmcifsxjc0015li04vl5zd9q7	Maths Olympiad 		2025-06-30 01:45:33.384	2025-06-30 01:45:33.384
cmciftbdg0018li04n7fpuzny	Vedic Maths 		2025-06-30 01:45:51.316	2025-06-30 01:45:51.316
cmcih8h950000l40435060nod	All subjects		2025-06-30 02:25:38.393	2025-06-30 02:25:38.393
cmcih8sou0003l404feix35az	Maths n Science		2025-06-30 02:25:53.214	2025-06-30 02:25:53.214
cmcih93ai0006l404cu03619k	Maths n english		2025-06-30 02:26:06.954	2025-06-30 02:26:06.954
cmcih9muj0009l404hicbfkoh	Hindi n Sanskrit		2025-06-30 02:26:32.3	2025-06-30 02:26:32.3
cmcifs5vk000zli04d6farvfv	Abacus		2025-06-30 01:44:57.537	2025-07-02 03:41:11.292
cmd7lho750000l504iz361tcd	PSAT MATHS 		2025-07-17 16:19:00.162	2025-07-17 16:19:00.162
cmd7li1lr0003l504k5j9m7h4	PSAT ENGLISH 		2025-07-17 16:19:17.536	2025-07-17 16:19:17.536
cmd7lj0ta0009l504jvohxbpi	SAT MATHS		2025-07-17 16:20:03.166	2025-07-17 16:20:03.166
cmd7ljf6f000cl5043a4k8ccp	SAT English 		2025-07-17 16:20:21.783	2025-07-17 16:20:21.783
cmd7lihb80006l5047r3fbag3	Calculus		2025-07-17 16:19:37.892	2025-07-27 06:58:35.999
cmdlczm27000ejy049luw6wqf	Applied Maths		2025-07-27 07:29:47.119	2025-07-27 07:29:47.119
cmdldewmh0011jy043i1lyj3k	Itegerated Maths-2		2025-07-27 07:41:40.649	2025-07-27 07:41:40.649
\.


--
-- Data for Name: Teacher; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Teacher" (id, "userId", bio, availability, "createdAt", "updatedAt", "phoneNumber", education, qualification) FROM stdin;
cmcifp3n4000eli047rx8as2t	cmcifp3mk000cli04gwnav3xr		{}	2025-06-30 01:42:34.672	2025-06-30 01:42:34.672	9899599036	\N	\N
cmcigko5x0005k104u0besbe5	cmcigko5p0003k1043usnan8y		{}	2025-06-30 02:07:07.606	2025-06-30 02:07:07.606	9711907978	\N	\N
cmcign1yt000ck1049kscmv3u	cmcign1yj000ak104evj8kv8b		{}	2025-06-30 02:08:58.805	2025-06-30 02:08:58.805	8264937201	\N	\N
cmcigofg9000jk104fkxpfquz	cmcigofg0000hk104uvs7ktnc		{}	2025-06-30 02:10:02.937	2025-06-30 02:10:02.937	9918926200	\N	\N
cmd6t78cz0005yezhq1giwsuh	cmd6t77yk0003yezh15qiz4e6		{}	2025-07-17 03:07:03.827	2025-07-17 03:07:03.827	9870367348	\N	\N
cmdfb9lqn001al5046q5cqffb	cmdfb9lq90018l504eglcbtxb		{}	2025-07-23 01:54:56.975	2025-07-23 01:54:56.975	9675776229	\N	\N
cmdfbbffq001jl504cdd1xbix	cmdfbbffi001hl504dpb24gph		{}	2025-07-23 01:56:22.118	2025-07-23 01:56:22.118	9717440770	\N	\N
cmdfbdnvu001ul504673hph06	cmdfbdnvm001sl504frqrprto		{}	2025-07-23 01:58:06.378	2025-07-23 01:58:06.378	9350013790	\N	M.Sc.Chemistry
cmdfbg5po0023l504ivegm049	cmdfbg5p80021l5047ne0boc5		{}	2025-07-23 02:00:02.797	2025-07-23 02:00:02.797	9914402245	\N	\N
cmdfbin9l002gl504jy3a5o0c	cmdfbin9d002el504vfwbdl7w		{}	2025-07-23 02:01:58.857	2025-07-23 02:01:58.857	8950619239	\N	M.Sc.Chemistry, Ph.D
cmdfbkujh002nl504t2eke3cd	cmdfbkuj9002ll5046aly4e3h		{}	2025-07-23 02:03:41.598	2025-07-23 02:03:41.598	9478697972	\N	\N
cmdfbmt8v002wl504089k7b38	cmdfbmt8g002ul504qwdzv056		{}	2025-07-23 02:05:13.231	2025-07-23 02:05:13.231	9911223893	\N	\N
cmdfbozsi0035l5048lqt0evz	cmdfbozs90033l50459hr1lq5		{}	2025-07-23 02:06:55.026	2025-07-23 02:06:55.026	9808807475	\N	\N
cmdfbqrf3003gl504aure6e2s	cmdfbqrev003el504yv2yhhw3		{}	2025-07-23 02:08:17.487	2025-07-23 02:08:17.487	9467947792	\N	\N
cmdfbsmke003ll504taasbbtw	cmdfbsmk7003jl504z7zakrp4	working as TGT Maths in DPS Manali	{}	2025-07-23 02:09:44.511	2025-07-23 02:09:44.511	8219678020	\N	\N
cmdfbwdd1003ql5043ecjikco	cmdfbwdcm003ol5044e6vxtq1	working as TGT Maths in Govt. School of West Bangal	{}	2025-07-23 02:12:39.206	2025-07-23 02:12:39.206	8345015959	\N	\N
cmdfbxsgh003vl5047vqlpz4t	cmdfbxsg9003tl504ybwgetps		{}	2025-07-23 02:13:45.425	2025-07-23 02:13:45.425	9971083433	\N	\N
cmdfbzvqs0040l504rsjt66pf	cmdfbzvqk003yl5048nnneq1n	working as PGT Physics in S.D.Public School P.Pura	{}	2025-07-23 02:15:22.997	2025-07-23 02:15:22.997	9990017564	\N	\N
cmdfc23s90045l5046zhwappw	cmdfc23ru0043l504br1u84w2		{}	2025-07-23 02:17:06.73	2025-07-23 02:17:06.73	8445431633	\N	\N
cmdfc522n004gl5048whk6www	cmdfc5229004el504bawlp0ts		{}	2025-07-23 02:19:24.48	2025-07-23 02:19:24.48	7838023012	\N	\N
cmdfccbu0004ll5049dm195tk	cmdfccbtm004jl50400gr799p		{}	2025-07-23 02:25:03.721	2025-07-23 02:25:03.721	9868909141	\N	\N
cmdfce8g8004wl504hqmk6ozy	cmdfce8g1004ul504ci31wwp2		{}	2025-07-23 02:26:32.649	2025-07-23 02:26:32.649	9868911345	\N	\N
cmdfcggts0057l504ii1qez81	cmdfcggtk0055l50446gqc4rn		{}	2025-07-23 02:28:16.817	2025-07-23 02:28:16.817	8802009228	\N	\N
cmdfcinje005cl5043277keg4	cmdfcinj6005al504nn3cyfja		{}	2025-07-23 02:29:58.826	2025-07-23 02:29:58.826	7007957315	\N	\N
cmdfckjmi005pl504glevzhkd	cmdfckjm3005nl50451zxrs1q		{}	2025-07-23 02:31:27.067	2025-07-23 02:31:27.067	6239696045	\N	\N
cmdfcn4pq0060l504b1ypr9e1	cmdfcn4ph005yl504no8tzxm3		{}	2025-07-23 02:33:27.71	2025-07-23 02:33:27.71	8005522424	\N	\N
cmdld2bx2000kjy047oxna1pg	cmdld2bwj000ijy04hxnbzkw2		{}	2025-07-27 07:31:53.943	2025-07-27 07:31:53.943	9899599036	\N	\N
\.


--
-- Data for Name: TeacherAvailability; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."TeacherAvailability" (id, "teacherId", "dayOfWeek", "startTime", "endTime", "isAvailable", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: TeacherPayout; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."TeacherPayout" (id, "teacherId", month, "totalAmount", status, "paidAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: TeacherSubject; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."TeacherSubject" (id, "teacherId", "subjectId", "createdAt", "updatedAt") FROM stdin;
cmcifp3nn000gli04k4rn1xng	cmcifp3n4000eli047rx8as2t	cmcifn2tj0003li04u1b0q2hl	2025-06-30 01:42:34.692	2025-06-30 01:42:34.692
cmcigko6g0007k104gyw8dye3	cmcigko5x0005k104u0besbe5	cmcifnh7n0006li04di43zjd7	2025-06-30 02:07:07.625	2025-06-30 02:07:07.625
cmcigko6g0009k104gvhg1poe	cmcigko5x0005k104u0besbe5	cmcifn2tj0003li04u1b0q2hl	2025-06-30 02:07:07.625	2025-06-30 02:07:07.625
cmcign1z3000ek104wnxdr7gh	cmcign1yt000ck1049kscmv3u	cmcifnh7n0006li04di43zjd7	2025-06-30 02:08:58.815	2025-06-30 02:08:58.815
cmcign1z3000gk104t8yvip6w	cmcign1yt000ck1049kscmv3u	cmcifn2tj0003li04u1b0q2hl	2025-06-30 02:08:58.815	2025-06-30 02:08:58.815
cmcigofgh000lk1042utr6p13	cmcigofg9000jk104fkxpfquz	cmcifn2tj0003li04u1b0q2hl	2025-06-30 02:10:02.945	2025-06-30 02:10:02.945
cmd6t78qk0007yezhuv9msybj	cmd6t78cz0005yezhq1giwsuh	cmcifnh7n0006li04di43zjd7	2025-07-17 03:07:04.316	2025-07-17 03:07:04.316
cmdfb9lr6001cl504vk2wrutp	cmdfb9lqn001al5046q5cqffb	cmcih8h950000l40435060nod	2025-07-23 01:54:56.994	2025-07-23 01:54:56.994
cmdfb9lr6001el504equz1ugc	cmdfb9lqn001al5046q5cqffb	cmcifn2tj0003li04u1b0q2hl	2025-07-23 01:54:56.994	2025-07-23 01:54:56.994
cmdfb9lr6001gl504u52twf4v	cmdfb9lqn001al5046q5cqffb	cmcifnpb50009li04sei1hpj3	2025-07-23 01:54:56.994	2025-07-23 01:54:56.994
cmdfbbfge001ll50416u5m0sm	cmdfbbffq001jl504cdd1xbix	cmcih8h950000l40435060nod	2025-07-23 01:56:22.142	2025-07-23 01:56:22.142
cmdfbbfge001nl5046z641ka9	cmdfbbffq001jl504cdd1xbix	cmcifnh7n0006li04di43zjd7	2025-07-23 01:56:22.142	2025-07-23 01:56:22.142
cmdfbbfge001pl504w1disxag	cmdfbbffq001jl504cdd1xbix	cmcifnpb50009li04sei1hpj3	2025-07-23 01:56:22.142	2025-07-23 01:56:22.142
cmdfbbfge001rl504qjqgmyes	cmdfbbffq001jl504cdd1xbix	cmcifn2tj0003li04u1b0q2hl	2025-07-23 01:56:22.142	2025-07-23 01:56:22.142
cmdfbdnw8001wl504iulm3q84	cmdfbdnvu001ul504673hph06	cmcih8h950000l40435060nod	2025-07-23 01:58:06.393	2025-07-23 01:58:06.393
cmdfbdnw8001yl504l6j9geqr	cmdfbdnvu001ul504673hph06	cmcifn2tj0003li04u1b0q2hl	2025-07-23 01:58:06.393	2025-07-23 01:58:06.393
cmdfbdnw80020l504b0e1jibm	cmdfbdnvu001ul504673hph06	cmcifnpb50009li04sei1hpj3	2025-07-23 01:58:06.393	2025-07-23 01:58:06.393
cmdfbg5q40025l504x8lj4bw0	cmdfbg5po0023l504ivegm049	cmcih8h950000l40435060nod	2025-07-23 02:00:02.813	2025-07-23 02:00:02.813
cmdfbg5q40027l504mx6ii22r	cmdfbg5po0023l504ivegm049	cmcifn2tj0003li04u1b0q2hl	2025-07-23 02:00:02.813	2025-07-23 02:00:02.813
cmdfbg5q40029l504yf617b98	cmdfbg5po0023l504ivegm049	cmcifshh20012li04zzqqaxby	2025-07-23 02:00:02.813	2025-07-23 02:00:02.813
cmdfbg5q4002bl504l14ou0zt	cmdfbg5po0023l504ivegm049	cmciftbdg0018li04n7fpuzny	2025-07-23 02:00:02.813	2025-07-23 02:00:02.813
cmdfbg5q4002dl504e9xy7ksh	cmdfbg5po0023l504ivegm049	cmcifsxjc0015li04vl5zd9q7	2025-07-23 02:00:02.813	2025-07-23 02:00:02.813
cmdfbin9u002il504oup5s2xj	cmdfbin9l002gl504jy3a5o0c	cmcifrdsn000qli042fbtlv2a	2025-07-23 02:01:58.866	2025-07-23 02:01:58.866
cmdfbin9u002kl504vsnx131w	cmdfbin9l002gl504jy3a5o0c	cmcifnpb50009li04sei1hpj3	2025-07-23 02:01:58.866	2025-07-23 02:01:58.866
cmdfbkujq002pl5041op3zahu	cmdfbkujh002nl504t2eke3cd	cmcih8h950000l40435060nod	2025-07-23 02:03:41.606	2025-07-23 02:03:41.606
cmdfbkujq002rl504wzpcyna9	cmdfbkujh002nl504t2eke3cd	cmcih8sou0003l404feix35az	2025-07-23 02:03:41.606	2025-07-23 02:03:41.606
cmdfbkujq002tl504hc14notu	cmdfbkujh002nl504t2eke3cd	cmcifn2tj0003li04u1b0q2hl	2025-07-23 02:03:41.606	2025-07-23 02:03:41.606
cmdfbmt99002yl504bvn4q37d	cmdfbmt8v002wl504089k7b38	cmcifn2tj0003li04u1b0q2hl	2025-07-23 02:05:13.245	2025-07-23 02:05:13.245
cmdfbmt990030l504900pbobl	cmdfbmt8v002wl504089k7b38	cmcih8sou0003l404feix35az	2025-07-23 02:05:13.245	2025-07-23 02:05:13.245
cmdfbmt990032l504zqrslsjz	cmdfbmt8v002wl504089k7b38	cmcifnpb50009li04sei1hpj3	2025-07-23 02:05:13.245	2025-07-23 02:05:13.245
cmdfbozsp0037l504jyw1sk7m	cmdfbozsi0035l5048lqt0evz	cmcih8h950000l40435060nod	2025-07-23 02:06:55.034	2025-07-23 02:06:55.034
cmdfbozsp0039l504g0cayzi9	cmdfbozsi0035l5048lqt0evz	cmcifnh7n0006li04di43zjd7	2025-07-23 02:06:55.034	2025-07-23 02:06:55.034
cmdfbozsp003bl504mp6gqhkx	cmdfbozsi0035l5048lqt0evz	cmcih93ai0006l404cu03619k	2025-07-23 02:06:55.034	2025-07-23 02:06:55.034
cmdfbozsp003dl5041tmr2ker	cmdfbozsi0035l5048lqt0evz	cmcifn2tj0003li04u1b0q2hl	2025-07-23 02:06:55.034	2025-07-23 02:06:55.034
cmdfbqrfb003il504ga44sl6h	cmdfbqrf3003gl504aure6e2s	cmcifqith000hli04ugifo4f3	2025-07-23 02:08:17.495	2025-07-23 02:08:17.495
cmdfbsmkm003nl504jj2lh0uo	cmdfbsmke003ll504taasbbtw	cmcifn2tj0003li04u1b0q2hl	2025-07-23 02:09:44.518	2025-07-23 02:09:44.518
cmdfbwddz003sl5041ungu5jt	cmdfbwdd1003ql5043ecjikco	cmcifn2tj0003li04u1b0q2hl	2025-07-23 02:12:39.239	2025-07-23 02:12:39.239
cmdfbxsgp003xl504h69ekaq1	cmdfbxsgh003vl5047vqlpz4t	cmcifn2tj0003li04u1b0q2hl	2025-07-23 02:13:45.433	2025-07-23 02:13:45.433
cmdfbzvr00042l504g7rprv4t	cmdfbzvqs0040l504rsjt66pf	cmcifr6fn000nli04tternemu	2025-07-23 02:15:23.004	2025-07-23 02:15:23.004
cmdfc23sq0047l504blmuooxm	cmdfc23s90045l5046zhwappw	cmcih8h950000l40435060nod	2025-07-23 02:17:06.746	2025-07-23 02:17:06.746
cmdfc23sq0049l504f46nuwmg	cmdfc23s90045l5046zhwappw	cmcifn2tj0003li04u1b0q2hl	2025-07-23 02:17:06.746	2025-07-23 02:17:06.746
cmdfc23sq004bl504kyod357o	cmdfc23s90045l5046zhwappw	cmcifsxjc0015li04vl5zd9q7	2025-07-23 02:17:06.746	2025-07-23 02:17:06.746
cmdfc23sq004dl504srl7esdx	cmdfc23s90045l5046zhwappw	cmcifshh20012li04zzqqaxby	2025-07-23 02:17:06.746	2025-07-23 02:17:06.746
cmdfc5232004il504tcmv7at0	cmdfc522n004gl5048whk6www	cmcifs5vk000zli04d6farvfv	2025-07-23 02:19:24.494	2025-07-23 02:19:24.494
cmdfccbue004nl504gwdzzjy6	cmdfccbu0004ll5049dm195tk	cmcih8h950000l40435060nod	2025-07-23 02:25:03.735	2025-07-23 02:25:03.735
cmdfccbue004pl504hpn9s6x2	cmdfccbu0004ll5049dm195tk	cmcifn2tj0003li04u1b0q2hl	2025-07-23 02:25:03.735	2025-07-23 02:25:03.735
cmdfccbue004rl504qhusj045	cmdfccbu0004ll5049dm195tk	cmcifnpb50009li04sei1hpj3	2025-07-23 02:25:03.735	2025-07-23 02:25:03.735
cmdfccbuf004tl5044ef7f9xh	cmdfccbu0004ll5049dm195tk	cmcifrdsn000qli042fbtlv2a	2025-07-23 02:25:03.735	2025-07-23 02:25:03.735
cmdfce8gg004yl50443g95n28	cmdfce8g8004wl504hqmk6ozy	cmcih8h950000l40435060nod	2025-07-23 02:26:32.656	2025-07-23 02:26:32.656
cmdfce8gg0050l5044ioz4dnm	cmdfce8g8004wl504hqmk6ozy	cmcifn2tj0003li04u1b0q2hl	2025-07-23 02:26:32.656	2025-07-23 02:26:32.656
cmdfce8gg0052l5045yso95oq	cmdfce8g8004wl504hqmk6ozy	cmcifnpb50009li04sei1hpj3	2025-07-23 02:26:32.656	2025-07-23 02:26:32.656
cmdfce8gg0054l504rhucj5tv	cmdfce8g8004wl504hqmk6ozy	cmcih8sou0003l404feix35az	2025-07-23 02:26:32.656	2025-07-23 02:26:32.656
cmdfcggu00059l504trjaupkx	cmdfcggts0057l504ii1qez81	cmcifn2tj0003li04u1b0q2hl	2025-07-23 02:28:16.824	2025-07-23 02:28:16.824
cmdfcinjm005el504dvak3363	cmdfcinje005cl5043277keg4	cmcifn2tj0003li04u1b0q2hl	2025-07-23 02:29:58.834	2025-07-23 02:29:58.834
cmdfcinjm005gl5049vr3cwyr	cmdfcinje005cl5043277keg4	cmcih8sou0003l404feix35az	2025-07-23 02:29:58.834	2025-07-23 02:29:58.834
cmdfcinjm005il504652q2ggg	cmdfcinje005cl5043277keg4	cmd7lho750000l504iz361tcd	2025-07-23 02:29:58.834	2025-07-23 02:29:58.834
cmdfcinjm005kl504dn9k0u32	cmdfcinje005cl5043277keg4	cmcifnpb50009li04sei1hpj3	2025-07-23 02:29:58.834	2025-07-23 02:29:58.834
cmdfcinjm005ml504un1rmy3h	cmdfcinje005cl5043277keg4	cmcifr6fn000nli04tternemu	2025-07-23 02:29:58.834	2025-07-23 02:29:58.834
cmdfckjmx005rl504q1vsoafe	cmdfckjmi005pl504glevzhkd	cmcih8h950000l40435060nod	2025-07-23 02:31:27.081	2025-07-23 02:31:27.081
cmdfckjmx005tl50453eefqof	cmdfckjmi005pl504glevzhkd	cmcifn2tj0003li04u1b0q2hl	2025-07-23 02:31:27.081	2025-07-23 02:31:27.081
cmdfckjmx005vl504p51kqrxv	cmdfckjmi005pl504glevzhkd	cmcih8sou0003l404feix35az	2025-07-23 02:31:27.081	2025-07-23 02:31:27.081
cmdfckjmx005xl504ha48msqp	cmdfckjmi005pl504glevzhkd	cmcifnpb50009li04sei1hpj3	2025-07-23 02:31:27.081	2025-07-23 02:31:27.081
cmdfcn4q50062l504wvgplj2s	cmdfcn4pq0060l504b1ypr9e1	cmcifqith000hli04ugifo4f3	2025-07-23 02:33:27.725	2025-07-23 02:33:27.725
cmdfcn4q50064l504c9gxk41e	cmdfcn4pq0060l504b1ypr9e1	cmcih9muj0009l404hicbfkoh	2025-07-23 02:33:27.725	2025-07-23 02:33:27.725
cmdfcn4q50066l5047o303065	cmdfcn4pq0060l504b1ypr9e1	cmcifqt5f000kli049l61n4qw	2025-07-23 02:33:27.725	2025-07-23 02:33:27.725
cmdld2bxk000mjy04i74nub4e	cmdld2bx2000kjy047oxna1pg	cmdlczm27000ejy049luw6wqf	2025-07-27 07:31:53.961	2025-07-27 07:31:53.961
cmdld2bxk000ojy04s11xcs9v	cmdld2bx2000kjy047oxna1pg	cmd7lihb80006l5047r3fbag3	2025-07-27 07:31:53.961	2025-07-27 07:31:53.961
cmdld2bxk000qjy04a1801f71	cmdld2bx2000kjy047oxna1pg	cmd7lho750000l504iz361tcd	2025-07-27 07:31:53.961	2025-07-27 07:31:53.961
cmdld2bxk000sjy04qm17tqyq	cmdld2bx2000kjy047oxna1pg	cmd7lj0ta0009l504jvohxbpi	2025-07-27 07:31:53.961	2025-07-27 07:31:53.961
cmdld2bxk000ujy04a4w6lmke	cmdld2bx2000kjy047oxna1pg	cmcifsxjc0015li04vl5zd9q7	2025-07-27 07:31:53.961	2025-07-27 07:31:53.961
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."User" (id, name, email, password, role, "createdAt", "updatedAt") FROM stdin;
cmcifp3mk000cli04gwnav3xr	Sulender Kumar	sulenderkumar@gmail.com	$2b$10$nndmCI6ugcXifbzSeQ6V/eVpjeqwWWqaCl5HPr524F4wGJ1c2Z64W	TEACHER	2025-06-30 01:42:34.653	2025-06-30 01:42:34.653
cmcigf25k0000lg04iopsaluo	Nithya	nithya@gmail.com	$2b$10$n/Uq30tWwrtt.dmErhaX2OTVY74H0AsT8po3oGdhTFRX5qILbAnmu	STUDENT	2025-06-30 02:02:45.801	2025-06-30 02:02:45.801
cmcigijlc0000k104lx8gtxkw	Hem Kashyap	hemkashyap@gmail.com	$2b$10$v4bZwmOS5E/luW2kaKahuuG405E6tmv0.iaS50GXQuoyik7Jk9KBG	STUDENT	2025-06-30 02:05:28.369	2025-06-30 02:05:28.369
cmcigko5p0003k1043usnan8y	Swati Gupta	swatigupta@gmail.com	$2b$10$CipoH/ldnAlWFoDUw.KSD.HnMCsfY5nxXSjjkLtNNqCrqB6YGOWDW	TEACHER	2025-06-30 02:07:07.598	2025-06-30 02:07:07.598
cmcign1yj000ak104evj8kv8b	Suruchi Gupta	suruchigupta@gmail.com	$2b$10$Z99YuPUdlDRAg.ONsb1LO./G7Kx172ICkrWzQa0YOuqKPIXI.vVmq	TEACHER	2025-06-30 02:08:58.795	2025-06-30 02:08:58.795
cmcigofg0000hk104uvs7ktnc	Roli Singh	rolisingh@gmail.com	$2b$10$bvnNWpIORHvYZmpVDnMAleSpwX9huj3peRMset5WKQDQmHHJ194XW	TEACHER	2025-06-30 02:10:02.929	2025-06-30 02:10:02.929
cmd6t77yk0003yezh15qiz4e6	test teacher 1	testteacher1@gmail.com	$2b$10$/UjcSwE1LlNrzIsl5ipcze0f2tPYMs4c8rhtJBkeEf/mQIRWsNema	TEACHER	2025-07-17 03:07:03.308	2025-07-17 03:07:03.308
cmdd07lp00000l5043aq05pg6	Sidak kochar	drpritisoin1980@gmail.com	$2b$10$9vBAQDLgclloVZfIBt2hH.6wJaJ66ZzDeqE2AsDwJY52Xa.AEBgRq	STUDENT	2025-07-21 11:09:55.476	2025-07-22 02:42:36.242
cmdcorlbc0000yeypaywmapz8	test student 3	teststudent3@gmail.com	$2b$10$esy0qoIUvU3kcqTmRoEtTeYkcbPfaQ04VsGvsN19N0IgjKh5brIzq	STUDENT	2025-07-21 05:49:32.712	2025-07-21 05:57:13.436
cmdcy43da0000kz04eu7j5jkw	Abhi	abhi@gmail.com	$2b$10$FRjUQuu8EwVXPw1HZ1PHJeFCfwW6MKd6e6K33t8QkzAHtVKzIYOXG	STUDENT	2025-07-21 10:11:12.526	2025-07-21 10:11:12.526
cmdcy9dpu0000kw04py24rmm0	Parvasti	parvasti@gmail.com	$2b$10$FUFqjlvkBPxFcexwPOVrGOXWGidK0.uCaqR.JZpdp0CYF2c3X023i	STUDENT	2025-07-21 10:15:19.218	2025-07-21 10:15:19.218
cmdcyitoy0005kw04284ouqb3	Shanaya	shanaya@gmail.com	$2b$10$IRDTduEs19SKHf2cLVpMuO6b0n/L9JwthECe8pgIDle8LuXMgZySm	STUDENT	2025-07-21 10:22:39.826	2025-07-21 10:22:39.826
cmdcylj0r000gkz04rcjnr0uq	Saanvi	saanvi@gmail.com	$2b$10$1Z5g1X77bZlsRCOzC24GTuCfKO0/kWKqyjJ/v/nmdpMZpyP1Sz5DK	STUDENT	2025-07-21 10:24:45.963	2025-07-21 10:24:45.963
cmdcz2vfw000kkw04i2xus5j3	VarinSehrawat	varinsehrawat2012@gmail.com	$2b$10$aq71pOr7vAOJK8OFaTHknu8/K2vM8eWXUORBqu/NJ2BxLq6azsMFC	STUDENT	2025-07-21 10:38:15.212	2025-07-21 10:41:22.844
cmdczkds70009jn04stvs4o1u	Aakriti aggarwal	aakritiaggarwal@gmail.com	$2b$10$YPSbqodPclb6Cu8uYG38U.h9O1gmgBUXeRQiS4q1Yeb9xAj79a6V.	STUDENT	2025-07-21 10:51:52.136	2025-07-21 10:51:52.136
cmdczho0q000rkw04d7bvi1fx	Manya Aggarwal	manyaaggarwal@gmail.com	$2b$10$8LIRBWRgXAEpfvz56sml4.Z8AFmE6YLDFco2t62p20idwn9e.ySvO	STUDENT	2025-07-21 10:49:45.434	2025-07-21 10:57:26.233
cmdd03a7l0004i20431fils80	Arnav Aggarwal	arnavaggarwal@gmail.com	$2b$10$tXEEJlOlmHDOi38ciLDN9e5vxJ5dttjvUDNjOObeFs.kuScMBcQBa	STUDENT	2025-07-21 11:06:33.969	2025-07-21 11:07:14.242
cmdczeyb60004jn04xdxryipi	Paavni	tanikasharadgupta@gmail.com	$2b$10$C7YNvOESSrJLj/YVKNvqi.6/2aC/FuIxsodIJY5H8LwZBUbjX7sFu	STUDENT	2025-07-21 10:47:38.802	2025-07-21 11:46:22.669
cmdd1rg8f0000jp048mmof3ym	Parv	parv@gmail.com	$2b$10$Bo5pqhawL67WxRn4bJev2e66QI7U5tv8wznQHslPJg0DSaQqfdhmu	STUDENT	2025-07-21 11:53:21.135	2025-07-21 11:53:21.135
cmdd1vcx00000l704o7l77yhe	Sannidhi	sannidhi@gmail.com	$2b$10$Ym6AJWEPFTj/OZ9G9oHYYuk.k1zPJggkeQh0KA1HQRoOi9tgt3zCG	STUDENT	2025-07-21 11:56:23.46	2025-07-21 11:56:23.46
cmdd2dva20008l704hivdf7t3	Viaan	viaan@gmail.com	$2b$10$1xNI8xOp28Ub2j6EximfeeqHMNMzVhH0vuc/u9In8Sm9s1B72k.Yi	STUDENT	2025-07-21 12:10:47.067	2025-07-21 12:10:47.067
cmdczzvd60000i204fl2nrkk7	Shalok	manisha_yv@yahoo.com.sg	$2b$10$q8rWmkp1NcOJqCR2kKF3mubdIK5AK0iVXjc1pCuWdZBBnwwFxp8rC	STUDENT	2025-07-21 11:03:54.762	2025-07-21 12:34:11.316
cmdcz0h8i0000jn047sofdqeq	Yash gupta	pujaag007@gmail.com	$2b$10$mftjhWocO.50.6Bw6AFiauZMiYo4QIh0S.1wGzP4zZut2G5UdsE8m	STUDENT	2025-07-21 10:36:23.491	2025-07-21 12:39:05.78
cmdcyxjgf000fkw04lryrcie2	Medhansh	pipalia.medhansh@gmail.com	$2b$10$ST2jGZ.EynYC.34bqfyYw.Un5/Xxn/czzSYuS2jvBaTG8az0ygA6y	STUDENT	2025-07-21 10:34:06.399	2025-07-21 12:45:53.276
cmdd0979u000bi204oropp13s	Arsiya	arsiyats@gmail.com	$2b$10$V9VaAS8WslbQsOjscey5EOSS/5chO8LVSIkrzpL9Z4y1fcuc6Yy.q	STUDENT	2025-07-21 11:11:10.099	2025-07-22 02:52:35.704
cmdcyg86l000bkz04lovq0ufa	Agastya	deepshikha.arora44@gmail.com	$2b$10$vt.JXuXUOVC8QGk8VcjwneILGTsMztF1Gr7Bb/AKngBDq2TrVvafC	STUDENT	2025-07-21 10:20:38.637	2025-07-27 06:26:30.314
cmdcw7wji0000l4045rgz51m1	test class 1	testclass1@gmail.com	$2b$10$7iHKoXDUq0ozAzJg5iuFWeGtTUc9OxX.7LwrYDf.DrPPjZZmCn1zK	STUDENT	2025-07-21 09:18:11.07	2025-07-21 12:57:49.931
cmdd0dzdw0003l504tsvtzglo	Mihika	amitbiet83@gmail.com	$2b$10$bimAB9GMpAxSlYFzmRn3YeKA2mGeCGuNHFkbHYL16p6kJmGroRVsS	STUDENT	2025-07-21 11:14:53.157	2025-07-22 03:13:23.947
cmdd1zobd0004l704bsghiun5	Ikshita	ikshita.anand@hotmail.com	$2b$10$.icxNi0HKV1Rwz1tPRmBWupI7ZUrdcbqbFxYxW1tX4ucJO1zNVgxC	STUDENT	2025-07-21 11:59:44.857	2025-07-22 03:15:42.269
cmdcyu8j0000bkw04dwwycb29	Suryanshi	sweta2000@gmail.com	$2b$10$orTN0YU3kKWsCRQY1qcOTuZzK2EWcL3S/YtkZ3MI.hRPYv5OsVRey	STUDENT	2025-07-21 10:31:32.268	2025-07-22 03:20:12.796
cmdcydgpp0005kz04utdz1j9q	Aahana	richaparasher2005@yahoo.co.in	$2b$10$XhQAVsl16x9raFxP1CUHPu3FSkoGI/AYEXh66T4rATk.37PCgp0BS	STUDENT	2025-07-21 10:18:29.725	2025-07-22 03:24:58.319
cmde32wrk0000l4049xmjjjur	Aahan	teststudent4@gmail.com	$2b$10$UYzyq3YWMpvpQ2rNhqYvWumtktPCzX3Zd/w92qgtUQDhuvEwnCgpq	STUDENT	2025-07-22 05:18:01.568	2025-07-22 06:49:34.731
cmde6jcn10007ju04n4gxrcc2	Aarush	aarush@gmail.com	$2b$10$77dAbPDcLT9u.D8uP4Gv8eO8tsccLKG/HnhqcoJ.o8CdTE0JI9CRC	STUDENT	2025-07-22 06:54:47.485	2025-07-22 06:54:47.485
cmde6txq7000al404wfjs7npc	Vrajesh	apple_devi@yahoo.co.in	$2b$10$WgAm/6fxbQYZ6KEChguez.5SXlgLl2ZYZtxYdzLU3hwZWTrYnPQ4e	STUDENT	2025-07-22 07:03:01.375	2025-07-22 07:13:19.733
cmde6rl95000cju04a5nwqoka	Pragdeesh Anand	pragdishanand2020@gmail.com	$2b$10$FTq5CsOe7QNbjI9Lr9a.KuJSJbMGv43ommgcU.XWn451B5aMZer5i	STUDENT	2025-07-22 07:01:11.897	2025-07-22 07:12:05.186
cmdd22c450005jp040a9gbem8	Vedica	vedica@gmail.com	$2b$10$fPqWGxlj0AxqGGctsVSJEuUy1Uyn9391c5YYIhjnLxRho9RIIsfXW	STUDENT	2025-07-21 12:01:49.013	2025-07-22 07:18:49.152
cmde7j5hz0000lb04t5s715da	Mivaan	nehachirania1@gmail.com	$2b$10$.yy.AtdgfYi6k683BM7KMed1e2lDPCRFdHk50tMgZQVctthIznW8S	STUDENT	2025-07-22 07:22:37.848	2025-07-22 07:26:39.428
cmde7ujib000clb04sdyplgb6	Fravash	fravash@gmail.com	$2b$10$htuLkO86pnNI0Hh73OBo0Oh3Mt0jgtGZAuxQUUEu09aqxxKiEJUCe	STUDENT	2025-07-22 07:31:29.219	2025-07-22 07:31:29.219
cmde715hb000il404mtx14ycg	Jivin Parkash Nayak	jivin.nayak@gmail.com	$2b$10$SB0dTP5d0mlG5AdBmEnILusYI2nUWIgE3VEkAWKk1firVv7wWF51e	STUDENT	2025-07-22 07:08:38.015	2025-07-23 09:29:27
cmcmckzky0000yeuazqolf1z7	Saanvi	poojasingal244@gmail.com	$2b$10$1mJTw1lhKSNZcYEcSs4ilOvNyZs/uWNMuMN7EbHat49gNGpjl508i	STUDENT	2025-07-02 19:26:28.643	2025-07-27 04:20:42.657
cmde7s85z000ll504ljhm05yf	Nysa Dhunde	namratahakande@gmail.com	$2b$10$.x664T4bYpULqZAx.NdRJOKeSo02K5DgPBxoLKS.CAXcIpr8FO5oa	STUDENT	2025-07-22 07:29:41.208	2025-07-27 06:14:32.914
cmde68j6e0000l404dr0d8uuo	Vanshika	khushbooseth.bit@gmail.com	$2b$10$bGZsPA5zMMaUgYSzqveCWeDGslAMyZRMqLlQosSO8Br3JQYLJ5WAK	STUDENT	2025-07-22 06:46:22.742	2025-07-27 06:19:12.852
cmdd2gjg8000dl7041u9q70ga	Tavishi	manisha.aggarwal2007@gmail.com	$2b$10$zVik31VJQ7UFFsVlmXkMTunLYPBifJQb4nAtEwThQ1DaM1fmTjys.	STUDENT	2025-07-21 12:12:51.705	2025-07-27 06:24:14.284
cmde7zy4b000pl50450ij7hbm	Amitesh	amitesh@gmail.com	$2b$10$AuMYaxPN9LeOHRKp69yTb.7gOR0.rofdvg0CHa5XqrVXMXZLyj.PS	STUDENT	2025-07-22 07:35:41.435	2025-07-28 05:54:18.737
cmde6wntm000el404bay5iqdb	Daivik	bm.mallesh@gmail.com	$2b$10$Hh6G1rRVeqXxPQUf5128BOvo/xEDLSbf3cDQLlahh5bMk.DFY4wbG	STUDENT	2025-07-22 07:05:08.506	2025-07-28 05:56:35.133
cmd6t6idu0000yezhutta6n0d	Vivaan	sarikavrm21@gmail.com	$2b$10$3sBQ9xwc6uiplpApNOu3NuVecVBfR8dIlABZhreoTctQB13O3OdVW	STUDENT	2025-07-17 03:06:30.163	2025-07-28 06:01:04.11
cmde8rl1u0000l8047kc7e57z	Faiza	faiza@gmail.com	$2b$10$3DlAdMEgeIJ9MQ.39xw8NOcdztnZRdaLU7vNSAaoKQ2DAsYgswAD2	STUDENT	2025-07-22 07:57:10.866	2025-07-22 07:57:10.866
cmde8x6d90008jo04obc6u9j4	Kevin	kevin@gmail.com	$2b$10$.bMNhluYczspNSW6TfOAI.JoRWDr82/pWwpjDACXnRtNhBojnHARq	STUDENT	2025-07-22 08:01:31.773	2025-07-22 08:01:31.773
cmde914t10004l804wkdubkr3	Sanjana	sanjana@gmail.com	$2b$10$gptx5fNMP9uJyJ3zze9Y/.3D.Z9DE8yrqVQ8PmdYlYx2ZRjmGPkfK	STUDENT	2025-07-22 08:04:36.373	2025-07-22 08:04:36.373
cmde958fu000cjo04gg389gfh	Sarithya	sarithya@gmail.com	$2b$10$zSs5/vhbNXSsns8635jZ2egr7HrfhQcaaDWXz/0DTU2MExzdcnCgK	STUDENT	2025-07-22 08:07:47.707	2025-07-22 08:07:47.707
cmde9csru000gjo04jxhqwnem	Lakshania	lakshania@gmail.com	$2b$10$lHYvNWhID/l8/i1HkCxQ1uZ6QEIPsRF6mSGzwmdz2738uERpwd4tG	STUDENT	2025-07-22 08:13:40.651	2025-07-22 08:13:40.651
cmde9io0o000kjo04aw8qolp3	Shiven	shiven@gmail.com	$2b$10$n7/U68Hny6sdCU7rjw7ANO1nEhazdZi9fieMqBGM5JXwKlhTnDOtq	STUDENT	2025-07-22 08:18:14.425	2025-07-22 08:18:14.425
cmde9g360000cl804mrxlzsjh	Sameirra	sharenjoseph1@gmail.com	$2b$10$XHfq2rP9Dl34inX38ycdN.pMROGPCSRu9rJWoVXiDObeB98UbzSc2	STUDENT	2025-07-22 08:16:14.089	2025-07-22 08:30:41.173
cmdeaejnu0000k004007ao45a	Shivansh Aggarwal	shivanshaggarwal@gmail.com	$2b$10$tYxsZFotFD7N74iJ2EPQFO.VWSomlb1HXjzYv5A6CI8CvL8O24FZK	STUDENT	2025-07-22 08:43:01.771	2025-07-22 08:43:01.771
cmdeb81lp0000jl04c5cjpnj9	Jenaisha	jenaisha@gmail.com	$2b$10$chLFZMWzTdVZfTXqJdrcLOmAYM8zsERaDre3wzHW2O2UqILXxpjey	STUDENT	2025-07-22 09:05:58.045	2025-07-22 09:05:58.045
cmdebpizs0008jl04s0jsufz6	Jaagvi	jaagvi@gmail.com	$2b$10$LUfeiko/IeVMUm5EjexSYeWGkwq04KyH0P54D1/J7ZPVJvyceb6.C	STUDENT	2025-07-22 09:19:33.737	2025-07-22 09:19:33.737
cmdeavye50005kz04rybdl8cr	Liam	liam@gmail.com	$2b$10$EG7gnPr77Ad0N7CQuq6o..7SVoHsc6iCJK9BQfVdHV2TNO3N4TfKe	STUDENT	2025-07-22 08:56:34.014	2025-07-22 09:22:41.142
cmdfalkvm000zl5044cp5qt94	Jackson	jackson@gmail.com	$2b$10$kN7vOtE/r5dySirxRGnYB.Dh1ydsELB9Y1zBHHCSrxIFF5dKGt3iy	STUDENT	2025-07-23 01:36:16.114	2025-07-23 01:36:16.114
cmdebf4pk000fkz04jsbd080r	Sarah	sweetrizwana@gmail.com	$2b$10$SOYu1R.rFeHH2ZvMbFHwjeax9lhkYMfWMj7JHZNXY6J.GbuZLHOf.	STUDENT	2025-07-22 09:11:28.664	2025-07-22 09:30:44.044
cmdebc7bl000akz046q6bq89w	Utsho Saha	utshosaha@gmail.com	$2b$10$F0OU8UOylySrZMNtavaA7ODX/82m/9q3w317xvHJ4kYbgokmQ36O6	STUDENT	2025-07-22 09:09:12.081	2025-07-23 00:57:54.112
cmde6na240005l404sggyjh41	Arundhati	nithyamolj@gmail.com	$2b$10$S3U1wOnOADMTRnxsjkr0X.y8lSEWs/LgpihD8RXPf9GRRRLGJ./32	STUDENT	2025-07-22 06:57:50.765	2025-07-23 00:59:47.725
cmde8umdu0004jo04gszu5i7v	Navya	desikids16@gmail.com	$2b$10$qAN4mTCqhqFXYmCGs00ZkOVcgOznXPXvdOcdCyjDgareLiVC759oO	STUDENT	2025-07-22 07:59:32.562	2025-07-23 01:01:15.255
cmdf9f5ik0000l504tao1a0fk	Anika Garg	lampritikagarg@gmail.com	$2b$10$6gMOARG3YDdWiKoeeQxh3uuHuRbVol.hKC1fT/nQekpEkhxN/kob.	STUDENT	2025-07-23 01:03:16.652	2025-07-23 01:04:04.346
cmdedavva0000l504qitlkuy3	Ayra Parasher	ayraparasher2005@yahoo.co.in	$2b$10$/hri07/8B.izpQjJXSTYWeN/qEGDMEkhyPat5AozFHPazTKanuAX.	STUDENT	2025-07-22 10:04:09.814	2025-07-23 01:06:41.377
cmdf9qsqi0009kz04xhllv58f	Hari Kirit	harikirit@gmail.com	$2b$10$OuxeJh7.PfhOtCRF9I2n/udztzk1X.UVutqUocBFc1g.0hB22POBK	STUDENT	2025-07-23 01:12:19.963	2025-07-23 01:12:19.963
cmdf9xw5k000dkz0411wq23o3	Sunishtha Nandy	sunishthanandy@gmail.com	$2b$10$r/cMMNRwsnxeoBT03Xir5eBYn0MhxCb/mNnlJ0.d3om1wHl/PXSTy	STUDENT	2025-07-23 01:17:50.985	2025-07-23 01:18:43.007
cmdfa9teb000ikz04922ujsjj	Shomit	shomit@gmail.com	$2b$10$RA/AQDPLPfJRMJEGS92Jv.jYaBNvx90YupnHCdQVr8rnchrKgB55O	STUDENT	2025-07-23 01:27:07.283	2025-07-23 01:27:07.283
cmdfa29hn000cl504w59fb1oj	Tisha	tikuromi@gmail.com	$2b$10$R7yvvHhVxbr0aOWQslTuTu/3CbduVnNqe3onKqejYg3IjL9gVSx16	STUDENT	2025-07-23 01:21:14.892	2025-07-23 01:41:34.417
cmdebn603000jkz044wgx33kq	Teertha	nagalakshmi.vamsi@gmail.com	$2b$10$XXsQs7Sj9EWRe8FimmEzseYr/M3aCI1ZX1Urtlb3Gl65Y6U2yxbza	STUDENT	2025-07-22 09:17:43.587	2025-07-23 01:49:39.866
cmdfb9lq90018l504eglcbtxb	Iteeka Garg	iteekagarg@gmail.com	$2b$10$/rJ5uCG/80mycGytjjdLG.bEo5GG3Y1OnC1auCWnq.hpbB38YNTq2	TEACHER	2025-07-23 01:54:56.962	2025-07-23 01:54:56.962
cmdfbbffi001hl504dpb24gph	Geeta Nanda	geetananda@gmail.com	$2b$10$S8wEAi4wdTFRelcKArvnTeUqHYVGQ3K/Hvjqnk/fuJhp6YDZY5Wji	TEACHER	2025-07-23 01:56:22.11	2025-07-23 01:56:22.11
cmdfbdnvm001sl504frqrprto	Muskan Kuchal	muskankuchal@gmail.com	$2b$10$sGL0juwu9zTcSoe0UUJB0eruc.bFDCZtqB76DZSAEFnnf2jS9ko0i	TEACHER	2025-07-23 01:58:06.37	2025-07-23 01:58:06.37
cmdfbg5p80021l5047ne0boc5	Mamta Arora	mamtaarora@gmail.com	$2b$10$O4I3Xnn/LOio0CyNFItyCujS9Y9c3rgc1Y7JYf/FeaAalzJ4lHboK	TEACHER	2025-07-23 02:00:02.781	2025-07-23 02:00:02.781
cmdfbin9d002el504vfwbdl7w	Navneet Kaur	navneetkaur@gmail.com	$2b$10$GNB50qboidkP8ug16aRmYOgE9189K2xv7HUX3P4teMHz7uJwkkyuy	TEACHER	2025-07-23 02:01:58.849	2025-07-23 02:01:58.849
cmdfbkuj9002ll5046aly4e3h	Anupama Rai	anupamarai@gmail.com	$2b$10$lmq8xtw0jEw3TgWP6TFW7eu1qGSTiwSI4Xlq.V8tCI1EFq2dz60TC	TEACHER	2025-07-23 02:03:41.589	2025-07-23 02:03:41.589
cmdfbmt8g002ul504qwdzv056	Namita jain	namitajain@gmail.com	$2b$10$6or8zYVwf3oXKA730Gvb0.nslO4kmz92bQTEXrYxxmc358hG7PSXG	TEACHER	2025-07-23 02:05:13.217	2025-07-23 02:05:13.217
cmdfbozs90033l50459hr1lq5	Ritanjali	ritanjali@gmail.com	$2b$10$Dl.Uy1Zyde00hkym2A/QnO4bzUFA7EteblFXxXZ8mtg8jxsMHgQjO	TEACHER	2025-07-23 02:06:55.018	2025-07-23 02:06:55.018
cmdfbqrev003el504yv2yhhw3	Sunaina Aggarwal	sunainaaggarwal@gmail.com	$2b$10$ODEiGjWNw8vHyHAaGGYg4esqFiuC9siuCS3GR.MP4N3KcX2M6dYb6	TEACHER	2025-07-23 02:08:17.48	2025-07-23 02:08:17.48
cmdfbsmk7003jl504z7zakrp4	Ritika Garg	ritikagarg@gmail.com	$2b$10$UdDZOq5pTHvqwjp9jFHe3u8tG6y2LFQji4JaYXVFpW4hM9ucajDoG	TEACHER	2025-07-23 02:09:44.503	2025-07-23 02:09:44.503
cmdfbwdcm003ol5044e6vxtq1	Arpita Das Ray	arpitadasray@gmail.com	$2b$10$KQpdHrgTw7cK9p9aVdZGaOLAjGrRBSuWRKkBU8hv5FuuCJpRUKFVa	TEACHER	2025-07-23 02:12:39.191	2025-07-23 02:12:39.191
cmdfbxsg9003tl504ybwgetps	Divya Goel	divyagoel@gmail.com	$2b$10$OjZAiSP8NK4nSdJ7zLyqPe//uyJg85JOWZHKT4PvLxUhHI6DGQ9Lu	TEACHER	2025-07-23 02:13:45.418	2025-07-23 02:13:45.418
cmdfbzvqk003yl5048nnneq1n	Kusum	kusum@gmail.com	$2b$10$Er3aymQdZvCC83q/YPFqAuebZ2SBykkaiBD7iJg1xOI4aEX0g4awy	TEACHER	2025-07-23 02:15:22.989	2025-07-23 02:15:22.989
cmdfapgdi000qkz047o1i6m4b	Deeksha	shilpanaini84@gmail.com	$2b$10$HRfLHFHUSVGRti7Fx3M7iOieG0KqI7Dk6cJuDK5mprnaroXUkJ4De	STUDENT	2025-07-23 01:39:16.902	2025-07-23 09:34:30.511
cmdfajktl000mkz047p2wz4yp	Amogh Sam	amogh@gmail.com	$2b$10$A2eIQiG4tuVlrG.yWRwnNeoUWWJz3003b5DS0V3LodlG8em4nG6jm	STUDENT	2025-07-23 01:34:42.729	2025-07-23 09:35:53.914
cmdebkq420004jl047ktnjtyg	Tanvi	divyajshahri@gmail.com	$2b$10$b8zBZ0L3Y19f/DJqUUomVuPYAjnJwYgwWHvpxAd2QNVUlN2sdgvuW	STUDENT	2025-07-22 09:15:49.683	2025-07-23 09:37:31.82
cmdf9oeqf0005kz04vyt0pmza	Avya Pandey	neelam_pandey@hotmail.com	$2b$10$A88hDAisTTHJ/RNGRGt9meJMF9dr/Oc/PMLOigTbO5f5Iq5PSS40a	STUDENT	2025-07-23 01:10:28.504	2025-07-23 09:40:08.014
cmdfaebef000vl5040vy587pl	Jaanvi	srivanireddy2008@gmail.com	$2b$10$UKI/S2EXGAPq29o6HkgVneIN1MNVq2.gwCy5POKtVRxMsdB7XjTZ2	STUDENT	2025-07-23 01:30:37.24	2025-07-23 09:41:55.069
cmdfa5lnp000gl504zdkwbk1z	Aarksh	aarkshr@gmail.com	$2b$10$bQpgXzFgA/Q6Uzub4jWPn.fnfVh30uvqfxCRmtbsPpWk3UFjwsEci	STUDENT	2025-07-23 01:23:50.629	2025-07-27 06:00:10.165
cmdearqrh0000kz04hrk7jnle	Kavya	dhanakshee.kukreja@gmail.com	$2b$10$zJnqls52aaSUcAuF1W8Ioe1uIa7BOST6uP.MHK.05G9Rhb/7QRfA6	STUDENT	2025-07-22 08:53:17.502	2025-07-27 06:06:10.336
cmde99ria0008l804uzpmor0d	Aarush-Ananya	aarushananya@gmail.com	$2b$10$KjLwmSuRGmK.bUP01GRCsuWzfl7Aeos3ZwvBfHXLiGfCgavfokkQa	STUDENT	2025-07-22 08:11:19.043	2025-07-27 06:08:08.19
cmde8orxw0000jo04oz7zk4d7	Nysa Zeena	zeena_aranha@yahoo.com	$2b$10$tiG7udMHRcqsfl6Oq1xqYukKR97uOUYFfommDPTafQn0o5JP5IXBm	STUDENT	2025-07-22 07:54:59.828	2025-07-27 06:16:27.803
cmdfb0e2s0013l5041q9xhzmt	Rijak Kochar	rijakkochar@gmail.com	$2b$10$ouRxbzYZkH.nD5i0/.tjcOY04mtpbirjdGW4NV.zaqAvNBZJcpS3O	STUDENT	2025-07-23 01:47:47.14	2025-07-27 07:45:09.396
cmdfc23ru0043l504br1u84w2	Vibhuti Kavlani	vibhutikavlani@gmail.com	$2b$10$AVhkDkarwg63T2Dd5gawLud23MKjPqW4DH2/pt/6KM99yYf378hIu	TEACHER	2025-07-23 02:17:06.715	2025-07-23 02:17:06.715
cmdfc5229004el504bawlp0ts	S.Chitra	schitra@gmail.com	$2b$10$14koB0eZ5RExl9f8hW8QLu6PMiRx5je7pTyhoJAndRIkjXvFw/oBG	TEACHER	2025-07-23 02:19:24.465	2025-07-23 02:19:24.465
cmdfccbtm004jl50400gr799p	Charu Rustogi	charurustogi@gmail.com	$2b$10$iri4q2qHLRlGp4XBmlIrleEWhtf1u3KHNqnVPY.iEhQi/Mk9S85We	TEACHER	2025-07-23 02:25:03.707	2025-07-23 02:25:03.707
cmdfce8g1004ul504ci31wwp2	Vandana Ankit	vandanaankit@gmail.com	$2b$10$quGUaePitit5UHCuIms9tu1cG6NXmkyI4cUI0Pma6WD9unjMPKL5a	TEACHER	2025-07-23 02:26:32.641	2025-07-23 02:26:32.641
cmdfcggtk0055l50446gqc4rn	Roopinder Kaur	roopinderkaur@gmail.com	$2b$10$97JymXST7/iR6Dt4kYO19euxvS025ET.wjDyh4ef2ZL88rSZ5SUVi	TEACHER	2025-07-23 02:28:16.809	2025-07-23 02:28:16.809
cmdfcinj6005al504nn3cyfja	Payal Jaiswal	payaljaiswal@gmail.com	$2b$10$pTR9nKl9wOFl1woU9eUHqO25wCYlmOPFX6prmZGZCutNBGJ9Ws5A2	TEACHER	2025-07-23 02:29:58.819	2025-07-23 02:29:58.819
cmdfckjm3005nl50451zxrs1q	Palak Gupta	palakgupta@gmail.com	$2b$10$DC2ypGgEAonjKPXOxGB.d.vjywoJg..lJO03XapO.eOx752z73x3y	TEACHER	2025-07-23 02:31:27.052	2025-07-23 02:31:27.052
cmdfcn4ph005yl504no8tzxm3	Rekha Kalra	rekhakalra@gmail.com	$2b$10$RynF4Kmsd1FrxS5/q5RG0.HfIw3CXNZfio3ipBdibqU8GySIv3YKu	TEACHER	2025-07-23 02:33:27.702	2025-07-23 02:33:27.702
cmdf9ti6h0008l504l08ydpt0	Vedansh Singhal	KIRTI14singhal@gmail.com	$2b$10$8G32i/XAdd6YbGjhxxCd8OnX83H.bhCb7SzyVK5d8tTzx5QAUfuj6	STUDENT	2025-07-23 01:14:26.249	2025-07-23 09:31:16.507
cmdlax3mt000pjv04z53eg0he	Armaan Dutta	armaandutta@gmail.com	$2b$10$zl.uoccWtVGXL7iuQg8JvOvX8bssDRJF7XSi6fTUUSuXo2XVr3Ym2	STUDENT	2025-07-27 06:31:50.693	2025-07-27 07:30:25.547
cmdld2bwj000ijy04hxnbzkw2	Sulender	sulender@gmail.com	$2b$10$125BPCbIg7.SVCuKZbQ0zezY7Xs3n8ZjY5Ot9AO9ZiRbPlUgL7Xwy	TEACHER	2025-07-27 07:31:53.923	2025-07-27 07:31:53.923
cmdse4ftb0000i904lbs7rjx8	Ishita	ishita@gmail.com	$2b$10$H42DCseWpxYXTSikkA5EP.O.EVFmWBmKeKm/NCmZ4Admdh/vb1Lyu	STUDENT	2025-08-01 05:35:55.152	2025-08-01 05:35:55.152
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
ba830f51-db79-4a5e-a01f-2e958b74b66e	daf754af72c2a014668fb612889a6005e77250c479e79ae920741e14d1c98e4a	2025-06-29 15:30:48.818959+00	20250529033036_init	\N	\N	2025-06-29 15:30:47.575551+00	1
6b279b20-8ec7-4d77-983a-6113f7cf5759	6217d5305f92c10f9fd9dfa2afbf488153ac25a5830745ac5ad811331f8b62cf	2025-06-29 15:30:50.896328+00	20250529034249_add_activity_model	\N	\N	2025-06-29 15:30:49.660972+00	1
73cfdb03-debd-4f00-9523-b61f8a0a877d	2b3d129395e0cbc06f854adacd7f39b1a346eeb274ee837b753a6543c8dff2ed	2025-06-29 15:30:53.247886+00	20250529034851_add_calendar_and_scheduling	\N	\N	2025-06-29 15:30:51.353038+00	1
88166526-fa4a-4172-869f-ee62e85268e9	671e54364424ecc6cb9768e2acaa5e5df0861f6ed8b9e4ba2c84a9f89345722a	2025-06-29 15:30:55.001198+00	20250529035052_add_calendar_activity_types	\N	\N	2025-06-29 15:30:53.693875+00	1
fd47e911-474b-4f52-9279-80f915770b9c	4ce0dc3e8a304541a4a88abbcd7a52e8feb258b1656e631942e82f9cd7544ea2	2025-06-29 15:30:56.570226+00	20250604032035_add_mobile_number_to_student	\N	\N	2025-06-29 15:30:55.448916+00	1
84beb123-bf0a-46b0-8429-00ab9628386b	5dc1b60aa73da21ec8d9ffaa904176678d969ce51b1cb60acd899d38f96580be	2025-06-29 15:30:58.196674+00	20250604033239_add_subjects_and_teacher_subjects	\N	\N	2025-06-29 15:30:57.020066+00	1
a6117ad8-c1cd-49b5-8524-d82675fa38e2	d5a990cfe35fdfe6455fcda97ee4d26f976652a2735d87afd6e2a86c94b788c5	2025-06-29 15:32:29.51029+00	20250629153214_add_grade_management	\N	\N	2025-06-29 15:32:28.361912+00	1
cb7cd5ff-c85f-4349-a8e8-a170ce6df45c	1fe1f6104cd19dc703607f2dfd8afb6ad8bc26abf2dc0643d8345c6e257cb2bc	2025-07-01 03:11:07.822694+00	20250701031053_remove_hourlyrate_add_education_qualification	\N	\N	2025-07-01 03:11:06.589204+00	1
c8184e58-617c-4bf4-b33c-d71cb8d2521a	1bbec26b6fcc80dbed97e47a2cacf0d147de9f833516fe3584b6f7284f8132b7	2025-07-17 03:19:58.708231+00	20250717031940_class_multi_students	\N	\N	2025-07-17 03:19:57.304847+00	1
1473bf6c-4a16-4173-9012-f6930fc9cd9f	c76c9a5c5cfe0e278c8be15ea0c9fe6c820314b58c20db49360ed5eefc0aba13	2025-07-20 07:15:56.13936+00	20250720071541_add_student_enrolled_subjects	\N	\N	2025-07-20 07:15:54.95265+00	1
6a032d04-9cbf-42e5-8bfb-4090a175eb75	5ef3d8738d96be3f7972e8232408b2ceff7b879276f0cd2eb7be342bbedf57ae	2025-07-21 06:27:42.143568+00	20250721062726_new_fee_model	\N	\N	2025-07-21 06:27:40.831217+00	1
4fcda336-2dfc-49b9-9c7f-fc09a693a09b	2e14b73cc857b9018cf6d973a2f7d4cf49f8605fce561195d95a6777f0f047a6	2025-07-21 09:17:21.638315+00	20250721091706_add_class_fee_field	\N	\N	2025-07-21 09:17:20.352134+00	1
\.


--
-- Name: Activity Activity_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Activity"
    ADD CONSTRAINT "Activity_pkey" PRIMARY KEY (id);


--
-- Name: CalendarEvent CalendarEvent_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."CalendarEvent"
    ADD CONSTRAINT "CalendarEvent_pkey" PRIMARY KEY (id);


--
-- Name: ClassStudent ClassStudent_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."ClassStudent"
    ADD CONSTRAINT "ClassStudent_pkey" PRIMARY KEY (id);


--
-- Name: Class Class_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Class"
    ADD CONSTRAINT "Class_pkey" PRIMARY KEY (id);


--
-- Name: DemoClass DemoClass_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."DemoClass"
    ADD CONSTRAINT "DemoClass_pkey" PRIMARY KEY (id);


--
-- Name: GradeSubject GradeSubject_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."GradeSubject"
    ADD CONSTRAINT "GradeSubject_pkey" PRIMARY KEY (id);


--
-- Name: Grade Grade_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Grade"
    ADD CONSTRAINT "Grade_pkey" PRIMARY KEY (id);


--
-- Name: Lead Lead_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Lead"
    ADD CONSTRAINT "Lead_pkey" PRIMARY KEY (id);


--
-- Name: StudentEnrolledSubject StudentEnrolledSubject_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."StudentEnrolledSubject"
    ADD CONSTRAINT "StudentEnrolledSubject_pkey" PRIMARY KEY (id);


--
-- Name: StudentFee StudentFee_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."StudentFee"
    ADD CONSTRAINT "StudentFee_pkey" PRIMARY KEY (id);


--
-- Name: StudentPayment StudentPayment_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."StudentPayment"
    ADD CONSTRAINT "StudentPayment_pkey" PRIMARY KEY (id);


--
-- Name: Student Student_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Student"
    ADD CONSTRAINT "Student_pkey" PRIMARY KEY (id);


--
-- Name: Subject Subject_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Subject"
    ADD CONSTRAINT "Subject_pkey" PRIMARY KEY (id);


--
-- Name: TeacherAvailability TeacherAvailability_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."TeacherAvailability"
    ADD CONSTRAINT "TeacherAvailability_pkey" PRIMARY KEY (id);


--
-- Name: TeacherPayout TeacherPayout_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."TeacherPayout"
    ADD CONSTRAINT "TeacherPayout_pkey" PRIMARY KEY (id);


--
-- Name: TeacherSubject TeacherSubject_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."TeacherSubject"
    ADD CONSTRAINT "TeacherSubject_pkey" PRIMARY KEY (id);


--
-- Name: Teacher Teacher_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Teacher"
    ADD CONSTRAINT "Teacher_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: CalendarEvent_classId_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "CalendarEvent_classId_key" ON public."CalendarEvent" USING btree ("classId");


--
-- Name: ClassStudent_classId_studentId_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "ClassStudent_classId_studentId_key" ON public."ClassStudent" USING btree ("classId", "studentId");


--
-- Name: GradeSubject_gradeId_subjectId_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "GradeSubject_gradeId_subjectId_key" ON public."GradeSubject" USING btree ("gradeId", "subjectId");


--
-- Name: Grade_name_curriculum_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "Grade_name_curriculum_key" ON public."Grade" USING btree (name, curriculum);


--
-- Name: Lead_userId_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "Lead_userId_key" ON public."Lead" USING btree ("userId");


--
-- Name: StudentEnrolledSubject_studentId_subjectId_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "StudentEnrolledSubject_studentId_subjectId_key" ON public."StudentEnrolledSubject" USING btree ("studentId", "subjectId");


--
-- Name: StudentFee_studentId_month_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "StudentFee_studentId_month_key" ON public."StudentFee" USING btree ("studentId", month);


--
-- Name: Student_userId_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "Student_userId_key" ON public."Student" USING btree ("userId");


--
-- Name: Subject_name_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "Subject_name_key" ON public."Subject" USING btree (name);


--
-- Name: TeacherAvailability_teacherId_dayOfWeek_startTime_endTime_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "TeacherAvailability_teacherId_dayOfWeek_startTime_endTime_key" ON public."TeacherAvailability" USING btree ("teacherId", "dayOfWeek", "startTime", "endTime");


--
-- Name: TeacherPayout_teacherId_month_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "TeacherPayout_teacherId_month_key" ON public."TeacherPayout" USING btree ("teacherId", month);


--
-- Name: TeacherSubject_teacherId_subjectId_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "TeacherSubject_teacherId_subjectId_key" ON public."TeacherSubject" USING btree ("teacherId", "subjectId");


--
-- Name: Teacher_userId_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "Teacher_userId_key" ON public."Teacher" USING btree ("userId");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: Activity Activity_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Activity"
    ADD CONSTRAINT "Activity_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: CalendarEvent CalendarEvent_classId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."CalendarEvent"
    ADD CONSTRAINT "CalendarEvent_classId_fkey" FOREIGN KEY ("classId") REFERENCES public."Class"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: CalendarEvent CalendarEvent_teacherId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."CalendarEvent"
    ADD CONSTRAINT "CalendarEvent_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES public."Teacher"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ClassStudent ClassStudent_classId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."ClassStudent"
    ADD CONSTRAINT "ClassStudent_classId_fkey" FOREIGN KEY ("classId") REFERENCES public."Class"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ClassStudent ClassStudent_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."ClassStudent"
    ADD CONSTRAINT "ClassStudent_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public."Student"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Class Class_subjectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Class"
    ADD CONSTRAINT "Class_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES public."Subject"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Class Class_teacherId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Class"
    ADD CONSTRAINT "Class_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES public."Teacher"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: DemoClass DemoClass_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."DemoClass"
    ADD CONSTRAINT "DemoClass_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: DemoClass DemoClass_subjectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."DemoClass"
    ADD CONSTRAINT "DemoClass_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES public."Subject"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: DemoClass DemoClass_teacherId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."DemoClass"
    ADD CONSTRAINT "DemoClass_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES public."Teacher"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: GradeSubject GradeSubject_gradeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."GradeSubject"
    ADD CONSTRAINT "GradeSubject_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES public."Grade"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: GradeSubject GradeSubject_subjectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."GradeSubject"
    ADD CONSTRAINT "GradeSubject_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES public."Subject"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Lead Lead_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Lead"
    ADD CONSTRAINT "Lead_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: StudentEnrolledSubject StudentEnrolledSubject_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."StudentEnrolledSubject"
    ADD CONSTRAINT "StudentEnrolledSubject_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public."Student"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: StudentEnrolledSubject StudentEnrolledSubject_subjectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."StudentEnrolledSubject"
    ADD CONSTRAINT "StudentEnrolledSubject_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES public."Subject"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: StudentFee StudentFee_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."StudentFee"
    ADD CONSTRAINT "StudentFee_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public."Student"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: StudentPayment StudentPayment_studentFeeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."StudentPayment"
    ADD CONSTRAINT "StudentPayment_studentFeeId_fkey" FOREIGN KEY ("studentFeeId") REFERENCES public."StudentFee"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Student Student_gradeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Student"
    ADD CONSTRAINT "Student_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES public."Grade"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Student Student_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Student"
    ADD CONSTRAINT "Student_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: TeacherAvailability TeacherAvailability_teacherId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."TeacherAvailability"
    ADD CONSTRAINT "TeacherAvailability_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES public."Teacher"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: TeacherPayout TeacherPayout_teacherId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."TeacherPayout"
    ADD CONSTRAINT "TeacherPayout_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES public."Teacher"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: TeacherSubject TeacherSubject_subjectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."TeacherSubject"
    ADD CONSTRAINT "TeacherSubject_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES public."Subject"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: TeacherSubject TeacherSubject_teacherId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."TeacherSubject"
    ADD CONSTRAINT "TeacherSubject_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES public."Teacher"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Teacher Teacher_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Teacher"
    ADD CONSTRAINT "Teacher_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: neondb_owner
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

