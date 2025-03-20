# IRB Chatbot Docker Deployment

This document provides instructions for deploying the IRB Chatbot application using Docker and Docker Compose.

## Prerequisites

- Docker and Docker Compose installed on your server
- For GPU support: NVIDIA Container Toolkit installed (for GPU acceleration with Ollama)

## Deployment Steps

### 1. Clone the repository

```bash
git clone <repository-url>
cd irb-chatbot
```

### 2. Configure environment variables (optional)

The default configuration should work out of the box, but you can modify the `.env.production` file if needed.

### 3. Deploy with Docker Compose

```bash
docker-compose up -d
```

This will:
- Build the frontend container
- Pull and start the Ollama container
- Set up networking between containers
- Mount a persistent volume for Ollama models

### 4. Access the application

The application will be available at `http://<your-server-ip>` (port 80).

## Configuration Options

### GPU Support

The docker-compose.yml file includes configuration for GPU support. If you don't have a GPU or don't want to use it, you can remove the `deploy` section from the Ollama service.

### Custom Models

To use custom models with Ollama, you can SSH into the server and run:

```bash
docker exec -it irb-chatbot-ollama-1 ollama pull <model-name>
```

Then update the default model in the application settings.

### Ports

By default, the application runs on port 80. To change this, modify the `ports` section in the docker-compose.yml file:

```yaml
ports:
  - "8080:80"  # Change 8080 to your desired port
```

## Troubleshooting

### Viewing Logs

```bash
# View all logs
docker-compose logs

# View logs for a specific service
docker-compose logs frontend
docker-compose logs ollama
```

### Restarting Services

```bash
docker-compose restart frontend
docker-compose restart ollama
```

### Rebuilding After Changes

```bash
docker-compose build frontend
docker-compose up -d
```