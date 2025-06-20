<template>
  <LoadingModal :visible="isLoading" />
  <div class="contact-form">
    <form @submit.prevent="submitForm">
      <h2>Hubungi Kami</h2>
      <div class="form-group">
        <label for="name">Nama:</label>
        <input type="text" id="name" v-model="name" required />
      </div>
      <div class="form-group">
        <label for="email">Emel:</label>
        <input type="email" id="email" v-model="email" required />
      </div>
      <div class="form-group">
        <label for="subject">Subjek:</label>
        <input type="text" id="subject" v-model="subject" required />
      </div>
      <div class="form-group">
        <label for="message">Mesej:</label>
        <textarea id="message" v-model="message" required></textarea>
      </div>
      <button type="submit" class="submit-btn">Hantar</button>
    </form>
  </div>

  <div v-if="showModal" class="modal-overlay">
    <div class="modal">
      <h2>{{ modalTitle }}</h2>
      <p>{{ modalMessage }}</p>
      <button @click="closeModal" class="btn-green btn-icon">
        <i class="fas fa-check-circle"></i> OK
      </button>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { mapState } from "vuex";

export default {
  data() {
    return {
      name: "",
      email: "",
      subject: "",
      message: "",
      isLoading: false,
      showModal: false,
      modalTitle: "",
      modalMessage: "",
    };
  },
  computed: {
    ...mapState({
      user: (state) => state.user,
    }),
  },
  created() {
    if (this.user) {
      this.name = this.user.username || "";
      this.email = this.user.email || "";
    }
  },
  methods: {
    async submitForm() {
      console.log("Submitting form with data:", {
        name: this.name,
        email: this.email,
        subject: this.subject,
        message: this.message,
      });

      this.isLoading = true;

      try {
        const response = await axios.post(
          `${process.env.VUE_APP_API_BASE}/api/contact`,
          {
            name: this.name,
            email: this.email,
            subject: this.subject,
            message: this.message,
          }
        );
        console.log("Form submitted successfully:", response.data);
        this.showSuccessModal();
        this.resetForm();
      } catch (error) {
        console.error("Error submitting form:", error);
      } finally {
        this.isLoading = false;
      }
    },
    showSuccessModal() {
      this.modalTitle = "Borang Berjaya Dihantar!";
      this.modalMessage =
        "Terima kasih atas mesej anda. Kami akan menghubungi anda secepat mungkin.";
      this.showModal = true;
    },
    showErrorModal() {
      this.modalTitle = "Ralat Penghantaran!";
      this.modalMessage =
        "Maaf, berlaku ralat semasa menghantar borang. Sila cuba lagi.";
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
    },
    resetForm() {
      this.name = "";
      this.email = "";
      this.subject = "";
      this.message = "";
    },
  },
};
</script>

<style scoped>
.contact-form {
  margin: 20px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  margin: 40px auto;
}

.contact-form h2 {
  font-size: 2rem;
  margin-bottom: 20px;
  color: #42b983;
  text-align: center;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #333;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
}

.form-group textarea {
  resize: vertical;
  height: 150px;
}

.submit-btn {
  display: block;
  width: 100%;
  padding: 10px 20px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1.1rem;
  transition: background-color 0.3s;
}

.submit-btn:hover {
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
  background: #000;
  color: #fff;
  padding: 30px;
  border-radius: 10px;
  max-width: 500px;
  text-align: center;
}

.modal h2 {
  font-size: 1.8rem;
  margin-bottom: 20px;
  color: #42b983;
}

.modal p {
  margin-bottom: 20px;
}

.modal button {
  padding: 10px 20px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.modal button:hover {
  background-color: #36a273;
}
</style>
