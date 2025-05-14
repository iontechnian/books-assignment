# Books Assignment

## Setup
```bash
# Copy the example environment file
cp .env.example .env
# Edit .env file with your database credentials if needed

# Deploy local MySQL Database
docker-compose up -d

# Optional: Populates database with seeded models
npm run seed
```

## Running
```bash
npm run dev
```