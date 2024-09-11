# File Management Dashboard

A modern, responsive file management dashboard built with React and Next.js.

## Features

- Display files in a sortable, paginated table
- Search functionality
- File upload, edit, and delete operations
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

## API Requirements

This component expects a backend API with the following endpoint:

- `GET /api/files`: Fetch files with pagination, sorting, and search parameters

## Customization

The `FileTable` component can be easily customized by modifying the UI components or adjusting the API integration.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
