import { createRouter, createWebHistory } from "vue-router";
import MainPage from "../views/MainPage.vue";
import HomePage from "../views/HomePage.vue";
import AboutPage from "../views/AboutPage.vue";
import CourseMaterialsPage from "../views/CourseMaterialsPage.vue";
import CourseProgressPage from "../views/CourseProgressPage.vue";
import ContactPage from "../views/ContactPage.vue";
import ProfilePage from "../views/ProfilePage.vue";
import LessonPage from "../views/LessonPage.vue";
import CodeEditor from "../views/CodeEditor.vue";
import QuizPage from "../views/QuizPage.vue";
import QuestionsPage from "../views/QuestionsPage.vue";
import ChatRoom from "../views/ChatRoom.vue";
import QnAChatRoom from "../views/QnAChatRoom.vue";

const routes = [
  { path: "/", name: "MainPage", component: MainPage },
  { path: "/home", name: "HomePage", component: HomePage },
  { path: "/about", name: "AboutPage", component: AboutPage },
  {
    path: "/course-materials",
    name: "CourseMaterialsPage",
    component: CourseMaterialsPage,
  },
  { path: "/quizzes", name: "QuizPage", component: QuizPage },
  {
    path: "/course-progress",
    name: "CourseProgress",
    component: CourseProgressPage,
  },
  {
    path: "/contact",
    name: "ContactPage",
    component: ContactPage,
  },
  {
    path: "/profile/:id",
    name: "ProfilePage",
    component: ProfilePage,
    props: true,
  },
  {
    path: "/lessons/:courseId",
    name: "Lessons",
    component: LessonPage,
    props: true,
  },
  {
    path: "/code-editor",
    name: "CodeEditor",
    component: CodeEditor,
  },
  {
    path: "/quizzes/:quizId",
    name: "QuestionsPage",
    component: QuestionsPage,
  },
  {
    path: "/chat/:otherUserId",
    name: "ChatRoom",
    component: ChatRoom,
    props: true,
  },
  {
    path: "/qna-chat",
    name: "QnAChatRoom",
    component: QnAChatRoom,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
