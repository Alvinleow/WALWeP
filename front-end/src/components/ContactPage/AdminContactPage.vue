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
              <button class="btn-green" @click="markAsDone(contact._id)">
                Tandakan Selesai
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
              <button class="btn-red" @click="deleteContact(contact._id)">
                Padam
              </button>
            </td>
          </tr>
        </tbody>
      </table>
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
      const response = await axios.get("http://localhost:8081/api/contact");
      this.contacts = response.data;
    } catch (error) {
      console.error("Error fetching contacts:", error);
    } finally {
      this.isLoading = false;
    }
  },
  methods: {
    async markAsDone(id) {
      try {
        await axios.put(`http://localhost:8081/api/contact/${id}/status`, {
          status: "solved",
        });
        this.contacts = this.contacts.map((contact) =>
          contact._id === id ? { ...contact, status: "solved" } : contact
        );
      } catch (error) {
        console.error("Error updating contact status:", error);
      }
    },
    async deleteContact(id) {
      try {
        await axios.delete(`http://localhost:8081/api/contact/${id}`);
        this.contacts = this.contacts.filter((contact) => contact._id !== id);
      } catch (error) {
        console.error("Error deleting contact:", error);
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

button {
  padding: 5px 10px;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
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
</style>
