<template>
  <div class="main">
    <NavBar />
    <Lessons />
  </div>
</template>

<script>
import NavBar from "../components/NavBar.vue";
import Lessons from "../components/CourseMaterialsPage/Lessons.vue";

export default {
  name: "LessonPage",
  components: {
    NavBar,
    Lessons,
  },
};
</script>
