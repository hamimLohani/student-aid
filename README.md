# Student Aid BDG

Student Aid BDG is a student community platform built to help members stay connected, discover activities, read announcements, and submit join requests through a clean web interface.

## Description

This project was built as a practical community website for Student Aid BDG. It includes a public-facing site for members and visitors, along with an admin dashboard for managing content and reviewing membership requests.

The platform focuses on:
- community connection
- activity sharing
- announcements and updates
- membership onboarding
- admin-side content management

## Features

- Home page with community overview and call-to-action sections
- Member directory with search and filters
- Member profile pages
- Announcements page with likes and comments
- Activities page with event cards and image galleries
- Join request form with image upload
- Admin dashboard for:
  - adding and editing members
  - posting announcements
  - creating activities
  - approving or rejecting join requests
- Automatic cleanup of approved join requests after 24 hours
- Light and dark mode support

## Tech Stack

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env.local` file and add the required environment variables:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
```

3. Start the development server:

```bash
npm run dev
```

4. Open `http://localhost:3000`

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Project Structure

```text
app/           Next.js app routes and pages
components/    Shared UI components
context/       Authentication and theme providers
lib/           Firebase and Cloudinary helpers
```

## Purpose

The goal of this project is to provide a simple and practical digital space for a student community, where members can stay informed, engage with updates, and grow their network.

## Author

**Md. Inzamamul Lohani**  
Software Engineering, University of Dhaka
