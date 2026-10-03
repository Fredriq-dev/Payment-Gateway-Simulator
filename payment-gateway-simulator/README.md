# Payment Gateway Simulator (Backend)

A simulated payment gateway built with Node.js, Express and PostgreSQL. Merchants initiate payments, customers pay on a hosted checkout page using test cards, the gateway updates the transaction status and sends signed webhook callbacks to the merchant.

## Quick start

1. Install Node.js 18 or newer and PostgreSQL.
2. Create a database called `payment_gateway` (pgAdmin or `createdb payment_gateway`).
3. Clone the repo, then run:

```
npm install
cp .env.example .env
```

4. Open `.env` and set `DATABASE_URL` and `JWT_SECRET`.
5. Create the tables and the demo merchant:

```
npm run db:setup
npm run db:seed
```

6. Start the server:

```
npm run dev
```

7. Visit `http://localhost:5000/health`. You should see a success message.

Until each person finishes their part, unfinished endpoints respond with `501 ... is not implemented yet`. That is expected.

## How a payment flows

1. The merchant server calls `POST /api/v1/payments/initiate` with an amount, customer email and callback URL. The gateway returns a `reference` and a `payment_url`.
2. The customer opens the checkout page. The frontend calls `GET /api/v1/checkout/:reference`.
3. The customer enters a test card. The frontend calls `POST /api/v1/checkout/:reference/pay`.
4. The simulator decides the result from the card number and the status is updated inside a database transaction.
5. The gateway sends a signed webhook to the merchant and logs the attempt.
6. The merchant can also call `GET /api/v1/payments/verify/:reference` at any time.

Statuses: `pending`, `processing`, `success`, `failed`, `abandoned`, `refunded`

Amounts are integers in the smallest unit (kobo). 5,000 naira is `500000`.

## Test cards

| Card number | Result |
|-|-|
| 4242 4242 4242 4242 | Success |
| 4000 0000 0000 0002 | Declined |
| 4000 0000 0000 9995 | Insufficient funds |
| 4000 0000 0000 0069 | Expired card |
| 4000 0000 0000 0119 | Processing error (stays pending) |

Never store a full card number. Store only the last 4 digits and the brand.

## Team roles

Work is split by feature. Each person owns whole files, so nobody edits the same file at the same time. Every file has an `OWNER` comment at the top and a contract describing what it must do.

### Person 1: Foundation and setup (lead)

Everyone depends on this work, so it goes first.

- `app.js`, `package.json`, `.env.example`, `.gitignore`
- `Config/databaseConfig.js`, `Config/constants.js`
- `Database/schema.sql`, `Database/seed.sql`, `Database/setup.js`
- `Middleware/errorHandler.js`, `Middleware/rateLimiter.js`, `Middleware/validate.js`
- `Utility/AppError.js`, `Utility/response.js`, `Utility/notImplemented.js`, `Utility/catchAsync.js`
- `postman/` shared collection, Swagger docs (optional), PR reviews

### Person 2: Merchant accounts, auth and admin

- `Controllers/UserController.js`, `Controllers/AdminController.js`
- `Models/Users.js`
- `Routes/UserRoute.js`, `Routes/AdminRoute.js`
- `Middleware/auth.js`, `Middleware/apiKeyAuth.js`, `Middleware/role.js`
- `Utility/generateKeys.js`

Endpoints: `POST /users/register`, `POST /users/login`, `GET /users/profile`, `PATCH /users/webhook-url`, `POST /users/regenerate-keys`, `GET /admin/transactions`, `GET /admin/stats`

Start with `apiKeyAuth.js`, because Person 3 needs it.

### Person 3: Payment initiation and transaction records

- `Controllers/PaymentController.js`
- `Models/Transactions.js`, `Models/TransactionEvents.js`
- `Routes/PaymentRoute.js`
- `Utility/generateReference.js`

Endpoints: `POST /payments/initiate`, `GET /payments/verify/:reference`, `GET /payments`, `POST /payments/:reference/refund` (stretch)

Person 3 owns `Transactions.js`. Person 4 and Person 5 call its functions, so finish the signatures early and do not rename them.

### Person 4: Checkout and simulator

- `Controllers/CheckoutController.js`
- `Routes/CheckoutRoute.js`
- `Services/PaymentService.js`, `Services/SimulatorService.js`

Endpoints: `GET /checkout/:reference`, `POST /checkout/:reference/pay`, `POST /checkout/:reference/cancel`

Also owns expiry handling (a pending transaction past `expires_at` becomes `abandoned`). After a payment finishes, call `WebhookService.dispatch(transactionId)` without waiting for it. A stub already exists.

### Person 5: Webhooks and notifications

- `Controllers/WebhookController.js`
- `Models/WebhookLogs.js`
- `Routes/WebhookRoute.js`, `Routes/MockMerchantRoute.js`
- `Services/WebhookService.js`, `Services/EmailService.js` (optional)
- `Config/emailConfig.js` (optional)
- `Utility/signature.js`

Endpoints: `GET /webhooks`, `POST /webhooks/:transactionId/resend`, `POST /mock-merchant/webhook`

Also writes the retry logic (3 attempts using `setTimeout`) and runs the end to end test using the mock merchant endpoint.

## Shared contracts

Response format for every endpoint, built with `Utility/response.js`:

```json
{ "success": true, "message": "Payment initiated", "data": { } }
```

Errors use the same shape with `"success": false`. Throw `new AppError("message", statusCode)` and the central handler formats it. Route files wrap every controller in `catchAsync`, so thrown errors in async functions reach the handler instead of crashing the server. Keep that wrapper when you edit routes.

Function names in the Models folder and the Service functions are the contract between teammates. Their signatures are documented at the top of each function. If you need to change one, tell the group first.

Until real authentication exists, `auth.js` and `apiKeyAuth.js` are stubs that use the demo merchant from `seed.sql`:

- Merchant id: `11111111-1111-1111-1111-111111111111`
- Secret key: `sk_test_demo`

## Dependency order

| Stage | Who | What must be ready |
|-|-|-|
| 1 | Person 1 | Repo, database connection, schema, response helpers |
| 2 | Person 2 | Register, login, API key middleware |
| 3 | Person 3 | Initiate and verify (frontend can start on checkout) |
| 4 | Person 4 | Pay endpoint and simulator |
| 5 | Person 5 | Webhook dispatch plugged into Person 4's service |

Persons 2 to 5 can start together once Person 1 pushes this skeleton. Use the stubs for anything owned by someone else.

## Git workflow

- Never push directly to `main`.
- One branch per person: `feature/foundation`, `feature/auth`, `feature/payments`, `feature/checkout`, `feature/webhooks`.
- Open a pull request when a feature works. Person 1 reviews and merges.
- Pull from `main` often so your branch stays current.
- Never commit `.env`.

## API reference

All routes are under `/api/v1`.

| Method | Endpoint | Auth | Owner |
|-|-|-|-|
| POST | `/users/register` | none | 2 |
| POST | `/users/login` | none | 2 |
| GET | `/users/profile` | JWT | 2 |
| PATCH | `/users/webhook-url` | JWT | 2 |
| POST | `/users/regenerate-keys` | JWT | 2 |
| GET | `/admin/transactions` | JWT, admin | 2 |
| GET | `/admin/stats` | JWT, admin | 2 |
| POST | `/payments/initiate` | secret key | 3 |
| GET | `/payments/verify/:reference` | secret key | 3 |
| GET | `/payments` | secret key | 3 |
| POST | `/payments/:reference/refund` | secret key | 3 |
| GET | `/checkout/:reference` | none | 4 |
| POST | `/checkout/:reference/pay` | none | 4 |
| POST | `/checkout/:reference/cancel` | none | 4 |
| GET | `/webhooks` | JWT | 5 |
| POST | `/webhooks/:transactionId/resend` | JWT | 5 |
| POST | `/mock-merchant/webhook` | none | 5 |

Example initiate request:

```json
POST /api/v1/payments/initiate
Authorization: Bearer sk_test_demo

{
  "amount": 500000,
  "currency": "NGN",
  "email": "customer@example.com",
  "callback_url": "http://localhost:5000/api/v1/mock-merchant/webhook",
  "metadata": { "order_id": "ORD-1001" }
}
```

## PostgreSQL cheat sheet (coming from MongoDB)

| MongoDB | PostgreSQL |
|-|-|
| Collection | Table |
| Document | Row |
| Field | Column |
| Schema optional | Schema defined up front in `schema.sql` |
| `populate()` | `JOIN` |

- Always use parameterized queries: `pool.query("SELECT * FROM users WHERE id = $1", [id])`. Never join user input into a query string.
- Add `RETURNING *` to `INSERT` and `UPDATE` to get the row back.
- Query results are in `result.rows`. One row is `rows[0]`.
- Use `BEGIN`, `COMMIT` and `ROLLBACK` when several changes must succeed together.

## Stretch goals

Refunds, bank transfer simulation, an OTP step, email receipts, Swagger docs, tests with Jest and Supertest, and later Redis with BullMQ for reliable webhook retries.
