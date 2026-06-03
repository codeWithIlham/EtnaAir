# ETNAir — Schéma de Base de Données

> Diagramme relationnel — Pour générer un PDF : copier le code dbdiagram.io ci-dessous sur https://dbdiagram.io

## Diagramme dbdiagram.io

```dbml
Table users {
  id          int         [pk, increment]
  first_name  varchar(100) [not null]
  last_name   varchar(100) [not null]
  email       varchar(255) [unique, not null]
  password_hash text      [not null]
  phone_number varchar(20)
  profile_picture text
  bio         text
  role        text        [default: 'guest', note: 'guest | host | admin']
  is_verified boolean     [default: false]
  created_at  timestamp   [default: `now()`]
  updated_at  timestamp
}

Table properties {
  id              int       [pk, increment]
  owner_id        int       [not null, ref: > users.id]
  title           varchar(255) [not null]
  description     text      [not null]
  price_per_night decimal(10,2) [not null]
  property_type   varchar(50) [note: 'studio | apartment | house | villa']
  max_guests      int       [not null]
  bedrooms        int       [default: 1]
  bathrooms       int       [default: 1]
  country         varchar(100)
  city            varchar(100)
  address         text
  latitude        decimal(9,6)
  longitude       decimal(9,6)
  status          text      [default: 'active', note: 'active | inactive | pending']
  created_at      timestamp [default: `now()`]
  updated_at      timestamp
}

Table property_images {
  id          int     [pk, increment]
  property_id int     [not null, ref: > properties.id]
  image_url   text    [not null]
  is_main     boolean [default: false]
}

Table bookings {
  id             int       [pk, increment]
  guest_id       int       [not null, ref: > users.id]
  property_id    int       [not null, ref: > properties.id]
  start_date     date      [not null]
  end_date       date      [not null]
  total_price    decimal(10,2) [not null]
  booking_status text      [default: 'pending', note: 'pending | confirmed | cancelled | completed']
  created_at     timestamp [default: `now()`]
}

Table reviews {
  id          int       [pk, increment]
  booking_id  int       [ref: > bookings.id]
  reviewer_id int       [ref: > users.id]
  property_id int       [ref: > properties.id]
  rating      int       [note: '1 to 5']
  comment     text
  created_at  timestamp [default: `now()`]
}

Table amenities {
  id   int    [pk, increment]
  name varchar(100) [unique, not null]
}

Table property_amenities {
  property_id int [ref: > properties.id]
  amenity_id  int [ref: > amenities.id]

  indexes {
    (property_id, amenity_id) [pk]
  }
}

Table wishlists {
  id          int [pk, increment]
  user_id     int [ref: > users.id]
  property_id int [ref: > properties.id]
  created_at  timestamp [default: `now()`]
}

Table messages {
  id          int  [pk, increment]
  sender_id   int  [ref: > users.id]
  receiver_id int  [ref: > users.id]
  property_id int  [ref: > properties.id]
  content     text [not null]
  is_read     boolean [default: false]
  created_at  timestamp [default: `now()`]
}

Table notifications {
  id         int  [pk, increment]
  user_id    int  [ref: > users.id]
  title      varchar(255)
  content    text
  is_read    boolean  [default: false]
  created_at timestamp [default: `now()`]
}

Table availability {
  id             int  [pk, increment]
  property_id    int  [not null, ref: > properties.id]
  available_date date [not null]
  is_available   boolean [default: true]
}

Table payments {
  id             int  [pk, increment]
  booking_id     int  [unique, ref: > bookings.id]
  amount         decimal(10,2) [not null]
  payment_status varchar(20)  [note: 'pending | completed | failed | refunded']
  payment_method varchar(50)  [note: 'card | paypal | stripe | bank_transfer']
  transaction_id text
  created_at     timestamp [default: `now()`]
}
```

## Relations principales

| Table | Relation | Table |
|-------|----------|-------|
| `users` | 1 → N | `properties` (un hôte peut avoir plusieurs logements) |
| `users` | 1 → N | `bookings` (un voyageur peut avoir plusieurs réservations) |
| `properties` | 1 → N | `bookings` (un logement peut avoir plusieurs réservations) |
| `bookings` | 1 → N | `reviews` (une réservation peut avoir un avis) |
| `properties` | N → N | `amenities` (via `property_amenities`) |
| `properties` | 1 → N | `property_images` |
| `users` | N → N | `properties` (via `wishlists` — favoris) |

## Générer le dump PostgreSQL

```bash
# Depuis la machine locale avec Docker en cours d'exécution :
pg_dump -h localhost -p 5433 -U etnair_user -d etnair_db > etnair_dump.sql

# Ou depuis Docker directement :
docker exec etnair_db pg_dump -U etnair_user -d etnair_db > etnair_dump.sql
```

Le dump est disponible dans : `p2b/dump.sql`
