# Delete node_modules and package-lock.json to start fresh
rm -rf node_modules package-lock.json

# Install dependencies with legacy peer deps to resolve conflicts
npm install --legacy-peer-deps

# Initialize shadcn/ui (if needed)
npx shadcn@latest init

# Add the specific components we need
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add card
npx shadcn@latest add alert
npx shadcn@latest add badge
