<template>
  <div class="course-materials">
    <LoadingModal :visible="isLoading" />
    <div class="search-sort-bar">
      <input
        type="text"
        placeholder="Cari kursus..."
        v-model="searchQuery"
        @input="filterCourses"
      />
      <select v-model="sortKey" @change="sortCourses">
        <option value="date">Tarikh</option>
        <option value="enrollment">Pendaftaran</option>
      </select>
    </div>
    <div class="add-course-button-container" v-if="isAdmin">
      <button class="btn-green btn-icon" @click="showAddCourseModal">
        <i class="fas fa-plus-circle"></i> Tambah Kursus
      </button>
    </div>
    <div class="course-list">
      <div
        class="course"
        v-for="course in filteredCourses"
        :key="course._id"
        @click="showCourseDetails(course)"
      >
        <div
          class="enroll-ribbon"
          :class="{
            enrolled: isEnrolledInCourse(course._id),
            notEnrolled: !isEnrolledInCourse(course._id),
          }"
        >
          {{ isEnrolledInCourse(course._id) ? "Sudah Daftar" : "Belum Daftar" }}
        </div>

        <img
          :src="course.thumbnail"
          alt="Course Thumbnail"
          class="course-thumbnail"
        />
        <h2 class="course-title">{{ course.title }}</h2>
        <p class="course-lessons">{{ course.totalOfLessons }} pelajaran</p>
        <p class="course-enrollment">{{ course.enrollment }} penyertaan</p>
      </div>
    </div>

    <!-- Add Course Modal -->
    <div v-if="showAddCourseModalWindow" class="course-modal-overlay">
      <div class="course-modal">
        <h2>Tambah Kursus Baharu</h2>
        <form @submit.prevent="addCourse">
          <div class="form-group">
            <label for="thumbnail">Imej Kursus:</label>
            <input
              type="file"
              id="thumbnail"
              @change="handleThumbnailChange"
              required
            />
            <img
              v-if="previewThumbnail"
              :src="previewThumbnail"
              alt="Thumbnail Preview"
              class="thumbnail-preview"
            />
          </div>
          <div class="form-group">
            <label for="title">Tajuk Kursus:</label>
            <input type="text" id="title" v-model="newCourse.title" required />
          </div>
          <div class="form-group">
            <label for="description">Penerangan Kursus:</label>
            <textarea
              id="description"
              v-model="newCourse.description"
              required
            ></textarea>
          </div>
          <div class="form-buttons">
            <button type="submit" class="btn-green btn-icon">
              <i class="fas fa-paper-plane"></i> Hantar
            </button>
            <button
              type="button"
              class="btn-red btn-icon"
              @click="closeAddCourseModal"
            >
              <i class="fas fa-times"></i> Batal
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Course Details Modal -->
    <div v-if="showCourseModal" class="course-modal-overlay">
      <div class="course-modal">
        <button class="modal-close" @click="closeCourseModal">
          <i class="fas fa-times-circle"></i>
        </button>
        <h2>{{ selectedCourse.title }}</h2>
        <img :src="selectedCourse.thumbnail" alt="Course Thumbnail" />
        <p>{{ selectedCourse.description }}</p>
        <p>Jumlah Pelajaran: {{ selectedCourse.totalOfLessons }}</p>
        <p>Penyertaan: {{ selectedCourse.enrollment }}</p>
        <div class="modal-buttons">
          <div v-if="!isEnrolledInCourse(selectedCourse._id)">
            <button class="btn-green btn-icon" @click="enrollInCourse">
              <i class="fas fa-sign-in-alt"></i> Daftar Kursus
            </button>
          </div>
          <div v-else>
            <button class="btn-green btn-icon" @click="navigateToLessons">
              <div v-if="isAdmin">
                <i class="fas fa-edit"></i> Edit Pelajaran
              </div>
              <div v-else>
                <i class="fas fa-book-reader"></i> Sambung Pelajaran
              </div>
            </button>

            <button class="btn-red btn-icon" @click="confirmUnenroll">
              <i class="fas fa-sign-out-alt"></i> Batalkan Pendaftaran
            </button>
          </div>

          <div v-if="isAdmin">
            <button class="btn-green btn-icon" @click="showEditCourseForm">
              <i class="fas fa-edit"></i> Edit Maklumat Kursus
            </button>
            <button class="btn-red btn-icon" @click="confirmDeleteCourse">
              <i class="fas fa-trash"></i> Padam Kursus
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Course Form -->
    <div v-if="showEditCourseFormWindow" class="course-modal-overlay">
      <div class="course-modal">
        <h2>Edit Kursus</h2>
        <form @submit.prevent="editCourse">
          <div class="form-group">
            <label for="editTitle">Tajuk:</label>
            <input
              type="text"
              id="editTitle"
              v-model="selectedCourse.title"
              required
            />
          </div>
          <div class="form-group">
            <label for="editDescription">Penerangan:</label>
            <textarea
              id="editDescription"
              v-model="selectedCourse.description"
              required
            ></textarea>
          </div>
          <div class="form-buttons">
            <button class="btn-green btn-icon" type="submit">
              Simpan Perubahan
            </button>
            <button
              class="btn-red btn-icon"
              type="button"
              @click="closeEditCourseForm"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Course Confirmation Modal -->
    <div v-if="showDeleteCourseModalWindow" class="course-modal-overlay">
      <div class="course-modal">
        <button class="modal-close" @click="closeDeleteCourseModal">
          <i class="fas fa-times-circle"></i>
        </button>
        <h2>Padam Kursus</h2>
        <p>
          Tindakan ini akan memadam kursus dan semua data berkaitan secara
          kekal. Adakah anda pasti ingin meneruskan?
        </p>
        <div class="form-buttons">
          <button class="btn-red btn-icon" @click="deleteCourse">
            <i class="fas fa-trash-alt"></i> Padam
          </button>
          <button
            class="btn-green btn-icon"
            type="button"
            @click="closeDeleteCourseModal"
          >
            <i class="fas fa-times-circle"></i> Batal
          </button>
        </div>
      </div>
    </div>

    <!-- Unenroll Confirmation Modal -->
    <div v-if="showConfirmUnenrollModal" class="course-modal-overlay">
      <div class="course-modal">
        <button class="modal-close" @click="showEnrollmentModal = false">
          <i class="fas fa-times-circle"></i>
        </button>
        <h2>Batalkan Pendaftaran Kursus</h2>
        <p>
          Anda akan kehilangan semua kemajuan jika anda membatalkan pendaftaran
          kursus ini. Adakah anda mahu meneruskan?
        </p>
        <div class="form-buttons">
          <button class="btn-red btn-icon" @click="unenrollFromCourse">
            <i class="fas fa-sign-out-alt"></i> Batalkan Pendaftaran
          </button>
          <button class="btn-green btn-icon" @click="closeUnenrollModal">
            <i class="fas fa-times-circle"></i> Batal
          </button>
        </div>
      </div>
    </div>

    <!-- Enrollment Result Modal -->
    <div v-if="showEnrollmentModal" class="course-modal-overlay">
      <div class="course-modal">
        <button class="modal-close" @click="showEnrollmentModal = false">
          <i class="fas fa-times-circle"></i>
        </button>
        <h2 v-if="enrollmentStatus === 'success'" style="color: #42b983">
          {{
            currentAction === "enroll"
              ? "Berjaya Mendaftar!"
              : "Berjaya Dibatalkan!"
          }}
        </h2>
        <h2 v-else style="color: #ff4d4d">
          {{
            currentAction === "enroll"
              ? "Pendaftaran Gagal"
              : "Gagal Membatalkan"
          }}
        </h2>
        <p v-if="enrollmentStatus === 'success'">
          {{
            currentAction === "enroll"
              ? "Anda telah berjaya mendaftar dalam kursus tersebut."
              : "Pendaftaran kursus anda telah dibatalkan."
          }}
        </p>
        <p v-else>
          {{
            currentAction === "enroll"
              ? "Terdapat masalah semasa mendaftar. Sila cuba lagi kemudian."
              : "Terdapat masalah semasa membatalkan pendaftaran. Sila cuba lagi."
          }}
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { mapState } from "vuex";

export default {
  name: "CourseMaterials",
  data() {
    return {
      searchQuery: "",
      sortKey: "date",
      courses: [],
      filteredCourses: [],
      showAddCourseModalWindow: false,
      newCourse: {
        title: "",
        description: "",
        thumbnail: null,
      },
      previewThumbnail: null,
      showCourseModal: false,
      selectedCourse: null,
      showConfirmUnenrollModal: false,
      showEditCourseFormWindow: false,
      showDeleteCourseModalWindow: false,
      isLoading: false,
      enrollmentStatus: null,
      showEnrollmentModal: false,
      currentAction: "",
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
    this.fetchCourses();
  },
  methods: {
    async fetchCourses() {
      this.isLoading = true;
      try {
        const response = await axios.get(
          `${process.env.VUE_APP_API_BASE}/api/courses?sort=-createdAt`
        );
        this.courses = response.data.reverse();
        this.filteredCourses = this.courses;
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        this.isLoading = false;
      }
    },
    filterCourses() {
      this.filteredCourses = this.courses.filter((course) =>
        course.title.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
      this.sortCourses();
    },
    sortCourses() {
      if (this.sortKey === "date") {
        this.filteredCourses.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
      } else if (this.sortKey === "enrollment") {
        this.filteredCourses.sort((a, b) => b.enrollment - a.enrollment);
      }
    },
    showAddCourseModal() {
      this.showAddCourseModalWindow = true;
    },
    closeAddCourseModal() {
      this.showAddCourseModalWindow = false;
      this.newCourse = {
        title: "",
        description: "",
        thumbnail: null,
      };
      this.previewThumbnail = null;
    },
    handleThumbnailChange(event) {
      const file = event.target.files[0];
      if (file) {
        this.newCourse.thumbnail = file;
        const reader = new FileReader();
        reader.onload = (e) => {
          this.previewThumbnail = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    },
    async addCourse() {
      this.isLoading = true;

      const formData = new FormData();
      formData.append("title", this.newCourse.title);
      formData.append("description", this.newCourse.description);
      formData.append("thumbnail", this.newCourse.thumbnail);

      try {
        const response = await axios.post(
          `${process.env.VUE_APP_API_BASE}/api/courses`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        this.courses.push(response.data);
        this.filteredCourses = this.courses;
        this.closeAddCourseModal();
      } catch (error) {
        console.error("Error adding course:", error);
      } finally {
        this.isLoading = false;
      }
    },
    showCourseDetails(course) {
      this.selectedCourse = course;
      this.showCourseModal = true;
    },
    closeCourseModal() {
      this.showCourseModal = false;
      this.selectedCourse = null;
    },
    isEnrolledInCourse(courseId) {
      return this.user && this.user.enrolledCourses.includes(courseId);
    },
    async enrollInCourse() {
      try {
        await axios.put(
          `${process.env.VUE_APP_API_BASE}/api/accounts/enroll/${this.userId}`,
          {
            courseId: this.selectedCourse._id,
          }
        );
        this.user.enrolledCourses.push(this.selectedCourse._id);
        this.selectedCourse.enrollment += 1;
        this.enrollmentStatus = "success";
      } catch (error) {
        console.error("Error enrolling in course:", error);
        this.enrollmentStatus = "fail";
      } finally {
        this.currentAction = "enroll";
        this.closeCourseModal();
        this.showEnrollmentModal = true;
      }
    },
    confirmUnenroll() {
      this.showConfirmUnenrollModal = true;
    },
    closeUnenrollModal() {
      this.showConfirmUnenrollModal = false;
    },
    async unenrollFromCourse() {
      try {
        await axios.put(
          `${process.env.VUE_APP_API_BASE}/api/accounts/unenroll/${this.userId}`,
          {
            courseId: this.selectedCourse._id,
          }
        );
        this.user.enrolledCourses = this.user.enrolledCourses.filter(
          (id) => id !== this.selectedCourse._id
        );
        this.selectedCourse.enrollment -= 1;
        this.enrollmentStatus = "success";
        this.closeUnenrollModal();
        this.closeCourseModal();
      } catch (error) {
        console.error("Error unenrolling from course:", error);
        this.enrollmentStatus = "fail";
      } finally {
        this.currentAction = "unenroll";
        this.closeUnenrollModal();
        this.closeCourseModal();
        this.showEnrollmentModal = true;
      }
    },
    navigateToLessons() {
      this.$router.push({
        name: "Lessons",
        params: { courseId: this.selectedCourse._id },
      });
    },
    showEditCourseForm() {
      this.showEditCourseFormWindow = true;
    },
    closeEditCourseForm() {
      this.showEditCourseFormWindow = false;
    },
    async editCourse() {
      try {
        const response = await axios.put(
          `${process.env.VUE_APP_API_BASE}/api/courses/${this.selectedCourse._id}`,
          {
            title: this.selectedCourse.title,
            description: this.selectedCourse.description,
          }
        );
        this.selectedCourse = response.data;
        this.closeEditCourseForm();
      } catch (error) {
        console.error("Error editing course:", error);
      }
    },
    confirmDeleteCourse() {
      this.showDeleteCourseModalWindow = true;
    },
    closeDeleteCourseModal() {
      this.showDeleteCourseModalWindow = false;
    },
    async deleteCourse() {
      try {
        await axios.delete(
          `${process.env.VUE_APP_API_BASE}/api/courses/${this.selectedCourse._id}`
        );
        this.courses = this.courses.filter(
          (course) => course._id !== this.selectedCourse._id
        );
        this.filteredCourses = this.filteredCourses.filter(
          (course) => course._id !== this.selectedCourse._id
        );
        this.closeDeleteCourseModal();
        this.closeCourseModal();
      } catch (error) {
        console.error("Error deleting course:", error);
      }
    },
  },
};
</script>

<style scoped>
.course-materials {
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

.add-course-button-container {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.add-course-button-container button {
  padding: 10px 20px;
  font-size: 1.2rem;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.add-course-button-container button:hover {
  background-color: #36a273;
}

.course-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.course {
  flex: 0 0 calc(33.333% - 20px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  overflow: hidden;
  background: #000000;
  text-align: center;
  padding: 20px;
  cursor: pointer;
  transition: transform 0.3s ease-in-out;
  position: relative;
}

.course:hover {
  transform: scale(1.05);
}

.course:hover .course-title {
  text-decoration: underline;
}

.course-thumbnail {
  width: 100%;
  height: auto;
  border-bottom: 1px solid #ddd;
  margin-bottom: 10px;
}

.course-title {
  font-size: 1.5rem;
  margin: 10px 0;
  color: #42b983;
}

.course-lessons,
.course-enrollment {
  font-size: 1rem;
  color: #fff;
  margin: 5px 0;
}

.course-modal-overlay {
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

.course-modal {
  background: #000;
  color: #fff;
  padding: 20px;
  border-radius: 10px;
  max-width: 700px;
  text-align: center;
  position: relative;
  min-width: 400px;
}

.course-modal h2 {
  color: #42b983;
  font-size: 2rem;
  margin-bottom: 20px;
  margin-top: 20px;
  font-weight: 600;
}

.course-modal img {
  max-width: 100%;
  height: 100px;
  margin: 15px 0;
  border-radius: 8px;
}

.course-modal button {
  padding: 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1.2rem;
  transition: background-color 0.3s;
  margin-top: 20px;
}

.enroll-ribbon {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 5px 10px;
  background-color: #ccc;
  color: white;
  font-size: 0.85rem;
  font-weight: bold;
  border-radius: 5px;
  z-index: 10;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.enroll-ribbon.enrolled {
  background-color: #42b983; /* green */
}

.enroll-ribbon.notEnrolled {
  background-color: #ff4d4d; /* red */
}

.course {
  position: relative;
}

.delete-button {
  background-color: #ff4d4d;
  color: white;
}

.delete-button:hover {
  background-color: #ff1a1a;
}

.modal-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.modal-buttons > div {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  color: #fff;
  font-size: 1.2rem;
}

.form-group input,
.form-group textarea {
  padding: 15px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1.2rem;
  width: 100%;
}

.form-buttons {
  display: flex;
  justify-content: center;
  gap: 10px;
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

.modal-close {
  padding: 10px !important;
  margin-top: 0px !important;
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  color: #fff;
  font-size: 1.8rem;
  cursor: pointer;
}

.modal-close:hover {
  color: #ff4d4d;
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
