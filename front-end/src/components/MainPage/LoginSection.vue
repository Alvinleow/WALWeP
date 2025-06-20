<template>
  <div class="login-section">
    <LoadingModal :visible="isLoading" />
    <form @submit.prevent="handleLogin" class="login-form">
      <h2>Log Masuk</h2>
      <div class="form-group">
        <label for="email">Emel:</label>
        <input type="email" id="email" name="email" v-model="email" required />
      </div>
      <div class="form-group-password">
        <label for="password">Kata Laluan:</label>
        <div class="password-wrapper">
          <input
            :type="showPassword ? 'text' : 'password'"
            id="password"
            name="password"
            v-model="password"
            required
          />
          <i
            :class="[
              'toggle-password',
              showPassword ? 'fas fa-eye-slash' : 'fas fa-eye',
            ]"
            @click="showPassword = !showPassword"
            style="font-size: 20px"
          ></i>
        </div>
        <span v-if="loginError" class="error-message">{{ loginError }}</span>
      </div>

      <p class="password-reset">
        <a @click.prevent="showResetModal = true" href="#">Lupa Kata Laluan?</a>
      </p>

      <button type="submit" class="login-button">Log Masuk</button>

      <p class="switch-form">
        Belum mempunyai akaun?
        <a @click.prevent="switchToRegister" href="#">Daftar di sini</a>
      </p>
    </form>

    <div class="modal" v-if="showResetModal">
      <div class="modal-content">
        <span class="close-x" @click="showResetModal = false">&times;</span>
        <h3>Reset Kata Laluan</h3>
        <p>Sila masukkan emel anda untuk menerima pautan reset:</p>
        <input
          type="email"
          v-model="resetEmail"
          placeholder="Alamat emel"
          class="reset-input"
        />
        <p v-if="resetError" class="error-message">{{ resetError }}</p>
        <button class="login-button" @click="sendResetEmail">
          Hantar Reset
        </button>
      </div>
    </div>

    <div class="modal" v-if="resetSent">
      <div class="modal-content">
        <span class="close-x" @click="resetSent = false">&times;</span>
        <h3>Emel Dihantar</h3>
        <p>
          Pautan reset kata laluan telah dihantar ke
          <strong>{{ resetEmail }}</strong
          >. Sila semak inbox anda — mungkin juga berada di folder
          <strong>Spam</strong> atau <strong>Promosi</strong>.
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import {
  getAuth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import axios from "axios";
import { mapMutations } from "vuex";

export default {
  name: "LoginSection",
  data() {
    return {
      email: "",
      password: "",
      loginError: "",
      showPassword: false,
      showResetModal: false,
      resetEmail: "",
      resetSent: false,
      resetError: "",
      isLoading: false,
    };
  },
  methods: {
    ...mapMutations(["SET_USER"]),
    async handleLogin() {
      this.isLoading = true;
      // 1. Check for default admin
      if (this.email === "admin@gmail.com") {
        try {
          const response = await axios.post(
            `${process.env.VUE_APP_API_BASE}/api/accounts/login`,
            {
              email: this.email,
              password: this.password,
            }
          );

          const backendUser = response.data.account;

          if (!backendUser || !backendUser._id) {
            this.loginError = "Akaun admin tidak dijumpai.";
            return;
          }

          this.SET_USER(backendUser);
          this.$router.push("/home");
        } catch (error) {
          console.error("Admin login error:", error);
          this.loginError = "Maklumat admin salah.";
        } finally {
          this.isLoading = false;
        }
        return;
      }

      try {
        // 2. Fetch backend user info by email
        const userResponse = await axios.get(
          `${process.env.VUE_APP_API_BASE}/api/accounts/email/${this.email}`
        );
        const backendUser = userResponse.data;

        if (!backendUser || !backendUser._id) {
          this.loginError = "Akaun tidak dijumpai dalam pangkalan data kami.";
          return;
        }

        const auth = getAuth();

        // 3. Login with Firebase
        const userCredential = await signInWithEmailAndPassword(
          auth,
          this.email,
          this.password
        );
        const firebaseUser = userCredential.user;

        // 4. Check if admin account
        if (backendUser.accountLevel === 1) {
          // Skip email verification check
          this.SET_USER(backendUser);
          this.$router.push("/home");
        } else {
          // Enforce verification for regular users
          if (!firebaseUser.emailVerified) {
            this.loginError = "Sila sahkan emel anda sebelum log masuk.";
            return;
          }

          this.SET_USER(backendUser);
          this.$router.push("/home");
        }
      } catch (error) {
        console.error("Firebase login error:", error.code, error.message);

        if (error.code === "auth/invalid-credential") {
          this.loginError =
            "Bukti kelayakan tidak sah. Sila semak semula e-mel dan kata laluan anda.";
        } else {
          this.loginError = "Log masuk gagal. Sila cuba lagi.";
        }
      } finally {
        this.isLoading = false;
      }
    },
    switchToRegister() {
      this.$emit("show-register");
    },
    async sendResetEmail() {
      this.resetError = "";
      const auth = getAuth();

      if (!this.resetEmail) {
        this.resetError = "Sila masukkan emel anda.";
        return;
      }

      try {
        await sendPasswordResetEmail(auth, this.resetEmail);
        this.showResetModal = false;
        this.resetSent = true;
      } catch (error) {
        console.error("Reset email error:", error);
        this.resetError = "Gagal menghantar reset. Pastikan emel sah.";
      }
    },
  },
};
</script>

<style scoped>
.login-section {
  position: static;
  transform: none;
}

.login-form {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 400px;
}

.login-form h2 {
  margin-bottom: 20px;
  color: #333;
}

.form-group {
  margin-bottom: 15px;
}

.form-group-password {
  margin-bottom: 5px;
}

.form-group label,
.form-group-password label {
  display: block;
  margin-bottom: 5px;
  color: #333;
}

.form-group input,
.form-group-password input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.error-message {
  color: red;
  font-size: 0.8rem;
  margin-top: 5px;
  display: block;
}

.login-button {
  width: 100%;
  padding: 10px;
  border: none;
  background-color: #42b983;
  color: white;
  border-radius: 5px;
  font-size: 1.2rem;
  cursor: pointer;
}

.login-button:hover {
  background-color: #36a273;
}

.switch-form {
  margin-top: 15px;
  text-align: center;
}

.password-reset {
  margin-bottom: 15px;
  text-align: right;
}

.password-reset a,
.switch-form a {
  color: #42b983;
  cursor: pointer;
  text-decoration: none;
}
.password-reset a:hover,
.switch-form a:hover {
  text-decoration: underline;
}

.password-wrapper {
  position: relative;
}

.password-wrapper input {
  width: 100%;
  padding-right: 40px; /* Make room for the icon */
}

.toggle-password {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: #888;
  font-size: 1.1rem;
  height: 20px;
}

.toggle-password:hover {
  color: #42b983;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal h3 {
  margin: 10px;
}

.modal-content {
  position: relative;
  background: white;
  padding: 30px;
  border-radius: 10px;
  width: 350px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.reset-input {
  width: 100%;
  padding: 10px;
  margin: 15px 0;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.close-x {
  position: absolute;
  top: 10px;
  right: 15px;
  font-size: 1.4rem;
  font-weight: bold;
  color: #999;
  cursor: pointer;
  transition: color 0.3s;
  z-index: 10;
}

.close-x:hover {
  color: #ff1a1a;
}
</style>
