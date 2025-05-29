<template>
  <div class="register-section">
    <form
      @submit.prevent="handleRegister"
      v-if="!registrationSuccess"
      class="register-form"
    >
      <h2>Register</h2>

      <!-- Group: Personal Info -->
      <fieldset class="form-group-set">
        <legend>Personal Information</legend>
        <div class="form-grid">
          <div class="form-group">
            <label for="username">👤 Username:</label>
            <input type="text" id="username" v-model="username" required />
          </div>
          <div class="form-group">
            <label for="phone">📞 Phone:</label>
            <input type="tel" id="phone" v-model="phone" required />
          </div>
          <div class="form-group">
            <label for="schoolName">🏫 School Name:</label>
            <input type="text" id="schoolName" v-model="schoolName" required />
          </div>
          <div class="form-group">
            <label for="dob">🎂 Date of Birth:</label>
            <input type="date" id="dob" v-model="dob" required />
          </div>
        </div>
      </fieldset>

      <!-- Group: Account Info -->
      <fieldset class="form-group-set">
        <legend>Account Information</legend>
        <div class="form-grid">
          <div class="form-group">
            <label for="email">📧 Email:</label>
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
            <label for="password">🔒 Password:</label>
            <input
              type="password"
              id="password"
              v-model="password"
              @blur="validatePassword"
              required
            />
            <span v-if="passwordError" class="error-message">{{
              passwordError
            }}</span>
          </div>
          <div class="form-group">
            <label for="reenter-password">🔁 Re-enter Password:</label>
            <input
              type="password"
              id="reenter-password"
              v-model="reenterPassword"
              @blur="validateReenterPassword"
              required
            />
            <span v-if="reenterPasswordError" class="error-message">{{
              reenterPasswordError
            }}</span>
          </div>
        </div>
      </fieldset>

      <!-- Submit -->
      <button type="submit" class="register-button">Register</button>
      <p class="switch-form">
        Already have an account?
        <a @click.prevent="switchToLogin" href="#">Login here</a>
      </p>
    </form>
    <div v-else class="success-message">
      <h2>Account Register Successful!</h2>
      <p>
        A verification email has been sent to <strong>{{ email }}</strong
        >. Please check your inbox and verify your email before logging in.
      </p>
      <p>Redirecting to login page in {{ countdown }} seconds...</p>
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
    };
  },
  methods: {
    validateEmail() {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(this.email)) {
        this.emailError = "Invalid email format.";
      } else {
        this.emailError = "";
      }
    },
    validatePassword() {
      const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,15}$/;
      if (!passwordPattern.test(this.password)) {
        this.passwordError =
          "Password must be 8-15 characters long and contain both letters and numbers";
      } else {
        this.passwordError = "";
      }
    },
    validateReenterPassword() {
      if (this.password !== this.reenterPassword) {
        this.reenterPasswordError = "Passwords do not match!";
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
        alert("Failed to create account: " + error.message);
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
</style>
