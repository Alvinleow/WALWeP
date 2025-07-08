<template>
  <LoadingModal :visible="isLoading" />
  <div class="quiz-materials">
    <div class="search-sort-bar">
      <input
        type="text"
        placeholder="Cari kuiz..."
        v-model="searchQuery"
        @input="filterQuizzes"
      />
      <select v-model="sortKey" @change="sortQuizzes">
        <option value="date">Tarikh</option>
        <option value="questions">Bilangan Soalan</option>
      </select>
    </div>
    <div class="add-quiz-button-container" v-if="isAdmin">
      <button class="btn-green btn-icon" @click="showAddQuizModal">
        <i class="fas fa-plus-circle"></i> Tambah Kuiz
      </button>
    </div>

    <div class="quiz-list">
      <div
        class="quiz"
        v-for="quiz in filteredQuizzes"
        :key="quiz._id"
        @click="handleQuizClick(quiz)"
      >
        <h2 class="quiz-title">Kuiz untuk {{ quiz.courseTitle }}</h2>
        <p class="quiz-questions">{{ quiz.questions.length }} soalan</p>
        <p class="quiz-score">Best Skor Anda: {{ getQuizScore(quiz._id) }}</p>
      </div>
    </div>

    <!-- Add Quiz Modal -->
    <div v-if="showAddQuizModalWindow" class="modal-overlay">
      <div class="modal">
        <h2>Tambah Kuiz Baharu</h2>
        <form @submit.prevent="addQuiz">
          <div class="form-group">
            <label for="course">Tambah Kuiz untuk Kursus:</label>
            <select v-model="selectedCourseId" required>
              <option
                v-for="course in courses"
                :key="course._id"
                :value="course._id"
              >
                {{ course.title }}
              </option>
            </select>
          </div>
          <div class="form-buttons">
            <button type="submit" class="btn-green btn-icon">
              <i class="fas fa-paper-plane"></i> Tambah Kuiz
            </button>
            <button
              type="button"
              class="btn-red btn-icon"
              @click="closeAddQuizModal"
            >
              <i class="fas fa-times"></i> Batal
            </button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="showQuizOptionsModal" class="modal-overlay">
      <div class="modal">
        <button class="cancel-btn" @click="closeQuizOptionsModal">
          <i class="fas fa-times-circle"></i>
        </button>
        <h2>Apa yang anda ingin lakukan dengan kuiz ini?</h2>
        <div class="form-buttons">
          <button class="btn-green btn-icon" @click="editQuiz">
            <i class="fas fa-edit"></i> Edit Kandungan Kuiz
          </button>
          <button class="btn-red btn-icon" @click="deleteQuiz">
            <i class="fas fa-trash"></i> Padam Kuiz
          </button>
        </div>
      </div>
    </div>

    <div v-if="showDeleteConfirmation" class="modal-overlay">
      <div class="modal">
        <h2>Adakah anda pasti ingin memadam kuiz ini?</h2>
        <p style="margin-bottom: 10px">Kuiz: {{ selectedQuiz?.courseTitle }}</p>
        <div class="form-buttons">
          <button class="btn-red btn-icon" @click="confirmDeleteQuiz">
            <i class="fas fa-trash"></i> Ya, Padam
          </button>
          <button class="btn-green btn-icon" @click="cancelDeleteQuiz">
            <i class="fas fa-times"></i> Batal
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { mapState } from "vuex";

export default {
  name: "QuizMaterials",
  data() {
    return {
      searchQuery: "",
      sortKey: "date",
      quizzes: [],
      courses: [],
      filteredQuizzes: [],
      quizResults: [],
      showAddQuizModalWindow: false,
      selectedCourseId: null,
      selectedQuiz: null,
      showQuizOptionsModal: false,
      isLoading: false,
      showDeleteConfirmation: false,
    };
  },
  computed: {
    ...mapState({
      userId: (state) => (state.user ? state.user._id : null),
      user: (state) => state.user,
    }),
    isAdmin() {
      return this.user && this.user.accountLevel === 1;
    },
  },
  mounted() {
    this.fetchQuizzes();
    this.fetchCourses();
    this.fetchQuizResults();
  },
  methods: {
    async fetchQuizzes() {
      this.isLoading = true;
      try {
        const response = await axios.get(
          `${process.env.VUE_APP_API_BASE}/api/quizzes`
        );
        this.quizzes = response.data.map((quiz) => ({
          ...quiz,
          courseTitle: quiz.courseId.title,
        }));
        this.filteredQuizzes = this.quizzes;
      } catch (error) {
        console.error("Error fetching quizzes:", error);
      } finally {
        this.isLoading = false;
      }
    },
    async fetchCourses() {
      this.isLoading = true;
      try {
        const response = await axios.get(
          `${process.env.VUE_APP_API_BASE}/api/courses`
        );
        this.courses = response.data;
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        this.isLoading = false;
      }
    },
    async fetchQuizResults() {
      if (!this.userId) return;
      try {
        const response = await axios.get(
          `${process.env.VUE_APP_API_BASE}/api/accounts/${this.userId}`
        );
        this.quizResults = response.data.quizResults || [];
      } catch (error) {
        console.error("Error fetching quiz results:", error);
      }
    },
    getQuizScore(quizId) {
      const result = this.quizResults.find((r) => r.quizId === quizId);
      return result ? result.score + "%" : "Belum Ambil";
    },
    filterQuizzes() {
      this.filteredQuizzes = this.quizzes.filter((quiz) =>
        quiz.courseTitle.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
      this.sortQuizzes();
    },
    sortQuizzes() {
      if (this.sortKey === "date") {
        this.filteredQuizzes.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
      } else if (this.sortKey === "questions") {
        this.filteredQuizzes.sort(
          (a, b) => b.questions.length - a.questions.length
        );
      }
    },
    showAddQuizModal() {
      this.showAddQuizModalWindow = true;
    },
    closeAddQuizModal() {
      this.showAddQuizModalWindow = false;
      this.selectedCourseId = null;
    },
    async addQuiz() {
      if (this.selectedCourseId) {
        this.isLoading = true;
        try {
          const response = await axios.post(
            `${process.env.VUE_APP_API_BASE}/api/quizzes/${this.selectedCourseId}`,
            {
              courseId: this.selectedCourseId,
            }
          );
          const newQuiz = response.data;
          const course = this.courses.find(
            (course) => course._id === newQuiz.courseId
          );
          newQuiz.courseTitle = course ? course.title : "Unknown Course";
          this.quizzes.push(newQuiz);
          this.filteredQuizzes = this.quizzes;
          this.closeAddQuizModal();
        } catch (error) {
          console.error("Error adding quiz:", error);
        } finally {
          this.isLoading = false;
        }
      }
    },
    handleQuizClick(quiz) {
      if (this.isAdmin) {
        this.selectedQuiz = quiz;
        this.showQuizOptionsModal = true;
      } else {
        this.navigateToQuestions(quiz);
      }
    },
    showQuizOptions(quiz) {
      this.selectedQuiz = quiz;
      this.showQuizOptionsModal = true;
    },
    closeQuizOptionsModal() {
      this.showQuizOptionsModal = false;
      this.selectedQuiz = null;
    },
    async editQuiz() {
      this.$router.push({
        name: "QuestionsPage",
        params: { quizId: this.selectedQuiz._id },
      });
      this.closeQuizOptionsModal();
    },
    async deleteQuiz() {
      this.showQuizOptionsModal = false;
      this.showDeleteConfirmation = true;
    },
    async confirmDeleteQuiz() {
      if (this.selectedQuiz) {
        this.isLoading = true;
        try {
          await axios.delete(
            `${process.env.VUE_APP_API_BASE}/api/quizzes/${this.selectedQuiz._id}`
          );
          this.quizzes = this.quizzes.filter(
            (quiz) => quiz._id !== this.selectedQuiz._id
          );
          this.filteredQuizzes = this.filteredQuizzes.filter(
            (quiz) => quiz._id !== this.selectedQuiz._id
          );
        } catch (error) {
          console.error("Error deleting quiz:", error);
        } finally {
          this.selectedQuiz = null;
          this.showDeleteConfirmation = false;
          this.isLoading = false;
        }
      }
    },
    cancelDeleteQuiz() {
      this.showDeleteConfirmation = false;
      this.selectedQuiz = null;
    },
    navigateToQuestions(quiz) {
      this.$router.push({
        name: "QuestionsPage",
        params: { quizId: quiz._id },
      });
    },
  },
};
</script>

<style scoped>
.quiz-materials {
  padding: 20px;
  max-width: 1200px;
  margin: auto;
}

.search-sort-bar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  background-color: #f8f9fa;
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.search-sort-bar input {
  flex: 1;
  padding: 10px;
  font-size: 1rem;
  margin-right: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.search-sort-bar select {
  padding: 10px;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.add-quiz-button-container {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.add-quiz-button-container button {
  padding: 10px 20px;
  font-size: 1.2rem;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.add-quiz-button-container button:hover {
  background-color: #36a273;
}

.quiz-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.quiz {
  flex: 0 0 calc(33.333% - 20px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  overflow: hidden;
  background: #000000;
  text-align: center;
  padding: 20px;
  cursor: pointer;
  transition: transform 0.3s ease-in-out;
}

.quiz:hover {
  transform: scale(1.05);
}

.quiz:hover .quiz-title {
  text-decoration: underline;
}

.quiz-title {
  font-size: 1.5rem;
  margin: 10px 0;
  color: #42b983;
}

.quiz-questions {
  font-size: 1rem;
  color: #fff;
  margin: 5px 0;
}

.quiz-score {
  font-size: 1rem;
  color: #ffd700;
  margin-top: 5px;
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
  background: #000;
  color: #fff;
  padding: 30px;
  border-radius: 10px;
  max-width: 800px;
  text-align: center;
  position: relative;
}

.modal h2 {
  font-size: 2rem;
  margin-bottom: 20px;
  color: #42b983;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  color: #fff;
  font-size: 1.2rem;
  margin-bottom: 10px;
}

.form-group select,
.form-group input,
.form-group textarea {
  width: 100%;
  padding: 15px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1.2rem;
}

.form-buttons {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.cancel-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  color: #fff;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  transition: color 0.3s;
}

.cancel-btn:hover {
  color: #ff4d4d;
}

.form-buttons button {
  padding: 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1.2rem;
  transition: background-color 0.3s;
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

.btn-icon {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}
.btn-icon i {
  font-size: 1.2rem;
}
</style>
