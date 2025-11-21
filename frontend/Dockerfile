FROM node:20-bullseye

# Work directory
WORKDIR /app

# Copy dependencies first (better cache)
COPY package*.json ./
RUN npm install

# Copy everything else
COPY . .

# Build production files
RUN npm run build

# Install a simple web server
RUN npm install -g serve

# Expose production port
EXPOSE 5173

# Serve production build
CMD ["serve", "-s", "dist", "-l", "5173"]