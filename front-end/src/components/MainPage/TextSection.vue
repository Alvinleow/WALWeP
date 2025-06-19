<template>
  <div class="text-section">
    <h1>WAL<span class="highlight">WeP</span></h1>
    <p>
      Platform kami menawarkan pelbagai kursus untuk membantu anda mengembangkan
      pengetahuan dan kemahiran dalam Pengaturcaraan Web. Sertai kami hari ini
      untuk mula belajar!
    </p>
  </div>
</template>

<script>
export default {
  name: "TextSection",
};
</script>

<style scoped>
.text-section {
  position: static;
  transform: none;
  color: white;
  max-width: 50%;
}

.text-section h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.text-section p {
  font-size: 1.5rem;
}

.text-section .highlight {
  color: #42b983;
}
</style>
