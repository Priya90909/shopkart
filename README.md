# ShopKart (Labs 01-05)

## Backend
cd backend && npm install && npm run dev
Needs a .env with: MONGO_URI, JWT_SECRET (PORT optional, default 5000; CLIENT_URL optional, default http://localhost:5173)
Optional: npm run seed   (adds 8 sample products if none exist)

## Frontend
cd frontend && npm install && npm run dev
Optional: VITE_API_URL (default http://localhost:5000)

## Add sample products (Postman or curl)
POST /products  { name, description, price, category, image, stock }
Categories used in the dropdown: Electronics, Fashion, Books, Home
