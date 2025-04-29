

## Project info
This is a simple task management system that uses typescript,javascript and a some css and html. The web app has tasks categorized in different groups;pending,completed,deffered and ongoing tasks. They also have a priority from low to high. It has notifications turned on once a times task has arrived and the countdown is available in hours.Enjoy the project by testing it yourself.

## How can I edit this code?
You can directly download the zip here and find all codes and componenrs.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone https://github.com/h-hiram/Task-Management-App

Step 2: Navigate to the project directory.
cd Task-Management-App

Step 3: Install the necessary dependencies.
npm iinstall

Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev

Acces the app in your browser through http://localhost:8080
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
Another method To run the app on a mobile device:
if you have a server in your local host,you can connect you phone to your pc provided you are in the same network using your pc's ip address and the apps port number (http://<YOUR PC IP>/<PORTNUMBER>
### Updating the app after changes

After making changes to your web code:

1. Build the project: `npm run build`
2. Sync changes to the native project: `npx cap sync`
3. Open and run the project again

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Capacitor (for mobile apps)

