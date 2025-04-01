

## Project info

**URL**: https://lovable.dev/projects/391b2d48-9d9b-48e6-a563-c650bebfc859

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/391b2d48-9d9b-48e6-a563-c650bebfc859) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

## Mobile Installation Instructions

To run the app on a mobile device:

1. Transfer the project to your GitHub repository using the "Export to GitHub" button
2. Git pull the project from your own GitHub repository
3. Run `npm install` to install all dependencies
4. Add iOS and/or Android platforms:
   - For Android: `npx cap add android`
   - For iOS: `npx cap add ios` (requires macOS with Xcode)
5. Build the project: `npm run build`
6. Sync the web code to the native project: `npx cap sync`
7. Open and run the project:
   - For Android: `npx cap open android` (requires Android Studio)
   - For iOS: `npx cap open ios` (requires Xcode)

### Updating the app after changes

After making changes to your web code:

1. Build the project: `npm run build`
2. Sync changes to the native project: `npx cap sync`
3. Open and run the project again

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Capacitor (for mobile apps)

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/391b2d48-9d9b-48e6-a563-c650bebfc859) and click on Share -> Publish.

## I want to use a custom domain - is that possible?

We don't support custom domains (yet). If you want to deploy your project under your own domain then we recommend using Netlify. Visit our docs for more details: [Custom domains](https://docs.lovable.dev/tips-tricks/custom-domain/)
