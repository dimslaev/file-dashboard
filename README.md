# File Management Dashboard

A modern, responsive file management dashboard built with React and Next.js.

[See it in action](https://file-dashboard-em4n.vercel.app/).

## Features

- Display files in a sortable, paginated table
- File upload, edit, and delete operations
- Search functionality
- Bulk selection and actions
- Responsive design for mobile and desktop

## Tech Stack

- React
- Next.js
- TypeScript
- Tanstack React Query
- Axios
- date-fns
- Tailwind CSS
- Shadcn UI components

## Areas for improvement

1. Uploading multiple files is not yet possible

2. Responsive needs more work, mainly:

- The UI is too minimal (reduced) for mobile screens
- At around 800px, parts of the table might not be fully visible.

3. Should split the main component `app/page.tsx` in smaller components, and improve folder structure.

4. Should use authentication and more secure policies for storage.

5. Should add a script for seeding / uploading some sample files.
