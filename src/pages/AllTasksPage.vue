<script setup>
import MainLayout from '../layout/MainLayout.vue'
import TaskTable from '../components/TaskTable.vue'

</script>

<template>
  <MainLayout>
    <h1>Страница задач других пользователей</h1>
    <TaskTable :is-all-tasks='true'/>
  </MainLayout>
</template>

<style scoped>

</style>