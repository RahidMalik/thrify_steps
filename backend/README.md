# Thrify Kicks Backend API

Complete Node.js backend API for Thrify Kicks e-commerce platform - a shoe selling website.

## 🚀 Features

- **User Authentication** - JWT-based authentication with role-based access control
- **Product Management** - Full CRUD operations with filtering, sorting, and pagination
- **Category Management** - Organize products by categories
- **Shopping Cart** - Add, update, and remove items from cart
- **Order Management** - Create orders, track status, and manage payments
- **Reviews & Ratings** - Product reviews with automatic rating calculations
- **Admin Dashboard** - Statistics, user management, and admin controls
- **Payment Integration** - Stripe payment processing
- **Image Uploads** - Cloudinary integration for product images
- **Error Handling** - Centralized error handling middleware
- **Input Validation** - Request validation and sanitization

## 🛠️ Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database with Mongoose ODM
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Multer** - File upload handling
- **Cloudinary** - Image cloud storage (optional)
- **Stripe** - Payment processing (optional)
- **Express Validator** - Input validation
- **Morgan** - HTTP request logger

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   ├── db.js        # MongoDB connection
│   │   ├── cloudinary.js # Cloudinary setup
│   │   └── env.js       # Environment variables
│   ├── models/          # Mongoose models
│   │   ├── User.model.js
│   │   ├── Product.model.js
│   │   ├── Category.model.js
│   │   ├── Order.model.js
│   │   └── Review.model.js
│   ├── controllers/     # Route controllers
│   │   ├── auth.controller.js
│   │   ├── product.controller.js
│   │   ├── category.controller.js
│   │   ├── order.controller.js
│   │   ├── review.controller.js
│   │   └── admin.controller.js
│   ├── routes/          # Express routes
│   │   ├── auth.routes.js
│   │   ├── product.routes.js
│   │   ├── category.routes.js
│   │   ├── order.routes.js
│   │   ├── review.routes.js
│   │   ├── admin.routes.js
│   │   └── payment.routes.js
│   ├── middlewares/     # Custom middlewares
│   │   ├── auth.middleware.js
│   │   ├── admin.middleware.js
│   │   ├── error.middleware.js
│   │   └── upload.middleware.js
│   ├── utils/           # Utility functions
│   │   ├── jwt.js
│   │   ├── response.js
│   │   └── validators.js
│   ├── services/        # External services
│   │   └── payment.service.js
│   ├── app.js           # Express app setup
│   └── server.js        # Server entry point
├── .env.example         # Environment variables template
├── package.json
└── README.md
```

## 📦 Installation

1. **Clone the repository**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and fill in your configuration values.

4. **Start MongoDB**
   Make sure MongoDB is running on your system or use MongoDB Atlas.

5. **Run the server**
   ```bash
   # Development mode with auto-reload
   npm run dev

   # Production mode
   npm start
   ```

## ⚙️ Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/thrify_kicks
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000

# Optional: Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Optional: Stripe (for payments)
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile (Protected)
- `PUT /api/auth/profile` - Update user profile (Protected)

### Cart
- `GET /api/auth/cart` - Get user cart (Protected)
- `POST /api/auth/cart` - Add item to cart (Protected)
- `PUT /api/auth/cart/:itemId` - Update cart item (Protected)
- `DELETE /api/auth/cart/:itemId` - Remove item from cart (Protected)

### Products
- `GET /api/products` - Get all products (with filters, pagination)
- `GET /api/products/:id` - Get single product
- `GET /api/products/brands` - Get all brands
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get single category
- `POST /api/categories` - Create category (Admin)
- `PUT /api/categories/:id` - Update category (Admin)
- `DELETE /api/categories/:id` - Delete category (Admin)

### Orders
- `POST /api/orders` - Create new order (Protected)
- `GET /api/orders/my` - Get user's orders (Protected)
- `GET /api/orders/:id` - Get single order (Protected)
- `GET /api/orders` - Get all orders (Admin)
- `PUT /api/orders/:id/status` - Update order status (Admin)

### Reviews
- `GET /api/reviews/:productId` - Get product reviews
- `POST /api/reviews` - Create review (Protected)
- `PUT /api/reviews/:id` - Update review (Protected)
- `DELETE /api/reviews/:id` - Delete review (Protected)

### Admin
- `GET /api/admin/stats` - Get dashboard statistics (Admin)
- `GET /api/admin/users` - Get all users (Admin)
- `PUT /api/admin/users/:id/role` - Update user role (Admin)

### Payments
- `POST /api/payments/create-intent` - Create Stripe payment intent (Protected)

## 🔐 Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## 📝 Example API Calls

### Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Get Products with Filters
```bash
GET /api/products?page=1&limit=12&category=60d5ec49f1b2c72b8c8e4f1a&brand=Nike&minPrice=50&maxPrice=200&sortBy=price&sortOrder=asc
```

### Create Order
```bash
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": [
    {
      "product": "60d5ec49f1b2c72b8c8e4f1a",
      "quantity": 2,
      "size": "10",
      "color": "Black"
    }
  ],
  "shippingAddress": {
    "fullName": "John Doe",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "United States",
    "phone": "+1234567890"
  },
  "paymentMethod": "stripe",
  "paymentIntentId": "pi_xxx"
}
```

## 🗄️ Database Schema

### User
- name, email (unique), password (hashed)
- role (admin/customer)
- cart (array of items)
- timestamps

### Product
- title, brand, price, discountPrice
- sizes (array), colors (array)
- stock, category (reference)
- images (array), description
- rating, numReviews, isFeatured
- timestamps

### Category
- name (unique), slug (auto-generated)
- isActive
- timestamps

### Order
- user (reference)
- items (array with product details)
- shippingAddress (object)
- paymentMethod, paymentStatus, orderStatus
- totalAmount, shippingCost, tax
- timestamps

### Review
- user (reference), product (reference)
- rating (1-5), comment
- timestamps
- Auto-updates product rating on save/delete

## 🧪 Testing

You can use tools like Postman, Thunder Client, or curl to test the API endpoints.

## 🚨 Error Handling

All errors are handled centrally and return a consistent format:

```json
{
  "success": false,
  "message": "Error message here"
}
```

## 📦 Production Deployment

1. Set `NODE_ENV=production` in your `.env` file
2. Use a strong `JWT_SECRET`
3. Use MongoDB Atlas or a managed MongoDB service
4. Set up proper CORS origins
5. Use environment variables for all secrets
6. Enable HTTPS
7. Set up proper logging
8. Configure Stripe webhooks for production

## 🔒 Security Best Practices

- Passwords are hashed using bcrypt
- JWT tokens for authentication
- Role-based access control
- Input validation on all endpoints
- CORS configured for specific origins
- Environment variables for sensitive data
- SQL injection protection (MongoDB)
- XSS protection (input sanitization)

## 📄 License

ISC

## 🤝 Contributing

This is a production-ready backend for Thrify Kicks e-commerce platform. Customize as needed for your specific requirements.

## 📞 Support

For issues or questions, please refer to the code comments or create an issue in the repository.

---

**Built with ❤️ for Thrify Kicks**
