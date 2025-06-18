<template>
  <div class="main">
    <div class="content">
      <TextSection />
      <ButtonSection
        v-if="!showLoginForm && !showRegisterForm"
        @show-login="showLogin"
        @show-register="showRegister"
      />
      <LoginSection v-if="showLoginForm" @show-register="showRegister" />
      <RegisterSection v-if="showRegisterForm" @show-login="showLogin" />
    </div>
  </div>
</template>

<script>
import TextSection from "../components/MainPage/TextSection.vue";
import ButtonSection from "../components/MainPage/ButtonSection.vue";
import LoginSection from "../components/MainPage/LoginSection.vue";
import RegisterSection from "../components/MainPage/RegisterSection.vue";

export default {
  name: "MainPage",
  components: {
    TextSection,
    ButtonSection,
    LoginSection,
    RegisterSection,
  },
  data() {
    return {
      showLoginForm: false,
      showRegisterForm: false,
    };
  },
  methods: {
    showLogin() {
      this.showLoginForm = true;
      this.showRegisterForm = false;
    },
    showRegister() {
      this.showRegisterForm = true;
      this.showLoginForm = false;
    },
  },
};
</script>

<style scoped>
.main {
  padding-top: 0 !important;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  box-sizing: border-box;
  overflow: hidden;
}

.content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 1200px;
  gap: 40px;
}
</style>
