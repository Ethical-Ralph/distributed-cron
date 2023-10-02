# Distributed Cron Job System

A resilient and scalable architecture for managing scheduled tasks across multiple machines.

![Distributed Cron System Architecture](https://cdn.hashnode.com/res/hashnode/image/upload/v1696004917836/ad22aba1-4fca-4b61-8c38-bcc2ff408509.png?auto=compress,format&format=webp)

For a detailed explanation and reasoning behind the architecture and design choices, please refer to this [article](https://blog.ethicalralph.me/cron-jobs-at-scale-using-mongodb-redis-and-kafka).

## Prerequisites

- MongoDB
- Kafka
- Redis
- Node.js

## Setup Instructions

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/Ethical-Ralph/distributed-cron
   cd distributed-cron
   ```

2. **Install Dependencies**:

   ```bash
   npm install
   ```

3. **Environment Variables:**

   Copy the `.env.example` file to create your own `.env` file and configure the variables as per your setup.

   ```bash
   cp .env.example .env
   ```

## Starting the Application

1. **Start the Job Scheduler**:

   Run the following command to start an instance of the scheduler

   ```bash
   npm run start-scheduler
   ```

   You can scale by initiating more scheduler instances as needed.

2. **Start Workers**:

   To start an instance of the worker:

   ```bash
   npm run start-worker
   ```

   You can scale by initiating more worker instances as needed.

3. **Adding Dummy Jobs**:

   To add test jobs to your system:

   ```bash
   node addJobs.js
   ```
