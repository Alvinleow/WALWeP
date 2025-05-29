<template>
  <div class="login-section">
    <form @submit.prevent="handleLogin" class="login-form">
      <h2>Login</h2>
      <div class="form-group">
        <label for="email">Email:</label>
        <input type="email" id="email" name="email" v-model="email" required />
      </div>
      <div class="form-group">
        <label for="password">Password:</label>
        <input
          type="password"
          id="password"
          name="password"
          v-model="password"
          required
        />
        <span v-if="loginError" class="error-message">{{ loginError }}</span>
      </div>
      <button type="submit" class="login-button">Login</button>
      <p class="switch-form">
        Don't have an account?
        <a @click.prevent="switchToRegister" href="#">Register here</a>
      </p>
    </form>
  </div>
</template>

<script>
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import axios from "axios";
import { mapMutations } from "vuex";

export default {
  name: "LoginSection",
  data() {
    return {
      email: "",
      password: "",
      loginError: "",
    };
  },
  methods: {
    ...mapMutations(["SET_USER"]),
    async handleLogin() {
      const auth = getAuth();

      try {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          this.email,
          this.password
        );
        const firebaseUser = userCredential.user;

        if (!firebaseUser.emailVerified) {
          this.loginError = "Please verify your email before logging in.";
          return;
        }

        const response = await axios.get(
          `http://localhost:8081/api/accounts/email/${firebaseUser.email}`
        );
        const backendUser = response.data;

        if (!backendUser || !backendUser._id) {
          this.loginError = "Account not found in our database.";
          return;
        }

        this.SET_USER(backendUser);

        this.$router.push("/home");
      } catch (error) {
        console.error("Firebase login error:", error.code, error.message);

        if (error.code === "auth/user-not-found") {
          this.loginError = "No account found with this email.";
        } else if (error.code === "auth/wrong-password") {
          this.loginError = "Incorrect password.";
        } else {
          this.loginError = "Login failed. Please try again.";
        }
      }
    },
    switchToRegister() {
      this.$emit("show-register");
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

.form-group label {
  display: block;
  margin-bottom: 5px;
  color: #333;
}

.form-group input {
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
.switch-form a {
  color: #42b983;
  cursor: pointer;
  text-decoration: none;
}
.switch-form a:hover {
  text-decoration: underline;
}
</style>
