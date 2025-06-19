<template>
  <div class="register-section">
    <LoadingModal :visible="isLoading" />
    <form
      @submit.prevent="handleRegister"
      v-if="!registrationSuccess"
      class="register-form"
    >
      <h2>Daftar</h2>

      <!-- Group: Personal Info -->
      <fieldset class="form-group-set">
        <legend>Maklumat Peribadi</legend>
        <div class="form-grid">
          <div class="form-group">
            <label for="username">👤 Nama Pengguna:</label>
            <input type="text" id="username" v-model="username" required />
          </div>
          <div class="form-group">
            <label for="phone">📞 Telefon:</label>
            <input type="tel" id="phone" v-model="phone" required />
          </div>
          <div class="form-group">
            <label for="schoolName">🏫 Nama Sekolah:</label>
            <input type="text" id="schoolName" v-model="schoolName" required />
          </div>
          <div class="form-group">
            <label for="dob">🎂 Tarikh Lahir:</label>
            <input type="date" id="dob" v-model="dob" required />
          </div>
        </div>
      </fieldset>

      <!-- Group: Account Info -->
      <fieldset class="form-group-set">
        <legend>Maklumat Akaun</legend>
        <div class="form-grid">
          <div class="form-group">
            <label for="email">📧 Emel:</label>
            <input
              type="email"
              id="email"
              v-model="email"
              @blur="validateEmail"
              required
            />
            <span v-if="emailError" class="error-message">{{
              emailError
            }}</span>
          </div>
          <div class="form-group">
            <label for="password">🔒 Kata Laluan:</label>
            <div class="password-wrapper">
              <input
                :type="showPassword ? 'text' : 'password'"
                id="password"
                v-model="password"
                @blur="validatePassword"
                required
              />
              <i
                :class="[
                  'toggle-password',
                  showPassword ? 'fas fa-eye-slash' : 'fas fa-eye',
                ]"
                @click="showPassword = !showPassword"
              ></i>
            </div>
            <span v-if="passwordError" class="error-message">{{
              passwordError
            }}</span>
          </div>
          <div class="form-group">
            <label for="reenter-password"
              >🔁 Masukkan Semula Kata Laluan:</label
            >
            <div class="password-wrapper">
              <input
                :type="showReenterPassword ? 'text' : 'password'"
                id="reenter-password"
                v-model="reenterPassword"
                @blur="validateReenterPassword"
                autocomplete="new-password"
                required
              />
              <i
                :class="[
                  'toggle-password',
                  showReenterPassword ? 'fas fa-eye-slash' : 'fas fa-eye',
                ]"
                @click="showReenterPassword = !showReenterPassword"
              ></i>
            </div>

            <span v-if="reenterPasswordError" class="error-message">{{
              reenterPasswordError
            }}</span>
          </div>
        </div>
      </fieldset>

      <!-- Submit -->
      <button type="submit" class="register-button">Daftar</button>
      <p class="switch-form">
        Sudah mempunyai akaun?
        <a @click.prevent="switchToLogin" href="#">Log Masuk di sini</a>
      </p>
    </form>
    <div v-else class="success-message">
      <h2>Pendaftaran Akaun Berjaya!</h2>
      <p>
        Emel pengesahan telah dihantar ke <strong>{{ email }}</strong
        >. Sila semak inbox anda dan sahkan emel sebelum log masuk.
      </p>
      <p>Mengalih ke halaman log masuk dalam {{ countdown }} saat...</p>
    </div>

    <div v-if="showErrorModal" class="custom-modal-overlay">
      <div class="custom-modal">
        <h3>Ralat Pendaftaran</h3>
        <p>{{ errorMessage }}</p>
        <button @click="showErrorModal = false">Tutup</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { auth } from "../../firebase";

export default {
  name: "RegisterSection",
  data() {
    return {
      email: "",
      username: "",
      phone: "",
      schoolName: "",
      dob: "",
      password: "",
      reenterPassword: "",
      emailError: "",
      passwordError: "",
      reenterPasswordError: "",
      registrationSuccess: false,
      countdown: 5,
      showPassword: false,
      showReenterPassword: false,
      isLoading: false,
      showErrorModal: false,
      errorMessage: "",
    };
  },
  methods: {
    validateEmail() {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(this.email)) {
        this.emailError = "Format emel tidak sah.";
      } else {
        this.emailError = "";
      }
    },
    validatePassword() {
      const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,15}$/;
      if (!passwordPattern.test(this.password)) {
        this.passwordError =
          "Kata laluan mesti antara 8 hingga 15 aksara dan mengandungi huruf dan nombor.";
      } else {
        this.passwordError = "";
      }
    },
    validateReenterPassword() {
      if (this.password !== this.reenterPassword) {
        this.reenterPasswordError = "Kata laluan tidak sepadan!";
      } else {
        this.reenterPasswordError = "";
      }
    },
    async handleRegister() {
      this.validateEmail();
      this.validatePassword();
      this.validateReenterPassword();

      if (this.emailError || this.passwordError || this.reenterPasswordError) {
        return;
      }

      this.isLoading = true;

      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          this.email,
          this.password
        );
        const firebaseUser = userCredential.user;

        await sendEmailVerification(firebaseUser);

        const userData = {
          email: this.email,
          username: this.username,
          phone: this.phone,
          schoolName: this.schoolName,
          dob: this.dob,
          completedCourses: [],
          accountLevel: 0,
          firebaseUid: firebaseUser.uid,
          password: this.password,
        };

        const response = await axios.post(
          "http://localhost:8081/api/accounts",
          userData
        );
        console.log("Account created in backend:", response.data);

        this.registrationSuccess = true;
        this.startCountdown();
      } catch (error) {
        console.error("Firebase registration error:", error);
        this.errorMessage = "Gagal mencipta akaun: " + error.message;
        this.showErrorModal = true;
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
          this.switchToLogin();
        }
      }, 1000);
    },
    switchToLogin() {
      this.$emit("show-login");
    },
  },
};
</script>

<style scoped>
.register-section {
  position: static;
  transform: none;
}
.register-form {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 600px;
}

.register-form h2 {
  margin-bottom: 20px;
  color: #333;
}

.form-group-set {
  margin-bottom: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
}

.form-group-set legend {
  font-weight: bold;
  color: #42b983;
  padding: 0 5px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

@media (max-width: 600px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 5px;
  font-weight: 600;
}

.form-group input {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
}

.error-message {
  color: red;
  font-size: 0.8rem;
  margin-top: 5px;
  display: block;
}

.register-button {
  width: 100%;
  padding: 10px;
  border: none;
  background-color: #42b983;
  color: white;
  border-radius: 5px;
  font-size: 1.2rem;
  cursor: pointer;
}

.register-button:hover {
  background-color: #36a273;
}

.switch-form {
  margin-top: 15px;
  text-align: center;
}

.switch-form a {
  color: #42b983;
  cursor: pointer;
  text-decoration: none;
}

.switch-form a:hover {
  text-decoration: underline;
}

.success-message {
  position: static;
  transform: none;
  text-align: center;
  color: white;
}

.password-wrapper {
  position: relative;
}

.password-wrapper input {
  width: 100%;
  padding-right: 40px; /* space for the icon */
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

/* Hide the default Chrome password reveal button */
input[type="password"]::-ms-reveal,
input[type="password"]::-ms-clear {
  display: none;
}

input[type="password"]::-webkit-credentials-auto-fill-button,
input[type="password"]::-webkit-inner-spin-button,
input[type="password"]::-webkit-clear-button {
  display: none;
}

/* Chrome-specific fix */
input[type="password"]::-webkit-textfield-decoration-container {
  display: none !important;
}

.custom-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.custom-modal {
  background: white;
  padding: 20px 30px;
  border-radius: 8px;
  max-width: 400px;
  width: 90%;
  text-align: center;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
}

.custom-modal h3 {
  margin-top: 0;
  color: #e74c3c;
}

.custom-modal p {
  margin: 15px 0;
  color: #333;
  word-break: break-word;
}

.custom-modal button {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 8px 16px;
  font-size: 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.custom-modal button:hover {
  background-color: #c0392b;
}
</style>
