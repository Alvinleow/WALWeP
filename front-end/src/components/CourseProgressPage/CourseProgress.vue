<template>
  <div class="course-progress">
    <LoadingModal :visible="isLoading" />
    <h2>Kemajuan Kursus</h2>
    <p>Lihat markah anda dan jejak kemajuan anda dalam kursus.</p>
    <div v-for="course in courses" :key="course._id" class="progress-item">
      <h3>{{ course.title }}</h3>
      <p>
        Status:
        <strong
          :style="{ color: isUserEnrolled(course._id) ? '#42b983' : 'red' }"
        >
          {{ isUserEnrolled(course._id) ? "Sudah Daftar" : "Belum Daftar" }}
        </strong>
      </p>
      <p>
        Pelajaran Selesai: {{ getCompletedLessons(course._id) }}/{{
          getTotalLessons(course._id)
        }}
      </p>
      <p>Markah: {{ getCourseScore(course._id) }}%</p>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { mapState } from "vuex";

export default {
  name: "CourseProgress",
  data() {
    return {
      courses: [],
      lessonProgresses: [],
      quizResults: [],
      quizzes: [],
      enrolledCourseIds: [],
      isLoading: false,
    };
  },
  computed: {
    ...mapState({
      userId: (state) => (state.user ? state.user._id : null),
    }),
  },
  async created() {
    if (this.userId) {
      this.isLoading = true;
      await this.fetchCourses();
      await this.fetchLessonProgresses();
      await this.fetchQuizzes();
      await this.fetchUserData();
      this.isLoading = false;
    }
  },
  methods: {
    async fetchCourses() {
      try {
        const response = await axios.get(
          `${process.env.VUE_APP_API_BASE}/api/courses`
        );
        this.courses = response.data;
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    },
    async fetchLessonProgresses() {
      try {
        const response = await axios.get(
          `${process.env.VUE_APP_API_BASE}/api/userProgress/${this.userId}`
        );
        this.lessonProgresses = response.data;
      } catch (error) {
        console.error("Error fetching lesson progresses:", error);
      }
    },
    async fetchQuizzes() {
      try {
        const response = await axios.get(
          `${process.env.VUE_APP_API_BASE}/api/quizzes`
        );
        this.quizzes = response.data;
      } catch (error) {
        console.error("Error fetching quizzes:", error);
      }
    },
    async fetchUserData() {
      try {
        const response = await axios.get(
          `${process.env.VUE_APP_API_BASE}/api/accounts/${this.userId}`
        );
        this.quizResults = response.data.quizResults;
        this.enrolledCourseIds = response.data.enrolledCourses || [];
      } catch (error) {
        console.error("Error fetching quiz results:", error);
      }
    },
    isUserEnrolled(courseId) {
      return this.enrolledCourseIds.includes(courseId);
    },
    getCompletedLessons(courseId) {
      const courseProgress = this.lessonProgresses.find(
        (progress) => progress.courseId === courseId
      );
      if (!courseProgress) return 0;
      return courseProgress.lessonStatuses.filter(
        (lesson) => lesson.status === "viewed"
      ).length;
    },
    getTotalLessons(courseId) {
      const course = this.courses.find((course) => course._id === courseId);
      return course ? course.totalOfLessons : 0;
    },
    getCourseScore(courseId) {
      // Find the quiz with the matching courseId
      const quiz = this.quizzes.find((quiz) => quiz.courseId._id === courseId);
      if (!quiz) return 0;

      // Find the quizResult with the matching quizId
      const quizResult = this.quizResults.find(
        (result) => result.quizId === quiz._id
      );
      return quizResult ? quizResult.score : 0;
    },
  },
};
</script>

<style scoped>
.course-progress {
  margin: 20px;
  padding: 20px;
  background: #000000;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.course-progress h2 {
  font-size: 2rem;
  margin-bottom: 20px;
  color: #42b983;
  text-align: center;
}

.course-progress p {
  font-size: 1.1rem;
  margin-bottom: 10px;
  color: #fff;
}

.progress-item {
  margin-bottom: 20px;
  padding: 15px;
  background: #666;
  border-radius: 5px;
}

.progress-item h3 {
  margin: 0;
  font-size: 1.5rem;
  color: #42b983;
}

.progress-item p {
  margin: 5px 0;
  color: #fff;
}
</style>
