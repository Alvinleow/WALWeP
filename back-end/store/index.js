import { createStore } from "vuex";
import axios from "axios";

const storedUser = localStorage.getItem("user");

export default createStore({
  state: {
    user: storedUser ? JSON.parse(storedUser) : null,
  },
  mutations: {
    SET_USER(state, user) {
      state.user = user;
      localStorage.setItem("user", JSON.stringify(user));
    },
    CLEAR_USER(state) {
      state.user = null;
      localStorage.removeItem("user");
    },
    ENROLL_COURSE(state, courseId) {
      if (!state.user.enrolledCourses.includes(courseId)) {
        state.user.enrolledCourses.push(courseId);
        localStorage.setItem("user", JSON.stringify(state.user));
      }
    },
    UNENROLL_COURSE(state, courseId) {
      state.user.enrolledCourses = state.user.enrolledCourses.filter(
        (id) => id !== courseId
      );
      localStorage.setItem("user", JSON.stringify(state.user));
    },
  },
  actions: {
    async login({ commit }, credentials) {
      try {
        const response = await axios.post(
          `${process.env.VUE_APP_API_BASE}/api/accounts/login`,
          credentials
        );
        const user = response.data.account;
        commit("SET_USER", user);
      } catch (error) {
        console.error("Error logging in:", error);
        throw error;
      }
    },
    logout({ commit }) {
      commit("CLEAR_USER");
    },
    async enrollInCourse({ commit, state }, courseId) {
      try {
        await axios.put(`${process.env.VUE_APP_API_BASE}/api/accounts/enroll`, {
          userId: state.user._id,
          courseId,
        });
        commit("ENROLL_COURSE", courseId);
      } catch (error) {
        console.error("Error enrolling in course:", error);
        throw error;
      }
    },
    async unenrollFromCourse({ commit, state }, courseId) {
      try {
        await axios.put(
          `${process.env.VUE_APP_API_BASE}/api/accounts/unenroll`,
          {
            userId: state.user._id,
            courseId,
          }
        );
        commit("UNENROLL_COURSE", courseId);
      } catch (error) {
        console.error("Error unenrolling from course:", error);
        throw error;
      }
    },
  },
  getters: {
    isLoggedIn: (state) => !!state.user,
    userId: (state) => (state.user ? state.user._id : null),
    user: (state) => state.user,
  },
});
