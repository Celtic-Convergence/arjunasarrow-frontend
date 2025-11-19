# Arjuna's Arrow - E-Learning Platform

## Project Overview

**Arjuna's Arrow** is a comprehensive e-learning platform focused on economics education, built with Next.js and AWS services. The platform serves both students and administrators with course management, content delivery, and user administration features.

### Key Features
- **Student Portal**: Course browsing, content access (PDFs, videos), notifications
- **Admin Dashboard**: Complete course management, user administration, notification system
- **Secure Content Delivery**: AWS CloudFront with signed URLs for protected content
- **Authentication**: AWS Cognito with role-based access control
- **Responsive Design**: Mobile-first approach with Material-UI components

## Tech Stack & Architecture

### Frontend Framework
- **Next.js 15.1.0** with TypeScript
- **Static Export** (`output: 'export'`) for deployment flexibility
- **SSG/SSR** hybrid approach for performance

### UI & Styling
- **Material-UI (MUI) v5** with custom theming
- **Emotion** for CSS-in-JS styling
- **Framer Motion** for animations
- **React Slick** for carousels

### Authentication & Authorization
- **AWS Cognito** for user management
- **AWS Amplify** for auth integration
- **Role-based access**: Admin vs Student permissions
- **JWT tokens** for API authentication

### Content Management
- **AWS S3** for file storage
- **AWS CloudFront** with signed URLs for secure content delivery
- **PDF.js** integration for in-browser PDF viewing
- **Video.js** for video playback with security measures

### State Management
- **React Context** for auth state
- **Custom hooks** for data fetching and state management
- **Local storage** for session caching

### Development Tools
- **TypeScript** with strict configuration
- **ESLint + Prettier** for code quality
- **Git** for version control

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── auth/            # Authentication guards
│   ├── content/         # PDF/Video viewers
│   ├── dashboard/       # Admin dashboard components
│   ├── home/            # Landing page components
│   ├── loading/         # Loading states & spinners
│   └── ...
├── contexts/            # React Context providers
├── hooks/               # Custom React hooks
├── lib/                 # External service configurations
├── pages/               # Next.js pages (file-based routing)
├── styles/              # Global styles
├── types/               # TypeScript definitions
└── utils/               # Helper functions
```

## Environment & Configuration

### Environment Variables Required
```bash
# Cognito Authentication
NEXT_PUBLIC_COGNITO_USER_POOL_ID=your_user_pool_id
NEXT_PUBLIC_COGNITO_CLIENT_ID=your_client_id

# API Configuration  
DEV_API_BASE_URL=https://dev-api.arjunasarrow.in/v1
PROD_API_BASE_URL=https://api.arjunasarrow.in/v1

# Google Analytics (optional)
NEXT_PUBLIC_GA_ID=your_ga_id
```

### Build Configuration
- **Multiple environments**: `.env.dev`, `.env.prod`
- **Build scripts**: `npm run build:dev`, `npm run build:prod`
- **Deployment**: Static export compatible with Vercel, S3, CloudFront

## Key Components & Features

### Authentication System
- **AuthContext**: Global auth state management
- **AuthGuard**: Route protection component  
- **Session caching**: 5-minute localStorage cache
- **Auto-refresh**: Background token refresh

### Content Delivery
- **PDFViewer**: Secure PDF rendering with react-pdf-viewer
- **MobilePDFViewer**: Mobile-optimized PDF experience
- **SecureVideoPlayer**: Protected video streaming
- **ContentPlayer**: Unified content player component

### Dashboard Features
- **Multi-tab interface**: Courses, Notifications, Users, Groups
- **Course management**: Create/edit courses, books, chapters
- **User administration**: Invite users, manage groups, reset passwords
- **Notification system**: Create announcements with file attachments
- **File upload**: Presigned S3 URLs for secure uploads

### Loading & UX
- **Smart loading states**: Different strategies for different wait times
- **Progressive loading**: Show content as it becomes available
- **Educational content**: Economics facts during long loads
- **Mobile optimization**: Touch-friendly responsive design

## API Integration

### Backend Services
- **Base URL**: `https://api.arjunasarrow.in/v1` (prod)
- **Authentication**: JWT Bearer tokens from Cognito
- **Content Security**: Time-limited signed URLs (30min-2hr expiration)

### Key Endpoints
- `GET /v1/course` - Course data (role-based response)
- `GET /v1/chapters/{id}` - Chapter details with signed URLs
- `POST /v1/upload` - Generate upload URLs (admin only)
- `GET /v1/notifications` - Paginated notifications
- See `API_ENDPOINT_DOCUMENTATION.md` for complete reference

## Development Guidelines

### Code Organization
- **Component co-location**: Keep related files together
- **Custom hooks**: Extract reusable logic
- **TypeScript strict**: Maintain type safety
- **File naming**: kebab-case for files, PascalCase for components

### Performance Considerations
- **Dynamic imports**: Code splitting for large components
- **Image optimization**: Use Next.js Image component
- **Bundle analysis**: Monitor build sizes
- **Caching strategies**: Leverage browser and CDN caching

### Security Features
- **Route protection**: Middleware-level auth checks
- **Content security**: Signed URLs prevent direct access
- **Input validation**: Client and server-side validation
- **XSS protection**: Sanitized content rendering

## Common Development Tasks

### Adding New Components
1. Create component in appropriate `/components` subdirectory
2. Export from `index.ts` for clean imports
3. Add TypeScript interfaces in `/interfaces` if needed
4. Include in storybook/documentation as needed

### API Integration
1. Create custom hook in `/hooks`
2. Use `useApiClient` for authenticated requests
3. Handle loading states and error scenarios
4. Update TypeScript types in `/types`

### Authentication Flow
1. Users authenticate via AWS Cognito
2. JWT tokens stored in Amplify session
3. API calls include Bearer token
4. Middleware checks protect routes

### Content Management
1. Admins upload files via presigned S3 URLs
2. Files organized by course/book/chapter structure
3. Signed URLs generated on-demand with expiration
4. CloudFront CDN for global delivery

## Deployment

### Build Process
```bash
npm run build:prod    # Build for production
npm run start        # Start production server
npm run lint         # Code quality checks
```

### Static Export
- Configured for static site generation
- Compatible with Vercel, AWS S3, CloudFront
- Custom 404 handling for SPA routing

### Performance Optimization
- Webpack optimizations for PDF.js
- Image optimization disabled for static export
- Bundle splitting for optimal loading

## Recent Changes & Migration Notes

### AWS Cognito Migration
- **Status**: Complete migration from Supabase to AWS Cognito
- **Impact**: All authentication flows updated
- **Documentation**: See `COGNITO_MIGRATION_GUIDE.md`

### Static Export Configuration
- **Reason**: Deployment flexibility across platforms
- **Trade-offs**: No server-side rendering for dynamic content
- **Benefits**: Better performance, simplified deployment

### Mobile PDF Experience
- **Enhancement**: Dedicated mobile PDF viewer
- **iOS Focus**: Special handling for iOS Safari limitations
- **Documentation**: See `ios_pdf_fullscreen_solutions.md`

## Troubleshooting Common Issues

### Authentication Issues
- Check Cognito environment variables
- Verify user pool configuration
- Clear localStorage cache if needed

### Content Loading Issues
- Verify signed URL expiration
- Check CloudFront distribution settings
- Ensure proper CORS configuration

### Build Issues
- Clear `.next` folder: `npm run clean`
- Verify TypeScript configuration
- Check for missing dependencies

## Future Considerations

### Potential Improvements
- **Real-time features**: WebSocket integration for live notifications
- **Offline support**: Service worker for content caching
- **Analytics**: Enhanced user behavior tracking
- **Internationalization**: Multi-language support

### Scalability Notes
- **Database**: Current API handles data persistence
- **CDN**: CloudFront provides global content delivery
- **Authentication**: Cognito scales automatically
- **File storage**: S3 provides unlimited storage capacity

---

## Quick Start for New Developers

1. **Clone and Install**
   ```bash
   git clone <repository>
   npm install
   ```

2. **Environment Setup**
   - Copy `.env.example` to `.env.dev`
   - Add required Cognito and API credentials

3. **Start Development**
   ```bash
   npm run dev:dev
   ```

4. **Key Files to Understand**
   - `/src/pages/_app.tsx` - App configuration
   - `/src/contexts/AuthContext.tsx` - Authentication state
   - `/src/pages/dashboard.tsx` - Main admin interface
   - `/middleware.ts` - Route protection

5. **Documentation to Read**
   - `API_ENDPOINT_DOCUMENTATION.md` - Complete API reference
   - `COGNITO_MIGRATION_GUIDE.md` - Authentication system details
   - `/src/components/loading/README.md` - Loading UX guidelines

This codebase represents a mature e-learning platform with enterprise-grade security, performance optimizations, and comprehensive admin capabilities. The architecture is designed for scalability and maintainability, with clear separation of concerns and extensive documentation.