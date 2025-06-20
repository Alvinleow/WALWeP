<template>
  <div class="admin-contact-page">
    <LoadingModal :visible="isLoading" />
    <h2>Penyerahan Laporan</h2>
    <div class="tabs">
      <div :class="{ active: view === 'pending' }" @click="view = 'pending'">
        Belum Selesai
      </div>
      <div :class="{ active: view === 'solved' }" @click="view = 'solved'">
        Selesai
      </div>
    </div>
    <div v-if="view === 'pending'" class="pending-submissions">
      <h3>Belum Selesai</h3>
      <table>
        <thead>
          <tr>
            <th>Nama</th>
            <th>Emel</th>
            <th>Subjek</th>
            <th>Mesej</th>
            <th>Tindakan</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="contact in pendingContacts" :key="contact._id">
            <td>{{ contact.name }}</td>
            <td>{{ contact.email }}</td>
            <td>{{ contact.subject }}</td>
            <td>{{ contact.message }}</td>
            <td>
              <button
                class="btn-green"
                @click="confirmAction(contact._id, 'done')"
              >
                <i class="fas fa-check-circle"></i> Tandakan Selesai
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="view === 'solved'" class="solved-submissions">
      <h3>Selesai</h3>
      <table>
        <thead>
          <tr>
            <th>Nama</th>
            <th>Emel</th>
            <th>Subjek</th>
            <th>Mesej</th>
            <th>Tindakan</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="contact in solvedContacts" :key="contact._id">
            <td>{{ contact.name }}</td>
            <td>{{ contact.email }}</td>
            <td>{{ contact.subject }}</td>
            <td>{{ contact.message }}</td>
            <td>
              <button
                class="btn-red"
                @click="confirmAction(contact._id, 'delete')"
              >
                <i class="fas fa-trash-alt"></i> Padam
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showConfirmModal" class="modal-overlay">
      <div class="modal">
        <h2>{{ modalTitle }}</h2>
        <p>{{ modalMessage }}</p>
        <div class="modal-buttons">
          <button @click="executeAction" class="btn-green btn-icon">
            <i class="fas fa-check-circle"></i> Ya
          </button>
          <button @click="closeConfirmModal" class="btn-red btn-icon">
            <i class="fas fa-times-circle"></i> Tidak
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      contacts: [],
      view: "pending",
      isLoading: false,
      showConfirmModal: false,
      modalTitle: "",
      modalMessage: "",
      actionType: "",
      selectedContactId: null,
    };
  },
  computed: {
    pendingContacts() {
      return this.contacts.filter((contact) => contact.status === "pending");
    },
    solvedContacts() {
      return this.contacts.filter((contact) => contact.status === "solved");
    },
  },
  async created() {
    this.isLoading = true;
    try {
      const response = await axios.get(
        `${process.env.VUE_APP_API_BASE}/api/contact`
      );
      this.contacts = response.data;
    } catch (error) {
      console.error("Error fetching contacts:", error);
    } finally {
      this.isLoading = false;
    }
  },
  methods: {
    confirmAction(contactId, actionType) {
      this.selectedContactId = contactId;
      this.actionType = actionType;
      if (actionType === "done") {
        this.modalTitle = "Sahkan Tandakan Selesai";
        this.modalMessage =
          "Adakah anda pasti mahu tandakan laporan ini sebagai selesai?";
      } else if (actionType === "delete") {
        this.modalTitle = "Sahkan Pemadaman";
        this.modalMessage = "Adakah anda pasti mahu padam laporan ini?";
      }
      this.showConfirmModal = true;
    },
    closeConfirmModal() {
      this.showConfirmModal = false;
      this.selectedContactId = null;
      this.actionType = "";
    },
    async executeAction() {
      if (this.actionType === "done") {
        this.markAsDone(this.selectedContactId);
      } else if (this.actionType === "delete") {
        this.deleteContact(this.selectedContactId);
      }
      this.closeConfirmModal();
      await this.fetchContacts();
    },
    async markAsDone(id) {
      try {
        await axios.put(
          `${process.env.VUE_APP_API_BASE}/api/contact/${id}/status`,
          {
            status: "solved",
          }
        );
        this.contacts = this.contacts.map((contact) =>
          contact._id === id ? { ...contact, status: "solved" } : contact
        );
      } catch (error) {
        console.error("Error updating contact status:", error);
      }
    },
    async deleteContact(id) {
      try {
        await axios.delete(`${process.env.VUE_APP_API_BASE}/api/contact/${id}`);
        this.contacts = this.contacts.filter((contact) => contact._id !== id);
      } catch (error) {
        console.error("Error deleting contact:", error);
      }
    },
    async fetchContacts() {
      this.isLoading = true;
      try {
        const response = await axios.get(
          `${process.env.VUE_APP_API_BASE}/api/contact`
        );
        this.contacts = response.data;
      } catch (error) {
        console.error("Error fetching contacts:", error);
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>

<style scoped>
.admin-contact-page {
  margin: 20px;
  padding: 20px;
  background: black;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  color: white;
}

h2 {
  text-align: center;
  color: #42b983;
  margin-bottom: 20px;
}

.tabs {
  display: flex;
  justify-content: center;
  border-bottom: 1px solid #444;
}

.tabs div {
  padding: 10px 20px;
  cursor: pointer;
  transition: background-color 0.3s;
  color: white;
}

.tabs div.active {
  background-color: #42b983;
  border-top: 2px solid #42b983;
  border-left: 1px solid #444;
  border-right: 1px solid #444;
  border-bottom: none;
  color: black;
}

.tabs div:not(.active):hover {
  background-color: #666;
}

.pending-submissions,
.solved-submissions {
  margin-top: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
  color: white;
}

thead {
  background-color: #4a4a4a;
}

th,
td {
  padding: 10px;
  border: 1px solid #666;
  text-align: left;
}

th {
  background-color: black;
  color: white;
}

td {
  background-color: #333;
}

tr:nth-child(even) td {
  background-color: #222;
}

th:nth-child(1),
td:nth-child(1) {
  width: 10%;
  text-align: left;
}
th:nth-child(2),
td:nth-child(2) {
  width: 20%;
  text-align: left;
}
th:nth-child(3),
td:nth-child(3) {
  width: 10%;
  text-align: left;
}
th:nth-child(4),
td:nth-child(4) {
  width: 50%;
  text-align: left;
}
th:nth-child(5),
td:nth-child(5) {
  width: 10%;
  text-align: center;
}

button {
  padding: 5px 10px;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
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
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-icon {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-icon i {
  font-size: 1.2rem;
}

.modal-buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
}

.modal-buttons button {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
  width: 48%;
}
</style>
