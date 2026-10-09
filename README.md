# ShopKart

A full-stack shopping application built with React, Express, and MongoDB for the ShopKart lab project. Customers can create an account, browse products, manage a wishlist and cart, pay through Razorpay, and view their orders.

## Features

- Customer registration, login, and logout with JWT authentication in an HttpOnly cookie.
- Protected frontend pages for signed-in customers.
- Product details, search by name, category filters, and price sorting.
- Wishlist management and a shopping cart with quantity updates.
- Checkout with shipping address validation and stock checks.
- Razorpay payment orders in INR and server-side signature verification.
- Order history and individual order details.
- Eight sample products across Electronics, Fashion, Books, and Home.

## Tech stack

| Layer | Technologies |
| --- | --- |
| Frontend | React 18, Vite, React Router, Axios, CSS |
| Backend | Node.js, Express, Mongoose |
| Database | MongoDB |
| Authentication | JSON Web Tokens, bcrypt, cookie-parser |
| Payments | Razorpay SDK and Checkout |

## Project structure

```text
shopkart/
├── backend/
│   ├── config/          # Razorpay configuration
│   ├── controllers/     # Customer, product, wishlist, cart, and order logic
│   ├── middlewares/     # Authentication middleware
│   ├── models/          # Customer, product, and order schemas
│   ├── routes/          # Express API routes
│   ├── utils/           # JWT cookie helper
│   ├── index.js         # API entry point and MongoDB connection
│   └── seed.js          # Sample product seed script
├── frontend/
│   ├── src/
│   │   ├── components/  # Navigation, product cards, and cart components
│   │   ├── context/     # Cart context
│   │   ├── pages/       # Authentication, catalog, checkout, and orders
│   │   ├── services/    # Axios API client
│   │   ├── App.jsx      # Routes and protected layout
│   │   └── main.jsx     # React entry point
│   └── vite.config.js
├── .gitignore
└── README.md
```

## Getting started

### Prerequisites

- Node.js 22 or newer and npm.
- A running MongoDB instance or a MongoDB Atlas connection string.
- Razorpay test credentials. The backend initializes the Razorpay client at startup, so configure these before starting it.

### 1. Clone the repository

```bash
git clone https://github.com/Priya90909/shopkart.git
cd shopkart
```

### 2. Configure the backend

Create `backend/.env` and add the configuration below. Replace the placeholders with your own credentials.

```dotenv
MONGO_URI=mongodb://127.0.0.1:27017/shopkart
JWT_SECRET=replace_with_a_long_random_secret
PORT=5000
CLIENT_URL=http://localhost:5173
RAZORPAY_KEY_ID=replace_with_your_razorpay_test_key_id
RAZORPAY_KEY_SECRET=replace_with_your_razorpay_test_key_secret
```

| Variable | Purpose |
| --- | --- |
| `MONGO_URI` | MongoDB connection string. Required. |
| `JWT_SECRET` | Secret used to sign and verify authentication tokens. Required. |
| `PORT` | API port; defaults to `5000`. |
| `CLIENT_URL` | Allowed frontend origin for credentialed CORS; defaults to `http://localhost:5173`. |
| `RAZORPAY_KEY_ID` | Razorpay key ID used to initialize payment integration. |
| `RAZORPAY_KEY_SECRET` | Razorpay secret used for the SDK and signature verification. |
| `MONGO_DNS_SERVERS` | Optional comma-separated DNS servers used by the API process. |

Keep actual credentials in local environment files. `.gitignore` excludes environment files, dependencies, build output, private key files, and `viva.md`.

### 3. Install dependencies and start the API

In one terminal:

```bash
cd backend
npm install
npm run dev
```

The API starts at `http://localhost:5000` after connecting successfully to MongoDB. Keep this terminal running.

### 4. Add sample products

In a separate terminal, from the repository root:

```bash
cd backend
npm run seed
```

The seed script adds eight sample products only when the product collection is empty. It leaves existing products in place.

### 5. Start the frontend

In another terminal, from the repository root:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` and register a customer account. Registration asks for a full name, email, password of at least six characters, and phone number.

The frontend uses `http://localhost:5000` as its default API URL. To use a different address, create `frontend/.env`:

```dotenv
VITE_API_URL=http://localhost:5000
```

Restart Vite after changing frontend environment variables. If Vite starts on another port, update the backend's `CLIENT_URL` to match and restart the API.

## Try the shopping flow

1. Register and log in.
2. Browse the catalog, search for a product, or filter by category.
3. Open product details and add an item to your wishlist or cart.
4. Update cart quantities and continue to checkout.
5. Enter a shipping address with a valid phone number and six-digit pincode.
6. Complete checkout using Razorpay test mode.
7. Open Orders to inspect the saved order and payment status.

## Available commands

Run each command from the directory listed below.

| Directory | Command | Purpose |
| --- | --- | --- |
| `backend/` | `npm run dev` | Start the API with Node's file watcher. |
| `backend/` | `npm start` | Start the API without the watcher. |
| `backend/` | `npm run seed` | Insert sample products if the catalog is empty. |
| `frontend/` | `npm run dev` | Start the Vite development server. |
| `frontend/` | `npm run build` | Generate the frontend build in `frontend/dist/`. |

## API reference

Local base URL: `http://localhost:5000`.

Protected endpoints require the JWT cookie issued during login. The frontend's Axios client sends cookies with `withCredentials: true`.

| Method | Endpoint | Purpose | Authentication |
| --- | --- | --- | --- |
| POST | `/customers/register` | Register a customer | Public |
| POST | `/customers/login` | Log in and set the authentication cookie | Public |
| GET | `/customers/me` | Get the current customer | Required |
| POST | `/customers/logout` | Clear the authentication cookie | Required |
| GET | `/products` | List, search, filter, and sort products | Public |
| GET | `/products/:id` | Get product details | Public |
| POST | `/products` | Create a product | Public in this lab implementation |
| GET | `/wishlist` | Get the customer's wishlist | Required |
| POST | `/wishlist/:productId` | Add a wishlist product | Required |
| DELETE | `/wishlist/:productId` | Remove a wishlist product | Required |
| GET | `/cart` | Get the customer's cart | Required |
| POST | `/cart/:productId` | Add a cart product | Required |
| PATCH | `/cart/:productId` | Update quantity using a `quantity` field | Required |
| DELETE | `/cart/:productId` | Remove a cart item | Required |
| POST | `/orders/create-payment-order` | Validate checkout and create a payment order | Required |
| POST | `/orders/verify-payment` | Verify the Razorpay signature | Required |
| GET | `/orders` | List the customer's orders | Required |
| GET | `/orders/:id` | Get a customer order | Required |

Product listing accepts `search`, `category`, and `sort` query parameters. Sort values are `price_asc` and `price_desc`.

```text
GET /products?search=keyboard&category=Electronics&sort=price_asc
```

To add a product through Postman, send a JSON body to `POST /products`:

```json
{
  "name": "Mechanical Keyboard",
  "description": "RGB mechanical keyboard with blue switches.",
  "price": 2999,
  "category": "Electronics",
  "image": "https://placehold.co/400x300?text=Keyboard",
  "stock": 10
}
```

## Troubleshooting

| Problem | What to check |
| --- | --- |
| Database connection fails | Check `MONGO_URI`, MongoDB availability, and Atlas network access settings if using Atlas. The API listens only after the database connects. |
| Razorpay initialization fails | Configure both Razorpay credentials in `backend/.env` and restart the API. |
| CORS error or authentication fails | Ensure `CLIENT_URL` matches the frontend origin. Use `localhost` consistently for both local services. |
| Catalog is empty | Run `npm run seed` from `backend/` using the same database as the API. |
| Checkout fails | Check Razorpay test credentials, product stock, and required shipping fields. |
| API URL changes have no effect | Restart Vite after editing `frontend/.env`; rebuild if using a compiled frontend. |

## Project status

This repository contains the frontend and backend for the ShopKart lab project. Both services can be run locally using the instructions above. No live deployment link is currently included.
