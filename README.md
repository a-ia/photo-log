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
## Main Page before authentication
![image](https://github.com/user-attachments/assets/88e502ca-d4e8-400f-9138-f21b829fa069)
## Main Page after authentication, with upload access
![image](https://github.com/user-attachments/assets/9707bd85-5916-4289-9010-536d5a6c2874)
## Creating a new Photo Log
![image](https://github.com/user-attachments/assets/b17d9245-427a-45dc-8c8e-3e19d7fe890b)
## Redirect to updated Main Page
![image](https://github.com/user-attachments/assets/1e0df000-cc0b-4662-9be5-18f0782c33df)
## Darkmode theme: Ooo, that's more like it!
![image](https://github.com/user-attachments/assets/2e091c77-ddf7-45c8-8a1a-ae5f06015fc1)

