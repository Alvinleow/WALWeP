<template>
  <div class="navbar">
    <div class="icon">
      <img src="../assets/logo.png" alt="WALWeP Logo" class="logo-image" />
      <h2 class="logo"><span class="highlight">WAL</span>WeP</h2>
    </div>
    <div class="menu">
      <ul>
        <li><router-link to="/home">LAMAN UTAMA</router-link></li>
        <li><router-link to="/about">TENTANG WALWeP</router-link></li>
        <li>
          <router-link to="/course-materials">BAHAN KURSUS</router-link>
        </li>
        <li><router-link to="/quizzes">KUIZ</router-link></li>
        <li>
          <router-link to="/course-progress">KEMAJUAN KURSUS</router-link>
        </li>
        <li>
          <router-link to="/contact">
            {{ isAdmin ? "HUBUNGI KAMI" : "LAPORAN" }}
          </router-link>
        </li>
      </ul>
    </div>
    <div class="right-icons">
      <!-- Chat Icon -->
      <div class="chat" @click="toggleChatDrawer">
        <img
          src="https://img.icons8.com/ios-glyphs/30/ffffff/chat--v1.png"
          alt="Chat Icon"
          class="chat-icon"
        />
      </div>

      <!-- Profile Icon -->
      <div class="profile" @click="toggleMenu">
        <img
          src="https://img.icons8.com/ios-filled/50/ffffff/user-male-circle.png"
          alt="Profile Icon"
          class="profile-icon"
        />
        <div class="dropdown-menu" v-if="menuVisible">
          <a @click="navigateToProfile">Lihat Profil</a>
          <a @click="logOut"><span class="highlightLogOut">Log Keluar</span></a>
        </div>
      </div>
    </div>
  </div>
  <ChatDrawer v-if="chatDrawerVisible" @close="chatDrawerVisible = false" />
</template>

<script>
import { mapState, mapActions } from "vuex";
import ChatDrawer from "../components/ChatDrawer/ChatDrawer.vue";

export default {
  emits: ["close"],
  components: {
    ChatDrawer,
  },
  name: "NavBar",
  computed: {
    ...mapState({
      user: (state) => state.user,
      userId: (state) => (state.user ? state.user._id : null),
    }),
    isAdmin() {
      return this.user && this.user.accountLevel === 1;
    },
  },
  data() {
    return {
      menuVisible: false,
      chatDrawerVisible: false,
    };
  },
  methods: {
    toggleMenu() {
      this.menuVisible = !this.menuVisible;
    },
    navigateToProfile() {
      this.$router.push(`/profile/${this.userId}`);
      this.menuVisible = false;
    },
    ...mapActions(["logout"]),
    logOut() {
      this.logout();
      this.$router.push("/");
      this.menuVisible = false;
    },
    toggleChatDrawer() {
      this.chatDrawerVisible = !this.chatDrawerVisible;
    },
  },
};
</script>

<style scoped>
.navbar {
  width: 100%;
  height: 100px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  background: #000;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  box-sizing: border-box;
}

.icon {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-image {
  width: 50px;
  height: 50px;
  border-radius: 50%;
}

.logo {
  color: #42b983;
  font-size: 26px;
  font-family: Cambria;
  margin: 0;
}

.highlight {
  color: #fff;
}

.menu {
  flex-grow: 1;
  display: flex;
  justify-content: center;
}

.menu ul {
  display: flex;
  gap: 40px;
  list-style: none;
  margin: 0;
  padding: 0;
}

.menu ul li {
  font-size: 14px;
}

.menu ul li a {
  text-decoration: none;
  color: #fff;
  font-family: Arial, sans-serif;
  font-weight: bold;
  transition: 0.3s ease;
}

.menu ul li a:hover {
  color: #42b983;
}

.right-icons {
  display: flex;
  align-items: center;
  gap: 20px;
}

.chat-icon,
.profile-icon {
  width: 35px;
  height: 35px;
  cursor: pointer;
}

.profile {
  position: relative;
  display: flex;
  align-items: center;
}

.dropdown-menu {
  position: absolute;
  top: 45px;
  right: 0;
  background: rgba(0, 0, 0, 0.9);
  border-radius: 6px;
  width: 150px;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 999;
}

.dropdown-menu a {
  display: block;
  padding: 12px 16px;
  color: #fff;
  text-decoration: none;
  white-space: nowrap;
}

.dropdown-menu a:hover {
  background-color: #42b983;
}

.highlightLogOut {
  color: red;
}
</style>
