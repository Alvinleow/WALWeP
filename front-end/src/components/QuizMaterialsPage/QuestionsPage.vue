<template>
  <div class="main">
    <LoadingModal :visible="isLoading" />
    <div class="questions-page">
      <NavBar />
      <div class="content">
        <div class="sidebar">
          <ul v-if="quiz?.questions?.length > 0">
            <li
              v-for="(question, index) in quiz.questions"
              :key="question._id"
              :class="{ selected: selectedQuestionIndex === index }"
              @click="isAdmin ? selectQuestion(question, index) : null"
            >
              Question {{ index + 1 }}
            </li>
          </ul>
          <div v-else>
            <p>No questions available. Please add some questions.</p>
          </div>
        </div>
        <div class="main-content">
          <div class="action-buttons" v-if="isAdmin">
            <button class="btn-green btn-icon" @click="showAddQuestionModal">
              <i class="fas fa-plus-circle"></i> Add Question
            </button>
            <button
              class="btn-green btn-icon"
              @click="showEditQuestionModal"
              :disabled="!selectedQuestion"
            >
              <i class="fas fa-edit"></i> Edit Question
            </button>
            <button
              class="btn-red btn-icon"
              @click="showDeleteQuestionModal"
              :disabled="!selectedQuestion"
            >
              <i class="fas fa-trash-alt"></i> Delete Question
            </button>
          </div>

          <div v-if="selectedQuestion" class="question-container">
            <h3 class="question-title">
              Question {{ selectedQuestionIndex + 1 }}
            </h3>
            <p class="question-text">{{ selectedQuestion.text }}</p>
            <form @submit.prevent="submitAnswer">
              <div class="options">
                <label
                  v-for="(option, index) in selectedQuestion.options"
                  :key="index"
                  :class="{ selected: selectedAnswer === option }"
                >
                  <input
                    type="radio"
                    :value="option"
                    v-model="selectedAnswer"
                    name="options"
                    :disabled="answerSubmitted"
                  />
                  {{ option }}
                </label>
              </div>
              <button
                type="submit"
                class="btn-green btn-icon"
                :disabled="answerSubmitted"
              >
                <i class="fas fa-paper-plane"></i> Submit Answer
              </button>
            </form>
            <p
              v-if="showCorrectAnswer"
              :class="answerCorrect ? 'correct-answer' : 'wrong-answer'"
            >
              {{ answerCorrect ? "Correct answer" : "Wrong answer" }}
            </p>
          </div>
          <div v-else>
            <h2>Please select a question to view its details.</h2>
          </div>
          <div class="navigation-buttons">
            <button
              class="btn-green btn-icon"
              v-if="selectedQuestionIndex > 0"
              @click="previousQuestion"
            >
              <i class="fas fa-arrow-left"></i> Previous
            </button>

            <div class="spacer"></div>

            <button
              class="btn-green btn-icon"
              v-if="selectedQuestionIndex < quiz?.questions?.length - 1"
              @click="nextQuestion"
            >
              Next <i class="fas fa-arrow-right"></i>
            </button>

            <button
              class="btn-green btn-icon"
              v-if="selectedQuestionIndex === quiz?.questions?.length - 1"
              @click="checkBeforeFinish"
            >
              <i class="fas fa-flag-checkered"></i> Finish Quiz
            </button>
          </div>
        </div>
      </div>

      <!-- Add Question Modal -->
      <div v-if="showAddQuestionModalWindow" class="modal-overlay">
        <div class="modal">
          <h2>Add New Question</h2>
          <form @submit.prevent="addQuestion">
            <div>
              <label for="questionText">Question Text:</label>
              <input
                type="text"
                id="questionText"
                v-model="newQuestion.text"
                required
              />
            </div>
            <div>
              <label for="options">Options:</label>
              <input
                type="text"
                id="options"
                v-model="newQuestion.options"
                placeholder="Separate options with commas"
                required
              />
            </div>
            <div>
              <label for="correctAnswer">Correct Answer:</label>
              <input
                type="text"
                id="correctAnswer"
                v-model="newQuestion.correctAnswer"
                required
              />
            </div>
            <button type="submit" class="btn-green btn-icon">
              <i class="fas fa-check-circle"></i> Save
            </button>
            <button
              type="button"
              class="btn-red btn-icon"
              @click="closeAddQuestionModal"
            >
              <i class="fas fa-times-circle"></i> Cancel
            </button>
          </form>
        </div>
      </div>

      <!-- Edit Question Modal -->
      <div v-if="showEditQuestionModalWindow" class="modal-overlay">
        <div class="modal">
          <h2>Edit Question</h2>
          <form @submit.prevent="editQuestion">
            <div>
              <label for="editQuestionText">Question Text:</label>
              <input
                type="text"
                id="editQuestionText"
                v-model="editQuestionData.text"
                required
              />
            </div>
            <div>
              <label for="editOptions">Options:</label>
              <input
                type="text"
                id="editOptions"
                v-model="editQuestionData.options"
                placeholder="Separate options with commas"
                required
              />
            </div>
            <div>
              <label for="editCorrectAnswer">Correct Answer:</label>
              <input
                type="text"
                id="editCorrectAnswer"
                v-model="editQuestionData.correctAnswer"
                required
              />
            </div>
            <button type="submit" class="btn-green btn-icon">
              Save Changes
            </button>
            <button
              type="button"
              class="btn-red btn-icon"
              @click="closeEditQuestionModal"
            >
              Cancel
            </button>
          </form>
        </div>
      </div>

      <!-- Delete Question Modal -->
      <div v-if="showDeleteQuestionModalWindow" class="modal-overlay">
        <div class="modal">
          <h2>Confirm Deletion</h2>
          <p>Are you sure you want to delete this question?</p>
          <button class="btn-green btn-icon" @click="deleteQuestion">
            Yes
          </button>
          <button class="btn-red btn-icon" @click="closeDeleteQuestionModal">
            No
          </button>
        </div>
      </div>

      <!-- Quiz Result Modal -->
      <div v-if="showQuizResultModal" class="modal-overlay">
        <div class="modal">
          <h2>Quiz Result</h2>
          <p>Your score is {{ quizResult.score }}%</p>
          <button class="btn-green btn-icon" @click="goHome">
            Back to Home
          </button>
        </div>
      </div>

      <!-- Answer Reminder Modal -->
      <div v-if="showAnswerReminderModal" class="modal-overlay">
        <div class="modal">
          <h2>Reminder</h2>
          <p>
            Please choose and submit your answer before moving to the next
            question.
          </p>
          <button class="btn-green btn-icon" @click="closeAnswerReminderModal">
            OK
          </button>
        </div>
      </div>
      <div v-if="showLeaveConfirmModal" class="modal-overlay">
        <div class="modal">
          <h2>Leave Quiz?</h2>
          <p>
            Your answers will not be saved. Are you sure you want to leave this
            page?
          </p>
          <button class="btn-red btn-icon" @click="confirmLeaveQuiz">
            Yes, Leave
          </button>
          <button class="btn-green btn-icon" @click="cancelLeaveQuiz">
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import NavBar from "../NavBar.vue";
import { mapState } from "vuex";

export default {
  name: "QuestionsPage",
  components: {
    NavBar,
  },
  data() {
    return {
      quiz: null,
      selectedQuestion: null,
      selectedQuestionIndex: -1,
      selectedAnswer: "",
      showCorrectAnswer: false,
      answerSubmitted: false,
      answerCorrect: false,
      userAnswers: [],
      showLeaveConfirmModal: false,
      pendingNext: null,

      showAddQuestionModalWindow: false,
      showEditQuestionModalWindow: false,
      showDeleteQuestionModalWindow: false,
      showQuizResultModal: false,
      showAnswerReminderModal: false,
      quizResult: null,
      newQuestion: {
        text: "",
        options: "",
        correctAnswer: "",
      },
      editQuestionData: {
        text: "",
        options: "",
        correctAnswer: "",
      },
      quizId: this.$route.params.quizId,
      isLoading: false,
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
    isQuizInProgress() {
      return this.userAnswers.length > 0 && !this.showQuizResultModal;
    },
  },
  async created() {
    this.isLoading = true;
    await this.fetchQuiz();
    this.isLoading = false;
  },
  beforeRouteLeave(to, from, next) {
    if (this.isQuizInProgress) {
      this.showLeaveConfirmModal = true;
      this.pendingNext = next;
    } else {
      next();
    }
  },
  methods: {
    async fetchQuiz() {
      const quizId = this.$route.params.quizId;
      try {
        const response = await axios.get(
          `http://localhost:8081/api/quizzes/${quizId}`
        );
        console.log(response.data);
        this.quiz = response.data || { questions: [] };
        if (this.quiz?.questions?.length > 0) {
          this.selectQuestion(this.quiz.questions[0], 0);
        }
      } catch (error) {
        console.error("Error fetching quiz:", error);
      }
    },
    selectQuestion(question, index) {
      if (this.selectedQuestionIndex !== index) {
        this.selectedQuestion = question;
        this.selectedQuestionIndex = index;

        // Check if the question was already answered and retrieve the answer
        const savedAnswer = this.userAnswers.find(
          (ans) => ans.questionId === question._id
        );
        this.selectedAnswer = savedAnswer ? savedAnswer.answer : "";
        this.showCorrectAnswer = false;
        this.answerSubmitted = savedAnswer ? true : false;
        console.log("Question selected:", this.selectedQuestion);
      }
    },
    showAddQuestionModal() {
      this.showAddQuestionModalWindow = true;
    },
    closeAddQuestionModal() {
      this.showAddQuestionModalWindow = false;
      this.newQuestion = {
        text: "",
        options: "",
        correctAnswer: "",
      };
    },
    async addQuestion() {
      if (
        this.newQuestion.text.trim() &&
        this.newQuestion.options.trim() &&
        this.newQuestion.correctAnswer.trim()
      ) {
        const optionsArray = this.newQuestion.options
          .split(",")
          .map((option) => option.trim());
        const questionData = {
          text: this.newQuestion.text,
          options: optionsArray,
          correctAnswer: this.newQuestion.correctAnswer,
        };
        try {
          await axios.post(
            `http://localhost:8081/api/quizzes/${this.quizId}/questions`,
            questionData
          );
          await this.fetchQuiz();
          this.closeAddQuestionModal();
        } catch (error) {
          console.error("Error adding question:", error);
        }
      }
    },
    showEditQuestionModal() {
      if (this.selectedQuestion) {
        this.editQuestionData = { ...this.selectedQuestion };
        this.editQuestionData.options =
          this.editQuestionData.options.join(", ");
        this.showEditQuestionModalWindow = true;
      }
    },
    closeEditQuestionModal() {
      this.showEditQuestionModalWindow = false;
      this.editQuestionData = {
        text: "",
        options: "",
        correctAnswer: "",
      };
    },
    async editQuestion() {
      if (
        this.editQuestionData.text.trim() &&
        this.editQuestionData.options.trim() &&
        this.editQuestionData.correctAnswer.trim()
      ) {
        const optionsArray = this.editQuestionData.options
          .split(",")
          .map((option) => option.trim());
        const updatedQuestionData = {
          text: this.editQuestionData.text,
          options: optionsArray,
          correctAnswer: this.editQuestionData.correctAnswer,
        };
        try {
          const response = await axios.put(
            `http://localhost:8081/api/quizzes/${this.quizId}/questions/${this.selectedQuestion._id}`,
            updatedQuestionData
          );
          const updatedQuestionIndex = this.quiz.questions.findIndex(
            (question) => question._id === this.selectedQuestion._id
          );
          this.quiz.questions.splice(updatedQuestionIndex, 1, response.data);
          this.closeEditQuestionModal();
          this.selectedQuestion = response.data; // Update selected question
        } catch (error) {
          console.error("Error editing question:", error);
        }
      }
    },
    showDeleteQuestionModal() {
      this.showDeleteQuestionModalWindow = true;
    },
    closeDeleteQuestionModal() {
      this.showDeleteQuestionModalWindow = false;
    },
    async deleteQuestion() {
      try {
        await axios.delete(
          `http://localhost:8081/api/quizzes/${this.quizId}/questions/${this.selectedQuestion._id}`
        );
        const updatedQuestionIndex = this.quiz.questions.findIndex(
          (question) => question._id === this.selectedQuestion._id
        );
        this.quiz.questions.splice(updatedQuestionIndex, 1);
        this.selectedQuestion = null;
        this.selectedQuestionIndex = -1;
        this.closeDeleteQuestionModal();
      } catch (error) {
        console.error("Error deleting question:", error);
      }
    },
    selectAnswer(option) {
      this.selectedAnswer = option;
    },
    submitAnswer() {
      if (this.selectedAnswer) {
        this.answerSubmitted = true;
        this.answerCorrect =
          this.selectedAnswer === this.selectedQuestion.correctAnswer;
        this.showCorrectAnswer = true;

        // Save or update the user's answer
        const existingAnswerIndex = this.userAnswers.findIndex(
          (ans) => ans.questionId === this.selectedQuestion._id
        );
        if (existingAnswerIndex !== -1) {
          this.userAnswers[existingAnswerIndex].answer = this.selectedAnswer;
        } else {
          this.userAnswers.push({
            questionId: this.selectedQuestion._id,
            answer: this.selectedAnswer,
          });
        }
      } else {
        this.showAnswerReminderModal = true;
      }
    },
    async finishQuiz() {
      if (!this.answerSubmitted) {
        this.showAnswerReminderModal = true;
        return;
      }
      try {
        const response = await axios.post(
          `http://localhost:8081/api/quizzes/${this.quizId}/submit`,
          {
            userId: this.userId,
            answers: this.userAnswers,
          }
        );
        this.quizResult = response.data;
        this.showQuizResultModal = true;
      } catch (error) {
        console.error("Error submitting quiz:", error);
      }
    },
    checkBeforeFinish() {
      if (!this.answerSubmitted) {
        this.showAnswerReminderModal = true;
      } else {
        this.finishQuiz();
      }
    },
    goHome() {
      this.$router.push("/home");
    },
    retryQuiz() {
      this.userAnswers = [];
      this.selectedQuestionIndex = 0;
      this.selectQuestion(this.quiz.questions[0], 0);
      this.showQuizResultModal = false;
    },
    nextQuestion() {
      if (this.answerSubmitted) {
        if (this.selectedQuestionIndex < this.quiz?.questions?.length - 1) {
          this.selectQuestion(
            this.quiz.questions[this.selectedQuestionIndex + 1],
            this.selectedQuestionIndex + 1
          );
        }
      } else {
        this.showAnswerReminderModal = true;
      }
    },
    previousQuestion() {
      if (this.selectedQuestionIndex > 0) {
        this.selectQuestion(
          this.quiz.questions[this.selectedQuestionIndex - 1],
          this.selectedQuestionIndex - 1
        );
      }
    },
    closeAnswerReminderModal() {
      this.showAnswerReminderModal = false;
    },
    confirmLeaveQuiz() {
      this.showLeaveConfirmModal = false;
      if (this.pendingNext) {
        this.pendingNext();
        this.pendingNext = null;
      }
    },
    cancelLeaveQuiz() {
      this.showLeaveConfirmModal = false;
      if (this.pendingNext) {
        this.pendingNext(false);
        this.pendingNext = null;
      }
    },
  },
};
</script>

<style scoped>
.questions-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.content {
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
  color: white;
  cursor: pointer;
}

.sidebar li.selected {
  background: #2e8b57;
}

.main-content {
  flex: 8;
  padding: 20px;
  background: white;
  color: black;
  border-radius: 10px;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
}

.action-buttons {
  display: flex;
  justify-content: flex-start;
  gap: 10px;
}

.main-content button {
  margin-bottom: 10px;
  padding: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  color: white;
  transition: background-color 0.3s;
}

.question-container {
  margin-bottom: 20px;
}

.question-title {
  font-size: 1.5rem;
  margin-bottom: 10px;
}

.question-text {
  font-size: 1.2rem;
  margin-bottom: 20px;
}

.options {
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
}

.options label {
  margin-bottom: 10px;
  font-size: 1.1rem;
}

.correct-answer {
  color: green;
  font-weight: bold;
  font-size: 1.2rem;
  margin-top: 10px;
}

.wrong-answer {
  color: red;
  font-weight: bold;
  font-size: 1.2rem;
  margin-top: 10px;
}

.navigation-buttons {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 20px;
}

.navigation-buttons .spacer {
  flex-grow: 1;
}

.navigation-buttons .next-button {
  margin-left: auto;
}

.navigation-buttons button {
  padding: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  background-color: #42b983;
  color: white;
  transition: background-color 0.3s;
}

.navigation-buttons button:hover {
  background-color: #36a273;
}

.navigation-buttons button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
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

.light-overlay {
  background: rgba(0, 0, 0, 0.2);
}

.modal {
  background: #fff;
  color: #000;
  padding: 20px;
  border-radius: 10px;
  max-width: 500px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.modal button {
  padding: 10px 16px;
  margin: 10px 5px 0;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.modal input,
.modal textarea {
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border-radius: 5px;
  border: 1px solid #ccc;
  font-size: 1.2rem;
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
