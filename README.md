
# Workout Tracker

A Flask-based workout tracker designed to demonstrate backend and DevOps practices such as containerization, infrastructure as code, AWS deployment, and automated CI/CD using Docker, Terraform, AWS EC2, and GitHub Actions.

## Features

- Log workouts by muscle group, exercise name, weight, and reps
- View exercise history with weight/reps/date for each session
- Automatic PR (personal record) detection based on estimated 1-rep max
- Update the most recent entry for an exercise
- Delete an exercise and all of its logged history

## Infrastructure & Deployment

The application is deployed to AWS EC2 using Docker and Docker Compose. Terraform is used to set up the required AWS infrastructure, while Docker Compose manages the Flask application and PostgreSQL containers on the EC2 instance.
The deployment pipeline is automated using GitHub Actions. Whenever code is pushed to the main branch, the workflow:

1. Checks out the latest code.
2. Configures AWS credentials using GitHub Secrets.
3. Builds the Docker image and pushes it to Amazon ECR.
4. Copies the Docker Compose configuration to the EC2 instance.
5. Connects to the EC2 instance through SSH.
6. Authenticates Docker with Amazon ECR.
7. Stops the existing containers and removes unused Docker images.
8. Starts the updated application using Docker Compose and pulls the latest image from ECR.

**Deployment flow**
GitHub → GitHub Actions → Amazon ECR → AWS EC2 → Docker Compose → Flask + PostgreSQL

## Architecture

The frontend (vanilla JS, HTML, CSS) runs in the user's browser and communicates with a Flask backend over a REST API. Flask and PostgreSQL each run in their own Docker container, managed by Docker Compose on a single EC2 instance. This keeps the two isolated from each other while still letting Flask reach the database over the container's internal network.

**Request flow:**
Browser (JS/fetch) → Flask API (Docker container) → PostgreSQL (Docker container) → response back to browser


## Tech Stack

**Backend:** Flask, SQLAlchemy, Flask-Migrate
**Frontend:** Vanilla JavaScript, HTML, CSS – communicates with the backend via a REST API (fetch/JSON)
**Infrastructure:** Docker, Docker Compose (multi-container orchestration), Terraform (infrastructure as code), AWS EC2, Amazon ECR
**CI/CD:** GitHub Actions

## Setup / Running Locally

**Requirements:** Docker and Docker Compose installed.

1. Clone the repository:
```bash
   git clone https://github.com/GoncaloCarvalho123/Workout_tracker.git
   cd Workout_tracker
```

2. Create a `.env` file in the project root:
POSTGRES_USER=your_username
POSTGRES_PASSWORD=your_password
POSTGRES_DB=workout_tracker
DATABASE_URL=postgresql://your_username:your_password@db/workout_tracker

3. Start the app:
```bash
   docker compose up
```

4. Visit `http://localhost:5555` in your browser.

## Known Limitations / Future Work

**Limitations**
- No authentication/authorization – all API routes are currently open
- The application runs on a single EC2 instance, creating a single point of failure
- Deployments do not currently include automated health checks or rollback functionality
- Flask-Migrate/Alembic is set up but not fully integrated – schema changes are currently handled manually

**Future Work**
- Add authentication so workouts are tied to individual user accounts
- Add automated deployment health checks and rollback functionality
- Implement infrastructure CI/CD to automatically validate and apply Terraform changes
- A progress graph showing each exercise's estimated 1RM over time
- Automated tests (unit tests for API routes, at minimum)