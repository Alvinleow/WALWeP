<template>
  <div class="main">
    <NavBar />
    <Questions />
  </div>
</template>

<script>
import NavBar from "../components/NavBar.vue";
import Questions from "../components/QuizMaterialsPage/Questions.vue";

export default {
  name: "QuestionsPage",
  components: {
    NavBar,
    Questions,
  },
};
</script>
