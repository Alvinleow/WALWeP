<template>
  <div class="main">
    <LoadingModal :visible="isLoading" />
    <div class="lesson-page">
      <NavBar />
      <div class="lesson-content">
        <div class="sidebar">
          <ul>
            <li
              v-for="(lesson, index) in lessons"
              :key="lesson._id"
              @click="selectLesson(lesson, index)"
              :class="{
                viewed: lesson.status === 'viewed',
                'not-viewed': lesson.status === 'not viewed',
              }"
            >
              Lesson {{ index + 1 }}: {{ lesson.title }}
            </li>
          </ul>
        </div>
        <div class="content">
          <div class="action-buttons" v-if="isAdmin">
            <button class="btn-green btn-icon" @click="showAddLessonModal">
              <i class="fas fa-plus-circle"></i> Add New Lesson
            </button>
            <button
              class="btn-green btn-icon"
              v-if="selectedLesson"
              @click="showEditLessonModal"
            >
              <i class="fas fa-edit"></i> Edit Lesson Content
            </button>
            <button
              class="btn-red btn-icon"
              v-if="selectedLesson"
              @click="showDeleteLessonModal"
            >
              <i class="fas fa-trash"></i> Delete Lesson
            </button>
          </div>

          <div v-if="selectedLesson" class="lesson-container">
            <h3 class="lesson-title">{{ selectedLesson.title }}</h3>
            <div v-html="selectedLesson.content" class="lesson-text"></div>
            <div v-if="selectedLesson.codeExample">
              <h4 class="example-title">Example Code:</h4>
              <div class="example-box">
                <pre class="example-code">{{ selectedLesson.codeExample }}</pre>
              </div>
              <button
                v-if="selectedLesson.codeExample"
                class="btn-green btn-icon try-button"
                @click="tryExample"
              >
                <i class="fas fa-terminal"></i> Try it Yourself
              </button>
            </div>
          </div>
          <div v-else class="empty-content-message">
            <h2>Please select a lesson to view or edit its content.</h2>
          </div>
          <div class="lesson-navigation" v-if="selectedLesson">
            <button
              class="btn-green btn-icon"
              v-if="selectedLessonIndex > 0"
              @click="previousLesson"
            >
              <i class="fas fa-arrow-left"></i> Previous Lesson
            </button>

            <div class="spacer"></div>

            <button
              class="btn-green btn-icon"
              v-if="selectedLessonIndex < lessons.length - 1"
              @click="nextLesson"
            >
              Next Lesson <i class="fas fa-arrow-right"></i>
            </button>

            <button
              class="btn-green btn-icon"
              v-if="selectedLessonIndex === lessons.length - 1"
              @click="finishCourse"
            >
              <i class="fas fa-flag-checkered"></i> Finish Course
            </button>
          </div>
        </div>
      </div>

      <!-- Add Lesson Modal -->
      <div v-if="showAddLessonModalWindow" class="modal-overlay">
        <div class="modal">
          <h2>Add New Lesson</h2>
          <form @submit.prevent="addLesson">
            <div>
              <label for="lessonTitle">Lesson Title:</label>
              <input
                type="text"
                id="lessonTitle"
                v-model="newLessonTitle"
                required
              />
            </div>
            <button type="submit">Add Lesson</button>
            <button type="button" @click="closeAddLessonModal">Cancel</button>
          </form>
        </div>
      </div>

      <!-- Edit Lesson Modal -->
      <div v-if="showEditLessonModalWindow" class="modal-overlay">
        <div class="modal">
          <h2 style="text-align: center">Edit Lesson Content</h2>
          <div ref="quillEditor" class="quill-editor"></div>

          <label>Code Example (HTML/CSS/JS):</label>
          <div ref="codeEditor" class="code-editor-container"></div>

          <button @click="saveLessonContent">Save</button>
          <button type="button" @click="closeEditLessonModal">Cancel</button>
        </div>
      </div>

      <!-- Delete Lesson Confirmation Modal -->
      <div v-if="showDeleteLessonModalWindow" class="modal-overlay">
        <div class="modal">
          <h2>Are you sure you want to delete this lesson?</h2>
          <button @click="deleteLesson">Yes</button>
          <button type="button" @click="closeDeleteLessonModal">No</button>
        </div>
      </div>

      <!-- Finish Course Modal -->
      <div v-if="showFinishModal" class="modal-overlay">
        <div class="modal">
          <h2>{{ finishMessage }}</h2>
          <button @click="goHome">
            <i class="fas fa-home"></i> Back to Home
          </button>
          <button @click="attemptQuiz">
            <i class="fas fa-question-circle"></i> Attempt Now
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import NavBar from "../components/NavBar.vue";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { mapState } from "vuex";

import CodeMirror from "codemirror";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/monokai.css";
import "codemirror/mode/htmlmixed/htmlmixed.js";

export default {
  name: "LessonPage",
  components: {
    NavBar,
  },
  data() {
    return {
      isLoading: false,
      lessons: [],
      showAddLessonModalWindow: false,
      showEditLessonModalWindow: false,
      showDeleteLessonModalWindow: false,
      showFinishModal: false,
      newLessonTitle: "",
      editableCodeExample: "",
      codeMirrorInstance: null,
      selectedLesson: null,
      selectedLessonIndex: -1,
      quill: null,
      finishMessage: "",
      courseId: this.$route.params.courseId,
    };
  },
  computed: {
    ...mapState({
      userId: (state) => (state.user ? state.user._id : null),
      accountLevel: (state) => (state.user ? state.user.accountLevel : null),
    }),
    isAdmin() {
      return this.accountLevel === 1;
    },
  },
  async created() {
    await this.fetchLessons();
    await this.fetchUserProgress();
  },
  methods: {
    async fetchLessons() {
      this.isLoading = true;
      try {
        const response = await axios.get(
          `http://localhost:8081/api/courses/${this.courseId}`
        );
        this.lessons = response.data.lessons;
      } catch (error) {
        console.error("Error fetching lessons:", error);
      } finally {
        this.isLoading = false;
      }
    },
    async fetchUserProgress() {
      this.isLoading = true;
      try {
        const response = await axios.get(
          `http://localhost:8081/api/userProgress/${this.userId}/${this.courseId}`
        );
        if (response.data && response.data.lessonStatuses) {
          this.lessons.forEach((lesson) => {
            const progress = response.data.lessonStatuses.find(
              (ls) => ls.lessonId === lesson._id
            );
            if (progress) {
              lesson.status = progress.status;
            }
          });
        }
      } catch (error) {
        console.error("Error fetching user progress:", error);
      } finally {
        this.isLoading = false;
      }
    },
    showAddLessonModal() {
      this.showAddLessonModalWindow = true;
    },
    closeAddLessonModal() {
      this.showAddLessonModalWindow = false;
      this.newLessonTitle = "";
    },
    async addLesson() {
      if (this.newLessonTitle.trim()) {
        try {
          const response = await axios.post(
            `http://localhost:8081/api/courses/${this.courseId}/lessons`,
            { title: this.newLessonTitle }
          );
          this.lessons = response.data.lessons;
          this.newLessonTitle = "";
          this.closeAddLessonModal();
        } catch (error) {
          console.error("Error adding lesson:", error);
        }
      }
    },
    selectLesson(lesson, index) {
      this.selectedLesson = lesson;
      this.selectedLessonIndex = index;
    },
    showEditLessonModal() {
      this.showEditLessonModalWindow = true;

      this.$nextTick(() => {
        this.quill = new Quill(this.$refs.quillEditor, {
          theme: "snow",
          modules: {
            toolbar: [
              ["bold", "italic", "underline"],
              ["link", "image", "video"],
            ],
          },
        });
        if (this.selectedLesson) {
          this.quill.root.innerHTML = this.selectedLesson.content;
        }

        this.codeMirrorInstance = CodeMirror(this.$refs.codeEditor, {
          value: this.selectedLesson.codeExample || "",
          mode: "htmlmixed",
          lineNumbers: true,
          theme: "monokai",
          tabSize: 2,
        });
      });
      this.editableCodeExample = this.selectedLesson.codeExample || "";
    },
    closeEditLessonModal() {
      this.showEditLessonModalWindow = false;
      this.quill = null;
    },
    async saveLessonContent() {
      if (this.selectedLesson) {
        try {
          const updatedCode = this.codeMirrorInstance.getValue();
          this.editableCodeExample = updatedCode;

          const response = await axios.put(
            `http://localhost:8081/api/courses/${this.courseId}/lessons/${this.selectedLesson._id}`,
            {
              content: this.quill.root.innerHTML,
              codeExample: updatedCode,
            }
          );

          this.selectedLesson.content = this.quill.root.innerHTML;
          this.selectedLesson.codeExample = this.editableCodeExample;
          this.lessons = response.data.lessons;
          this.closeEditLessonModal();
        } catch (error) {
          console.error("Error saving lesson content:", error);
        }
      }
    },
    showDeleteLessonModal() {
      this.showDeleteLessonModalWindow = true;
    },
    closeDeleteLessonModal() {
      this.showDeleteLessonModalWindow = false;
    },
    async deleteLesson() {
      if (this.selectedLesson) {
        try {
          const deleteResponse = await axios.delete(
            `http://localhost:8081/api/courses/${this.courseId}/lessons/${this.selectedLesson._id}`
          );
          console.log("Delete response:", deleteResponse.data);

          this.lessons = this.lessons.filter(
            (lesson) => lesson._id !== this.selectedLesson._id
          );

          console.log(`Updated number of lessons: ${this.lessons.length}`);

          const updateResponse = await axios.put(
            `http://localhost:8081/api/courses/${this.courseId}`,
            {
              totalOfLessons: this.lessons.length,
            }
          );

          console.log("Update response:", updateResponse.data);

          this.closeDeleteLessonModal();
        } catch (error) {
          console.error("Error deleting lesson:", error);
        }
      }
    },
    async updateLessonStatus(lessonId, status) {
      try {
        await axios.put(`http://localhost:8081/api/userProgress`, {
          userId: this.userId,
          courseId: this.courseId,
          lessonId,
          status,
        });
        const lesson = this.lessons.find((lesson) => lesson._id === lessonId);
        if (lesson) {
          lesson.status = status;
        }
      } catch (error) {
        console.error("Error updating lesson status:", error);
      }
    },
    async nextLesson() {
      if (this.selectedLessonIndex < this.lessons.length - 1) {
        const nextLesson = this.lessons[this.selectedLessonIndex + 1];
        if (this.selectedLesson.status !== "viewed") {
          await this.updateLessonStatus(this.selectedLesson._id, "viewed");
        }
        this.selectLesson(nextLesson, this.selectedLessonIndex + 1);
      }
    },
    async previousLesson() {
      if (this.selectedLessonIndex > 0) {
        this.selectLesson(
          this.lessons[this.selectedLessonIndex - 1],
          this.selectedLessonIndex - 1
        );
      }
    },
    async finishCourse() {
      // Check if all previous lessons are viewed
      for (let i = 0; i < this.selectedLessonIndex; i++) {
        if (this.lessons[i].status !== "viewed") {
          this.finishMessage = "You haven't completed all the lessons yet.";
          this.showFinishModal = true;
          return;
        }
      }

      // Mark current lesson as viewed
      if (this.selectedLesson.status !== "viewed") {
        await this.updateLessonStatus(this.selectedLesson._id, "viewed");
      }

      if (this.lessons.every((lesson) => lesson.status === "viewed")) {
        this.finishMessage =
          "Congratulations! You have completed all the lessons! Do you want to proceed to the quiz for this course?";
      } else {
        this.finishMessage = "You haven't completed all the lessons yet.";
      }
      this.showFinishModal = true;
    },
    closeFinishModal() {
      this.showFinishModal = false;
    },
    goHome() {
      this.$router.push("/home");
    },
    async attemptQuiz() {
      try {
        const response = await axios.get(
          `http://localhost:8081/api/quizzes/${this.courseId}/quiz`
        );
        const quizId = response.data.quizId;
        if (quizId) {
          this.$router.push(`/quizzes/${quizId}`);
        } else {
          console.error("Quiz not found for this course");
        }
      } catch (error) {
        console.error("Error fetching quiz ID:", error);
      }
    },
    tryExample() {
      this.$router.push({
        name: "CodeEditor",
        query: {
          code: encodeURIComponent(this.selectedLesson.codeExample || ""),
        },
      });
    },
  },
};
</script>

<style scoped>
.lesson-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.lesson-content {
  display: flex;
  flex: 1;
  margin: 20px;
}

.sidebar {
  flex: 2;
  background: black;
  padding: 20px;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  margin-right: 20px;
}

.sidebar ul {
  list-style: none;
  padding: 0;
}

.sidebar li {
  padding: 10px;
  background: #42b983;
  margin-bottom: 10px;
  border-radius: 5px;
  cursor: pointer;
  color: white;
}

.sidebar li.viewed {
  background: #228b22; /* Dark green for viewed lessons */
}

.sidebar li.not-viewed {
  background: #ff4d4d;
}

.content {
  flex: 8;
  padding: 20px;
  background: white;
  color: black;
  border-radius: 10px;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
}

.empty-content-message {
  text-align: center;
  margin-top: 50px;
  color: #ccc;
}

.content button {
  margin-bottom: 10px;
  padding: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  color: white;
  transition: background-color 0.3s;
}

.delete-button {
  background-color: #ff4d4d !important;
  margin-left: 0px;
}

.delete-button:hover {
  background-color: #ff1a1a !important;
}

.lesson-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
}

.lesson-navigation .spacer {
  flex-grow: 1;
}

.prev-button {
  background-color: #ff4d4d;
}

.prev-button:hover {
  background-color: #ff1a1a;
}

.next-button {
  background-color: #42b983;
  margin-left: auto;
}

.next-button:hover {
  background-color: #36a273;
}

.finish-button {
  background-color: #42b983;
  margin-left: auto;
}

.finish-button:hover {
  background-color: #36a273;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  display: flex;
  flex-direction: column;
  background: #000;
  color: #fff;
  padding: 20px;
  border-radius: 10px;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  width: 90%;
}

.modal button {
  padding: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1.2rem; /* Increased font size */
  transition: background-color 0.3s;
  margin-top: 20px;
}

.modal button:first-of-type {
  background-color: #42b983;
  color: white;
}

.modal button:first-of-type:hover {
  background-color: #36a273;
}

.modal button:last-of-type {
  background-color: #ff4d4d;
  color: white;
}

.modal button:last-of-type:hover {
  background-color: #ff1a1a;
}

.modal input,
.modal textarea {
  width: 100%;
  padding: 15px; /* Increased padding */
  margin: 10px 0;
  border-radius: 5px;
  border: 1px solid #ccc;
  font-size: 1.2rem; /* Increased font size */
}

.quill-editor,
.code-editor-container {
  flex-shrink: 0;
  min-height: 150px;
  max-height: 250px;
  overflow-y: auto;
  margin-bottom: 20px;
}

.CodeMirror {
  height: auto !important;
  min-height: 150px;
  max-height: 250px;
  border-radius: 5px;
  font-size: 14px;
}

.action-buttons {
  display: flex;
  justify-content: flex-start;
  gap: 10px;
}

.lesson-container {
  margin-bottom: 20px;
}

.lesson-title {
  font-size: 1.5rem;
  margin-bottom: 10px;
}

.lesson-text {
  font-size: 1.2rem;
  margin-bottom: 20px;
}

.example-title {
  font-size: 1.25rem;
  margin-bottom: 10px;
}

.example-box {
  background-color: #1e293b; /* dark blue-gray */
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 15px;
  overflow-x: auto;
  margin-bottom: 15px;
}

.example-code {
  font-family: "Courier New", Courier, monospace;
  font-size: 14px;
  color: #f8f8f2;
  white-space: pre-wrap;
  margin: 0;
}

.try-button {
  background-color: #10b981; /* emerald-500 */
  color: white;
  padding: 10px 20px;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.try-button:hover {
  background-color: #059669; /* emerald-600 */
}

/* WebKit-based browsers (Chrome, Safari, Edge) */
.modal::-webkit-scrollbar,
.quill-editor::-webkit-scrollbar,
.code-editor-container::-webkit-scrollbar {
  width: 10px;
}

.modal::-webkit-scrollbar-track,
.quill-editor::-webkit-scrollbar-track,
.code-editor-container::-webkit-scrollbar-track {
  background: #1e1e1e; /* Track background */
  border-radius: 10px;
}

.modal::-webkit-scrollbar-thumb,
.quill-editor::-webkit-scrollbar-thumb,
.code-editor-container::-webkit-scrollbar-thumb {
  background-color: #42b983; /* Scrollbar thumb color */
  border-radius: 10px;
  border: 2px solid #1e1e1e; /* Optional: padding around thumb */
}

.modal::-webkit-scrollbar-thumb:hover,
.quill-editor::-webkit-scrollbar-thumb:hover,
.code-editor-container::-webkit-scrollbar-thumb:hover {
  background-color: #36a273;
}

.btn-green {
  background-color: #42b983;
  color: white;
}
.btn-green:hover {
  background-color: #36a273;
}

.btn-red {
  background-color: #ff4d4d;
  color: white;
}
.btn-red:hover {
  background-color: #ff1a1a;
}

.btn-gray {
  background-color: #6c757d;
  color: white;
}
.btn-gray:hover {
  background-color: #5a6268;
}

.btn-icon {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}
.btn-icon i {
  font-size: 1.2rem;
}
</style>
