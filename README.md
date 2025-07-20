# WALWeP — Web Application for Learning Web Programming

**WALWeP** is a full-stack web-based educational platform designed to help Malaysian secondary school students learn Web Programming in Bahasa Malaysia. The platform is aligned with the official curriculum and textbooks, integrating learning content, quizzes, AI-assisted help, real-time collaboration, and coding practice.

## 🚀 Project Overview

WALWeP empowers students to master HTML, CSS, JavaScript, and web development fundamentals in an engaging, accessible environment. It leverages the Microsoft Azure AI Language Model for interactive question answering and uses MongoDB for robust data storage and tracking.

## 🎯 Objectives

- Provide structured **Malay-language syllabus** based on school textbooks.
- Allow **students** to learn at their own pace with real-time feedback.
- Enable **admins** to manage course content and quizzes.
- Integrate **AI QnA** to help students understand complex concepts.
- Offer **hands-on coding practice** via an embedded online code editor.

## 👥 System Actors

1. **Student**
   - Access syllabus lessons, quizzes, and online code editor
   - Ask questions in the chat room (AI or peer-based)
   - Track progress and retry failed quizzes

2. **Admin**
   - Add/edit lessons, examples, and quizzes
   - Monitor student progress
   - Manage user feedback

3. **Microsoft Azure Language Model**
   - Acts as an **AI Tutor**
   - Responds to student questions using trained Malay textbook content
   - Supports the **QnA chat room**

## 🧠 Key Features

- 📚 **Syllabus Module**: Presents lesson content in Bahasa Malaysia with figures, code samples, and summaries.
- 🧪 **Quiz Module**: Interactive MCQs with instant feedback, retry mechanism, and progress tracking.
- 💬 **AI Chat Room**: Students can ask textbook-related questions and receive accurate, context-aware answers.
- 💻 **Online Code Editor**: Integrated with CodeMirror, allowing students to try HTML/CSS/JS code in real-time.
- 👥 **User Progress Tracker**: Monitors lesson completion, quiz scores, and time spent.
- 🔐 **Authentication System**: Firebase Auth-based login and registration with user roles.
- 🌐 **Real-Time Collaboration**: Includes chat support and AI conversation logs for continuous learning.

## 🧰 Tech Stack

### 🔹 Frontend
- Vue.js 3 (SPA)
- Vue Router
- CodeMirror (Code editor)

### 🔹 Backend
- Node.js + Express.js
- Firebase Authentication
- Microsoft Azure QnA Maker (AI model)
- MongoDB (Cloud)

### 🔹 Deployment
- Frontend & Backend: Railway.app
- Database: MongoDB Atlas

## 🛠️ Setup Instructions

### Prerequisites
- Node.js
- npm
- MongoDB Atlas account
- Firebase project
- Microsoft Azure Language Studio account

### Installation Steps

1. **Clone the repository**
```bash
git clone https://github.com/Alvinleow/WALWeP.git
cd walwep
```

2. **Install backend dependencies**
```bash
cd back-end
npm install
```

3. **Install frontend dependencies**
```bash
cd front-end
npm install
```

4. **Start the development servers**
```bash
# Backend
npm run server

# Frontend
npm run clientDev

# With concurrently
npm run startDev
```
