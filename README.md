# ToDo App – Breakable Toy I

This is a full-stack web application built with:

- 🖥️ **Frontend**: Vite + React (Port: 8080)
- ⚙️ **Backend**: Spring Boot + Maven (Port: 9090)

---
## 📋 Project Description

This app allows users to manage their daily tasks efficiently. It includes the following features:

- ✅ Full **CRUD operations** on todos (Create, Read, Update, Delete)
- 🔄 **Mark todos as done or undone**
- 🔍 **Filter** todos based on status (done/undone) and priority (low, medium, high)
- 📄 **Pagination** for scalable todo lists
- 📊 **Average completion time** calculation based on:
  - Time between the todo's creation date and its done date
---

## 📦 Backend – Spring Boot

### ✅ Requirements

- Java 17 or higher
- Maven installed (`mvn -v` to check)

### ▶️ Run the backend

```bash
mvn spring-boot:run
```
The backend will be available at:
📍 http://localhost:9090

🧪 Run backend tests
```bash
mvn test
```

## 💻 Frontend – Vite + React
### ✅ Requirements
Node.js (v18+ recommended)

npm (comes with Node)

### ▶️ Install dependencies
```bash
cd [frontend-folder]
npm install
```
### ▶️ Run the frontend
```bash
npm run start
```
The frontend will be available at:
📍 http://localhost:8080
