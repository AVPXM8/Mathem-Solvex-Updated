<div align="center">
  <h1>Maarula Classes Question Bank Portal</h1>
  <p>A high-performance, full-stack educational monorepo engineered to facilitate advanced interactive learning, precise question practice, and secure, AI-assisted content administration.</p>
</div>

---

## Project Overview and Architecture

The **Maarula Classes Question Bank Portal** is built using a modern **MERN-variant** stack (React, Node.js, Express, MongoDB) supplemented by cutting-edge Vector Database capabilities (Pinecone) and LLM integrations (Google GenAI).

The project uses a **Monorepo architecture** divided into three distinct workspaces:

1. **[Student Portal (`/student`)](./student/)**: A fast Single Page Application (SPA) designed for seamless student engagement and study.
2. **[Admin Panel (`/admin`)](./admin/)**: A highly secure, JWT-authenticated dashboard dedicated to content curation, reporting, and AI management.
3. **[Backend API (`/backend`)](./backend/)**: The centralized RESTful API that securely orchestrates database reads/writes, file buffer uploads, and asynchronous AI operations.

---

## Exhaustive File Directory Index

Below is a comprehensive breakdown of every critical file in the repository, detailing its exact purpose and role within the system architecture.

### 1. Backend API (`/backend`)
The core Node.js application powering the entire platform.

**Root Configuration Files:**
* [`backend/server.js`](./backend/server.js): The central entry point. Initializes Express, configures security middleware (Helmet, CORS), connects to MongoDB, and binds all routing.
* [`backend/package.json`](./backend/package.json): Lists Node.js dependencies including `express`, `mongoose`, `jsonwebtoken`, `multer`, `@google/genai`, and `@pinecone-database/pinecone`.

**Controllers (`backend/controllers/`):**
* [`adminController.js`](./backend/controllers/adminController.js): Handles administrator authentication logic, JWT generation, and login verification.
* [`aiController.js`](./backend/controllers/aiController.js): Interfaces with Google Gemini and Pinecone to provide contextual responses to student queries (The AI Tutor feature).
* [`postController.js`](./backend/controllers/postController.js): Manages CRUD operations for blog posts and handles TinyMCE rich-text image uploads.
* [`questionController.js`](./backend/controllers/questionController.js): The largest controller. Handles complex multipart/form-data for question creation, pagination, filtering, and dashboard statistics.
* [`reportController.js`](./backend/controllers/reportController.js): Manages student-submitted error reports and allows admins to track resolution status.
* [`sitemapController.js`](./backend/controllers/sitemapController.js): Generates automated XML sitemaps for SEO indexing of dynamic content.

**Middleware (`backend/middleware/`):**
* [`authMiddleware.js`](./backend/middleware/authMiddleware.js): Intercepts protected requests, verifies JWT tokens, and attaches the authenticated user to the request context.
* [`rateLimitMiddleware.js`](./backend/middleware/rateLimitMiddleware.js): Prevents abusive traffic and brute-force login attempts using `express-rate-limit`.
* [`uploadMiddleware.js`](./backend/middleware/uploadMiddleware.js): Uses `multer` to intercept incoming media buffers, validating mime-types (JPEG, PNG, GIF) before saving to disk.

**Mongoose Models (`backend/models/`):**
* [`AdminUser.js`](./backend/models/AdminUser.js): Schema for administrator credentials, featuring bcrypt password hashing.
* [`Counter.js`](./backend/models/Counter.js): A utility schema used exclusively to generate sequential, collision-free Question IDs.
* [`Post.js`](./backend/models/Post.js): Schema for rich-text articles, featuring automated string-to-slug conversion hooks.
* [`Question.js`](./backend/models/Question.js): Complex schema for exam questions, enforcing multi-option validation and maintaining compound text indexes for fast search.
* [`Report.js`](./backend/models/Report.js): Schema mapping user feedback to specific Question IDs.

**API Routes (`backend/routes/`):**
* [`adminRoutes.js`](./backend/routes/adminRoutes.js): Connects `/api/admin` requests to `adminController`.
* [`aiRoutes.js`](./backend/routes/aiRoutes.js): Exposes the `/api/ai` endpoints used by the AI Tutor.
* [`postRoutes.js`](./backend/routes/postRoutes.js): Maps public slug queries and protected CMS actions for posts.
* [`questionRoutes.js`](./backend/routes/questionRoutes.js): Declares public filtering routes and protected multi-buffer upload routes (Questions and Options).
* [`reportRoutes.js`](./backend/routes/reportRoutes.js): Handles inbound error submissions and outbound dashboard resolution updates.
* [`sitemapRoutes.js`](./backend/routes/sitemapRoutes.js): Exposes the `/sitemap.xml` generic route.

**Scripts and Utilities (`backend/scripts/` & `backend/utils/`):**
* [`seedEmbeddings.js`](./backend/scripts/seedEmbeddings.js): A standalone batch script that pulls questions from MongoDB, generates floating-point vector embeddings via Gemini, and upserts them to Pinecone.
* [`counterInit.js`](./backend/utils/counterInit.js): Ensures the auto-increment database sequences are initialized safely on server boot.

---

### 2. Admin Panel (`/admin`)
The protected React application for content managers.

**Root Configuration Files:**
* [`admin/package.json`](./admin/package.json): Defines frontend dependencies like `react`, `react-router-dom`, `axios`, and `@tinymce/tinymce-react`.
* [`admin/vite.config.js`](./admin/vite.config.js): The build tool configuration optimizing the SPA bundle.

**Core React Code (`admin/src/`):**
* [`main.jsx`](./admin/src/main.jsx) & [`App.jsx`](./admin/src/App.jsx): Bootstraps the React DOM and defines the primary nested routing structures.
* [`api.js`](./admin/src/api.js): Configures the central Axios instance, automatically attaching the JWT `Authorization` header to every outbound request.
* [`index.css`](./admin/src/index.css): Global styling rules and CSS variables.

**Pages (`admin/src/pages/`):**
* [`LoginPage.jsx`](./admin/src/pages/LoginPage.jsx): The gateway form handling authentication.
* [`DashboardPage.jsx`](./admin/src/pages/DashboardPage.jsx): Renders statistical overview charts and database metrics.
* [`AddQuestionPage.jsx`](./admin/src/pages/AddQuestionPage.jsx) & [`QuestionListPage.jsx`](./admin/src/pages/QuestionListPage.jsx): Forms and data tables for managing the question bank, supporting LaTeX rendering.
* [`AddPostPage.jsx`](./admin/src/pages/AddPostPage.jsx) & [`PostListPage.jsx`](./admin/src/pages/PostListPage.jsx): CMS interface utilizing the TinyMCE rich editor for detailed articles.
* [`ReportsPage.jsx`](./admin/src/pages/ReportsPage.jsx): Interface for reviewing and resolving user-submitted question errors.
* *(Note: Every `.jsx` page file is accompanied by a CSS module like `LoginPage.module.css` for scoped, collision-free styling).*

**Components & Hooks (`admin/src/components/`, `admin/src/hooks/`):**
* [`AdminLayout.jsx`](./admin/src/components/AdminLayout.jsx): The persistent UI shell providing the sidebar navigation.
* [`MathPreview.jsx`](./admin/src/components/MathPreview.jsx): A utility component to live-preview LaTeX strings as mathematical formulas.
* [`useDebounce.js`](./admin/src/hooks/useDebounce.js): A custom React hook preventing excessive API calls during search typing.
* [`useMathJax.js`](./admin/src/hooks/useMathJax.js) & [`mathjax.js`](./admin/src/utils/mathjax.js): Abstractions for triggering MathJax typesetting passes on the DOM.
* [`AuthContext.jsx`](./admin/src/context/AuthContext.jsx): Provides global application state regarding the administrator's login status.

---

### 3. Student Portal (`/student`)
The highly optimized public-facing React SPA.

**Root Configuration Files:**
* [`student/package.json`](./student/package.json): Lists dependencies such as `react-helmet-async` (for SEO mapping) and `react-slick` (for UI carousels).
* [`student/vite.config.js`](./student/vite.config.js): Build processor script for the public application.

**Core React Code (`student/src/`):**
* [`main.jsx`](./student/src/main.jsx) & [`App.jsx`](./student/src/App.jsx): Entry points declaring public routes and SEO wrapper contexts.
* [`api.js`](./student/src/api.js): The Axios instance mapped to the backend public routes.

**Pages (`student/src/pages/`):**
* [`HomePage.jsx`](./student/src/pages/HomePage.jsx): The landing view showcasing platform capabilities.
* [`QuestionLibraryPage.jsx`](./student/src/pages/QuestionLibraryPage.jsx): The primary interactive module. Renders MCQs with complex filtering (Subject, Topic, Year, Difficulty).
* [`PYQResourcesPage.jsx`](./student/src/pages/PYQResourcesPage.jsx): Dedicated view curating Previous Year Questions dynamically.
* [`ArticleListPage.jsx`](./student/src/pages/ArticleListPage.jsx) & [`SinglePostPage.jsx`](./student/src/pages/SinglePostPage.jsx): Public blog rendering engine for server-slugified rich-text articles.
* [`SingleQuestionPage.jsx`](./student/src/pages/SingleQuestionPage.jsx): Direct link endpoint for deep-sharing individual questions.
* [`ResultsPage.jsx`](./student/src/pages/ResultsPage.jsx): Tally and assessment view presented after practice sessions.
* [`ReportIssuePage.jsx`](./student/src/pages/ReportIssuePage.jsx): The form communicating errata back to the administrators.

**Components (`student/src/components/`):**
* [`AITutor.jsx`](./student/src/components/AITutor.jsx): The chat interface querying the Gemini/Pinecone RAG pipeline.
* [`AwardCarousel.jsx`](./student/src/components/AwardCarousel.jsx) & [`SuccessCarousel.jsx`](./student/src/components/SuccessCarousel.jsx): Interactive highlight displays mapping data to Slider components.
* [`FloatingSocialBar.jsx`](./student/src/components/FloatingSocialBar.jsx): Persistent UI attachment for sharing links.
* [`Header.jsx`](./student/src/components/Header.jsx) & [`Footer.jsx`](./student/src/components/Footer.jsx): Global layout architecture.
* [`MathPreview.jsx`](./student/src/components/MathPreview.jsx): Renders LaTeX safely on the public side.
* [`PublicLayout.jsx`](./student/src/components/PublicLayout.jsx): The structural React Router outlet shell.
* [`SkeletonLoader.jsx`](./student/src/components/SkeletonLoader.jsx): Fallback UI blocks representing loading state before API resolution.
* [`StudentCard.jsx`](./student/src/components/StudentCard.jsx): Micro-component used within the carousels.

**Hooks, Data, & Utils (`student/src/hooks/`, `student/src/data/`, `student/src/utils/`):**
* [`useHasMounted.js`](./student/src/hooks/useHasMounted.js): Prevents hydration mismatches by tracking initial component mounts.
* [`resourceData.js`](./student/src/data/resourceData.js) & [`students.js`](./student/src/data/students.js): Static mock structures or initialization payloads.
* [`useMathJax.js`](./student/src/hooks/useMathJax.js) & [`mathjax.js`](./student/src/utils/mathjax.js): Rebuilding DOM nodes to render mathematical formulas on public questions.

---

## Local Development Setup

To replicate the production environment locally, please follow this strict sequence.

### Prerequisites
* **Node.js**: v18.0.0 or higher.
* **MongoDB**: A running local instance (`mongodb://localhost:27017`) or an Atlas cluster URI.
* **External APIs**: Valid API Keys required for:
  * Google Gemini (`GEMINI_API_KEY`)
  * Pinecone DB (`PINECONE_API_KEY`, `PINECONE_INDEX`)
  * Cloudinary (`CLOUDINARY_URL` / related keys for image hosting)

### 1. Configure the Environment
Ensure your root `.env` (or internal `backend/.env`) file exists and is populated.
```env
PORT=3001
MONGODB_URI=your_mongodb_cluster_string
JWT_SECRET=super_secret_jwt_string_here
NODE_ENV=development

# Allow CORS during development
STUDENT_URL=http://localhost:5174
ADMIN_URL=http://localhost:5173
```

### 2. Bootstrapping the Services
Open three separate terminal windows to instantiate the micro-services.

**Terminal 1 (Backend API):**
```bash
cd backend
npm install
npm run dev
# The Node Server will boot and Mongoose will sync text indexes.
```
*(Optional Task)*: If you wish to test the RAG AI, execute the embedding seeder: `node scripts/seedEmbeddings.js` while the DB runs.

**Terminal 2 (Admin Panel):**
```bash
cd admin
npm install
npm run dev
# Access via http://localhost:5173
```

**Terminal 3 (Student Portal):**
```bash
cd student
npm install
npm run dev
# Access via http://localhost:5174
```

---

## CI/CD and Production Topology
This project is decoupled for maximum operational efficiency.

1. **Stateful Backend**: Designed for PAAS environments (Heroku, Render, AWS ECS). Requires environmental variable parity and secure IP whitelists to the MongoDB cluster.
2. **Stateless Frontends (Admin & Student)**: Both utilize Vite build processes (`npm run build`). The `dist/` folders are heavily optimized for Edge CDNs like **Vercel** or **Netlify**. Embedded `vercel.json` files intercept 404s and redirect to `/index.html` to perfectly support React Router's SPA history API without requiring a backend HTML server.

---

## Copyright and Proprietary Rights
© Maarula Classes. All rights reserved. 
The software code, algorithms, visual design, and data structures contained within this repository are proprietary. Unauthorized cloning, redistribution, or derivation is strictly prohibited by law.
