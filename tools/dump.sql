--
-- PostgreSQL database dump
--

\restrict aq59ys8NaJLQY436UmRIcDFDG44ewYaldi3YIMexjj3iqKqYeZOcZBJF4Zu9O8x

-- Dumped from database version 15.17
-- Dumped by pg_dump version 15.17

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

SET default_table_access_method = heap;

--
-- Name: amenities; Type: TABLE; Schema: public; Owner: p2b_user
--

CREATE TABLE public.amenities (
    id integer NOT NULL,
    name character varying(100) NOT NULL
);


ALTER TABLE public.amenities OWNER TO p2b_user;

--
-- Name: COLUMN amenities.name; Type: COMMENT; Schema: public; Owner: p2b_user
--

COMMENT ON COLUMN public.amenities.name IS 'wifi | pool | parking | kitchen...';


--
-- Name: amenities_id_seq; Type: SEQUENCE; Schema: public; Owner: p2b_user
--

CREATE SEQUENCE public.amenities_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.amenities_id_seq OWNER TO p2b_user;

--
-- Name: amenities_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: p2b_user
--

ALTER SEQUENCE public.amenities_id_seq OWNED BY public.amenities.id;


--
-- Name: availability; Type: TABLE; Schema: public; Owner: p2b_user
--

CREATE TABLE public.availability (
    id integer NOT NULL,
    property_id integer NOT NULL,
    available_date date NOT NULL,
    is_available boolean DEFAULT true
);


ALTER TABLE public.availability OWNER TO p2b_user;

--
-- Name: availability_id_seq; Type: SEQUENCE; Schema: public; Owner: p2b_user
--

CREATE SEQUENCE public.availability_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.availability_id_seq OWNER TO p2b_user;

--
-- Name: availability_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: p2b_user
--

ALTER SEQUENCE public.availability_id_seq OWNED BY public.availability.id;


--
-- Name: bookings; Type: TABLE; Schema: public; Owner: p2b_user
--

CREATE TABLE public.bookings (
    id integer NOT NULL,
    guest_id integer NOT NULL,
    property_id integer NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    total_price numeric(10,2) NOT NULL,
    booking_status character varying(20) DEFAULT 'pending'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.bookings OWNER TO p2b_user;

--
-- Name: COLUMN bookings.booking_status; Type: COMMENT; Schema: public; Owner: p2b_user
--

COMMENT ON COLUMN public.bookings.booking_status IS 'pending | confirmed | cancelled | completed';


--
-- Name: bookings_id_seq; Type: SEQUENCE; Schema: public; Owner: p2b_user
--

CREATE SEQUENCE public.bookings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.bookings_id_seq OWNER TO p2b_user;

--
-- Name: bookings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: p2b_user
--

ALTER SEQUENCE public.bookings_id_seq OWNED BY public.bookings.id;


--
-- Name: messages; Type: TABLE; Schema: public; Owner: p2b_user
--

CREATE TABLE public.messages (
    id integer NOT NULL,
    sender_id integer,
    receiver_id integer,
    property_id integer,
    content text NOT NULL,
    is_read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.messages OWNER TO p2b_user;

--
-- Name: messages_id_seq; Type: SEQUENCE; Schema: public; Owner: p2b_user
--

CREATE SEQUENCE public.messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.messages_id_seq OWNER TO p2b_user;

--
-- Name: messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: p2b_user
--

ALTER SEQUENCE public.messages_id_seq OWNED BY public.messages.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: p2b_user
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    user_id integer,
    title character varying(255),
    content text,
    is_read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.notifications OWNER TO p2b_user;

--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: p2b_user
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.notifications_id_seq OWNER TO p2b_user;

--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: p2b_user
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: payments; Type: TABLE; Schema: public; Owner: p2b_user
--

CREATE TABLE public.payments (
    id integer NOT NULL,
    booking_id integer,
    amount numeric(10,2) NOT NULL,
    payment_status character varying(20),
    payment_method character varying(50),
    transaction_id text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.payments OWNER TO p2b_user;

--
-- Name: COLUMN payments.payment_status; Type: COMMENT; Schema: public; Owner: p2b_user
--

COMMENT ON COLUMN public.payments.payment_status IS 'pending | completed | failed | refunded';


--
-- Name: COLUMN payments.payment_method; Type: COMMENT; Schema: public; Owner: p2b_user
--

COMMENT ON COLUMN public.payments.payment_method IS 'card | paypal | stripe | bank_transfer';


--
-- Name: payments_id_seq; Type: SEQUENCE; Schema: public; Owner: p2b_user
--

CREATE SEQUENCE public.payments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.payments_id_seq OWNER TO p2b_user;

--
-- Name: payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: p2b_user
--

ALTER SEQUENCE public.payments_id_seq OWNED BY public.payments.id;


--
-- Name: properties; Type: TABLE; Schema: public; Owner: p2b_user
--

CREATE TABLE public.properties (
    id integer NOT NULL,
    owner_id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text NOT NULL,
    price_per_night numeric(10,2) NOT NULL,
    property_type character varying(50),
    max_guests integer NOT NULL,
    bedrooms integer DEFAULT 1,
    bathrooms integer DEFAULT 1,
    country character varying(100),
    city character varying(100),
    address text,
    latitude numeric(9,6),
    longitude numeric(9,6),
    status character varying(20) DEFAULT 'active'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.properties OWNER TO p2b_user;

--
-- Name: COLUMN properties.property_type; Type: COMMENT; Schema: public; Owner: p2b_user
--

COMMENT ON COLUMN public.properties.property_type IS 'apartment | house | villa | studio';


--
-- Name: COLUMN properties.status; Type: COMMENT; Schema: public; Owner: p2b_user
--

COMMENT ON COLUMN public.properties.status IS 'active | inactive | pending';


--
-- Name: properties_id_seq; Type: SEQUENCE; Schema: public; Owner: p2b_user
--

CREATE SEQUENCE public.properties_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.properties_id_seq OWNER TO p2b_user;

--
-- Name: properties_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: p2b_user
--

ALTER SEQUENCE public.properties_id_seq OWNED BY public.properties.id;


--
-- Name: property_amenities; Type: TABLE; Schema: public; Owner: p2b_user
--

CREATE TABLE public.property_amenities (
    property_id integer NOT NULL,
    amenity_id integer NOT NULL
);


ALTER TABLE public.property_amenities OWNER TO p2b_user;

--
-- Name: property_images; Type: TABLE; Schema: public; Owner: p2b_user
--

CREATE TABLE public.property_images (
    id integer NOT NULL,
    property_id integer NOT NULL,
    image_url text NOT NULL,
    is_main boolean DEFAULT false
);


ALTER TABLE public.property_images OWNER TO p2b_user;

--
-- Name: property_images_id_seq; Type: SEQUENCE; Schema: public; Owner: p2b_user
--

CREATE SEQUENCE public.property_images_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.property_images_id_seq OWNER TO p2b_user;

--
-- Name: property_images_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: p2b_user
--

ALTER SEQUENCE public.property_images_id_seq OWNED BY public.property_images.id;


--
-- Name: reviews; Type: TABLE; Schema: public; Owner: p2b_user
--

CREATE TABLE public.reviews (
    id integer NOT NULL,
    booking_id integer,
    reviewer_id integer,
    property_id integer,
    rating integer,
    comment text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.reviews OWNER TO p2b_user;

--
-- Name: COLUMN reviews.rating; Type: COMMENT; Schema: public; Owner: p2b_user
--

COMMENT ON COLUMN public.reviews.rating IS 'CHECK rating >= 1 AND rating <= 5';


--
-- Name: reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: p2b_user
--

CREATE SEQUENCE public.reviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.reviews_id_seq OWNER TO p2b_user;

--
-- Name: reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: p2b_user
--

ALTER SEQUENCE public.reviews_id_seq OWNED BY public.reviews.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: p2b_user
--

CREATE TABLE public.users (
    id integer NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    email character varying(255) NOT NULL,
    password_hash text NOT NULL,
    phone_number character varying(20),
    profile_picture text,
    bio text,
    role character varying(20) DEFAULT 'guest'::character varying,
    is_verified boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO p2b_user;

--
-- Name: COLUMN users.role; Type: COMMENT; Schema: public; Owner: p2b_user
--

COMMENT ON COLUMN public.users.role IS 'guest | host | admin';


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: p2b_user
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO p2b_user;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: p2b_user
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: wishlists; Type: TABLE; Schema: public; Owner: p2b_user
--

CREATE TABLE public.wishlists (
    id integer NOT NULL,
    user_id integer,
    property_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.wishlists OWNER TO p2b_user;

--
-- Name: wishlists_id_seq; Type: SEQUENCE; Schema: public; Owner: p2b_user
--

CREATE SEQUENCE public.wishlists_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.wishlists_id_seq OWNER TO p2b_user;

--
-- Name: wishlists_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: p2b_user
--

ALTER SEQUENCE public.wishlists_id_seq OWNED BY public.wishlists.id;


--
-- Name: amenities id; Type: DEFAULT; Schema: public; Owner: p2b_user
--

ALTER TABLE ONLY public.amenities ALTER COLUMN id SET DEFAULT nextval('public.amenities_id_seq'::regclass);


--
-- Name: availability id; Type: DEFAULT; Schema: public; Owner: p2b_user
--

ALTER TABLE ONLY public.availability ALTER COLUMN id SET DEFAULT nextval('public.availability_id_seq'::regclass);


--
-- Name: bookings id; Type: DEFAULT; Schema: public; Owner: p2b_user
--

ALTER TABLE ONLY public.bookings ALTER COLUMN id SET DEFAULT nextval('public.bookings_id_seq'::regclass);


--
-- Name: messages id; Type: DEFAULT; Schema: public; Owner: p2b_user
--

ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: p2b_user
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: payments id; Type: DEFAULT; Schema: public; Owner: p2b_user
--

ALTER TABLE ONLY public.payments ALTER COLUMN id SET DEFAULT nextval('public.payments_id_seq'::regclass);


--
-- Name: properties id; Type: DEFAULT; Schema: public; Owner: p2b_user
--

ALTER TABLE ONLY public.properties ALTER COLUMN id SET DEFAULT nextval('public.properties_id_seq'::regclass);


--
-- Name: property_images id; Type: DEFAULT; Schema: public; Owner: p2b_user
--

ALTER TABLE ONLY public.property_images ALTER COLUMN id SET DEFAULT nextval('public.property_images_id_seq'::regclass);


--
-- Name: reviews id; Type: DEFAULT; Schema: public; Owner: p2b_user
--

ALTER TABLE ONLY public.reviews ALTER COLUMN id SET DEFAULT nextval('public.reviews_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: p2b_user
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: wishlists id; Type: DEFAULT; Schema: public; Owner: p2b_user
--

ALTER TABLE ONLY public.wishlists ALTER COLUMN id SET DEFAULT nextval('public.wishlists_id_seq'::regclass);


--
-- Data for Name: amenities; Type: TABLE DATA; Schema: public; Owner: p2b_user
--

COPY public.amenities (id, name) FROM stdin;
1	WiFi
2	Pool
3	Parking
4	Kitchen
5	Air Conditioning
6	Heating
7	Washer
8	Dryer
9	TV
10	Garden
\.


--
-- Data for Name: availability; Type: TABLE DATA; Schema: public; Owner: p2b_user
--

COPY public.availability (id, property_id, available_date, is_available) FROM stdin;
1	1	2025-05-01	t
2	1	2025-05-02	t
3	1	2025-05-03	f
4	1	2025-05-04	f
5	1	2025-05-05	t
6	1	2025-05-06	t
7	2	2025-05-01	t
8	2	2025-05-02	t
9	2	2025-05-03	t
10	2	2025-05-04	f
11	2	2025-05-05	f
12	2	2025-05-06	t
13	3	2025-05-01	t
14	3	2025-05-02	t
15	3	2025-05-03	t
16	3	2025-05-04	t
17	3	2025-05-05	f
18	3	2025-05-06	f
19	6	2025-05-01	f
20	6	2025-05-02	f
21	6	2025-05-03	t
22	6	2025-05-04	t
23	6	2025-05-05	t
24	6	2025-05-06	t
25	7	2025-05-01	t
26	7	2025-05-02	t
27	7	2025-05-03	t
28	7	2025-05-04	f
29	7	2025-05-05	f
30	7	2025-05-06	t
\.


--
-- Data for Name: bookings; Type: TABLE DATA; Schema: public; Owner: p2b_user
--

COPY public.bookings (id, guest_id, property_id, start_date, end_date, total_price, booking_status, created_at) FROM stdin;
1	6	1	2025-01-10	2025-01-15	425.00	completed	2026-05-13 13:53:20.8113
2	7	2	2025-01-20	2025-01-25	750.00	completed	2026-05-13 13:53:20.8113
3	8	3	2025-02-05	2025-02-10	1600.00	completed	2026-05-13 13:53:20.8113
4	9	4	2025-02-14	2025-02-17	285.00	completed	2026-05-13 13:53:20.8113
5	10	5	2025-03-01	2025-03-04	330.00	completed	2026-05-13 13:53:20.8113
6	6	6	2025-03-15	2025-03-20	375.00	completed	2026-05-13 13:53:20.8113
7	7	7	2025-04-01	2025-04-06	1000.00	confirmed	2026-05-13 13:53:20.8113
8	8	1	2025-04-20	2025-04-23	255.00	confirmed	2026-05-13 13:53:20.8113
9	9	2	2025-05-10	2025-05-15	750.00	pending	2026-05-13 13:53:20.8113
10	10	6	2025-05-20	2025-05-22	150.00	cancelled	2026-05-13 13:53:20.8113
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: p2b_user
--

COPY public.messages (id, sender_id, receiver_id, property_id, content, is_read, created_at) FROM stdin;
1	6	2	1	Hi James! Is the studio available for early check-in on January 10th?	t	2026-05-13 13:53:20.848816
2	2	6	1	Hi Oliver! Yes, early check-in is possible from 11am. See you then!	t	2026-05-13 13:53:20.848816
3	7	3	3	Hello Sophia, can we bring our dog to the villa?	t	2026-05-13 13:53:20.848816
4	3	7	3	Hi Mia! Unfortunately pets are not allowed in the villa. Sorry about that.	t	2026-05-13 13:53:20.848816
5	8	4	5	Hey Lucas, is parking included with the loft rental?	t	2026-05-13 13:53:20.848816
6	4	8	5	Hi Noah! Yes, one parking spot is included. No worries.	t	2026-05-13 13:53:20.848816
7	9	5	7	Hi Emma! Is the garden private or shared with other guests?	f	2026-05-13 13:53:20.848816
8	10	5	6	Hello, does the studio have air conditioning? It is very important for us.	f	2026-05-13 13:53:20.848816
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: p2b_user
--

COPY public.notifications (id, user_id, title, content, is_read, created_at) FROM stdin;
1	6	Booking Confirmed	Your booking at Charming Studio in Montmartre has been confirmed.	t	2026-05-13 13:53:20.857066
2	7	Booking Confirmed	Your booking at Modern Apartment near Eiffel Tower has been confirmed.	t	2026-05-13 13:53:20.857066
3	8	Booking Confirmed	Your booking at Luxury Villa with Pool in Lyon has been confirmed.	t	2026-05-13 13:53:20.857066
4	2	New Booking Received	You have a new booking request for Charming Studio in Montmartre.	t	2026-05-13 13:53:20.857066
5	3	New Booking Received	You have a new booking request for Luxury Villa with Pool in Lyon.	t	2026-05-13 13:53:20.857066
6	9	Booking Pending	Your booking at Modern Apartment near Eiffel Tower is pending approval.	f	2026-05-13 13:53:20.857066
7	10	Booking Cancelled	Your booking at Seaside Studio in Nice has been cancelled.	f	2026-05-13 13:53:20.857066
8	6	New Message	You have a new message from James Carter regarding your upcoming stay.	t	2026-05-13 13:53:20.857066
9	5	New Message	You have a new unread message from a guest about your property.	f	2026-05-13 13:53:20.857066
10	1	New User Registered	A new user has registered on the platform: Ethan Thomas.	t	2026-05-13 13:53:20.857066
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: p2b_user
--

COPY public.payments (id, booking_id, amount, payment_status, payment_method, transaction_id, created_at) FROM stdin;
1	1	425.00	completed	card	txn_001_stripe	2026-05-13 13:53:20.82724
2	2	750.00	completed	paypal	txn_002_paypal	2026-05-13 13:53:20.82724
3	3	1600.00	completed	card	txn_003_stripe	2026-05-13 13:53:20.82724
4	4	285.00	completed	card	txn_004_stripe	2026-05-13 13:53:20.82724
5	5	330.00	completed	bank_transfer	txn_005_bank	2026-05-13 13:53:20.82724
6	6	375.00	completed	card	txn_006_stripe	2026-05-13 13:53:20.82724
7	7	1000.00	completed	card	txn_007_stripe	2026-05-13 13:53:20.82724
8	8	255.00	completed	paypal	txn_008_paypal	2026-05-13 13:53:20.82724
9	9	750.00	pending	card	txn_009_stripe	2026-05-13 13:53:20.82724
10	10	150.00	refunded	card	txn_010_stripe	2026-05-13 13:53:20.82724
\.


--
-- Data for Name: properties; Type: TABLE DATA; Schema: public; Owner: p2b_user
--

COPY public.properties (id, owner_id, title, description, price_per_night, property_type, max_guests, bedrooms, bathrooms, country, city, address, latitude, longitude, status, created_at, updated_at) FROM stdin;
1	2	Charming Studio in Montmartre	A cozy studio in the heart of Montmartre with stunning views.	85.00	studio	2	1	1	France	Paris	12 Rue Lepic, 75018 Paris	48.886490	2.337320	active	2026-05-13 13:53:20.77427	2026-05-13 13:53:20.77427
2	2	Modern Apartment near Eiffel Tower	Bright and spacious apartment just 10 min walk from the Eiffel Tower.	150.00	apartment	4	2	1	France	Paris	5 Avenue de Suffren, 75007 Paris	48.850220	2.301890	active	2026-05-13 13:53:20.77427	2026-05-13 13:53:20.77427
3	3	Luxury Villa with Pool in Lyon	A stunning villa with private pool, perfect for families.	320.00	villa	8	4	3	France	Lyon	14 Chemin des Roses, 69003 Lyon	45.748780	4.847120	active	2026-05-13 13:53:20.77427	2026-05-13 13:53:20.77427
4	3	Cozy Apartment in Vieux-Lyon	Historic district apartment with exposed stone walls and wooden beams.	95.00	apartment	3	1	1	France	Lyon	8 Rue Saint-Jean, 69005 Lyon	45.760110	4.827440	active	2026-05-13 13:53:20.77427	2026-05-13 13:53:20.77427
5	4	Minimalist Loft in Bordeaux	Open-space loft with industrial design, close to the tram.	110.00	apartment	2	1	1	France	Bordeaux	22 Quai des Chartrons, 33000 Bordeaux	44.851090	-0.561210	active	2026-05-13 13:53:20.77427	2026-05-13 13:53:20.77427
6	5	Seaside Studio in Nice	A bright studio steps away from the Promenade des Anglais.	75.00	studio	2	1	1	France	Nice	3 Rue de France, 06000 Nice	43.695920	7.265490	active	2026-05-13 13:53:20.77427	2026-05-13 13:53:20.77427
7	5	Beautiful House with Garden in Nice	Spacious house with a private garden, ideal for families.	200.00	house	6	3	2	France	Nice	17 Boulevard Gambetta, 06000 Nice	43.710340	7.261870	active	2026-05-13 13:53:20.77427	2026-05-13 13:53:20.77427
8	4	Classic House in Bordeaux Countryside	Traditional stone house surrounded by vineyards.	175.00	house	5	3	2	France	Bordeaux	4 Route des Vignes, 33460 Margaux	45.039200	-0.673890	inactive	2026-05-13 13:53:20.77427	2026-05-13 13:53:20.77427
\.


--
-- Data for Name: property_amenities; Type: TABLE DATA; Schema: public; Owner: p2b_user
--

COPY public.property_amenities (property_id, amenity_id) FROM stdin;
1	1
1	4
1	6
1	9
2	1
2	4
2	5
2	6
2	7
2	9
3	1
3	2
3	3
3	4
3	5
3	7
3	8
3	9
3	10
4	1
4	4
4	6
4	9
5	1
5	4
5	5
5	7
5	9
6	1
6	4
6	5
6	9
7	1
7	3
7	4
7	5
7	7
7	8
7	9
7	10
8	1
8	3
8	4
8	6
8	7
8	10
\.


--
-- Data for Name: property_images; Type: TABLE DATA; Schema: public; Owner: p2b_user
--

COPY public.property_images (id, property_id, image_url, is_main) FROM stdin;
1	1	https://images.etnair.com/properties/1/main.jpg	t
2	1	https://images.etnair.com/properties/1/room.jpg	f
3	2	https://images.etnair.com/properties/2/main.jpg	t
4	2	https://images.etnair.com/properties/2/living.jpg	f
5	2	https://images.etnair.com/properties/2/kitchen.jpg	f
6	3	https://images.etnair.com/properties/3/main.jpg	t
7	3	https://images.etnair.com/properties/3/pool.jpg	f
8	4	https://images.etnair.com/properties/4/main.jpg	t
9	5	https://images.etnair.com/properties/5/main.jpg	t
10	6	https://images.etnair.com/properties/6/main.jpg	t
11	7	https://images.etnair.com/properties/7/main.jpg	t
12	7	https://images.etnair.com/properties/7/garden.jpg	f
13	8	https://images.etnair.com/properties/8/main.jpg	t
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: p2b_user
--

COPY public.reviews (id, booking_id, reviewer_id, property_id, rating, comment, created_at) FROM stdin;
1	1	6	1	5	Amazing studio! Perfect location in Montmartre, very clean and cozy. Highly recommend.	2026-05-13 13:53:20.8185
2	2	7	2	4	Great apartment, very close to the Eiffel Tower. A bit noisy at night but overall excellent.	2026-05-13 13:53:20.8185
3	3	8	3	5	The villa is absolutely stunning. The pool was perfect. We will definitely come back!	2026-05-13 13:53:20.8185
4	4	9	4	4	Charming apartment in a historic area. The exposed stone walls were beautiful.	2026-05-13 13:53:20.8185
5	5	10	5	3	Nice loft but smaller than expected. Good location though.	2026-05-13 13:53:20.8185
6	6	6	6	5	Perfect seaside studio. Steps away from the beach, everything we needed.	2026-05-13 13:53:20.8185
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: p2b_user
--

COPY public.users (id, first_name, last_name, email, password_hash, phone_number, profile_picture, bio, role, is_verified, created_at, updated_at) FROM stdin;
1	Admin	ETNAir	admin@etnair.com	$2b$10$hashedpassword001	+33600000001	\N	Platform administrator.	admin	t	2026-05-13 13:53:20.763272	2026-05-13 13:53:20.763272
2	James	Carter	james.carter@email.com	$2b$10$hashedpassword002	+33600000002	\N	Passionate traveler and host. I love sharing my spaces.	host	t	2026-05-13 13:53:20.763272	2026-05-13 13:53:20.763272
3	Sophia	Martin	sophia.martin@email.com	$2b$10$hashedpassword003	+33600000003	\N	Superhost with 3 properties in Paris and Lyon.	host	t	2026-05-13 13:53:20.763272	2026-05-13 13:53:20.763272
4	Lucas	Brown	lucas.brown@email.com	$2b$10$hashedpassword004	+33600000004	\N	I rent out my apartment when traveling.	host	t	2026-05-13 13:53:20.763272	2026-05-13 13:53:20.763272
5	Emma	Wilson	emma.wilson@email.com	$2b$10$hashedpassword005	+33600000005	\N	Host based in Nice, offering cozy seaside apartments.	host	t	2026-05-13 13:53:20.763272	2026-05-13 13:53:20.763272
6	Oliver	Davis	oliver.davis@email.com	$2b$10$hashedpassword006	+33600000006	\N	Frequent traveler, love discovering new cities.	guest	t	2026-05-13 13:53:20.763272	2026-05-13 13:53:20.763272
7	Mia	Johnson	mia.johnson@email.com	$2b$10$hashedpassword007	+33600000007	\N	Explorer and food lover.	guest	t	2026-05-13 13:53:20.763272	2026-05-13 13:53:20.763272
8	Noah	Taylor	noah.taylor@email.com	$2b$10$hashedpassword008	+33600000008	\N	Digital nomad, always on the move.	guest	t	2026-05-13 13:53:20.763272	2026-05-13 13:53:20.763272
9	Ava	Anderson	ava.anderson@email.com	$2b$10$hashedpassword009	+33600000009	\N	Love weekend getaways with family.	guest	f	2026-05-13 13:53:20.763272	2026-05-13 13:53:20.763272
10	Ethan	Thomas	ethan.thomas@email.com	$2b$10$hashedpassword010	+33600000010	\N	Student traveler on a budget.	guest	f	2026-05-13 13:53:20.763272	2026-05-13 13:53:20.763272
\.


--
-- Data for Name: wishlists; Type: TABLE DATA; Schema: public; Owner: p2b_user
--

COPY public.wishlists (id, user_id, property_id, created_at) FROM stdin;
1	6	3	2026-05-13 13:53:20.841507
2	6	7	2026-05-13 13:53:20.841507
3	7	1	2026-05-13 13:53:20.841507
4	7	5	2026-05-13 13:53:20.841507
5	8	2	2026-05-13 13:53:20.841507
6	8	6	2026-05-13 13:53:20.841507
7	9	3	2026-05-13 13:53:20.841507
8	9	7	2026-05-13 13:53:20.841507
9	10	1	2026-05-13 13:53:20.841507
10	10	4	2026-05-13 13:53:20.841507
\.


--
-- Name: amenities_id_seq; Type: SEQUENCE SET; Schema: public; Owner: p2b_user
--

SELECT pg_catalog.setval('public.amenities_id_seq', 10, true);


--
-- Name: availability_id_seq; Type: SEQUENCE SET; Schema: public; Owner: p2b_user
--

SELECT pg_catalog.setval('public.availability_id_seq', 30, true);


--
-- Name: bookings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: p2b_user
--

SELECT pg_catalog.setval('public.bookings_id_seq', 10, true);


--
-- Name: messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: p2b_user
--

SELECT pg_catalog.setval('public.messages_id_seq', 8, true);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: p2b_user
--

SELECT pg_catalog.setval('public.notifications_id_seq', 10, true);


--
-- Name: payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: p2b_user
--

SELECT pg_catalog.setval('public.payments_id_seq', 10, true);


--
-- Name: properties_id_seq; Type: SEQUENCE SET; Schema: public; Owner: p2b_user
--

SELECT pg_catalog.setval('public.properties_id_seq', 8, true);


--
-- Name: property_images_id_seq; Type: SEQUENCE SET; Schema: public; Owner: p2b_user
--

SELECT pg_catalog.setval('public.property_images_id_seq', 13, true);


--
-- Name: reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: p2b_user
--

SELECT pg_catalog.setval('public.reviews_id_seq', 6, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: p2b_user
--

SELECT pg_catalog.setval('public.users_id_seq', 10, true);


--
-- Name: wishlists_id_seq; Type: SEQUENCE SET; Schema: public; Owner: p2b_user
--

SELECT pg_catalog.setval('public.wishlists_id_seq', 10, true);


--
-- Name: amenities amenities_name_key; Type: CONSTRAINT; Schema: public; Owner: p2b_user
--

ALTER TABLE ONLY public.amenities
    ADD CONSTRAINT amenities_name_key UNIQUE (name);


--
-- Name: amenities amenities_pkey; Type: CONSTRAINT; Schema: public; Owner: p2b_user
--

ALTER TABLE ONLY public.amenities
    ADD CONSTRAINT amenities_pkey PRIMARY KEY (id);


--
-- Name: availability availability_pkey; Type: CONSTRAINT; Schema: public; Owner: p2b_user
--

ALTER TABLE ONLY public.availability
    ADD CONSTRAINT availability_pkey PRIMARY KEY (id);


--
-- Name: bookings bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: p2b_user
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: p2b_user
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: p2b_user
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: p2b_user
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: properties properties_pkey; Type: CONSTRAINT; Schema: public; Owner: p2b_user
--

ALTER TABLE ONLY public.properties
    ADD CONSTRAINT properties_pkey PRIMARY KEY (id);


--
-- Name: property_amenities property_amenities_pkey; Type: CONSTRAINT; Schema: public; Owner: p2b_user
--

ALTER TABLE ONLY public.property_amenities
    ADD CONSTRAINT property_amenities_pkey PRIMARY KEY (property_id, amenity_id);


--
-- Name: property_images property_images_pkey; Type: CONSTRAINT; Schema: public; Owner: p2b_user
--

ALTER TABLE ONLY public.property_images
    ADD CONSTRAINT property_images_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: p2b_user
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: p2b_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: p2b_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: wishlists wishlists_pkey; Type: CONSTRAINT; Schema: public; Owner: p2b_user
--

ALTER TABLE ONLY public.wishlists
    ADD CONSTRAINT wishlists_pkey PRIMARY KEY (id);


--
-- Name: availability availability_property_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: p2b_user
--

ALTER TABLE ONLY public.availability
    ADD CONSTRAINT availability_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id) DEFERRABLE;


--
-- Name: bookings bookings_guest_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: p2b_user
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_guest_id_fkey FOREIGN KEY (guest_id) REFERENCES public.users(id) DEFERRABLE;


--
-- Name: bookings bookings_property_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: p2b_user
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id) DEFERRABLE;


--
-- Name: messages messages_property_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: p2b_user
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id) DEFERRABLE;


--
-- Name: messages messages_receiver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: p2b_user
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES public.users(id) DEFERRABLE;


--
-- Name: messages messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: p2b_user
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id) DEFERRABLE;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: p2b_user
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) DEFERRABLE;


--
-- Name: payments payments_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: p2b_user
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id) DEFERRABLE;


--
-- Name: properties properties_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: p2b_user
--

ALTER TABLE ONLY public.properties
    ADD CONSTRAINT properties_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(id) DEFERRABLE;


--
-- Name: property_amenities property_amenities_amenity_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: p2b_user
--

ALTER TABLE ONLY public.property_amenities
    ADD CONSTRAINT property_amenities_amenity_id_fkey FOREIGN KEY (amenity_id) REFERENCES public.amenities(id) DEFERRABLE;


--
-- Name: property_amenities property_amenities_property_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: p2b_user
--

ALTER TABLE ONLY public.property_amenities
    ADD CONSTRAINT property_amenities_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id) DEFERRABLE;


--
-- Name: property_images property_images_property_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: p2b_user
--

ALTER TABLE ONLY public.property_images
    ADD CONSTRAINT property_images_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id) DEFERRABLE;


--
-- Name: reviews reviews_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: p2b_user
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id) DEFERRABLE;


--
-- Name: reviews reviews_property_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: p2b_user
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id) DEFERRABLE;


--
-- Name: reviews reviews_reviewer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: p2b_user
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_reviewer_id_fkey FOREIGN KEY (reviewer_id) REFERENCES public.users(id) DEFERRABLE;


--
-- Name: wishlists wishlists_property_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: p2b_user
--

ALTER TABLE ONLY public.wishlists
    ADD CONSTRAINT wishlists_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id) DEFERRABLE;


--
-- Name: wishlists wishlists_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: p2b_user
--

ALTER TABLE ONLY public.wishlists
    ADD CONSTRAINT wishlists_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) DEFERRABLE;


--
-- PostgreSQL database dump complete
--

\unrestrict aq59ys8NaJLQY436UmRIcDFDG44ewYaldi3YIMexjj3iqKqYeZOcZBJF4Zu9O8x

