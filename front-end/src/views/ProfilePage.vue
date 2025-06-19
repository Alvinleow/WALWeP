<template>
  <div class="main">
    <NavBar />
    <div class="main-content">
      <LoadingModal :visible="isLoading" />
      <div v-if="user && !deletionSuccess" class="profile-container">
        <div class="profile-header">
          <div class="profile-pic-wrapper">
            <img
              :src="previewProfilePicUrl || user.profilePicUrl"
              alt="Ikon Pengguna"
              class="user-icon"
              @click="triggerFileInput"
            />
            <span v-if="isEditing" class="edit-icon">&#9998;</span>
            <input
              type="file"
              ref="fileInput"
              style="display: none"
              @change="handleFileChange"
              accept="image/png, image/jpeg"
            />
          </div>

          <div class="profile-details">
            <h2 v-if="!isEditing" class="username-header">
              👤 <span class="highlight-name">{{ user.username }}</span>
            </h2>
            <input
              v-else
              v-model="editableUsername"
              type="text"
              class="editable-username"
            />

            <ul class="profile-info-list">
              <li>📧 <strong>Emel:</strong> {{ user.email }}</li>
              <li>📞 <strong>No. Telefon:</strong> {{ user.phone }}</li>
              <li>🏫 <strong>Sekolah:</strong> {{ user.schoolName }}</li>
              <li>
                🎂 <strong>Tarikh Lahir:</strong> {{ formatDate(user.dob) }}
              </li>
            </ul>
          </div>
        </div>

        <div class="button-row">
          <button
            v-if="!isEditing"
            class="edit-profile-btn"
            @click="enterEditMode"
          >
            Edit Profil
          </button>
          <template v-else>
            <button class="save-btn" @click="saveChanges">
              Simpan Perubahan
            </button>
            <button class="cancel-btn" @click="cancelEdit">Batal</button>
          </template>
        </div>

        <div class="button-row">
          <button
            v-if="user && user.accountLevel === 1"
            class="add-admin-btn"
            @click="showAdminModal = true"
          >
            Tambah Akaun Admin
          </button>
          <button class="delete-account-btn" @click="promptDeleteAccount">
            Padam Akaun
          </button>
        </div>
      </div>
      <div v-if="deletionSuccess" class="success-message">
        <h2>Akaun Berjaya Dipadam!</h2>
        <p>Keluar dalam {{ countdown }} saat...</p>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal">
      <div class="modal-content">
        <span class="close" @click="closeDeleteModal">&times;</span>
        <h2>Sahkan Pemadaman Akaun</h2>
        <p>Sila masukkan kata laluan untuk sahkan pemadaman akaun.</p>
        <input
          type="password"
          v-model="deletePassword"
          placeholder="Masukkan kata laluan anda"
          class="password-input"
        />
        <span v-if="deleteError" class="error-message">{{ deleteError }}</span>
        <button class="confirm-delete-btn" @click="deleteAccount">
          Sahkan Padam
        </button>
      </div>
    </div>

    <div v-if="showAdminModal" class="modal">
      <div class="modal-content">
        <span class="close" @click="closeAdminModal">&times;</span>
        <h2>Daftar Akaun Admin Baharu</h2>
        <form @submit.prevent="registerAdmin" autocomplete="off">
          <div class="form-group">
            <label for="admin-username">👤 Nama Pengguna:</label>
            <div class="password-wrapper">
              <input
                type="text"
                id="admin-username"
                v-model="adminUsername"
                required
                autocomplete="off"
              />
            </div>
          </div>
          <div class="form-group">
            <label for="admin-email">📧 Emel:</label>
            <div class="password-wrapper">
              <input
                type="email"
                id="admin-email"
                v-model="adminEmail"
                required
                autocomplete="off"
                @blur="validateAdminEmail"
              />
              <span class="error-message">{{ adminEmailError || " " }}</span>
            </div>
          </div>
          <div class="form-group">
            <label for="admin-password">🔒 Kata Laluan:</label>
            <div class="password-wrapper">
              <input
                :type="showAdminPassword ? 'text' : 'password'"
                id="admin-password"
                v-model="adminPassword"
                required
                autocomplete="off"
                @blur="validateAdminPassword"
              />
              <i
                :class="[
                  'toggle-password',
                  showAdminPassword ? 'fas fa-eye-slash' : 'fas fa-eye',
                ]"
                @click="showAdminPassword = !showAdminPassword"
              ></i>
            </div>
            <span class="error-message">{{ adminPasswordError || " " }}</span>
          </div>
          <p class="error-message">{{ adminError || " " }}</p>
          <button class="save-btn" type="submit">Daftar Admin</button>
        </form>
      </div>
    </div>

    <div v-if="showAlertModal" class="modal">
      <div class="modal-content">
        <span class="close" @click="closeAlertModal">&times;</span>
        <p>{{ alertMessage }}</p>
        <button class="save-btn" @click="closeAlertModal">OK</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { mapState } from "vuex";
import NavBar from "../components/NavBar.vue";

export default {
  name: "ProfilePage",
  components: {
    NavBar,
  },
  computed: {
    ...mapState({
      userId: (state) => (state.user ? state.user._id : null),
      user: (state) => state.user,
    }),
  },
  data() {
    return {
      isEditing: false,
      editableUsername: "",
      newProfilePic: null,
      previewProfilePicUrl: null,
      showDeleteModal: false,
      deletePassword: "",
      deleteError: "",
      deletionSuccess: false,
      countdown: 3,
      showAdminModal: false,
      adminEmail: "",
      adminPassword: "",
      adminUsername: "",
      adminError: "",
      adminEmailError: "",
      adminPasswordError: "",
      showAdminPassword: false,
      isLoading: false,
      showAlertModal: false,
      alertMessage: "",
    };
  },
  async created() {
    if (!this.user) {
      const userId = this.$route.params.id;
      try {
        const response = await axios.get(
          `http://localhost:8081/api/accounts/${userId}`
        );
        this.$store.commit("SET_USER", response.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }
    this.isLoading = false;
  },
  methods: {
    validateAdminEmail() {
      const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      this.adminEmailError = pattern.test(this.adminEmail)
        ? ""
        : "Format emel tidak sah.";
    },
    validateAdminPassword() {
      const pattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,15}$/;
      this.adminPasswordError = pattern.test(this.adminPassword)
        ? ""
        : "Kata laluan mesti antara 8 hingga 15 aksara dan mengandungi huruf dan nombor.";
    },
    openAlertModal(message) {
      this.alertMessage = message;
      this.showAlertModal = true;
    },
    closeAlertModal() {
      this.showAlertModal = false;
      this.alertMessage = "";
    },
    formatDate(dateStr) {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    },
    enterEditMode() {
      this.isEditing = true;
      this.editableUsername = this.user.username;
    },
    cancelEdit() {
      this.isEditing = false;
      this.editableUsername = "";
      this.newProfilePic = null;
      this.previewProfilePicUrl = null;
    },
    async saveChanges() {
      if (!this.editableUsername.trim()) {
        this.openAlertModal("Nama pengguna tidak boleh kosong");
        return;
      }

      this.isLoading = true;

      try {
        const formData = new FormData();
        formData.append("username", this.editableUsername);
        if (this.newProfilePic) {
          formData.append("profilePic", this.newProfilePic);
        }

        const response = await axios.put(
          `http://localhost:8081/api/accounts/${this.userId}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        this.$store.commit("SET_USER", response.data);
        this.isEditing = false;
        this.previewProfilePicUrl = null;
      } catch (error) {
        console.error("Error saving changes:", error);
        this.openAlertModal("Failed to save changes. Please try again.");
      } finally {
        this.isLoading = false;
      }
    },
    handleFileChange(event) {
      const file = event.target.files[0];
      if (file && (file.type === "image/jpeg" || file.type === "image/png")) {
        this.newProfilePic = file;

        const reader = new FileReader();
        reader.onload = (e) => {
          this.previewProfilePicUrl = e.target.result;
        };
        reader.readAsDataURL(file);
      } else {
        this.openAlertModal("Sila pilih fail imej yang sah (jpg atau png).");
      }
    },
    triggerFileInput() {
      if (this.isEditing) {
        this.$refs.fileInput.click();
      }
    },
    promptDeleteAccount() {
      this.showDeleteModal = true;
    },
    closeDeleteModal() {
      this.showDeleteModal = false;
      this.deletePassword = "";
      this.deleteError = "";
    },
    async deleteAccount() {
      if (!this.deletePassword) {
        this.deleteError = "Kata laluan diperlukan.";
        return;
      }

      this.isLoading = true;

      try {
        console.log("Verifying password...");
        const verifyResponse = await axios.post(
          `http://localhost:8081/api/accounts/${this.userId}/verify-password`,
          {
            password: this.deletePassword,
          }
        );
        console.log("Password verified:", verifyResponse.data);

        if (!verifyResponse.data.success) {
          this.deleteError = "Kata laluan salah.";
          return;
        }

        console.log("Deleting account...");
        const deleteResponse = await axios.delete(
          `http://localhost:8081/api/accounts/${this.userId}`
        );
        console.log("Account deleted:", deleteResponse.data);

        this.deletionSuccess = true;
        this.showDeleteModal = false;

        this.startCountdown();
      } catch (error) {
        console.error("Error deleting account:", error);
        this.deleteError = "Gagal memadam akaun. Sila semak kata laluan anda.";
      } finally {
        this.isLoading = false;
      }
    },
    startCountdown() {
      const interval = setInterval(() => {
        if (this.countdown > 0) {
          this.countdown--;
        } else {
          clearInterval(interval);
          this.$router.push({ name: "MainPage" });
        }
      }, 1000);
    },
    closeAdminModal() {
      this.showAdminModal = false;
      this.adminEmail = "";
      this.adminPassword = "";
      this.adminUsername = "";
      this.adminError = "";
    },
    async registerAdmin() {
      this.validateAdminEmail();
      this.validateAdminPassword();

      if (
        !this.adminEmail ||
        !this.adminPassword ||
        !this.adminUsername ||
        this.adminEmailError ||
        this.adminPasswordError
      ) {
        this.adminError = "Sila lengkapkan semua maklumat dengan betul.";
        return;
      }

      this.isLoading = true;

      try {
        const { createUserWithEmailAndPassword } = await import(
          "firebase/auth"
        );
        const { auth } = await import("../firebase");

        const userCredential = await createUserWithEmailAndPassword(
          auth,
          this.adminEmail,
          this.adminPassword
        );

        const firebaseUser = userCredential.user;

        const adminData = {
          email: this.adminEmail,
          username: this.adminUsername,
          password: this.adminPassword,
          phone: "N/A",
          schoolName: "Admin",
          dob: "2000-01-01",
          completedCourses: [],
          accountLevel: 1,
          firebaseUid: firebaseUser.uid,
        };

        await axios.post("http://localhost:8081/api/accounts", adminData);

        this.openAlertModal("Akaun admin berjaya didaftarkan.");
        this.closeAdminModal();
      } catch (error) {
        console.error("Admin registration error:", error);
        this.adminError = "Gagal mendaftar admin. " + error.message;
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>

<style scoped>
.main-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  margin-top: 100px;
  padding: 20px;
  box-sizing: border-box;
}

.profile-container {
  background: #000000;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  max-width: 800px;
  margin: 0 auto;
}

.profile-header {
  display: flex;
  gap: 30px;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.profile-pic-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.user-icon {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  border: 3px solid #42b983;
  box-shadow: 0 0 8px rgba(66, 185, 131, 0.6);
  cursor: pointer;
  transition: transform 0.2s ease;
}

.user-icon:hover {
  transform: scale(1.05);
}

.username-header {
  font-size: 2rem;
  margin-bottom: 10px;
}

.highlight-name {
  color: #42b983;
  font-weight: bold;
}

.profile-details {
  flex: 1;
}

.profile-info-list {
  list-style: none;
  padding: 0;
  margin: 0;
  color: #fff;
  font-size: 1.1rem;
}

.profile-info-list li {
  margin-bottom: 8px;
}

.edit-icon {
  position: absolute;
  bottom: 0;
  right: 0;
  font-size: 20px;
  color: #42b983;
  cursor: pointer;
}

.profile-info {
  display: flex;
  flex-direction: column;
}

.profile-info h2 {
  font-size: 2rem;
  color: #42b983;
  margin: 0;
}

.editable-username {
  font-size: 2rem;
  color: #42b983;
  background: transparent;
  border: none;
  border-bottom: 2px solid #42b983;
  outline: none;
}
.profile-info p {
  font-size: 1.2rem;
  color: #fff;
  margin: 0;
}

.completed-courses h3 {
  font-size: 1.5rem;
  color: #42b983;
  margin-bottom: 15px;
}

.completed-courses ul {
  list-style-type: none;
  padding: 0;
}

.completed-courses li {
  font-size: 1.1rem;
  color: #fff;
  margin-bottom: 10px;
}

.button-row {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 15px;
  margin-top: 20px;
}

.button-row button {
  flex: 1 1 30%;
}

.add-admin-btn,
.edit-profile-btn,
.save-btn,
.cancel-btn,
.delete-account-btn,
.confirm-delete-btn {
  display: block;
  width: auto;
  padding: 10px;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1.1rem;
  transition: background-color 0.3s;
  margin-top: 20px;
  text-align: center;
}

.add-admin-btn {
  background-color: #0066cc;
}
.add-admin-btn:hover {
  background-color: #0052a3;
}

.edit-profile-btn {
  background-color: #42b983;
}

.edit-profile-btn:hover {
  background-color: #36a273;
}

.save-btn {
  background-color: #42b983;
}

.save-btn:hover {
  background-color: #36a273;
}

.cancel-btn {
  background-color: #ff4d4d;
}

.cancel-btn:hover {
  background-color: #ff1a1a;
}

.delete-account-btn {
  background-color: #ff4d4d;
}

.delete-account-btn:hover {
  background-color: #ff1a1a;
}

.confirm-delete-btn {
  background-color: #ff4d4d;
}

.confirm-delete-btn:hover {
  background-color: #ff1a1a;
}

.no-user {
  text-align: center;
  color: #ff4d4d;
  font-size: 1.5rem;
}

/* Modal Styles */
.modal {
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  z-index: 1;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-content {
  position: relative;
  background-color: #000000;
  padding: 20px;
  border: 1px solid #888;
  width: 100%;
  max-width: 400px;
  word-wrap: break-word;
  overflow-wrap: break-word;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  color: white;
}

.modal-content form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 20px;
}

.modal-content input {
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ccc;
  font-size: 1rem;
  width: 100%;
  box-sizing: border-box;
}

.modal-content input::placeholder {
  color: #999;
}

.modal-content h2 {
  font-size: 1.4rem;
  color: #fff;
  margin-bottom: 10px;
}

.modal-content .confirm-delete-btn {
  background-color: #ff4d4d;
  border: none;
  padding: 10px;
  font-size: 1.1rem;
  border-radius: 5px;
  color: white;
  cursor: pointer;
  transition: background-color 0.3s;
}

.modal-content .confirm-delete-btn:hover {
  background-color: #ff1a1a;
}

.modal-content .error-message {
  font-size: 0.9rem;
  color: red;
  margin-top: -5px;
}

.modal-content .save-btn {
  margin: 20px auto 0 auto;
  display: block;
  padding: 10px 20px;
}

.close {
  position: absolute;
  top: 10px;
  right: 15px;
  font-size: 24px;
  font-weight: bold;
  color: #ccc;
  cursor: pointer;
  z-index: 10;
}

.close:hover {
  color: #fff;
}

.password-input {
  width: 100%;
  padding: 10px;
  margin: 15px 0;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-sizing: border-box;
}

.success-message {
  text-align: center;
  color: white;
}

.modal-content form label {
  display: block;
  text-align: left;
  margin-bottom: 10px;
  font-weight: bold;
}

.password-wrapper {
  position: relative;
}

.password-wrapper input {
  width: 100%;
  padding-right: 40px;
}

.toggle-password {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: #888;
  font-size: 1.1rem;
}

.toggle-password:hover {
  color: #42b983;
}
</style>
