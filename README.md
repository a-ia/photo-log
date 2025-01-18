# photo-log
Hello! "photo log" is currently a work in progress. 
It is designed to be a lightweight, web-based photo logging system designed for simplicity, offline functionality, and easy integration with existing projects.

--- 

## Features
- **Easy Integration**: Can be seamlessly added to an existing Express server or run as a standalone Docker container.
- **Photo Tagging & Analytics**: Use a tag system to categorize photos and gain insights.
- **Compact Storage**: Logs are efficiently stored in an SQLite database, containing photo, title, description, date, and tags.
- **Offline Support**: Works offline after the initial load, synchronizing logs once the connection is restored.
- **Optimized for the Network**: Lightweight log requests ensure minimal bandwidth usage.

---

## Usage

### Into an Express Server
The idea is to include **Photo Log** as a module in your existing or new Express server. After installing dependencies and setting up the `.env` configuration, you can add `server.js` from this project to handle photo logging routes and start your server.

### As a Standalone Docker Container
Alternatively you can deploy **Photo Log** using Docker Compose. Configure the database directory, user access, and default admin token in the provided `docker-compose.yaml` and `.env` files. Start the container to host the photo log as a dedicated service.

---

## Security
- Authentication for editing is secured via a token-based system (configured in the `.env` file).
- Logs are stored in an SQLite database.

---

## Dev Note
This project is actively being developed, and new features, enhancements, and updates are planned.

---

# Photo Log Development: A Visual Progression of the UI
## Main Page after authentication, with upload function
![screenshot-one](https://github.com/user-attachments/assets/e2d85ffd-5476-419f-b57b-a9ca6c87dc39)
## Creating a new Photo Log
![screenshot-two](https://github.com/user-attachments/assets/094597f6-5bd0-43ca-96dd-b85225a48517)
## Succesful message
![screenshot-three](https://github.com/user-attachments/assets/ee408d88-971f-4e8b-aafd-c8067ae291d7)
## Redirect to updated Main Page
![screenshot-four](https://github.com/user-attachments/assets/dea9f1ab-cc92-4195-8ae2-0d8c59964c0e)

