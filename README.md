Task Management System - Microservices Architecture
A full-stack, scalable task management application built with a modern microservices architecture, containerized with Docker, and deployed on AWS.

🚀 About The Project
This project is a complete task management solution designed to demonstrate a real-world implementation of a microservices architecture. The application is fully containerized using Docker and Docker Compose, making it easy to develop, test, and deploy consistently across different environments. It features a separate frontend, a user authentication service, and a task management service, all orchestrated behind an Nginx reverse proxy.

✨ Features
User Authentication: Secure user registration and login with JWT-based sessions stored in HTTP-only cookies.

Full CRUD for Tasks: Users can Create, Read, Update, and Delete their tasks.

Microservices Architecture: Independent services for User Management and Task Management for scalability and separation of concerns.

Centralized API Gateway: Nginx acts as a reverse proxy, directing traffic to the appropriate backend service.

Responsive Frontend: A clean and modern user interface built with Next.js and Tailwind CSS.

Containerized: Fully containerized with Docker for consistent development and production environments.

Cloud-Ready: Designed for and deployed on AWS EC2.

🛠️ Tech Stack & Architecture
Technology Used
Component

Technology

Frontend

Next.js, React, Tailwind CSS, Axios

Backend

Node.js, Express.js, JWT, Mongoose

Database

MongoDB (via MongoDB Atlas)

Infrastructure

Docker, Docker Compose, Nginx (Reverse Proxy)

Deployment

Amazon Web Services (AWS) EC2

Architecture Diagram
The application follows a classic microservice pattern with a reverse proxy.

+-------------------------------------------------------------+
|                        User's Browser                       |
+-------------------------------------------------------------+
                            |
                            | (HTTP Requests)
                            |
+-------------------------------------------------------------+
|                      AWS EC2 Server (Port 80)                 |
|                                                             |
|   +-------------------------------------------------------+ |
|   |                 NGINX Reverse Proxy                   | |
|   +-------------------------------------------------------+ |
|       /          |               |               |          |
|      /           | (/api/users)  | (/api/tasks)  |          |
|     /            |               |               |          |
+----/-------------+---------------+---------------+----------+
     |             |               |               |
(Serves a static frontend)   (Forwards to User Service) (Forwards to Task Service)
     |             |               |               |
+----v-------------+----v----------+----v----------+----------+
| Docker Network                                              |
|                                                             |
| +----------------+ +----------------+ +----------------+   |
| | Client Service | | User Service   | | Task Service   |   |
| | (Next.js)      | | (Node.js)      | | (Node.js)      |   |
| | Port: 3000     | | Port: 8001     | | Port: 8002     |   |
| +----------------+ +----------------+ +----------------+   |
|                                                             |
+-------------------------------------------------------------+

🏁 Getting Started
To get a local copy up and running, follow these simple steps.

Prerequisites
Git

Node.js

Docker and Docker Compose

Local Installation
Clone the repository:

git clone [https://github.com/upansh522.taskManagement.git](https://github.com/upansh522.taskManagement.git)
cd task_management

Create the environment file:
Create a file named .env in the root of the project and add your secret keys.

# .env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key

Configure for Local Development:
Ensure that all URLs in your docker-compose.yml file are set to http://localhost.

Build and Run the Containers:
This command will build the images from the Dockerfiles and start all the services.

docker-compose up --build

Access the application:
Open your browser and navigate to http://localhost.

🚀 Deployment
This application is deployed on an Amazon EC2 instance. The deployment process involves:

Provisioning an EC2 instance (e.g., t3.micro running Ubuntu).

Configuring the security group to allow HTTP (port 80) and SSH (port 22) traffic.

Installing Docker, Docker Compose, and Git on the server.

Cloning the repository from GitHub.

Creating the .env file with production secrets.

Updating the docker-compose.yml file with the server's public IP address.

Running docker-compose up --build -d to build and launch the application in the background.

Project Link: http://ec2-13-60-61-43.eu-north-1.compute.amazonaws.com/login
