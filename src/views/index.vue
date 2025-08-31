<template>
  <div class="welcome-container">
    <h1 class="welcome-title">欢迎您！来到后台管理系统</h1>
    <div class="welcome-subtitle">开始您的管理之旅</div>
  </div>
</template>

<script setup>

</script>

<style scoped lang="scss">
.welcome-container {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center; 
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.welcome-title {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
  text-align: center;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.welcome-subtitle {
  font-size: 1.2rem;
  opacity: 0.9;
}
</style>