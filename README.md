Payment Gateway Simulator
A working payment gateway you can use to practise online payments without moving real money. A merchant signs up, gets API keys, and creates payments. Customers pay on a hosted checkout page with test cards. The gateway records every step and tells the merchant's server about the result through signed webhooks.
Built by Group 14 for the TS Academy capstone project.
Live demo
Website: `https://payment-gateway-simulator-xi.vercel.app/`
API: `http://localhost:5000/api/v1`

What it does -
For merchants:
- Create an account and get a public key and a secret key.
- Create payments from the website or through the API.
- See all transactions, filter them by status, open the details of each one, and refund a successful payment.
- Set a webhook URL and regenerate keys when needed.

For customers:
- Open the payment link, see who they are paying and how much, then pay with a test card or cancel.
- See a clear result: successful, declined (with the reason), still processing, or expired.
- Behind the scenes
- Every payment moves through a fixed set of statuses: pending, success, failed, abandoned and refunded. Invalid jumps are blocked.
- Payments are locked while being processed, so a double click can never charge twice.
- Payments expire after a set time if nobody pays.
- Every status change is recorded in an events log.
- Webhooks are signed so the merchant can check they are genuine, and failed ones are retried automatically.
- An admin role can view all users, all transactions and overall statistics.

How a payment flows:
- The merchant's server calls the API with its secret key to create a payment and gets back a reference and a payment link.
- The customer opens the link and pays on the checkout page.
- The gateway runs the card through the simulator, saves the result, and logs the event.
- The gateway sends a signed webhook to the merchant, who can then confirm the payment with the verify endpoint.

Test cards
Use any future expiry date and any 3 digit CVV.
`4242 4242 4242 4242` succeeds
`4000 0000 0000 0002` is declined
`4000 0000 0000 9995` fails with insufficient funds
`4000 0000 0000 0069` fails with an expired card
`4000 0000 0000 0119` stays pending, so the customer can try again
Any other number fails as an invalid test card

Main API endpoints
Base path: `/api/v1`. Amounts are whole numbers in kobo, so 5,000 naira is `500000`.
Accounts (website login token)
`POST /users/register` and `POST /users/login`
`GET /users/profile`
`PATCH /users/webhook-url`
`POST /users/regenerate-keys`
Payments (secret key as `Authorization: Bearer sk_test_...`)
`POST /payments/initiate`
`GET /payments/verify/:reference`
`GET /payments` to list transactions
`POST /payments/:reference/refund`
Checkout (public, used by customers)
`GET /checkout/:reference`
`POST /checkout/:reference/pay`
`POST /checkout/:reference/cancel`
Webhooks (website login token)
`GET /webhooks/logs`, `POST /webhooks/logs/:id/retry` and `POST /webhooks/test`
Admin (admin accounts only)
`GET /admin/users`, `GET /admin/transactions` and `GET /admin/stats`

Tech stack
Backend: Node.js, Express
Database: PostgreSQL
Frontend: React with Vite
Security: bcrypt password hashing, JWT login tokens, API keys, rate limiting, signed webhooks

Project structure
`payment-gateway-simulator/` is the backend: config, routes, controllers, services, models, middleware and the database scripts.
`src/`, `public/` and `index.html` in the repo root are the frontend.

Running it locally
You need Node.js and PostgreSQL.
Create a PostgreSQL database named `payment_gateway`.
In `payment-gateway-simulator/`, copy `.env.example` to `.env` and fill in your values.
Install and prepare the database, then start the backend:
```
   cd payment-gateway-simulator
   npm install
   npm run db:setup
   npm run db:seed
   npm run dev
   ```
In a second terminal, start the frontend from the repo root:
```
   npm install
   npm run dev
   ```
Open `http://localhost:5173`.
The seed adds a demo merchant whose secret key is `sk_test_demo`. It works for API calls but cannot log in on the website, so register your own account to use the dashboard. To make an admin, register normally and then set that user's `role` to `admin` in the database.
Environment variables

Backend (`.env`):
`PORT`, `NODE_ENV`
`DATABASE_URL`, the PostgreSQL connection string
`JWT_SECRET` and `JWT_EXPIRES_IN`, for login tokens
`CHECKOUT_BASE_URL`, the address of the frontend checkout page
`TRANSACTION_EXPIRY_MINUTES`, how long a payment stays open
`WEBHOOK_MAX_ATTEMPTS`, how many times a webhook is tried
`MOCK_MERCHANT_SECRET`, optional, lets the built in mock merchant verify webhook signatures

Frontend:
`VITE_API_URL`, the address of the API, set at build time

Deployment notes
Set `NODE_ENV=production`, use a long random `JWT_SECRET`, and use a hosted PostgreSQL database.
Set `CHECKOUT_BASE_URL` to the deployed frontend address, so payment links open the live checkout page.
Point `VITE_API_URL` at the deployed API before building the frontend.
The seeded demo merchant's webhook URL points at localhost, so update it to the deployed API address for webhooks to reach the mock merchant.
Team
The work was split across five roles: foundation and database, accounts and admin, payment initiation and transaction management, checkout and the payment simulator, and webhooks. 
